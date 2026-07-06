<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TipoDocumentoController;
use App\Http\Controllers\Api\GeneroController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\EstadoUsuarioController;
use App\Http\Controllers\Api\TipoUsuarioController;
use App\Http\Controllers\Api\PlanServicioController;
use App\Http\Controllers\Api\RecuerdoController;
use App\Http\Controllers\Api\CancionController;
use App\Http\Controllers\Api\EspecieController;
use App\Http\Controllers\Api\MascotaController;
use App\Http\Controllers\Api\SuscripcionController;
use App\Http\Controllers\Api\AfiliadoController;
use App\Http\Controllers\Api\ServicioFunerarioController;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\Api\PlanRecuerdoController;
use App\Http\Controllers\Api\PersonalizacionController;
use App\Http\Controllers\Api\Pagos\FacturaController;
use App\Http\Controllers\Api\Pagos\PagoController;
use App\Http\Controllers\Api\Pagos\EstadoFacturaController;
use App\Http\Controllers\Api\Pagos\MetodoPagoController;
use App\Http\Controllers\Api\Procesos\EtapaServicioController;
use App\Http\Controllers\Api\Procesos\TrazabilidadServicioController;
use App\Http\Controllers\Api\Procesos\NotificacionController;
use App\Http\Controllers\ChatMascotaController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');


Route::apiResource('planes', PlanController::class);
Route::apiResource('tipos-documento', TipoDocumentoController::class);
Route::apiResource('generos', GeneroController::class);
Route::apiResource('servicios', ServicioController::class);
Route::apiResource('usuarios', UserController::class);
Route::apiResource('estados-usuario', EstadoUsuarioController::class);
Route::apiResource('tipos-usuario', TipoUsuarioController::class);
Route::apiResource('plan-servicio', PlanServicioController::class);
Route::apiResource('recuerdos', RecuerdoController::class);
Route::apiResource('canciones', CancionController::class);
Route::apiResource('especies', EspecieController::class);
Route::apiResource('mascotas', MascotaController::class);
Route::apiResource('suscripciones', SuscripcionController::class);
Route::apiResource('afiliados', AfiliadoController::class);
Route::apiResource('servicios-funerarios', ServicioFunerarioController::class);
Route::apiResource('tokens', TokenController::class);
Route::apiResource('plan-recuerdos', PlanRecuerdoController::class);
Route::apiResource('personalizaciones', PersonalizacionController::class);
Route::apiResource('facturas', FacturaController::class);
Route::apiResource('pagos', PagoController::class);
Route::apiResource('estados-factura', EstadoFacturaController::class);
Route::apiResource('metodos-pago', MetodoPagoController::class);
Route::apiResource('etapas-servicio', EtapaServicioController::class);
Route::apiResource('trazabilidad', TrazabilidadServicioController::class);
Route::apiResource('notificaciones', NotificacionController::class);
Route::post('/chat/mouri', ChatMascotaController::class);