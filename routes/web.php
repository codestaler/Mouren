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
use App\Http\Controllers\VentasController;
use App\Http\Controllers\NotificacionController;
use App\Http\Controllers\OpinionController;
use App\Http\Controllers\Public\ConsultaPublicaController;

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

    Route::get('/admin/gestion-usuarios/exportar-pdf', [App\Http\Controllers\DashboardController::class, 'exportarPdf'])->name('admin.exportar.pdf');
Route::get('/admin/gestion-usuarios/exportar-excel', [App\Http\Controllers\DashboardController::class, 'exportarExcel'])->name('admin.exportar.excel');

Route::prefix('admin/servicios-funerarios')->group(function () {
    Route::get('/', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'index'])->name('admin.servicios-funerarios');
    Route::get('/en-proceso', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'serviciosEnProceso']);
    Route::get('/datos-formulario', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'datosFormulario']);
    Route::get('/buscar-titular', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'buscarTitular']);
    Route::get('/buscar-mascota', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'buscarMascota']);
    Route::post('/marcar-fallecido', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'marcarFallecido']);
    Route::post('/programar-ceremonia', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'programarCeremonia']);
    Route::post('/agregar-etapa', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'agregarEtapa']);
    Route::get('/{servicio}/carta-fallecimiento', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'cartaFallecimiento']);
    Route::get('/{servicio}/carta-atencion', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'cartaAtencion']);
    Route::get('/ceremonia/{ceremonia}/imagen-whatsapp', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'imagenWhatsapp']);
    Route::post('/etapas', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'crearEtapa']);
    Route::put('/etapas/{id}', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'actualizarEtapa']);
    Route::delete('/etapas/{id}', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'eliminarEtapa']);
    Route::post('/salas', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'crearSala']);
    Route::put('/salas/{id}', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'actualizarSala']);
    Route::delete('/salas/{id}', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'eliminarSala']);
    Route::put('/ceremonia/{id}', [App\Http\Controllers\Api\Procesos\GestionServicioFunerarioController::class, 'editarCeremonia']);
    Route::post('/cambiar-titular', [SuscripcionController::class, 'cambiarTitular']);
});

Route::get('/admin/ventas', [App\Http\Controllers\VentasController::class, 'index'])
    ->name('admin.ventas');

Route::post('/admin/informes-ventas/factura', [VentasController::class, 'store'])
    ->name('admin.facturas.store');

Route::post('/admin/ventas/store',[VentasController::class,'store'])
    ->name('admin.ventas.store');

Route::get(
    '/admin/facturas/{id}/pdf',
    [VentasController::class,'descargarPdf']
)->name('admin.facturas.pdf'); 

Route::get(
    '/admin/ventas/exportar',
    [VentasController::class, 'exportarExcel']
)->name('ventas.exportar');

Route::post(
    '/admin/facturas/registrar-pago',
    [PagoController::class,'registrarManual']
)->name('admin.facturas.pagar');

Route::post(
    '/admin/facturas/registrar-pago',
    [PagoController::class, 'registrarManual']
)->name('admin.facturas.registrar-pago');

Route::put(
    '/admin/facturas/{id}/anular',
    [VentasController::class, 'anular']
)->name('admin.facturas.anular');

Route::get('/admin/ventas/buscar-usuario', [VentasController::class, 'buscarUsuarioRegistrado']);

Route::prefix('admin/notificaciones')->name('admin.notificaciones.')->group(function () {
    Route::get('/', [NotificacionController::class, 'index'])->name('index');
    Route::post('/{id}/marcar-leida', [NotificacionController::class, 'marcarLeida'])->name('marcar-leida');
    Route::post('/marcar-todas-leidas', [NotificacionController::class, 'marcarTodasLeidas'])->name('marcar-todas-leidas');
});

Route::prefix('admin/ajustes')->name('admin.ajustes.')->group(function () {
    Route::get('/', [App\Http\Controllers\AjustesController::class, 'index'])->name('index');
    Route::put('/datos', [App\Http\Controllers\AjustesController::class, 'actualizarDatos'])->name('datos');
    Route::post('/avatar', [App\Http\Controllers\AjustesController::class, 'actualizarAvatar'])->name('avatar');
    Route::post('/cerrar-otras-sesiones', [App\Http\Controllers\AjustesController::class, 'cerrarOtrasSesiones'])->name('cerrar-sesiones');
    Route::put('/password', [App\Http\Controllers\AjustesController::class, 'cambiarPassword'])->name('password');
    Route::get('/2fa/iniciar', [App\Http\Controllers\AjustesController::class, 'iniciar2FA'])->name('2fa.iniciar');
    Route::post('/2fa/confirmar', [App\Http\Controllers\AjustesController::class, 'confirmar2FA'])->name('2fa.confirmar');
    Route::post('/2fa/desactivar', [App\Http\Controllers\AjustesController::class, 'desactivar2FA'])->name('2fa.desactivar');
    Route::put('/idioma', [App\Http\Controllers\AjustesController::class, 'actualizarIdioma'])->name('idioma');
    Route::put('/tema', [App\Http\Controllers\AjustesController::class, 'actualizarTema'])->name('tema');
    Route::put('/notificaciones', [App\Http\Controllers\AjustesController::class, 'actualizarNotificaciones'])->name('notificaciones');
});
// 👇 Rutas de Gestión de Usuarios y Tipos de Documento — AHORA sí en su propio espacio
Route::get('/admin/usuarios/listar', [UserController::class, 'listarOperativo']);
Route::put('/admin/usuarios/{id}/actualizar', [UserController::class, 'actualizarDesdeAdmin']);
Route::put('/admin/usuarios/{id}/estado', [UserController::class, 'cambiarEstado']);
Route::post('/admin/usuarios/crear', [UserController::class, 'crearUsuarioDesdeAdmin']);
Route::post('/admin/tipos-documento', [UserController::class, 'crearTipoDocumento']);
Route::put('/admin/tipos-documento/{id}', [UserController::class, 'actualizarTipoDocumento']);
Route::delete('/admin/tipos-documento/{id}', [UserController::class, 'eliminarTipoDocumento']);

});

