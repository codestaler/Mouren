<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
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

            // IMPORTANTE: NO usamos Auth::login($user) aquí para que el usuario
            // no sea redirigido al dashboard por los middlewares de Laravel
            // y pueda ver el mensaje de éxito de Mouri en el Registro.

            // 4. Retorno a la página anterior con mensaje flash
            return redirect()->back()->with('message', '¡registro exitoso! mouri te da la bienvenida.');

        } catch (\Exception $e) {
            // Si algo falla, volvemos atrás con el error para que Mouri se ponga triste
            return back()->withErrors(['error' => 'no pudimos procesar tu registro: ' . $e->getMessage()]);
        }
    }

    /**
     * Actualizar datos del usuario.
     */
    public function update(Request $request, $id) {
        $user = User::find($id);
        if (!$user) return back()->withErrors(['mensaje' => 'usuario no encontrado']);

        $request->validate([
            'email' => 'unique:users,email,' . $id,
            'cedula' => 'unique:users,cedula,' . $id,
        ]);

        $data = $request->all();

        if ($request->has('nombre1') || $request->has('apellido1')) {
            $data['nombre'] = collect([
                $request->nombre1, $request->nombre2, $request->apellido1, $request->apellido2
            ])->filter()->implode(' ');
        }

        if ($request->has('password') && !empty($request->password)) {
            $data['password'] = Hash::make($request->password);
        } else {
            unset($data['password']);
        }

        $user->update($data);
        
        return back()->with('message', 'datos actualizados correctamente.');
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