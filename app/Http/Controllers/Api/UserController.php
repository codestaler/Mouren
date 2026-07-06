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
use Illuminate\Validation\Rule;

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
     * Crear un nuevo usuario Administrador desde el panel.
     */
    public function storeAdmin(Request $request) {
        // 1. Validación simplificada para administradores
        $request->validate([
            'nombre1' => 'required|string|max:50',
            'apellido1' => 'required|string|max:50',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|confirmed|min:6',
        ], [
            'email.unique' => 'Este correo electrónico ya está en uso.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
        ]);

        try {
            // 2. Construcción del nombre completo (igual que en clientes)
            $nombreCompleto = collect([
                $request->nombre1, 
                $request->nombre2, 
                $request->apellido1, 
                $request->apellido2
            ])->filter()->implode(' ');

            // 3. Creación del registro con tipo_usuario_id = 1 (Administrador)
            User::create([
                'nombre' => $nombreCompleto, 
                'nombre1' => $request->nombre1,
                'nombre2' => $request->nombre2,
                'apellido1' => $request->apellido1,
                'apellido2' => $request->apellido2,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'estado_id' => 1,          // Activo por defecto
                'tipo_usuario_id' => 1,    // 👈 ¡FORZAMOS EL 1 PARA QUE SEA ADMIN!
                // Colocamos valores nulos o por defecto para campos que un admin no necesita obligatoriamente al crearse
                'cedula' => 'ADMIN-' . time(), // Genera un identificador único temporal si el campo es UNIQUE en BD
                'tipo_documento_id' => 1,  
                'genero_id' => 1,          
                'fecha_nacimiento' => now()->format('Y-m-d'),
                'telefono' => $request->telefono ?? '0000000000',
            ]);

            return redirect()->back()->with('message', '¡Nuevo administrador registrado con éxito!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'No pudimos crear el administrador: ' . $e->getMessage()]);
        }
    }
    /**
     * Actualizar datos del usuario tras validar código.
     */
     public function update(Request $request, $id)
    {
        // 1. Validamos estrictamente antes de tocar la base de datos
        $request->validate([
            'email' => [
                'required',
                'email',
                // Esto comprueba que sea único en la tabla 'users', pero IGNORA al usuario actual ($id)
                Rule::unique('users')->ignore($id), 
            ],
            'telefono' => 'required|digits:10',
            'codigo_ingresado' => 'required',
        ], [
            'email.unique' => 'Esta dirección de correo electrónico ya se encuentra registrada por otro usuario.',
        ]);

        // 2. Lógica para verificar tu token de 6 dígitos
        $codigoGuardado = Session::get('codigo_verificacion');
        $emailGuardado = Session::get('email_verificacion');

        // Si el código no coincide o el correo cambió a mitad de camino, frenamos el proceso
        if (!$codigoGuardado || $codigoGuardado != $request->codigo_ingresado || $emailGuardado != $request->email) {
            return back()->withErrors([
                'codigo' => 'El código de seguridad ingresado es incorrecto o ha expirado.'
            ]);
        }

        // 3. Si el token es correcto, limpiamos la sesión y actualizas los campos
        Session::forget(['codigo_verificacion', 'email_verificacion']);
        
        $user = User::findOrFail($id);
        
        // Concatenamos el nombre si tu base de datos tiene un campo estructurado único
        if ($request->has('nombre1')) {
            $user->nombre = trim($request->nombre1 . ' ' . $request->nombre2) . ' ' . trim($request->apellido1 . ' ' . $request->apellido2);
        }
        
        $user->email = $request->email;
        $user->telefono = $request->telefono;
        $user->save();

        return redirect()->back()->with('message', 'Tus datos se actualizaron de manera correcta.');
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