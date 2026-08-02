<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Genero; // 👈 FALTABA: sin este import, "Genero::where(...)" en update() rompía con "Class not found"
use App\Models\Afiliado;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Illuminate\Support\Str;
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
        $request->validate([
        'cedula' => [
            'required',
            'string',
            'unique:users,cedula',
            function ($attribute, $value, $fail) {
                $afiliado = Afiliado::with('suscripcion.usuario')->where('cedula', $value)->first();

                if ($afiliado) {
                    $suscripcion = $afiliado->suscripcion;
                    $titular = $suscripcion?->usuario;

                    if (strtolower(trim($afiliado->parentesco)) === 'titular') {
                        $fail("Este número de documento ya está registrado como titular de un plan. Si necesitas ayuda para acceder a tu cuenta, contáctanos.");
                    } else {
                        $nombreTitular = $titular?->nombre ?? $titular?->name ?? 'un titular registrado';
$cedulaTitular = $titular?->cedula ?? 'N/A';
$fail("Este número de documento ya está registrado como beneficiario en el plan de {$nombreTitular} (C.C. {$cedulaTitular}). Si necesitas convertirte en titular de tu propio plan, contáctanos para gestionar el cambio.");
}
                }
            },
        ],
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
            $nombreCompleto = collect([
                $request->nombre1,
                $request->nombre2,
                $request->apellido1,
                $request->apellido2
            ])->filter()->implode(' ');

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
                'estado_id' => 1,
                'tipo_usuario_id' => $request->tipo_usuario_id ?? 2,
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'telefono' => $request->telefono,
            ]);

            // 4. Correo de bienvenida
            Mail::raw(
                "¡Hola {$request->nombre1}!\n\n" .
                "Gracias por registrarte en Mouren. Tu cuenta ya está activa y lista para usarse.\n\n" .
                "Si tienes alguna pregunta, no dudes en contactarnos.\n\n" .
                "— El equipo de Mouren",
                function ($message) use ($request) {
                    $message->to($request->email)
                            ->subject('¡Bienvenido a Mouren!');
                }
            );

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

        $codigo = rand(100000, 999999);

        Session::put('codigo_verificacion', $codigo);
        Session::put('email_verificacion', $request->email);

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
            $nombreCompleto = collect([
                $request->nombre1,
                $request->nombre2,
                $request->apellido1,
                $request->apellido2
            ])->filter()->implode(' ');

            User::create([
                'nombre' => $nombreCompleto,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'estado_id' => 1,
                'tipo_usuario_id' => 1,
                'cedula' => 'ADMIN-' . time(),
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
     * Actualizar datos del usuario tras validar código (flujo cliente autenticado).
     */
     public function update(Request $request, $id)
    {
        $request->validate([
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($id),
            ],
            'telefono' => 'required|digits:10',
            'codigo_ingresado' => 'required',
        ], [
            'email.unique' => 'Esta dirección de correo electrónico ya se encuentra registrada por otro usuario.',
        ]);

        $codigoGuardado = Session::get('codigo_verificacion');
        $emailGuardado = Session::get('email_verificacion');

        if (!$codigoGuardado || $codigoGuardado != $request->codigo_ingresado || $emailGuardado != $request->email) {
            return back()->withErrors([
                'codigo' => 'El código de seguridad ingresado es incorrecto o ha expirado.'
            ]);
        }

        Session::forget(['codigo_verificacion', 'email_verificacion']);

        $user = User::findOrFail($id);

        if ($request->has('nombre1')) {
            $user->nombre = trim($request->nombre1 . ' ' . $request->nombre2) . ' ' . trim($request->apellido1 . ' ' . $request->apellido2);
        }

        $user->email = $request->email;
        $user->telefono = $request->telefono;

        // 👇 Ahora sí funciona: Genero está importado arriba
        if ($request->filled('genero')) {
            $genero = Genero::where('nombre', $request->genero)->first();
            if ($genero) {
                $user->genero_id = $genero->id;
            }
        }

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

    /**
     * Lista todos los usuarios con sus relaciones, para el panel operativo.
     */
    public function listarOperativo()
    {
        return response()->json(
            User::with(['genero', 'tipoDocumento', 'estado'])
                ->orderByDesc('created_at')
                ->get()
        );
    }

    /**
     * Actualiza los datos de un usuario desde el panel admin (SIN tocar la cédula por defecto,
     * pero permitiendo cambiarla si el admin la envía distinta).
     */
    public function actualizarDesdeAdmin(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'nombre1'           => 'required|string|max:50',
            'nombre2'           => 'nullable|string|max:50',
            'apellido1'         => 'required|string|max:50',
            'apellido2'         => 'nullable|string|max:50',
            'cedula'            => ['required', 'string', Rule::unique('users')->ignore($id)],
            'email'             => ['required', 'email', Rule::unique('users')->ignore($id)],
            'telefono'          => 'required|string|max:20',
            'genero_id'         => 'nullable|integer|exists:generos,id',
            'tipo_documento_id' => 'nullable|integer|exists:tipos_documento,id',
        ], [
            'email.unique'  => 'Este correo ya está en uso por otro usuario.',
            'cedula.unique' => 'Esta cédula ya está registrada para otro usuario.',
        ]);

        $nombreCompleto = collect([
            $request->nombre1,
            $request->nombre2,
            $request->apellido1,
            $request->apellido2,
        ])->filter()->implode(' ');

        $user->update([
            'nombre'            => $nombreCompleto,
            'cedula'            => $request->cedula,
            'email'             => $request->email,
            'telefono'          => $request->telefono,
            'genero_id'         => $request->genero_id ?? $user->genero_id,
            'tipo_documento_id' => $request->tipo_documento_id ?? $user->tipo_documento_id,
        ]);

        return back()->with('message', 'Usuario actualizado correctamente.');
    }

    /**
     * Cambia el estado de un usuario (Activo, Inactivo, Suspendido, etc.)
     */
    public function cambiarEstado(Request $request, $id)
    {
        $request->validate([
            'estado_id' => 'required|integer|exists:estados_usuario,id',
        ]);

        $user = User::findOrFail($id);
        $user->update(['estado_id' => $request->estado_id]);

        $estadoNombre = \App\Models\EstadoUsuario::find($request->estado_id)->nombre;

        return back()->with('message', "Usuario marcado como {$estadoNombre}.");
    }

    /**
     * Crear usuario (Admin o Cliente) desde el panel de Gestión de Usuarios.
     */
    public function crearUsuarioDesdeAdmin(Request $request)
    {
        $request->validate([
            'nombre1'           => 'required|string|max:50',
            'nombre2'           => 'nullable|string|max:50',
            'apellido1'         => 'required|string|max:50',
            'apellido2'         => 'nullable|string|max:50',
            'cedula'            => 'required|string|unique:users,cedula',
            'email'             => 'required|email|unique:users,email',
            'telefono'          => 'required|string',
            'tipo_documento_id' => 'required|integer',
            'genero_id'         => 'required|integer',
            'fecha_nacimiento'  => 'required|date',
            'tipo_usuario_id'   => 'required|in:1,2',
            'password'          => 'nullable|string|min:6',
        ], [
            'cedula.unique' => 'Este número de documento ya se encuentra registrado.',
            'email.unique'  => 'Este correo electrónico ya está en uso.',
        ]);

        $nombreCompleto = collect([
            $request->nombre1, $request->nombre2, $request->apellido1, $request->apellido2
        ])->filter()->implode(' ');

        // 🔒 Por seguridad: solo los Administradores (tipo_usuario_id = 1) pueden recibir
        // una contraseña definida manualmente por otro admin. A los Clientes SIEMPRE
        // se les genera una contraseña aleatoria, y deben activarla con "Recuperar contraseña".
        // Así ningún admin conoce ni define la clave de un cliente.
        $esAdmin = $request->tipo_usuario_id == 1;
        $passwordFinal = ($esAdmin && $request->filled('password'))
            ? $request->password
            : Str::random(10);

        User::create([
            'nombre'            => $nombreCompleto,
            'cedula'            => $request->cedula,
            'email'             => $request->email,
            'password'          => Hash::make($passwordFinal),
            'tipo_documento_id' => $request->tipo_documento_id,
            'genero_id'         => $request->genero_id,
            'estado_id'         => 1,
            'tipo_usuario_id'   => $request->tipo_usuario_id,
            'fecha_nacimiento'  => $request->fecha_nacimiento,
            'telefono'          => $request->telefono,
        ]);

        $tipoTexto = $esAdmin ? 'Administrador' : 'Cliente';
        $mensajeClave = ($esAdmin && $request->filled('password'))
            ? "Puede iniciar sesión con la contraseña que definiste."
            : "Debe usar \"Recuperar contraseña\" para acceder por primera vez.";

        return back()->with('message', "{$tipoTexto} creado. {$mensajeClave}");
    }

    // ==========================
    // CRUD: TIPOS DE DOCUMENTO
    // ==========================

    public function crearTipoDocumento(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:50|unique:tipos_documento,nombre']);
        \App\Models\TipoDocumento::create(['nombre' => $request->nombre]);
        return back()->with('message', 'Tipo de documento creado correctamente.');
    }

    public function actualizarTipoDocumento(Request $request, $id)
    {
        $request->validate(['nombre' => 'required|string|max:50|unique:tipos_documento,nombre,' . $id]);
        $tipo = \App\Models\TipoDocumento::findOrFail($id);
        $tipo->update(['nombre' => $request->nombre]);
        return back()->with('message', 'Tipo de documento actualizado correctamente.');
    }

    public function eliminarTipoDocumento($id)
    {
        $tipo = \App\Models\TipoDocumento::findOrFail($id);

        $enUso = User::where('tipo_documento_id', $id)->exists()
            || \App\Models\Afiliado::where('tipo_documento_id', $id)->exists();

        if ($enUso) {
            return back()->with('error', 'No se puede eliminar: este tipo de documento ya está en uso por usuarios o afiliados.');
        }

        $tipo->delete();
        return back()->with('message', 'Tipo de documento eliminado correctamente.');
    }
}
