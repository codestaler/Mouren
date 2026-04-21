<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegisteredUserController extends Controller
{
    /**
     * Muestra la vista de registro (Tu página de cine)
     */
    public function create()
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Aquí procesaremos los datos del formulario más adelante
     */
    public function store(Request $request)
    {
        // Por ahora lo dejamos vacío para que no te dé error al cargar la página
    }
}