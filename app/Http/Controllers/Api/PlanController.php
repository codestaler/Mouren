<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Servicio;
use App\Models\Recuerdo;
use App\Models\Cancion;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PlanController extends Controller
{
    /**
     * Listar planes - Vista principal y API
     */
    public function index(Request $request)
    {
        // Cargamos los servicios de cada plan para que se vean en las cards
        $planes = Plan::with('servicios')->get();

        if ($request->wantsJson()) {
            return response()->json($planes, 200);
        }

        return Inertia::render('Clientes/Planes/Index', [
            'planes' => $planes
        ]);
    }

    /**
     * Mostrar formulario de inscripción (El que necesitas para /planes/inscribir/{id})
     */
    public function inscribir($id)
    {
        // 1. Buscamos el plan específico con sus servicios base
        $plan = Plan::with('servicios')->findOrFail($id);

        // 2. Obtenemos el resto de catálogos para los pasos del formulario
        $servicios = Servicio::all();
        $recuerdos = Recuerdo::all();
        $canciones = Cancion::all();

        // 3. Enviamos todo a la vista de React
        return Inertia::render('Clientes/Planes/Inscribir', [
            'plan'      => $plan,
            'servicios' => $servicios,
            'recuerdos' => $recuerdos,
            'canciones' => $canciones,
        ]);
    }

    /**
     * Crear un plan (Admin / API)
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'cuota_base' => 'required|numeric',
        ]);

        $plan = Plan::create($request->all());
        
        if ($request->wantsJson()) {
            return response()->json($plan, 201);
        }
        
        return back()->with('message', 'Plan creado exitosamente');
    }

    /**
     * Mostrar un plan específico (API)
     */
    public function show($id)
    {
        $plan = Plan::with('servicios')->findOrFail($id);
        return response()->json($plan, 200);
    }

    /**
     * Actualizar un plan (Admin / API)
     */
    public function update(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);
        $plan->update($request->all());

        if ($request->wantsJson()) {
            return response()->json([
                'mensaje' => 'Plan actualizado con éxito',
                'datos' => $plan
            ], 200);
        }

        return back()->with('message', 'Plan actualizado');
    }

    /**
     * Eliminar un plan (Admin / API)
     */
    public function destroy($id)
    {
        Plan::destroy($id);
        
        if (request()->wantsJson()) {
            return response()->json(['mensaje' => 'Plan eliminado'], 200);
        }

        return back()->with('message', 'Plan eliminado');
    }
}