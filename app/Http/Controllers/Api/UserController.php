<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
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
        // 1. Validación de campos con mensajes personalizados
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
                'cedula' => $request->cedula,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'tipo_documento_id' => $request->tipo_documento_id,
                'genero_id' => $request->genero_id,
                'estado_id' => 1, // Activo por defecto
                'tipo_usuario_id' => $request->tipo_usuario_id ?? 2, // Cliente por defecto
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'telefono' => $request->telefono,
            ]);

            // ✅ LA CLAVE PARA TU SOLICITUD:
            // Usamos back() para que el usuario NO se vaya de la página todavía.
            // Esto permite que el componente React muestre el mensaje de éxito y al cuervo.
            return back()->with('message', '¡Usuario registrado con éxito! Bienvenido a Mouren.');

        } catch (\Exception $e) {
            // Si ocurre un error técnico (BD, etc.), regresamos con el error para el cuervo triste
            return back()->withErrors(['error' => 'No pudimos procesar tu registro: ' . $e->getMessage()]);
        }
    }

    /**
     * Actualizar datos del usuario.
     */
    public function update(Request $request, $id) {
        $user = User::find($id);
        if (!$user) return back()->withErrors(['mensaje' => 'Usuario no encontrado']);

        $request->validate([
            'email' => 'unique:users,email,' . $id,
            'cedula' => 'unique:users,cedula,' . $id,
        ]);

        $data = $request->all();

        // Si se editan nombres, se reconstruye el campo 'nombre'
        if ($request->has('nombre1') || $request->has('apellido1')) {
            $data['nombre'] = collect([
                $request->nombre1, $request->nombre2, $request->apellido1, $request->apellido2
            ])->filter()->implode(' ');
        }

        // Manejo de cambio de contraseña
        if ($request->has('password') && !empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        
        return back()->with('message', 'Datos actualizados correctamente.');
    }

    /**
     * Eliminar usuario permanentemente.
     */
    public function destroy($id) {
        $user = User::find($id);
        if ($user) {
            $user->delete();
        }
        
        return back()->with('message', 'El usuario ha sido eliminado del sistema.');
    }
}