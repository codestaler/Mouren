<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use PragmaRX\Google2FAQRCode\Google2FA;

class AjustesController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        return Inertia::render('Admin/Ajustes', [
            'usuario' => [
                'id'                        => $user->id,
                'nombre'                    => $user->nombre,
                'cedula'                    => $user->cedula,
                'email'                     => $user->email,
                'telefono'                  => $user->telefono,
                'avatar'                    => $user->avatar ? Storage::url($user->avatar) : null,
                'idioma'                    => $user->idioma,
                'tema'                      => $user->tema,
                'notificaciones_activadas'  => $user->notificaciones_activadas,
                'dos_pasos_activo'          => $user->tieneDosPasosActivo(),
                'genero_id'                 => $user->genero_id,
                'tipo_documento_id'         => $user->tipo_documento_id,
            ],
            'generos'        => \App\Models\Genero::all(),
            'tiposDocumento' => \App\Models\TipoDocumento::all(),
        ]);
    }

    // --- PERFIL ---

    public function actualizarDatos(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'nombre1'           => 'required|string|max:50',
            'nombre2'           => 'nullable|string|max:50',
            'apellido1'         => 'required|string|max:50',
            'apellido2'         => 'nullable|string|max:50',
            'telefono'          => 'required|string|max:20',
            'email'             => ['required', 'email', \Illuminate\Validation\Rule::unique('users')->ignore($user->id)],
            'genero_id'         => 'nullable|integer|exists:generos,id',
            'tipo_documento_id' => 'nullable|integer|exists:tipos_documento,id',
        ], [
            'email.unique' => 'Este correo ya está en uso por otro usuario.',
        ]);

        $nombreCompleto = collect([
            $request->nombre1, $request->nombre2, $request->apellido1, $request->apellido2,
        ])->filter()->implode(' ');

        $user->update([
            'nombre'            => $nombreCompleto,
            'telefono'          => $request->telefono,
            'email'             => $request->email,
            'genero_id'         => $request->genero_id ?? $user->genero_id,
            'tipo_documento_id' => $request->tipo_documento_id ?? $user->tipo_documento_id,
        ]);

        return back()->with('message', 'Tus datos se actualizaron correctamente.');
    }

    public function actualizarAvatar(Request $request)
    {
        $request->validate([
            'avatar' => 'required|image|max:2048',
        ]);

        $user = Auth::user();

        if ($user->avatar) {
            Storage::delete($user->avatar);
        }

        $ruta = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $ruta]);

        return back()->with('message', 'Foto de perfil actualizada.');
    }

    public function cerrarOtrasSesiones(Request $request)
    {
        $request->validate(['password' => 'required']);

        if (!Hash::check($request->password, Auth::user()->password)) {
            return back()->withErrors(['password' => 'La contraseña no es correcta.']);
        }

        Auth::logoutOtherDeviceSessions($request->password);

        return back()->with('message', 'Se cerró la sesión en todos los demás dispositivos.');
    }

    // --- SEGURIDAD: CONTRASEÑA ---

    public function cambiarPassword(Request $request)
    {
        $request->validate([
            'password_actual' => 'required',
            'password'        => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = Auth::user();

        if (!Hash::check($request->password_actual, $user->password)) {
            return back()->withErrors(['password_actual' => 'La contraseña actual no es correcta.']);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return back()->with('message', 'Tu contraseña se actualizó correctamente.');
    }

    // --- SEGURIDAD: 2FA ---

    public function iniciar2FA(Request $request)
    {
        $google2fa = new Google2FA();
        $secreto = $google2fa->generateSecretKey();

        $request->session()->put('2fa_secreto_temporal', $secreto);

        $qrCodeUrl = $google2fa->getQRCodeInline(
            config('app.name'),
            Auth::user()->email,
            $secreto
        );

        return response()->json([
            'secreto' => $secreto,
            'qr'      => $qrCodeUrl,
        ]);
    }

    public function confirmar2FA(Request $request)
    {
        $request->validate(['codigo' => 'required|digits:6']);

        $secreto = $request->session()->get('2fa_secreto_temporal');

        if (!$secreto) {
            return back()->with('error', 'La sesión de configuración expiró, intenta de nuevo.');
        }

        $google2fa = new Google2FA();
        $valido = $google2fa->verifyKey($secreto, $request->codigo);

        if (!$valido) {
            return back()->withErrors(['codigo' => 'El código ingresado no es válido.']);
        }

        Auth::user()->update([
            'two_factor_secret'        => encrypt($secreto),
            'two_factor_confirmed_at'  => now(),
        ]);

        $request->session()->forget('2fa_secreto_temporal');

        return back()->with('message', 'Verificación en dos pasos activada correctamente.');
    }

    public function desactivar2FA(Request $request)
    {
        $request->validate(['password' => 'required']);

        if (!Hash::check($request->password, Auth::user()->password)) {
            return back()->withErrors(['password' => 'La contraseña no es correcta.']);
        }

        Auth::user()->update([
            'two_factor_secret'       => null,
            'two_factor_confirmed_at' => null,
        ]);

        return back()->with('message', 'Verificación en dos pasos desactivada.');
    }

    // --- PREFERENCIAS ---

    public function actualizarIdioma(Request $request)
    {
        $request->validate(['idioma' => 'required|in:es,en']);
        Auth::user()->update(['idioma' => $request->idioma]);
        return back()->with('message', 'Idioma actualizado.');
    }

    public function actualizarTema(Request $request)
    {
        $request->validate(['tema' => 'required|in:claro,oscuro']);
        Auth::user()->update(['tema' => $request->tema]);
        return back()->with('message', 'Apariencia actualizada.');
    }

    public function actualizarNotificaciones(Request $request)
    {
        $request->validate(['activadas' => 'required|boolean']);
        Auth::user()->update(['notificaciones_activadas' => $request->activadas]);
        return back()->with('message', $request->activadas ? 'Notificaciones activadas.' : 'Notificaciones desactivadas.');
    }
}
