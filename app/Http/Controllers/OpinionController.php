<?php

namespace App\Http\Controllers;

use App\Models\Opinion;
use Illuminate\Http\Request;

class OpinionController extends Controller
{
    public function index()
    {
        return Opinion::latest()->get();
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'mensaje' => 'required|string|max:500',
        ]);

        Opinion::create($request->only('nombre', 'mensaje'));

        return back();
    }
}