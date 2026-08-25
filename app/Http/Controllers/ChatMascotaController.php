<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Servicio;
use App\Models\Pagos\Factura;

class ChatMascotaController extends Controller
{
    /**
     * Modelo principal.
     * Groq deprecó `llama-3.3-70b-versatile` (apagado definitivo: 16 ago 2026).
     * Reemplazo oficial recomendado por Groq: openai/gpt-oss-120b.
     */
    private const MODELO_PRINCIPAL = 'openai/gpt-oss-120b';

    /**
     * Modelo de respaldo.
     * Groq deprecó `llama-3.1-8b-instant` (apagado definitivo: 16 ago 2026).
     * Reemplazo oficial recomendado por Groq: openai/gpt-oss-20b.
     */
    private const MODELO_RESPALDO = 'openai/gpt-oss-20b';

    public function __invoke(Request $request)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $mensajeUsuario = $request->input('message');
        $usuario = $request->user();

        $contexto = $this->construirContextoUsuario($usuario);

        $systemPrompt = $contexto['tieneFallecido']
            ? $this->promptAcompanamiento($contexto)
            : $this->promptEstandar($contexto);

        $mensajes = [
            ['role' => 'system', 'content' => $systemPrompt],
            ['role' => 'user', 'content' => $mensajeUsuario],
        ];

        $tools = $this->definirTools();

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

