<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = Auth::user();

        // 🔒 Bloqueamos el acceso si el usuario no está Activo (Inactivo, Suspendido, etc.)
        // Cargamos la relación 'estado' para comparar por nombre en vez de asumir un ID fijo.
        $user->loadMissing('estado');

        if (!$user->estado || $user->estado->nombre !== 'Activo') {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Tu cuenta se encuentra ' . ($user->estado->nombre ?? 'inactiva') . '. Contacta a un administrador si crees que esto es un error. Numero de Soporte 3247697488',
            ]);
        }

        $request->session()->regenerate();

        // 🚦 ¡Aquí tomamos el control del flujo de Mouren!
        if ($user->tipo_usuario_id === 1) {
            // Si es Administrador, lo desviamos directito a su panel de control
            return redirect()->route('admin.dashboard');
        }
        // Si es un cliente común, sigue su camino original sin enterarse de nada
        return redirect()->intended(route('dashboard', absolute: false));
    }
    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/');
    }
}
