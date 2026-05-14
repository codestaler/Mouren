<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * El template raíz que se carga en la primera visita.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determina la versión actual de los assets.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define las propiedades que se comparten por defecto con React.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            
            // Datos de autenticación
            'auth' => [
                'user' => $request->user(),
            ],

            // ✅ ESTA ES LA SECCIÓN CLAVE PARA LOS MENSAJES:
            // Compartimos los datos "flash" de la sesión para que aparezcan en props.flash
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ];
    }
}