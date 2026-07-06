<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Models\TipoDocumento; 
use App\Models\Genero;
use App\Models\Afiliado;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Clientes\ClienteDashboardController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\SuscripcionController;
use App\Models\Cancion;
use App\Http\Controllers\Api\CancionController;
use App\Http\Controllers\Api\PersonalizacionController;
use Inertia\Inertia;
use App\Http\Controllers\Api\SuscripcionMascotaController;
use App\Http\Controllers\ChatMascotaController;
use App\Http\Controllers\ClientPaymentsController;
use Illuminate\Support\Facades\Schedule;
use App\Http\Controllers\Api\Pagos\PagoController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\DashboardController;


// --- RUTAS PÚBLICAS ---
Route::get('/', fn() => Inertia::render('Home'))->name('home');
Route::get('/contactos', fn() => Inertia::render('Contactos'))->name('contactos');
Route::get('/quienes-somos', fn() => Inertia::render('QuienesSomos'))->name('quienes-somos');
Route::get('/planes', fn() => Inertia::render('Planes'))->name('planes');

// --- AUTENTICACIÓN (SOLO USUARIOS SIN INICIAR SESIÓN) ---
Route::middleware('guest')->group(function () {
    Route::get('/register', function () {
        return Inertia::render('Auth/Register', [
            'tiposDocumento' => TipoDocumento::all(), 
            'generos' => Genero::all(),
        ]);
    })->name('register');

    Route::post('/register-store', [UserController::class, 'store'])->name('register.store');


    // Por esto otro:
Route::get('/registro-super-oculto-admin', function () {
    return Inertia::render('Auth/AdminRegister', [
        'tiposDocumento' => \App\Models\TipoDocumento::all(), 
        'generos' => \App\Models\Genero::all(),
    ]);
});
    
    // 🌟 Tu vista de React para renderizar el Login
    Route::get('login', fn() => Inertia::render('Auth/Login'))->name('login');
    
    // 🌟 NUEVA: Esta ruta recibe los datos del formulario de login de tu React cuando le das a "Ingresar"
    Route::post('login', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'store']);

    // URLs limpias sin caracteres especiales para que no fallen en el navegador 
    // (Mantienen el mismo ->name() para que tu React no se rompa)
    Route::get('recuperar-clave', [ForgotPasswordController::class, 'showLinkRequestForm'])->name('password.request');
    Route::post('recuperar-clave', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');

    Route::get('cambiar-clave/{token}', [ForgotPasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('cambiar-clave', [ForgotPasswordController::class, 'reset'])->name('password.update');
});

// 🔒 RUTAS DEL ADMINISTRADOR (Protegidas por Login y por el rol de Admin)
Route::middleware(['auth', 'admin'])->group(function () {
    
    // Cambia la ruta del dashboard para que devuelva la vista real:
    Route::get('/admin/dashboard', function () {
        return Inertia::render('Admin/Dashboard'); 
    })->name('admin.dashboard');

    // Conectamos el Dashboard directamente a tu controlador personalizado
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

    // Ruta para listar a todos los usuarios
    Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');

    // Ruta para procesar la creación de NUEVOS administradores
    //aqui iba el Route::post('/admin/users/store-admin', [UserController::class, 'storeAdmin'])->name('admin.store');

    Route::post('/admin/users/store-admin', [UserController::class, 'storeAdmin'])->name('admin.store');

    // CORREGIDO: Ahora usa DashboardController en lugar del AdminController que no existe
    Route::get('/admin/gestion-usuarios', [DashboardController::class, 'gestionUsuarios'])->name('admin.usuarios');

});

// --- RUTAS PROTEGIDAS (PARA USUARIOS LOGUEADOS) ---
Route::middleware(['auth', 'verified'])->group(function () {
    
// 🦜 RUTAS DE MOURI IA
Route::get('/mouriia', function () {
    return Inertia::render('Clientes/MouriIa');
})->middleware(['auth']); 

// CORREGIDO: Quitamos el método 'store' y dejamos que use el __invoke original del controlador
Route::post('/chat/mouri', ChatMascotaController::class)->middleware(['auth'])->name('mouri.chat');

    Route::prefix('cliente')->group(function () {
        Route::get('/mi-plan', [SuscripcionController::class, 'miPlan'])->name('dashboard');
    });

    Route::get('/datos', function () {
        return Inertia::render('Clientes/Datos', [
            'auth_user' => auth()->user()
        ]);
    })->name('datos.edit');

    Route::post('/user-enviar-codigo', [UserController::class, 'enviarCodigoVerificacion'])->name('user.enviar-codigo');
    Route::put('/user-update/{id}', [UserController::class, 'update'])->name('user.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- PROCESO DE INSCRIPCIÓN A PLANES ---
    Route::get('/planes-disponibles', [PlanController::class, 'index'])->name('planes.index');
    Route::get('/planes/inscribir/{id}', [PlanController::class, 'inscribir'])->name('planes.inscribir');
    Route::post('/suscripciones/store', [SuscripcionController::class, 'store'])->name('suscripciones.store');

    Route::patch('/afiliados/{afiliado}', function (Request $request, Afiliado $afiliado) {
        $afiliado->update(['nombre' => $request->nombre]);
        return back()->with('message', 'Nombre del beneficiario actualizado correctamente');
    })->name('afiliados.update');

    // --- OTRAS RUTAS PROTEGIDAS ---
    Route::get('/mi-plan', [SuscripcionController::class, 'miPlan'])->name('mi.plan');
    Route::get('/detalles', [SuscripcionController::class, 'detallesPlan'])->name('detalles.plan');
    Route::post('/api/personalizacion/gabinete', [PersonalizacionController::class, 'guardarDesdeGabinete'])->name('personalizacion.gabinete');

    // ⬇️ RUTAS DE PAGOS ⬇️
    Route::get('/pagos', [ClientPaymentsController::class, 'index'])->name('cliente.pagos');
    Route::post('/cliente/pagos/{id}/procesar', [ClientPaymentsController::class, 'procesarPago']);
    Route::get('/cliente/factura/{id}/pdf', [ClientPaymentsController::class, 'descargarPdf'])->name('cliente.factura.pdf');
    Route::get('/cliente/estado-cuenta/pdf', [ClientPaymentsController::class, 'descargarEstadoCuenta'])->name('cliente.estado_cuenta.pdf');

    // 🌟 ESTA ES TU RUTA REAL DE INERTIA PARA EL BOTÓN DE REACT
    Route::post('/cliente/pagos/procesar-lote', [PagoController::class, 'store'])->name('cliente.pagos.procesar');

    Route::middleware(['auth', 'verified'])->group(function () {
        Route::post('/cliente/pagos/procesar-lote', [PagoController::class, 'store'])->name('cliente.pagos.procesar');
    });

    // Logout dentro del grupo protegido
    Route::get('/force-logout', function () {
        auth()->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    });

    // Rutas exclusivas para el plan Huella Eterna (Mascotas)
    Route::get('/mi-plan-mascota', [SuscripcionMascotaController::class, 'miPlanMascota'])->name('mi.plan.mascota');
    Route::post('/suscripcion-mascota', [SuscripcionMascotaController::class, 'store'])->name('suscripcion.mascota.store');
    Route::post('/suscripciones-mascota', [SuscripcionMascotaController::class, 'store'])->name('suscripciones_mascota.store');
});

Route::get('/canciones', [CancionController::class, 'index']);

Schedule::command('mouren:enviar-facturas')->monthlyOn(1, '00:00');

// 🌟 WEBHOOK PÚBLICO: Recibe las confirmaciones automáticas de Mercado Pago (PSE)
Route::post('/webhooks/mercadopago', [PagoController::class, 'recibirNotificacion'])->name('webhooks.mercadopago');

// Comentamos la carga automática original para que no choque con tus controladores personalizados de Inertia
// require __DIR__.'/auth.php';