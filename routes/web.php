<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Por esto:
Route::get('/', function () {
    return Inertia::render('Home'); // O el nombre de tu archivo de inicio de Mouren
});

// Rutas de Autenticación (Login y Registro)
// Laravel suele agrupar estas en 'auth.php', pero puedes verlas o definirlas así:

Route::middleware('guest')->group(function () {
    // Vista de Registro
    Route::get('register', function () {
        return Inertia::render('Auth/Register');
    })->name('register');

    // Vista de Login
    Route::get('login', function () {
        return Inertia::render('Auth/Login');
    })->name('login');
});

// Ruta del Dashboard (Solo para usuarios logueados)
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/auth.php';

// En routes/web.php
Route::get('/contactos', function () {
    return Inertia::render('Contactos');
})->name('contactos'); // <-- Este nombre es la clave

Route::get('/quienes-somos', function () {
    return Inertia::render('QuienesSomos');
})->name('quienes-somos');

// Ruta para la sección de Planes Funerarios (Humanos y Mascotas)
Route::get('/planes', function () {
    return Inertia::render('Planes');
})->name('planes');