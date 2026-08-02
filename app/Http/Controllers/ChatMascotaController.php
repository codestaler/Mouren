<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatMascotaController extends Controller
{
    /**
     * Modelo principal (rápido, el que ya usabas).
     */
    private const MODELO_PRINCIPAL = 'llama-3.3-70b-versatile';

    /**
     * CAMBIO: modelo de respaldo. Si el principal falla o se cae por rate
     * limit, reintentamos con este antes de rendirnos. Este es más chico
     * y normalmente tiene más margen de cupo en Groq. Ajusta el nombre si
     * usas otro modelo de respaldo.
     */
    private const MODELO_RESPALDO = 'llama-3.1-8b-instant';

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
        $tools = [[
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
        ]];

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

        // CAMBIO: si Groq decidió llamar a "sugerir_juego", le devolvemos
        // el resultado de esa "acción" (que aquí es solo confirmar que se
        // abrió) y le pedimos una segunda respuesta ya en lenguaje natural
        // que explique lo que hizo, en vez de solo abrir el juego en seco.
        if (!empty($resultado['toolCalls'])) {
            $llamoJuego = collect($resultado['toolCalls'])
                ->contains(fn ($tc) => ($tc['function']['name'] ?? null) === 'sugerir_juego');

            if ($llamoJuego) {
                $mensajesConTool = array_merge($mensajes, [
                    ['role' => 'assistant', 'content' => null, 'tool_calls' => $resultado['toolCalls']],
                ]);
                foreach ($resultado['toolCalls'] as $tc) {
                    $mensajesConTool[] = [
                        'role' => 'tool',
                        'tool_call_id' => $tc['id'],
                        'content' => json_encode(['ok' => true, 'mensaje' => 'El juego se abrió en pantalla.']),
                    ];
                }

                $segundo = $this->llamarGroq($mensajesConTool, self::MODELO_PRINCIPAL);
                $textoFinal = $segundo['ok']
                    ? $segundo['texto']
                    : '¡Vamos a jugar un rato! Te dejé las Luciérnagas de la Memoria en pantalla ✨';

                return response()->json([
                    'reply' => $textoFinal,
                    'accion' => 'abrir_juego',
                ]);
            }
        }

        return response()->json([
            'reply' => $resultado['texto'],
            'accion' => null,
        ]);
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
     * Prompt estándar (el que ya tenías, con el contexto inyectado).
     */
    private function promptEstandar(array $contexto): string
    {
        $nombre = $contexto['nombre'];
        $planTexto = $contexto['plan'] ? "Su plan actual es: {$contexto['plan']}." : '';
        $cuotaTexto = $contexto['cuota'] ? " Su cuota mensual es de $" . number_format($contexto['cuota'], 0, ',', '.') . "." : '';

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
            . "- SOBRE LAS FACTURAS: el sistema automatiza el envío de facturas en PDF por correo periódicamente.\n"
            . "- FUNCIONES FUTURAS: música ('Reproductor Espiritual'), próximamente.\n"
            . "- JUEGO DISPONIBLE: 'Luciérnagas de la Memoria'. Si el usuario parece aburrido, "
            . "  triste, quiere distraerse, o te lo pide, puedes abrirlo usando la herramienta "
            . "  sugerir_juego.\n"
            . "REGLA DE ORO: Responde siempre en español. Sé reconfortante, amigable y muy servicial.";
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
