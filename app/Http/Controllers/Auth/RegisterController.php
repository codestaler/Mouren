<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RegisterController extends Controller
{
    /**
     * Muestra el formulario de registro de Mouren.
     * Carga los datos necesarios para los selectores desde la base de datos.
     */
    public function create() {
        // Traemos los datos de las tablas maestras para los selectores del formulario
        $tiposDocumento = DB::table('tipos_documentos')->get(); 
        $generos = DB::table('generos')->get();

        return Inertia::render('Auth/Register', [
            'tiposDocumento' => $tiposDocumento,
            'generos' => $generos
        ]);
    }

    /**
     * Procesa la creación del nuevo usuario.
     * Valida los datos y consolida la información en la tabla 'users'.
     */
    public function store(Request $request) {
        // 1. Validación estricta de campos
        $request->validate([
            'cedula' => 'required|string|unique:users,cedula',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:6',
            'tipo_documento_id' => 'required|integer',
            'fecha_nacimiento' => 'required|date',
            'genero_id' => 'required|integer',
            'telefono' => 'required|string|max:10',
            'nombre1' => 'required|string|max:50',
            'apellido1' => 'required|string|max:50',
        ], [
            // Mensajes personalizados para que el cuervo triste los muestre
            'cedula.unique' => 'Este número de documento ya se encuentra registrado.',
            'email.unique' => 'Este correo electrónico ya está en uso.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
            'telefono.max' => 'El teléfono no puede exceder los 10 dígitos.',
        ]);

        try {
            // 2. Consolidación de nombres (limpia espacios si no hay segundo nombre/apellido)
            $nombreCompleto = collect([
                $request->nombre1,
                $request->nombre2,
                $request->apellido1,
                $request->apellido2
            ])->filter()->implode(' ');

            // 3. Creación del registro en la base de datos
            User::create([
                'nombre' => $nombreCompleto,
                'cedula' => $request->cedula,
                'tipo_documento_id' => $request->tipo_documento_id,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'genero_id' => $request->genero_id,
                'telefono' => $request->telefono,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'estado_id' => 1,        // Usuario activo por defecto
                'tipo_usuario_id' => 2,  // Rol de Cliente para registros públicos
            ]);

            // ✅ Retornamos a la misma página (back) con un mensaje flash de éxito.
            // Esto permite que React detecte el mensaje y muestre al Cuervo Feliz.
            return back()->with('message', '¡Usuario registrado con éxito! Bienvenido a la familia Mouren.');

        } catch (\Exception $e) {
            // En caso de error inesperado, regresamos con el detalle para el cuervo triste
            return back()->withErrors([
                'error' => 'Hubo un problema al procesar el registro. Inténtalo de nuevo.'
            ]);
        }
    }
}