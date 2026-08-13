<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Servicio;
use App\Models\Recuerdo;
use App\Models\Cancion;
use App\Models\Suscripcion;
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

        $user = auth()->user();

        // 🆕 Verificamos qué tipo de plan(es) ya tiene activo el usuario,
        // para que la vista pueda ocultar lo que no le corresponde ver.
        $tieneHumano = false;
        $tieneMascota = false;

        if ($user) {
            $tieneHumano = Suscripcion::where('usuario_id', $user->id)
                ->where('estado', 'activo')
                ->where('plan_id', '!=', 4)
                ->exists();

            $tieneMascota = Suscripcion::where('usuario_id', $user->id)
                ->where('estado', 'activo')
                ->where('plan_id', 4)
                ->exists();
        }

        return Inertia::render('Clientes/Planes/Index', [
            'planes'       => $planes,
            'tieneHumano'  => $tieneHumano,  // 🆕
            'tieneMascota' => $tieneMascota, // 🆕
        ]);
    }

    /**
     * Mostrar formulario de inscripción (El que necesitas para /planes/inscribir/{id})
     */
    public function inscribir($id)
    {
        // 1. Buscamos el plan específico con sus servicios base
        $plan = Plan::with('servicios')->findOrFail($id);

        $user = auth()->user();
        $esPlanMascota = ((int) $plan->id) === 4;

        // 🆕 GUARD: si el usuario ya tiene un plan activo de este mismo tipo
        // (humano u mascota), no lo dejamos entrar de nuevo al formulario
        // aunque escriba la URL directamente.
        $yaTieneEsteTipo = Suscripcion::where('usuario_id', $user->id)
            ->where('estado', 'activo')
            ->when($esPlanMascota, fn($q) => $q->where('plan_id', 4))
            ->when(!$esPlanMascota, fn($q) => $q->where('plan_id', '!=', 4))
            ->exists();

        if ($yaTieneEsteTipo) {
            return redirect()
                ->route($esPlanMascota ? 'mi.plan.mascota' : 'mi.plan')
                ->with('error', $esPlanMascota
                    ? 'Ya tienes un plan de mascota activo. No puedes inscribirte a otro.'
                    : 'Ya tienes un plan activo. No puedes inscribirte a otro plan humano.'
                );
        }

        // 2. Obtenemos el resto de catálogos para los pasos del formulario
        $servicios = Servicio::all();
        $recuerdos = Recuerdo::all();
        $canciones = Cancion::all();
        $generos = \App\Models\Genero::all();
        $tiposDocumento = \App\Models\TipoDocumento::all();

        // 3. Enviamos todo a la vista de React
        return Inertia::render('Clientes/Planes/Inscribir', [
            'plan'      => $plan,
            'servicios' => $servicios,
            'recuerdos' => $recuerdos,
            'canciones' => $canciones,
            'generos'   => $generos,
            'tiposDocumento' => $tiposDocumento,
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
