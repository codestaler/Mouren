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
use App\Http\Controllers\Api\PersonalizacionController;
use Inertia\Inertia;

// --- RUTAS PÚBLICAS ---
Route::get('/', fn() => Inertia::render('Home'))->name('home');
Route::get('/contactos', fn() => Inertia::render('Contactos'))->name('contactos');
Route::get('/quienes-somos', fn() => Inertia::render('QuienesSomos'))->name('quienes-somos');
Route::get('/planes', fn() => Inertia::render('Planes'))->name('planes');

// --- AUTENTICACIÓN ---
Route::middleware('guest')->group(function () {
    Route::get('/register', function () {
        return Inertia::render('Auth/Register', [
            'tiposDocumento' => TipoDocumento::all(), 
            'generos' => Genero::all(),
        ]);
    })->name('register');

    Route::post('/register-store', [UserController::class, 'store'])->name('register.store');
    Route::get('login', fn() => Inertia::render('Auth/Login'))->name('login');
});

// --- RUTAS PROTEGIDAS ---
Route::middleware(['auth', 'verified'])->group(function () {
    
    Route::prefix('cliente')->group(function () {
        Route::get('/mi-plan', [ClienteDashboardController::class, 'index'])->name('dashboard');
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

    // Logout dentro del grupo protegido
    Route::get('/force-logout', function () {
        auth()->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
        return redirect('/');
    });
});

require __DIR__.'/auth.php';