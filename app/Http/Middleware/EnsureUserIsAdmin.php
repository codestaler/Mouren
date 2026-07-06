<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 👮‍♂️ Si el usuario está logueado y es Tipo 1 (Administrador), lo dejamos pasar
        if (Auth::check() && Auth::user()->tipo_usuario_id === 1) {
            return $next($request);
        }

        // Si es un cliente o un intruso, lo regresamos al inicio con un mensaje de error
        return redirect('/')->withErrors([
            'email' => 'No tienes los permisos necesarios para acceder al panel de administración.'
        ]);
    }
}