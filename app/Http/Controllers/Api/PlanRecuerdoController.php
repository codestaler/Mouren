<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanRecuerdo;
use Illuminate\Http\Request;

class PlanRecuerdoController extends Controller
{
    public function index() {
        return response()->json(PlanRecuerdo::with(['plan', 'recuerdo'])->get(), 200);
    }

    public function store(Request $request) {
        $request->validate([
            'plan_id' => 'required|exists:planes,id',
            'recuerdo_id' => 'required|exists:recuerdos,id'
        ]);

        $planRecuerdo = PlanRecuerdo::create($request->all());
        return response()->json($planRecuerdo, 201);
    }

    public function show($id) {
        $planRecuerdo = PlanRecuerdo::with(['plan', 'recuerdo'])->find($id);
        if (!$planRecuerdo) return response()->json(['msg' => 'Relación no encontrada'], 404);
        return response()->json($planRecuerdo, 200);
    }

    public function update(Request $request, $id) {
        $planRecuerdo = PlanRecuerdo::find($id);
        if (!$planRecuerdo) return response()->json(['msg' => 'Relación no encontrada'], 404);
        
        $planRecuerdo->update($request->all());
        return response()->json($planRecuerdo, 200);
    }

    public function destroy($id) {
        $planRecuerdo = PlanRecuerdo::find($id);
        if (!$planRecuerdo) return response()->json(['msg' => 'Relación eliminada'], 404);
        
        $planRecuerdo->delete();
        return response()->json(['msg' => 'Relación borrada'], 200);
    }
}