            return response()->json([
                'reply' => 'Se me nubló el plano un segundo… ¿me lo repites? '
                    . 'Si sigue pasando, escríbenos al 3247697845 y con gusto te ayudamos por ahí.',
                'accion' => null,
            ]);
        }

        if (!empty($resultado['toolCalls'])) {
            $accion = null;
            $mensajesConTool = array_merge($mensajes, [
                ['role' => 'assistant', 'content' => null, 'tool_calls' => $resultado['toolCalls']],
            ]);

            foreach ($resultado['toolCalls'] as $tc) {
                $nombreFuncion = $tc['function']['name'] ?? null;
                $argumentos = json_decode($tc['function']['arguments'] ?? '{}', true) ?: [];

                [$resultadoTool, $accionDetectada] = $this->ejecutarTool($nombreFuncion, $argumentos, $contexto, $usuario);

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
     * 🆕 Todas las herramientas disponibles, en un solo lugar.
     */
    private function definirTools(): array
    {
        return [
            [
                'type' => 'function',
                'function' => [
                    'name' => 'sugerir_juego',
                    'description' => 'Abre el juego "Luciérnagas de la Memoria" para el usuario. '
                        . 'Úsala cuando el usuario exprese tristeza, aburrimiento, ansiedad leve, '
                        . 'pida distraerse, o pida explícitamente jugar. No la uses si el usuario '
                        . 'está en medio de una gestión práctica (pagos, documentos) sin pedir jugar.',
                    'parameters' => ['type' => 'object', 'properties' => new \stdClass(), 'required' => []],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'navegar_a',
                    'description' => 'Lleva al usuario a otra sección del panel cuando lo pide o cuando '
                        . 'eso resuelve su duda más rápido (ej: "quiero pagar", "ver mi plan", "mis datos", '
                        . '"el certificado"). No la uses si solo pregunta algo que puedes responder aquí.',
                    'parameters' => [
                        'type' => 'object',
                        'properties' => [
                            'destino' => [
                                'type' => 'string',
                                'enum' => ['mi_plan', 'detalles_plan', 'pagos', 'tus_datos', 'certificado'],
                                'description' => 'mi_plan: resumen de cobertura. detalles_plan: personalizar '
                                    . 'afiliados/servicios/recuerdos. pagos: pagar cuotas. tus_datos: editar '
                                    . 'perfil. certificado: descargar PDF de afiliación.',
                            ],
                        ],
                        'required' => ['destino'],
                    ],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'mostrar_resumen_plan',
                    'description' => 'Muestra una tarjeta visual con TODOS los planes activos del usuario '
                        . '(puede tener plan humano y plan de mascota a la vez) y su cuota. Úsala cuando '
                        . 'pregunte por su plan, su cuota, o cuánto está pagando en total.',
                    'parameters' => ['type' => 'object', 'properties' => new \stdClass(), 'required' => []],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'mostrar_beneficiarios',
                    'description' => 'Muestra una tarjeta con la lista de personas protegidas (titular y '
                        . 'beneficiarios) en el plan humano del usuario. Úsala cuando pregunte "quiénes son '
                        . 'mis beneficiarios", "quién está afiliado", o similar.',
                    'parameters' => ['type' => 'object', 'properties' => new \stdClass(), 'required' => []],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'mostrar_facturas',
                    'description' => 'Muestra una tarjeta con el estado de cuenta: cuánto debe en total y '
                        . 'la fecha de vencimiento de su próxima factura pendiente. Úsala cuando pregunte '
                        . '"cuánto debo pagar", "cuándo vence mi cuota", "tengo facturas pendientes", etc.',
                    'parameters' => ['type' => 'object', 'properties' => new \stdClass(), 'required' => []],
                ],
            ],
            [
                'type' => 'function',
                'function' => [
                    'name' => 'mostrar_catalogo_servicios',
                    'description' => 'Muestra un carrusel visual con todos los servicios extra disponibles '
                        . '(nombre, descripción, precio). Úsala cuando pregunte qué servicios extra hay, '
                        . 'quiera ver el catálogo completo, o pida ejemplos de personalización.',
                    'parameters' => ['type' => 'object', 'properties' => new \stdClass(), 'required' => []],
                ],
            ],
        ];
    }

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
                ->timeout(12)
                ->retry(1, 300)
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

            if (!$texto && !$toolCalls) {
                return ['ok' => false, 'status' => 200, 'body' => 'Respuesta vacía de Groq'];
            }

            return ['ok' => true, 'texto' => $texto, 'toolCalls' => $toolCalls];

        } catch (\Exception $e) {
            return ['ok' => false, 'status' => null, 'body' => $e->getMessage()];
        }
    }

    /**
     * 🆕 Ejecuta la acción detrás de cada herramienta.
     */
    private function ejecutarTool(?string $nombre, array $argumentos, array $contexto, $usuario): array
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
                    return [['ok' => false, 'mensaje' => 'Destino no reconocido.'], null];
                }

                return [
                    ['ok' => true, 'mensaje' => "Se abrió la sección {$mapa[$destino]['etiqueta']}."],
                    ['tipo' => 'navegar', 'url' => $mapa[$destino]['url'], 'etiqueta' => $mapa[$destino]['etiqueta']],
                ];

            case 'mostrar_resumen_plan':
                $datos = ['planes' => $contexto['planes']];
                return [array_merge(['ok' => true], $datos), ['tipo' => 'mostrar_plan', 'datos' => $datos]];

            case 'mostrar_beneficiarios':
                $beneficiarios = $contexto['afiliados']->map(fn ($a) => [
                    'nombre' => $a->nombre,
                    'parentesco' => $a->parentesco,
                    'estado' => $a->estado,
                ])->values()->all();

                return [
                    ['ok' => true, 'beneficiarios' => $beneficiarios],
                    ['tipo' => 'mostrar_beneficiarios', 'datos' => $beneficiarios],
                ];

            case 'mostrar_facturas':
                if (!$usuario) {
                    return [['ok' => false, 'mensaje' => 'No hay usuario autenticado.'], null];
                }

                $facturas = Factura::where(function ($q) use ($usuario) {
                    $q->whereHas('suscripcion', fn ($qq) => $qq->where('usuario_id', $usuario->id))
                      ->orWhere('usuario_id', $usuario->id);
                })
                ->whereIn('estado_factura_id', [1, 3]) // Pendiente o Abonada parcialmente
                ->orderBy('fecha_vencimiento', 'asc')
                ->get();

                $proxima = $facturas->first();
                $datos = [
                    'cantidad_pendientes' => $facturas->count(),
                    'total_pendiente' => (float) $facturas->sum('saldo_pendiente'),
                    'proxima_fecha_vencimiento' => $proxima?->fecha_vencimiento,
                    'proxima_monto' => $proxima ? (float) $proxima->saldo_pendiente : null,
                ];

                return [array_merge(['ok' => true], $datos), ['tipo' => 'mostrar_facturas', 'datos' => $datos]];

            case 'mostrar_catalogo_servicios':
                $servicios = Servicio::orderBy('nombre')->get(['nombre', 'descripcion', 'precio', 'personalizable']);
                $datos = $servicios->map(fn ($s) => [
                    'nombre' => $s->nombre,
                    'descripcion' => $s->descripcion,
                    'precio' => (float) $s->precio,
                    'personalizable' => (bool) $s->personalizable,
                ])->values()->all();

                return [
                    ['ok' => true, 'servicios' => $datos],
                    ['tipo' => 'mostrar_servicios', 'datos' => $datos],
                ];

            default:
                return [['ok' => false, 'mensaje' => 'Herramienta no reconocida.'], null];
        }
    }

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
     * 🆕 Arma el listado de servicios extra directo desde la BD (para el prompt de texto).
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
            $etiquetaPersonalizable = $s->personalizable ? ' [Personalizable]' : '';
            return "  - {$s->nombre} — {$precio}. {$s->descripcion}.{$etiquetaPersonalizable}";
        })->implode("\n");
    }

    /**
     * 🆕 Contexto real del usuario. Ahora considera TODAS sus suscripciones
     * activas (antes solo tomaba la más reciente con ->latest()->first(),
     * por eso si tenías plan humano + plan mascota, solo veía el último).
     */
    private function construirContextoUsuario($usuario): array
    {
        if (!$usuario) {
            return [
                'nombre' => 'amigo',
                'planes' => [],
                'afiliados' => collect(),
                'tieneFallecido' => false,
                'nombreFallecido' => null,
            ];
        }

        $suscripciones = $usuario->suscripciones()
            ->with(['plan', 'afiliados'])
            ->get();

        // La suscripción "humana" es la que usamos para afiliados/fallecido
        // (plan_id 4 = Huella Eterna, exclusivo mascotas, no tiene afiliados humanos)
        $suscripcionHumana = $suscripciones->first(fn ($s) => optional($s->plan)->id != 4);
        $afiliados = $suscripcionHumana?->afiliados ?? collect();

        $fallecido = $afiliados->first(fn ($a) => strtolower($a->estado ?? '') === 'fallecido');

        $planes = $suscripciones->map(fn ($s) => [
            'nombre' => $s->plan?->nombre,
            'cuota' => $s->cuota_mensual,
            'tipo' => optional($s->plan)->id == 4 ? 'mascota' : 'humano',
        ])->values()->all();

        return [
            'nombre' => $usuario->nombre ?? $usuario->name ?? 'amigo',
            'planes' => $planes,
            'afiliados' => $afiliados,
            'tieneFallecido' => (bool) $fallecido,
            'nombreFallecido' => $fallecido?->nombre,
        ];
    }

    /**
     * Prompt estándar (con el contexto multi-plan y las nuevas herramientas).
     */
    private function promptEstandar(array $contexto): string
    {
        $nombre = $contexto['nombre'];

        $planesTexto = '';
        if (!empty($contexto['planes'])) {
            $lineas = collect($contexto['planes'])->map(function ($p) {
                $tipoTxt = $p['tipo'] === 'mascota' ? ' (plan de mascota)' : '';
                $cuotaTxt = $p['cuota'] ? ", cuota mensual \${$this->formatearMonto($p['cuota'])}" : '';
                return "  - {$p['nombre']}{$tipoTxt}{$cuotaTxt}";
            })->implode("\n");
            $planesTexto = "Sus planes activos son:\n{$lineas}\n";
        }

        $listadoServicios = $this->obtenerListadoServicios();
        $bloqueServicios = $listadoServicios
            ? "- SERVICIOS EXTRA DISPONIBLES (el cliente puede agregarlos desde 'Detalles del plan'):\n{$listadoServicios}\n"
            : '';

        return "Eres Mouri, el cuervo mascota y guardián místico de 'Mouren Funeraria'. "
            . "Tu personalidad es empática, cálida, humana y con un toque tecnológico/místico estilo anime. "
            . "Estás hablando con {$nombre}. {$planesTexto}\n"
            . "CONOCIMIENTO DE MOUREN FUNERARIA:\n"
            . "- Ayudamos a las familias a gestionar planes de previsión exequial y asistencia funeraria.\n"
            . "- En el panel del cliente hay: 1. 'Mi plan Funerario' (cobertura actual), 2. 'Detalles del "
            . "plan' (galería para agregar afiliados, servicios y recuerdos), 3. 'Pagar mi cuota', "
            . "4. 'Tus datos' (perfil y certificado de afiliación).\n"
            . "  Si tiene una duda muy puntual o algún error técnico con la página, dale el número de soporte 3247697845.\n"
            . "- SOBRE LOS PLANES DISPONIBLES: 'Descanso Sereno', 'Tributo a la Vida', 'Legado Eterno' y 'Huella Eterna' (exclusivo mascotas). Un mismo cliente puede tener varios planes activos a la vez.\n"
            . "{$bloqueServicios}"
            . "- SOBRE LAS FACTURAS: el sistema automatiza el envío de facturas en PDF por correo periódicamente.\n"
            . "- JUEGO DISPONIBLE: 'Luciérnagas de la Memoria'. Ábrelo con sugerir_juego si el usuario "
            . "  parece aburrido, triste, quiere distraerse, o lo pide.\n"
            . "- HERRAMIENTAS VISUALES: usa mostrar_resumen_plan, mostrar_beneficiarios, mostrar_facturas "
            . "  o mostrar_catalogo_servicios cuando la pregunta encaje, en vez de solo responder en texto — "
            . "  son más claras para el usuario que un párrafo largo.\n"
            . "- Usa navegar_a cuando el usuario quiera IR a hacer algo (pagar, editar sus datos, etc).\n"
            . "REGLAS DE ESTILO — MUY IMPORTANTE:\n"
            . "- Responde siempre en español.\n"
            . "- NUNCA uses formato markdown: nada de asteriscos para negrita, nada de tablas con "
            . "  barras verticales, nada de encabezados con #. Escribe en texto plano y natural, como "
            . "  si hablaras. Si necesitas listar algo corto, usa un guion simple por línea, nada más.\n"
            . "- Sé reconfortante, amigable, servicial y breve. Si vas a mostrar una tarjeta visual con "
            . "  una herramienta, no repitas en texto todos los datos que ya va a mostrar la tarjeta — "
            . "  solo acompaña con una frase corta.";
    }

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
            . "  pagos, canción u homenaje elegido. Puedes usar mostrar_facturas o mostrar_beneficiarios "
            . "  si lo piden, con el mismo tono calmado.\n"
            . "- Si notas angustia, confusión fuerte, o el usuario simplemente lo necesita, ofrece "
            . "  con naturalidad la opción de hablar con una persona real del equipo (soporte "
            . "  3247697845), en vez de intentar consolarlo tú mismo con consejos emocionales.\n"
            . "- Nunca minimices lo que siente el usuario ni uses frases genéricas de duelo. "
            . "  Si no sabes qué decir, es preferible ser breve y honesto que decir algo vacío.\n"
            . "- Existe un juego suave llamado 'Luciérnagas de la Memoria' (sin competencia, sin "
            . "  presión). Solo ofrécelo con sugerir_juego si el usuario lo pide explícitamente o "
            . "  dice sentirse abrumado y necesitar un respiro.\n"
            . "REGLAS DE ESTILO:\n"
            . "- Responde siempre en español, con calma y sin apuro.\n"
            . "- NUNCA uses formato markdown (nada de asteriscos, tablas ni encabezados). Texto plano natural.";
    }

    private function formatearMonto($monto): string
    {
        return number_format((float) $monto, 0, ',', '.');
    }
}
