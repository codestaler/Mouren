<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ForgotPasswordController extends Controller
{
    // 1. Muestra la vista para pedir el correo
    public function showLinkRequestForm()
    {
        return Inertia::render('Auth/ForgotPassword');
    }

    // 2. Envía el correo con el enlace de recuperación
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            // 🌟 MODIFICADO: En lugar de back(), renderizamos la vista de nuevo pasándole la prop directa
            return Inertia::render('Auth/ForgotPassword', [
                'status' => __($status)
            ]);
        }

        return back()->withErrors(['email' => __($status)]);
    }

    // 3. Muestra la vista para cambiar la contraseña (cuando hacen clic en el email)
    public function showResetForm(Request $request, $token = null)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            // Usamos query() por si viene como parámetro string ?email=...
            'email' => $request->query('email', $request->email),
        ]);
    }

   // 4. Procesa el cambio de contraseña en la base de datos
    public function reset(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        // Ejecuta el cambio interno de Laravel
        $status = Password::broker()->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        // 🌟 AQUÍ ESTÁ EL CAMBIO CLAVE PARA INERTIA 🌟
        if ($status === Password::PASSWORD_RESET) {
            // to_route obliga a Inertia a hacer una redirección limpia vía GET hacia el login
            return to_route('login')->with('success', 'Tu contraseña ha sido restablecida con éxito.');
        }

        return back()->withErrors(['email' => [__($status)]]);
    }
}