<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatMascotaController extends Controller
{
    /**
     * Maneja la petición única del chat de Mouri usando Google Gemini.
     */
    public function __invoke(Request $request)
    {
        // 1. Validar que llegue el mensaje desde el formulario de React
        $request->validate([
            'message' => 'required|string',
        ]);

        $mensajeUsuario = $request->input('message');

        // =========================================================================
        // ENTRENAMIENTO DE MOURI (System Prompt)
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
            . "- SOBRE LOS PLANES DISPONIBLES: Actualmente ofrecemos 4 planes principales:\n"
            . "  * 'Descanso Sereno'\n"
            . "  * 'Tributo a la Vida'\n"
            . "  * 'Legado Eterno'\n"
            . "  * 'Huella Eterna' (Este es nuestro plan especial exclusivo para mascotas).\n"
            . "- SOBRE LAS FACTURAS: Explícales que el sistema automatiza la generación y envío de sus facturas en PDF por correo periódicamente, así que no deben preocuparse.\n"
            . "- FUNCIONES FUTURAS: Si te piden música, diles que pronto activarás el 'Reproductor Espiritual' para poner melodías hermosas, y que también estás preparando juegos interactivos basados en la memoria y el legado.\n"
            . "REGLA DE ORO: Responde siempre en español. Sé reconfortante, amigable y muy servicial, haciendo sentir al usuario en un espacio seguro y tecnológico.";

        // =========================================================================
        // LLAMADA A LA API DE GOOGLE GEMINI
        // =========================================================================
// =========================================================================
        // LLAMADA A LA API DE GROQ (LLAMA 3)
        // =========================================================================
        try {
            // Tu API Key real de Groq
            $groqKey = env('GROQ_API_KEY');

            // Consumimos el endpoint compatible con OpenAI de Groq usando Llama 3
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$groqKey}",
                'Content-Type' => 'application/json',
            ])->post("https://api.groq.com/openai/v1/chat/completions", [
                'model' => 'llama-3.3-70b-versatile', // Modelo ultra rápido y eficiente para chat
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => $systemPrompt
                    ],
                    [
                        'role' => 'user',
                        'content' => $mensajeUsuario
                    ]
                ],
                'temperature' => 0.7
            ]);

            // Si Groq devuelve un error, lo mandamos al log para saber qué pasó
            if ($response->failed()) {
    \Log::error("ERROR DE GROQ -> Código: " . $response->status() . " | Cuerpo: " . $response->body());
    
    return response()->json([
        'error' => 'El plano espiritual de Mouri está parpadeando.',
        'debug' => $response->json() // <-- TEMPORAL, quitar en producción
    ], $response->status());
}

            // Procesamos la respuesta estándar de Groq
            $resultado = $response->json();
            $respuestaMouri = $resultado['choices'][0]['message']['content'] ?? 'Mis alas se cruzaron, ¿podrías repetir eso?';

            return response()->json([
                'reply' => $respuestaMouri
            ]);

        } catch (\Exception $e) {
            \Log::error("Error crítico en ChatMascotaController (Groq): " . $e->getMessage());
            
            return response()->json([
                'error' => 'Ocurrió un problema de conexión interna en el Santuario.'
            ], 500);
        }
    }
}