<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Models\TipoDocumento; 
use App\Models\Genero;
use App\Models\Afiliado; // Importamos el modelo para la nueva ruta
use Illuminate\Http\Request;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Clientes\ClienteDashboardController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\SuscripcionController;
use Inertia\Inertia;

// --- RUTAS PÚBLICAS ---
Route::get('/', fn() => Inertia::render('Home'))->name('home');
Route::get('/contactos', fn() => Inertia::render('Contactos'))->name('contactos');
Route::get('/quienes-somos', fn() => Inertia::render('QuienesSomos'))->name('quienes-somos');
Route::get('/planes', fn() => Inertia::render('Planes'))->name('planes');

// --- AUTENTICACIÓN (Invitados / Login / Registro) ---
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

// --- RUTAS PROTEGIDAS (Solo usuarios logueados) ---
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard del Cliente
    Route::prefix('cliente')->group(function () {
        Route::get('/mi-plan', [ClienteDashboardController::class, 'index'])->name('dashboard');
    });

    // Gestión de Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // --- PROCESO DE INSCRIPCIÓN A PLANES ---
    
    // 1. Catálogo de planes disponibles
    Route::get('/planes-disponibles', [PlanController::class, 'index'])->name('planes.index');

    // 2. Formulario de inscripción
    Route::get('/planes/inscribir/{id}', [PlanController::class, 'inscribir'])->name('planes.inscribir');

    // 3. Procesar el guardado de suscripciones
    Route::post('/suscripciones/store', [SuscripcionController::class, 'store'])->name('suscripciones.store');

    // --- EDICIÓN DE AFILIADOS ---
    // Esta es la ruta para actualizar el nombre desde el prompt de React
    Route::patch('/afiliados/{afiliado}', function (Request $request, Afiliado $afiliado) {
        $afiliado->update([
            'nombre' => $request->nombre
        ]);
        return back()->with('message', 'Nombre del beneficiario actualizado correctamente');
    })->name('afiliados.update');
});

// --- UTILIDADES ---
Route::get('/force-logout', function () {
    auth()->logout();
    request()->session()->invalidate();
    request()->session()->regenerateToken();
    return redirect('/');
});

// Ruta de respaldo para mi-plan (opcional, ya que usas /cliente/mi-plan)
Route::get('/mi-plan', [SuscripcionController::class, 'miPlan'])->name('mi.plan')->middleware('auth');

require __DIR__.'/auth.php';