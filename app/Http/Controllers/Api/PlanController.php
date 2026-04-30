<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller {
    // LISTAR (Read)
    public function index() {
        return response()->json(Plan::all(), 200);
    }

    // CREAR (Create)
    public function store(Request $request) {
        $request->validate([
            'nombre' => 'required|string',
            'cuota_base' => 'required|numeric'
        ]);
        $plan = Plan::create($request->all());
        return response()->json($plan, 201);
    }

    // ACTUALIZAR (Update)
    public function update(Request $request, $id) {
        $plan = Plan::findOrFail($id);
        $plan->update($request->all());
        return response()->json($plan, 200);
    }

    // ELIMINAR (Delete)
    public function destroy($id) {
        Plan::destroy($id);
        return response()->json(['mensaje' => 'Plan eliminado'], 200);
    }
}