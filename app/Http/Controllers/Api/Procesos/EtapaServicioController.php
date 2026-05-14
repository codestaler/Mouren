<?php

namespace App\Http\Controllers\Api\Procesos;

use App\Http\Controllers\Controller;
use App\Models\Procesos\EtapaServicio;
use Illuminate\Http\Request;

class EtapaServicioController extends Controller
{
    public function index()
    {
        return response()->json(EtapaServicio::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate(['nombre' => 'required|string|max:50']);
        $etapa = EtapaServicio::create($request->all());
        return response()->json($etapa, 201);
    }

    public function show($id)
    {
        $etapa = EtapaServicio::find($id);
        if (!$etapa) return response()->json(['msg' => 'Etapa no encontrada'], 404);
        return response()->json($etapa, 200);
    }

    public function update(Request $request, $id)
    {
        $etapa = EtapaServicio::find($id);
        if (!$etapa) return response()->json(['msg' => 'Etapa no encontrada'], 404);
        $etapa->update($request->all());
        return response()->json($etapa, 200);
    }

    public function destroy($id)
    {
        $etapa = EtapaServicio::find($id);
        if (!$etapa) return response()->json(['msg' => 'Etapa no encontrada'], 404);
        $etapa->delete();
        return response()->json(['msg' => 'Etapa eliminada'], 200);
    }
}