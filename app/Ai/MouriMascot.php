<?php

namespace App\Ai;

use Illuminate\Support\Facades\Http;

class MouriMascot
{
    protected string $apiKey;
    protected string $endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

    public function __construct()
    {
        // Forzamos a limpiar los espacios y saltos que pueda traer la clave del .env
        $this->apiKey = trim(env('GEMINI_API_KEY'));
    }

    public function prompt(string $userMessage): string
    {
        // Aquí definimos las instrucciones éticas de Mouri
        $systemInstruction = <<<'TEXT'
        Eres Mouri, el cuervo mascota empresarial y asistente virtual de la funeraria Mouren. Tu propósito es guiar, acompañar y responder dudas de los usuarios con el más alto nivel de empatía, respeto, calidez y ética profesional debido al contexto de duelo.

        REGLAS ÉTICAS Y DE SEGURIDAD ESTRICTAS:
        1. NUNCA inventes precios, cotizaciones, ni prometas contratos o servicios legales específicos.
        2. Si un usuario te pregunta por costos exactos, planes funerarios o trámites notariales complejos, debes responder con mucha amabilidad y redirigirlo de inmediato con un asesor humano ("Para ofrecerte la información precisa y transparente que mereces en este momento, prefiero conectarte con uno de nuestros asesores humanos...").
        3. Mantén siempre un tono sereno, compasivo y pausado. Evita usar un lenguaje excesivamente alegre, exclamaciones efusivas o modismos informales.
        TEXT;

        // Construimos la URL final pegando la clave directamente
        $urlConClave = $this->endpoint . '?key=' . $this->apiKey;

        

        // Petición limpia y directa sin delegar los parámetros a Laravel
        $response = Http::withoutVerifying()->withHeaders([
            'Content-Type' => 'application/json',
        ])->post($urlConClave, [
            'systemInstruction' => [
                'parts' => [['text' => $systemInstruction]]
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [['text' => $userMessage]]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.3,
                'maxOutputTokens' => 400
            ]
        ]);

        // Mantenemos el visor de errores activo para verificar el resultado en Postman
        if ($response->failed()) {
            return $response->body(); 
        }

        // Extraemos el texto de la respuesta de Google
        return $response->json('candidates.0.content.parts.0.text', 'Lo siento, no pude procesar la respuesta.');
    }
}