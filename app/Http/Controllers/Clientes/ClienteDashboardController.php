<?php

namespace App\Http\Controllers\Clientes;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ClienteDashboardController extends Controller
{
    public function index()
    {
        // Retorna la vista que crearemos en Pages/Clientes
        return Inertia::render('Clientes/Dashboard', [
            'auth' => [
                'user' => Auth::user()
            ]
        ]);
    }
    
}