<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use App\Models\TipoDocumento; 
use App\Models\Genero;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Clientes\ClienteDashboardController; // Importante añadirlo
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| RUTAS PÚBLICAS DE MOUREN
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return Inertia::render('Home'); 
})->name('home');

Route::get('/contactos', function () {
    return Inertia::render('Contactos');
})->name('contactos');

Route::get('/quienes-somos', function () {
    return Inertia::render('QuienesSomos');
})->name('quienes-somos');

Route::get('/planes', function () {
    return Inertia::render('Planes');
})->name('planes');


/*
|--------------------------------------------------------------------------
| RUTAS DE AUTENTICACIÓN (Invitados)
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    // Vista de Registro con datos de BD
    Route::get('/register', function () {
        return Inertia::render('Auth/Register', [
            'tiposDocumento' => TipoDocumento::all(), 
            'generos' => Genero::all(),
        ]);
    })->name('register');

    // Procesar el registro
    Route::post('/register', [UserController::class, 'store'])->name('register.store');

    // Vista de Login
    Route::get('login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');
});


/*
|--------------------------------------------------------------------------
| RUTAS PROTEGIDAS (Solo Usuarios Logueados)
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'verified'])->group(function () {
    
    // Dashboard Genérico (opcional, por si Breeze lo usa)
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    /* --- SECCIÓN ESPECÍFICA DE CLIENTES MOUREN --- */
    Route::prefix('cliente')->group(function () {
        Route::get('/mi-plan', [ClienteDashboardController::class, 'index'])
            ->name('cliente.dashboard');
            
        // Aquí puedes añadir más rutas para el menú lateral (Detalles, Pagos, etc.)
    });

    // Rutas de Perfil
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Carga las rutas adicionales de Breeze (password reset, etc.)
require __DIR__.'/auth.php';