Route::post('/suscripciones/store', [SuscripcionController::class, 'store'])->name('cliente.suscripciones.store');
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
        'auth_user' => auth()->user(),
        'generos' => \App\Models\Genero::all(),
    ]);
})->name('datos.edit');


// 👇 NUEVO: rutas para que el cliente actualice sus preferencias
Route::prefix('cliente/ajustes')->name('cliente.ajustes.')->group(function () {
    Route::put('/tema', [App\Http\Controllers\AjustesController::class, 'actualizarTema'])->name('tema');
    Route::put('/idioma', [App\Http\Controllers\AjustesController::class, 'actualizarIdioma'])->name('idioma');
    Route::put('/notificaciones', [App\Http\Controllers\AjustesController::class, 'actualizarNotificaciones'])->name('notificaciones');
});

    Route::get('/mi-plan/certificado', [App\Http\Controllers\Api\SuscripcionController::class, 'certificadoAfiliacion'])->name('certificado.afiliacion');

    Route::post('/user-enviar-codigo', [UserController::class, 'enviarCodigoVerificacion'])->name('user.enviar-codigo');
    Route::put('/user-update/{id}', [UserController::class, 'update'])->name('user.update');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- PROCESO DE INSCRIPCIÓN A PLANES ---
    Route::get('/planes-disponibles', [PlanController::class, 'index'])->name('planes.disponibles');
    Route::get('/planes/inscribir/{id}', [PlanController::class, 'inscribir'])->name('planes.inscribir');
    

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

    Route::get('/cliente/pagos/{id}/comprobante', [PagoController::class, 'descargarComprobante'])->name('cliente.pagos.comprobante');

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
    Route::get('/detalles-mascota', [SuscripcionMascotaController::class, 'detalles'])
    ->name('detalles.mascota');

Route::post('/api/personalizacion/gabinete-mascota', [SuscripcionMascotaController::class, 'actualizar'])
    ->name('personalizacion.mascota.actualizar');

});

Route::get('/canciones', [CancionController::class, 'index']);

Schedule::command('mouren:enviar-facturas')->monthlyOn(1, '00:00');

// 🌟 WEBHOOK PÚBLICO: Recibe las confirmaciones automáticas de Mercado Pago (PSE)
Route::post('/webhooks/mercadopago', [PagoController::class, 'recibirNotificacion'])->name('webhooks.mercadopago');

Route::get('/opiniones', [OpinionController::class, 'index']);
Route::post('/opiniones', [OpinionController::class, 'store'])->name('opiniones.store');
Route::get('/pagos-consultas', fn() => Inertia::render('PagosConsultas'))->name('pagos.consultas');

// --- PÁGINA PÚBLICA: PAGOS Y CONSULTAS ---
Route::get('/pagos-consultas', fn() => Inertia::render('PagosConsultas'))->name('pagos.consultas');

// --- ENDPOINTS PÚBLICOS (con límite de intentos por IP para evitar abuso) ---
Route::middleware('throttle:20,1')->prefix('consultas')->group(function () {

    // Afiliación
    Route::post('/afiliacion', [ConsultaPublicaController::class, 'consultarAfiliacion']);
    Route::post('/afiliacion/certificado', [ConsultaPublicaController::class, 'descargarCertificado']);

    // Pagos (con límite más estricto para el envío de códigos, evita spam de correos)
    Route::post('/pagos/enviar-codigo', [ConsultaPublicaController::class, 'enviarCodigo'])
        ->middleware('throttle:5,1');
    Route::post('/pagos/verificar', [ConsultaPublicaController::class, 'verificarCodigo']);
    Route::post('/pagos/facturas', [ConsultaPublicaController::class, 'facturas']);
    Route::post('/pagos/procesar-lote', [ConsultaPublicaController::class, 'procesarLote']);
});


// Comentamos la carga automática original para que no choque con tus controladores personalizados de Inertia
// require __DIR__.'/auth.php';