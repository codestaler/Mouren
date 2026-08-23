<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Servicio;

class ChatMascotaController extends Controller
{
    /**
     * Modelo principal.
     * 🆕 Groq deprecó `llama-3.3-70b-versatile` (apagado definitivo: 16 ago 2026).
     * Reemplazo oficial recomendado por Groq: openai/gpt-oss-120b.
     */
    private const MODELO_PRINCIPAL = 'openai/gpt-oss-120b';

    /**
     * Modelo de respaldo. Si el principal falla o se cae por rate
     * limit, reintentamos con este antes de rendirnos.
     * 🆕 Groq deprecó `llama-3.1-8b-instant` (apagado definitivo: 16 ago 2026).
     * Reemplazo oficial recomendado por Groq: openai/gpt-oss-20b.
     */
    private const MODELO_RESPALDO = 'openai/gpt-oss-20b';

    public function __invoke(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $mensajeUsuario = $request->input('message');
        $usuario = $request->user(); // asumiendo que la ruta pasa por auth middleware

        // CAMBIO: contexto real del usuario (plan, afiliados, si tiene un
        // fallecido). Todavía con datos de ejemplo hasta que me pases los
        // modelos de Suscripcion/Afiliado — ver el TODO adentro.
        $contexto = $this->construirContextoUsuario($usuario);

        // CAMBIO: elegimos el prompt de sistema según si detectamos un
        // afiliado fallecido en la suscripción del usuario.
        $systemPrompt = $contexto['tieneFallecido']
            ? $this->promptAcompanamiento($contexto)
            : $this->promptEstandar($contexto);

        $mensajes = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $mensajeUsuario],
        ];

        // CAMBIO: la única herramienta por ahora — Mouri puede "abrir" el
        // juego Luciérnagas de la Memoria cuando detecta que el usuario
        // está triste, aburrido, o simplemente lo pide. No recibe
        // parámetros porque solo hay un juego disponible; el día que
        // agregues más, le sumas un parámetro "juego" con un enum.
        $tools = [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'sugerir_juego',
                    'description' => 'Abre el juego "Luciérnagas de la Memoria" para el usuario. '
                        . 'Úsala cuando el usuario exprese tristeza, aburrimiento, ansiedad leve, '
                        . 'pida distraerse, o pida explícitamente jugar. No la uses si el usuario '
                        . 'está en medio de una gestión práctica (pagos, documentos) sin pedir jugar.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => new \stdClass(),
                        'required' => [],
                    ],
                ],
            ],
            // 🆕 Navegación: Mouri puede llevar al usuario directo a otra sección del panel.
            [
                'type' => 'function',
                'function' => [
                    'name' => 'navegar_a',
                    'description' => 'Lleva al usuario a otra sección del panel cuando lo pide o cuando '
                        . 'eso resuelve su duda más rápido que explicarlo (ej: "quiero pagar", "ver mi plan", '
                        . '"mis datos", "el certificado"). No la uses si el usuario solo pregunta información '
                        . 'general que puedes responder aquí mismo en el chat.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'destino' => [
                                'type' => 'string',
                                'enum' => ['mi_plan', 'detalles_plan', 'pagos', 'tus_datos', 'certificado'],
                                'description' => 'mi_plan: resumen de su cobertura actual. detalles_plan: '
                                    . 'personalizar afiliados, servicios extra y recuerdos. pagos: pagar cuotas '
                                    . 'pendientes. tus_datos: editar su perfil. certificado: descargar el PDF '
                                    . 'de afiliación.',
                            ],
                        ],
                        'required' => ['destino'],
                    ],
                ],
            ],
            // 🆕 Tarjeta visual con el resumen del plan (usa el contexto que ya cargamos del usuario).
            [
                'type' => 'function',
                'function' => [
                    'name' => 'mostrar_resumen_plan',
                    'description' => 'Muestra una tarjeta visual con el resumen del plan actual del usuario '
                        . '(nombre del plan y cuota mensual). Úsala cuando pregunte por su plan, su cuota, '
                        . 'o cuánto está pagando — en vez de solo decírselo en texto plano.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => new \stdClass(),
                        'required' => [],
                    ],
                ],
            ],
        ];

        // CAMBIO: intenta con el modelo principal, y si falla (rate limit,
        // timeout, error 5xx), reintenta automáticamente con el de respaldo
        // antes de devolver un error al usuario.
        $resultado = $this->llamarGroq($mensajes, self::MODELO_PRINCIPAL, $tools);

        if (!$resultado['ok']) {
            Log::warning('Groq falló con el modelo principal, reintentando con respaldo', [
                'status' => $resultado['status'] ?? null,
            ]);
            $resultado = $this->llamarGroq($mensajes, self::MODELO_RESPALDO, $tools);
        }

        if (!$resultado['ok']) {
            Log::error('Groq falló también con el modelo de respaldo', [
                'status' => $resultado['status'] ?? null,
                'body' => $resultado['body'] ?? null,
            ]);

            // CAMBIO: respuesta de emergencia que mantiene el personaje en
            // vez de mostrar un error crudo al usuario.
            return response()->json([
                'reply' => 'Se me nubló el plano un segundo… ¿me lo repites? '
                    . 'Si sigue pasando, escríbenos al 3247697845 y con gusto te ayudamos por ahí.',
                'accion' => null,
            ]);
        }

        // CAMBIO: ahora manejamos cualquiera de las 3 herramientas (juego, navegar,
        // resumen de plan) de forma genérica, en vez de solo revisar "sugerir_juego".
        if (!empty($resultado['toolCalls'])) {
            $accion = null;
            $mensajesConTool = array_merge($mensajes, [
                ['role' => 'assistant', 'content' => null, 'tool_calls' => $resultado['toolCalls']],
            ]);

            foreach ($resultado['toolCalls'] as $tc) {
                $nombreFuncion = $tc['function']['name'] ?? null;
                $argumentos = json_decode($tc['function']['arguments'] ?? '{}', true) ?: [];

                [$resultadoTool, $accionDetectada] = $this->ejecutarTool($nombreFuncion, $argumentos, $contexto);

                // Nos quedamos con la primera acción reconocida del turno
                // (normalmente el modelo solo pide una a la vez).
                if ($accion === null && $accionDetectada !== null) {
                    $accion = $accionDetectada;
                }

                $mensajesConTool[] = [
                    'role' => 'tool',
                    'tool_call_id' => $tc['id'],
                    'content' => json_encode($resultadoTool),
                ];
            }

            $segundo = $this->llamarGroq($mensajesConTool, self::MODELO_PRINCIPAL);
            $textoFinal = $segundo['ok']
                ? $segundo['texto']
                : '¡Listo! Ya hice lo que me pediste ✨';

            return response()->json([
                'reply' => $textoFinal,
                'accion' => $accion,
            ]);
        }

        return response()->json([
            'reply' => $resultado['texto'],
            'accion' => null,
        ]);
    }

    /**
     * 🆕 Ejecuta la "acción" detrás de cada herramienta y devuelve dos cosas:
     * 1) El resultado que le mandamos de vuelta al modelo (para que redacte
     *    la respuesta final en lenguaje natural).
     * 2) La "acción" que le mandamos al frontend para que haga algo visual
     *    (abrir el juego, navegar, mostrar una tarjeta) — o null si no aplica.
     */
    private function ejecutarTool(?string $nombre, array $argumentos, array $contexto): array
    {
        switch ($nombre) {
            case 'sugerir_juego':
                return [
                    ['ok' => true, 'mensaje' => 'El juego se abrió en pantalla.'],
                    ['tipo' => 'abrir_juego'],
                ];

            case 'navegar_a':
                $mapa = $this->mapaDestinos();
                $destino = $argumentos['destino'] ?? null;

                if (!$destino || !isset($mapa[$destino])) {
                    return [
                        ['ok' => false, 'mensaje' => 'Destino no reconocido.'],
                        null,
                    ];
                }

                return [
                    ['ok' => true, 'mensaje' => "Se abrió la sección {$mapa[$destino]['etiqueta']}."],
                    ['tipo' => 'navegar', 'url' => $mapa[$destino]['url'], 'etiqueta' => $mapa[$destino]['etiqueta']],
                ];

            case 'mostrar_resumen_plan':
                $datos = [
                    'plan' => $contexto['plan'],
                    'cuota' => $contexto['cuota'],
                ];

                return [
                    array_merge(['ok' => true], $datos),
                    ['tipo' => 'mostrar_plan', 'datos' => $datos],
                ];

            default:
                return [
                    ['ok' => false, 'mensaje' => 'Herramienta no reconocida.'],
                    null,
                ];
        }
    }

    /**
     * 🆕 Mapa de destinos permitidos para la herramienta navegar_a.
     * Usa tus rutas con nombre reales — si cambias alguna ruta, solo hay
     * que actualizarla aquí.
     */
    private function mapaDestinos(): array
    {
        return [
            'mi_plan'       => ['url' => route('mi.plan'),               'etiqueta' => 'Mi Plan'],
            'detalles_plan' => ['url' => route('detalles.plan'),         'etiqueta' => 'Detalles del Plan'],
            'pagos'         => ['url' => route('cliente.pagos'),         'etiqueta' => 'Pagar mi Cuota'],
            'tus_datos'     => ['url' => route('datos.edit'),            'etiqueta' => 'Tus Datos'],
            'certificado'   => ['url' => route('certificado.afiliacion'), 'etiqueta' => 'Certificado de Afiliación'],
        ];
    }

    /**
     * CAMBIO: hace la llamada a Groq con el modelo indicado, con timeout
     * corto y devolviendo un resultado estructurado (ok/status/texto/
     * toolCalls) en vez de lanzar excepciones, para poder encadenar el
     * fallback y el flujo de function calling fácil.
     */
    private function llamarGroq(array $mensajes, string $modelo, ?array $tools = null): array
    {
        try {
            $groqKey = env('GROQ_API_KEY');

            $payload = [
                'model' => $modelo,
                'messages' => $mensajes,
                'temperature' => 0.7,
            ];
            if ($tools) {
                $payload['tools'] = $tools;
                $payload['tool_choice'] = 'auto';
            }

            $response = Http::withHeaders([
                'Authorization' => "Bearer {$groqKey}",
                'Content-Type' => 'application/json',
            ])
                ->timeout(12) // CAMBIO: timeout corto, no dejar al usuario esperando eternamente
                ->retry(1, 300) // CAMBIO: 1 reintento rápido antes de considerarlo fallo
                ->post('https://api.groq.com/openai/v1/chat/completions', $payload);

            if ($response->failed()) {
                return [
                    'ok' => false,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ];
            }

            $data = $response->json();
            $mensaje = $data['choices'][0]['message'] ?? [];
            $texto = $mensaje['content'] ?? null;
            $toolCalls = $mensaje['tool_calls'] ?? null;

            // CAMBIO: si el modelo decidió llamar a una tool, es válido que
            // no venga texto — no lo tratamos como fallo en ese caso.
            if (!$texto && !$toolCalls) {
                return ['ok' => false, 'status' => 200, 'body' => 'Respuesta vacía de Groq'];
            }

            return ['ok' => true, 'texto' => $texto, 'toolCalls' => $toolCalls];

        } catch (\Exception $e) {
            return ['ok' => false, 'status' => null, 'body' => $e->getMessage()];
        }
    }

    /**
     * CAMBIO: arma el contexto real del usuario para pasárselo a Mouri.
     * Usa: User->suscripciones() -> (plan, afiliados). Toma la suscripción
     * más reciente; si en tu app un usuario solo tiene una activa a la vez,
     * esto funciona tal cual. Si puede tener varias activas simultáneas
     * (ej: plan humano + plan mascota), dime y lo ajustamos para revisar
     * todas en vez de solo la última.
     */
    private function construirContextoUsuario($usuario): array
    {
        if (!$usuario) {
            return [
                'nombre' => 'amigo',
                'plan' => null,
                'cuota' => null,
                'afiliados' => collect(),
                'tieneFallecido' => false,
                'nombreFallecido' => null,
            ];
        }

        $suscripcion = $usuario->suscripciones()
            ->with(['plan', 'afiliados'])
            ->latest()
            ->first();

        $afiliados = $suscripcion?->afiliados ?? collect();

        $fallecido = $afiliados->first(
            fn ($a) => strtolower($a->estado ?? '') === 'fallecido'
        );

        return [
            'nombre' => $usuario->nombre ?? $usuario->name ?? 'amigo',
            'plan' => $suscripcion?->plan?->nombre,
            'cuota' => $suscripcion?->cuota_mensual,
            'afiliados' => $afiliados,
            'tieneFallecido' => (bool) $fallecido,
            'nombreFallecido' => $fallecido?->nombre,
        ];
    }

    /**
     * 🆕 Arma el listado de servicios extra directo desde la tabla `servicios`,
     * en vez de escribirlo a mano en el prompt. Así, si agregas/editas un
     * servicio desde el panel admin, Mouri lo conoce automáticamente sin
     * tener que tocar este archivo. Si la consulta falla por cualquier
     * motivo, devuelve string vacío y el prompt simplemente omite esa
     * sección (no rompe el chat).
     */
    private function obtenerListadoServicios(): string
    {
        try {
            $servicios = Servicio::orderBy('nombre')->get(['nombre', 'descripcion', 'precio', 'personalizable']);
        } catch (\Exception $e) {
            Log::warning('No se pudo cargar el listado de servicios para el prompt de Mouri', [
                'error' => $e->getMessage(),
            ]);
            return '';
        }

        if ($servicios->isEmpty()) {
            return '';
        }

        return $servicios->map(function ($s) {
            $precio = '$' . number_format((float) $s->precio, 0, ',', '.');
            $etiquetaPersonalizable = $s->personalizable ? ' [Personalizable: el cliente puede elegir color, flores y observaciones]' : '';
            return "  · {$s->nombre} — {$precio}. {$s->descripcion}.{$etiquetaPersonalizable}";
        })->implode("\n");
    }

    /**
     * Prompt estándar (el que ya tenías, con el contexto inyectado).
     */
    private function promptEstandar(array $contexto): string
    {
        $nombre = $contexto['nombre'];
        $planTexto = $contexto['plan'] ? "Su plan actual es: {$contexto['plan']}." : '';
        $cuotaTexto = $contexto['cuota'] ? " Su cuota mensual es de $" . number_format($contexto['cuota'], 0, ',', '.') . "." : '';

        // 🆕 Listado dinámico de servicios extra (viene de la BD, ver obtenerListadoServicios())
        $listadoServicios = $this->obtenerListadoServicios();
        $bloqueServicios = $listadoServicios
            ? "- SERVICIOS EXTRA DISPONIBLES (el cliente puede agregarlos a su plan desde 'Detalles del plan'):\n{$listadoServicios}\n"
            : '';

        return "Eres Mouri, el cuervo mascota y guardián místico de 'Mouren Funeraria'. "
            . "Tu personalidad es empática, cálida, humana y con un toque tecnológico/místico estilo anime. "
            . "Estás hablando con {$nombre}. {$planTexto}{$cuotaTexto}\n"
            . "CONOCIMIENTO DE MOUREN FUNERARIA:\n"
            . "- Ayudamos a las familias a gestionar planes de previsión exequial y asistencia funeraria.\n"
            . "- En el panel o dashboard del cliente, ellos tienen las siguientes secciones:\n"
            . "  1. 'Mi plan Funerario': Donde ven su cobertura actual.\n"
            . "  2. 'Detalles del plan': Diseñado de forma hermosa como una galería de arte virtual.\n"
            . "  3. 'Pagar mi cuota': Para mantenerse al día con sus pagos.\n"
            . "  4. 'Tus datos': Información del perfil, ahí también puedes descargar tu certificado de afiliación.\n"
            . "  Si tiene una duda muy puntual o algún error técnico con la página, dale el número de soporte 3247697845.\n"
            . "- SOBRE LOS PLANES DISPONIBLES: 'Descanso Sereno', 'Tributo a la Vida', 'Legado Eterno' y 'Huella Eterna' (exclusivo mascotas).\n"
            . "{$bloqueServicios}"
            . "- SOBRE LAS FACTURAS: el sistema automatiza el envío de facturas en PDF por correo periódicamente.\n"
            . "- FUNCIONES FUTURAS: música ('Reproductor Espiritual'), próximamente.\n"
            . "- JUEGO DISPONIBLE: 'Luciérnagas de la Memoria'. Si el usuario parece aburrido, "
            . "  triste, quiere distraerse, o te lo pide, puedes abrirlo usando la herramienta "
            . "  sugerir_juego.\n"
            . "REGLA DE ORO: Responde siempre en español. Sé reconfortante, amigable y muy servicial. "
            . "Si te preguntan por un servicio extra, usa los precios y descripciones exactos de la lista de arriba, "
            . "no inventes precios.";
    }

    /**
     * CAMBIO: prompt de "modo acompañamiento", usado cuando el usuario
     * tiene un afiliado fallecido en su suscripción. Tono más pausado,
     * sin ventas ni upsells, prioriza dirigir a soporte humano si hace
     * falta en vez de intentar consolar por sí mismo.
     */
    private function promptAcompanamiento(array $contexto): string
    {
        $nombre = $contexto['nombre'];
        $referenciaSerQuerido = $contexto['nombreFallecido']
            ? "Su ser querido, {$contexto['nombreFallecido']}, es quien está siendo acompañado en este proceso. "
              . "Puedes referirte a {$contexto['nombreFallecido']} por su nombre con naturalidad y respeto si el "
              . "contexto de la conversación lo pide, pero no lo repitas de forma forzada."
            : '';

        return "Eres Mouri, el cuervo guardián de 'Mouren Funeraria'. Estás hablando con {$nombre}, "
            . "quien tiene un ser querido que falleció recientemente y cuyo servicio está siendo "
            . "gestionado por Mouren. {$referenciaSerQuerido}\n"
            . "MODO ACOMPAÑAMIENTO — reglas especiales para esta conversación:\n"
            . "- Tu tono es pausado, cálido y respetuoso. Nunca urgente, nunca comercial.\n"
            . "- NO ofrezcas servicios adicionales, upsells, ni menciones el minijuego o funciones "
            . "  de entretenimiento a menos que el usuario los pida explícitamente.\n"
            . "- Puedes ayudar con dudas prácticas del servicio: estado del proceso, documentos, "
            . "  pagos, canción u homenaje elegido.\n"
            . "- Si notas angustia, confusión fuerte, o el usuario simplemente lo necesita, ofrece "
            . "  con naturalidad la opción de hablar con una persona real del equipo (soporte "
            . "  3247697845), en vez de intentar consolarlo tú mismo con consejos emocionales.\n"
            . "- Nunca minimices lo que siente el usuario ni uses frases genéricas de duelo. "
            . "  Si no sabes qué decir, es preferible ser breve y honesto que decir algo vacío.\n"
            . "- Existe un juego suave llamado 'Luciérnagas de la Memoria' (sin competencia, sin "
            . "  presión). Solo ofrécelo con la herramienta sugerir_juego si el usuario lo pide "
            . "  explícitamente o dice sentirse abrumado y necesitar un respiro — nunca lo ofrezcas "
            . "  tú primero de forma proactiva en este modo.\n"
            . "REGLA DE ORO: Responde siempre en español, con calma y sin apuro.";
    }
}
