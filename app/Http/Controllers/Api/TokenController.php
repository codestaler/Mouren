<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Token;
use Illuminate\Http\Request;

class TokenController extends Controller
{
    public function index() {
        return response()->json(Token::with('usuario')->get(), 200);
    }

    public function store(Request $request) {
        $request->validate([
            'usuario_id' => 'required|exists:users,id',
            'token' => 'required|string|max:255',
            'tipo' => 'required|string|max:50',
            'fecha_expiracion' => 'required|date'
        ]);

        $token = Token::create($request->all());
        return response()->json($token, 201);
    }

    public function show($id) {
        $token = Token::with('usuario')->find($id);
        if (!$token) return response()->json(['msg' => 'Token no encontrado'], 404);
        return response()->json($token, 200);
    }

    public function update(Request $request, $id) {
        $token = Token::find($id);
        if (!$token) return response()->json(['msg' => 'Token no encontrado'], 404);
        
        $token->update($request->all());
        return response()->json($token, 200);
    }

    public function destroy($id) {
        $token = Token::find($id);
        if (!$token) return response()->json(['msg' => 'Token no encontrado'], 404);
        
        $token->delete();
        return response()->json(['msg' => 'Token eliminado'], 200);
    }
}