<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan; // Asegúrate que el modelo se llame Plan
use Illuminate\Http\Request;

class PlanController extends Controller
{
    public function index() {
        return response()->json(Plan::all(), 200);
    }

    public function store(Request $request) {
        $plan = Plan::create($request->all());
        return response()->json($plan, 201);
    }

    public function update(Request $request, $id) {
        $plan = Plan::findOrFail($id);
        $plan->update($request->all());
        return response()->json([
            'mensaje' => 'Plan actualizado con éxito',
            'datos' => $plan
        ], 200);
    }

    public function destroy($id) {
        Plan::destroy($id);
        return response()->json(['mensaje' => 'Plan eliminado'], 200);
    }
}