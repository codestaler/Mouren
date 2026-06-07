<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;    // 👈 IMPORTANTE: Añadimos esto para enviar correos
use Illuminate\Support\Facades\Session; // 👈 IMPORTANTE: Añadimos esto para guardar el token temporal
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Listar todos los usuarios para el panel administrativo.
     */
    public function index() {
        return Inertia::render('Admin/Users', [
            'users' => User::all()
        ]);
    }

    /**
     * Crear un nuevo usuario (Maneja el registro de Mouren).
     */
    public function store(Request $request) {
        // 1. Validación de campos
        $request->validate([
            'cedula' => 'required|string|unique:users,cedula',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:6',
            'tipo_documento_id' => 'required|integer',
            'genero_id' => 'required|integer',
            'fecha_nacimiento' => 'required|date',
            'telefono' => 'required|string',
            'nombre1' => 'required|string|max:50',
            'apellido1' => 'required|string|max:50',
        ], [
            'cedula.unique' => 'Este número de documento ya se encuentra registrado.',
            'email.unique' => 'Este correo electrónico ya está en uso.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        try {
            // 2. Construcción del nombre completo
            $nombreCompleto = collect([
                $request->nombre1, 
                $request->nombre2, 
                $request->apellido1, 
                $request->apellido2
            ])->filter()->implode(' ');

            // 3. Creación del registro en la base de datos
            $user = User::create([
                'nombre' => $nombreCompleto, 
                'nombre1' => $request->nombre1,
                'nombre2' => $request->nombre2,
                'apellido1' => $request->apellido1,
                'apellido2' => $request->apellido2,
                'cedula' => $request->cedula,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tipo_documento_id' => $request->tipo_documento_id,
                'genero_id' => $request->genero_id,
                'estado_id' => 1, // Activo por defecto
                'tipo_usuario_id' => $request->tipo_usuario_id ?? 2, // 2 para Cliente
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'telefono' => $request->telefono,
            ]);

            // 4. Retorno a la página anterior con mensaje flash
            return redirect()->back()->with('message', '¡registro exitoso! mouri te da la bienvenida.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'no pudimos procesar tu registro: ' . $e->getMessage()]);
        }
    }

    /**
     * Generar y enviar el código por correo.
     */
    public function enviarCodigoVerificacion(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Generar un código aleatorio de 6 dígitos
        $codigo = rand(100000, 999999);

        // Guardar el código en la sesión del usuario (expira en 10 minutos)
        Session::put('codigo_verificacion', $codigo);
        Session::put('email_verificacion', $request->email);

        // Enviar el correo electrónico usando Mail
        Mail::raw("Tu código de seguridad para actualizar tus datos en Mouren es: {$codigo}", function ($message) use ($request) {
            $message->to($request->email)
                    ->subject('Código de Verificación - Mouren');
        });

        return response()->json(['success' => true, 'message' => 'Código enviado con éxito.']);
    }

    /**
     * Actualizar datos del usuario tras validar código.
     */
    public function update(Request $request, $id)
    {
        // Validar que el código que viene del formulario coincida con el de la sesión
        $codigoSesion = Session::get('codigo_verificacion');
        
        if (!$codigoSesion || $request->codigo_ingresado != $codigoSesion) {
            return back()->withErrors(['codigo' => 'El código de verificación es incorrecto o ha expirado.']);
        }

        // Si el código es correcto, limpiamos la sesión para que no se use de nuevo
        Session::forget('codigo_verificacion');

        // Construir también aquí el nombre completo por si cambia de apellidos o nombres
        $nombreCompleto = collect([
            $request->nombre1, 
            $request->nombre2, 
            $request->apellido1, 
            $request->apellido2
        ])->filter()->implode(' ');

        $user = User::findOrFail($id);
        $user->update([
            'nombre'    => $nombreCompleto, // Mantenemos la consistencia de tu DB
            'nombre1'   => $request->nombre1,
            'nombre2'   => $request->nombre2,
            'apellido1' => $request->apellido1,
            'apellido2' => $request->apellido2,
            'telefono'  => $request->telefono,
            'email'     => $request->email,
        ]);

        if ($request->filled('password')) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        // 💡 OJO AQUÍ: Tu ruta de renderizado de formulario en web.php se llama 'datos.edit', no 'user.datos'
        return redirect()->route('datos.edit')->with('message', 'Tus datos se han actualizado correctamente.');
    }

    /**
     * Eliminar usuario permanentemente.
     */
    public function destroy($id) {
        $user = User::find($id);
        if ($user) {
            $user->delete();
        }
        
        return back()->with('message', 'el usuario ha sido eliminado del sistema.');
    }
}