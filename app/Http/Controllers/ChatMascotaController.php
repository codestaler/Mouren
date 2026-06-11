<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatMascotaController extends Controller
{
    /**
     * Maneja la petición única del chat de Mouri.
     */
    public function __invoke(Request $request)
    {
        // 1. Validar que llegue el mensaje desde el formulario de React
        $request->validate([
            'message' => 'required|string',
        ]);

        $mensajeUsuario = $request->input('message');

        // =========================================================================
        // RESPUESTA A PREGUNTA 2: AQUÍ ENTRENAS A MOURI (Escribe todo lo que necesites)
        // =========================================================================
        $systemPrompt = "Eres Mouri, el cuervo mascota y guardián místico de 'Mouren Funeraria'. "
            . "Tu personalidad es empática, cálida, humana y con un toque tecnológico/místico estilo anime. "
            . "CONOCIMIENTO DE MOUREN FUNERARIA:\n"
            . "- Ayudamos a las familias a gestionar planes de previsión exequial y asistencia funeraria.\n"
            . "- En el panel o dashboard del cliente, ellos tienen las siguientes secciones:\n"
            . "  1. 'Mi plan Funerario': Donde ven su cobertura actual.\n"
            . "  2. 'Detalles del plan': Diseñado de forma hermosa como una galería de arte virtual.\n"
            . "  3. 'Pagar mi cuota': Para mantenerse al día con sus pagos.\n"
            . "  4. 'Tus datos': Información del perfil.\n"
            . "- SOBRE LAS FACTURAS: Explícales que el sistema automatiza la generación y envío de sus facturas en PDF por correo periódicamente, así que no deben preocuparse.\n"
            . "- FUNCIONES FUTURAS: Si te piden música, diles que pronto activarás el 'Reproductor Espiritual' para poner melodías hermosas, y que también estás preparando juegos interactivos basados en la memoria y el legado.\n"
            . "REGLA DE ORO: Responde siempre en español. Sé reconfortante, amigable y muy servicial, haciendo sentir al usuario en un espacio seguro y tecnológico."
            ."En este momento tenemos 4 planes, descanso sereno, tributo a a vida, legado eterno, y huella enerta este es de mascotas";


        // =========================================================================
        // RESPUESTA A PREGUNTA 1: CAPTURAR EL ERROR 503 DE LA API
        // =========================================================================
        try {
            // Ejemplo conectando con OpenAI (Modifica el endpoint o modelo según tu proveedor actual)
            $response = Http::withToken(env('OPENAI_API_KEY'))
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => 'gpt-4o-mini', // El modelo veloz y económico ideal para chats
                    'messages' => [
                        ['role' => 'system', 'content' => $systemPrompt], // Inyección de datos de entrenamiento
                        ['role' => 'user', 'content' => $mensajeUsuario]  // Lo que escribió el cliente
                    ],
                    'temperature' => 0.7,
                ]);

            // Si el proveedor de IA falla (da el error 503 por alta demanda u otros errores)
            if ($response->failed()) {
                return response()->json([
                    'error' => 'El plano espiritual de la IA está experimentando alta demanda.'
                ], $response->status()); // Devolvemos el mismo estatus (ej. 503) al React
            }

            // Si todo sale bien, procesamos la respuesta
            $resultado = $response->json();
            $respuestaMouri = $resultado['choices'][0]['message']['content'] ?? 'Mis alas se cruzaron, ¿podrías repetir eso?';

            // Retornamos la respuesta limpia que espera tu fetch en React
            return response()->json([
                'reply' => $respuestaMouri
            ]);

        } catch (\Exception $e) {
            // Si hay un error de código interno, se guarda en el log de Laravel (storage/logs/laravel.log)
            \Log::error("Error crítico en ChatMascotaController: " . $e->getMessage());
            
            return response()->json([
                'error' => 'Ocurrió un problema de conexión interna en el Santuario.'
            ], 500);
        }
    }
}