<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Personalizacion;
use App\Models\Suscripcion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PersonalizacionController extends Controller
{
    public function index() {
        return response()->json(Personalizacion::all(), 200);
    }

    /**
     * Guarda de forma masiva y limpia toda la personalización desde la vista DetallesPlan.
     */
public function guardarDesdeGabinete(Request $request)
{
    try {
        $suscripcion = \App\Models\Suscripcion::findOrFail($request->suscripcion_id);
        
        // 1. Actualizar cuota
        $suscripcion->update(['cuota_mensual' => $request->cuota_mensual]);

        // 2. Sincronizar Servicios Extras (incluyendo precio_pagado)
        $serviciosData = [];
        if ($request->has('servicios_adicionales')) {
            foreach ($request->servicios_adicionales as $serv) {
                $serviciosData[$serv['id']] = [
                    'precio_pagado' => $serv['precio'] ?? 0,
                    'created_at' => now(),
                    'updated_at' => now()
                ];
            }
        }
        $suscripcion->serviciosExtras()->sync($serviciosData);

    // ==========================
// GUARDAR PERSONALIZACIONES
// ==========================
if ($request->has('servicios_adicionales')) {

    foreach ($request->servicios_adicionales as $serv) {

        if (!empty($serv['personalizacion'])) {

            \App\Models\Personalizacion::updateOrCreate(
    [
        'suscripcion_id' => $suscripcion->id,
        'servicio_id' => $serv['id']
    ],
    [
        'servicio_funerario_id' => null,
        'configuracion' => $serv['personalizacion']['configuracion'] ?? []   // 👈 ahora
    ]
);
        }
    }
}
// 3. ACTUALIZACIÓN DE AFILIADOS
if ($request->has('afiliados')) {
    foreach ($request->afiliados as $data) {

        $esNuevo = ($data['id'] > 1000000000);
    $esTitular = strtolower($data['parentesco'] ?? '') === 'titular';

    // --- Si es un afiliado existente y está fallecido, lo saltamos sin error ---
    if (!$esNuevo) {
        $afiliadoExistente = \App\Models\Afiliado::find($data['id']);
        if ($afiliadoExistente && strtolower($afiliadoExistente->estado) === 'fallecido') {
            continue; // no se toca, pero tampoco truena el guardado
        }
    }

        // --- VALIDACIONES SOLO PARA NO-TITULARES ---
        if (!$esTitular) {
            if (empty($data['genero_id']) || empty($data['tipo_documento_id']) || empty($data['cedula']) || empty($data['fecha_nacimiento'])) {
                throw new \Exception("El afiliado '{$data['nombre']}' tiene datos personales incompletos (género, documento, cédula o fecha de nacimiento).");
            }

            // Cédula única: contra otros afiliados en la BD, excluyendo al mismo si ya existe
            $cedulaExiste = \App\Models\Afiliado::where('cedula', $data['cedula'])
                ->when(!$esNuevo, fn($q) => $q->where('id', '!=', $data['id']))
                ->exists();

            if ($cedulaExiste) {
                throw new \Exception("La cédula {$data['cedula']} ya está registrada para otro protegido.");
            }

            // Edad entre 6 y 75 años
            $edad = \Carbon\Carbon::parse($data['fecha_nacimiento'])->age;
            if ($edad < 6 || $edad > 75) {
                throw new \Exception("El afiliado '{$data['nombre']}' tiene {$edad} años. Mouren solo cubre entre 6 y 75 años.");
            }
        }

        if ($esNuevo) {
            // Es un afiliado nuevo, lo creamos
            $afiliado = \App\Models\Afiliado::create([
                'suscripcion_id'     => $request->suscripcion_id,
                'user_id'            => $suscripcion->usuario_id,
                'nombre'             => $data['nombre'],
                'parentesco'         => $data['parentesco'],
                'estado'             => 'activo',
                'genero_id'          => $data['genero_id'] ?? null,
                'tipo_documento_id'  => $data['tipo_documento_id'] ?? null,
                'cedula'             => $data['cedula'] ?? null,
                'fecha_nacimiento'   => $data['fecha_nacimiento'] ?? null,
            ]);
            $afiliadoId = $afiliado->id;
        } else {
            // Es uno existente, lo actualizamos
            $afiliado = \App\Models\Afiliado::find($data['id']);
            if ($afiliado) {
                $afiliado->update([
                    'nombre'             => $data['nombre'],
                    'parentesco'         => $data['parentesco'],
                    'genero_id'          => $data['genero_id'] ?? $afiliado->genero_id,
                    'tipo_documento_id'  => $data['tipo_documento_id'] ?? $afiliado->tipo_documento_id,
                    'cedula'             => $data['cedula'] ?? $afiliado->cedula,
                    'fecha_nacimiento'   => $data['fecha_nacimiento'] ?? $afiliado->fecha_nacimiento,
                ]);
                $afiliadoId = $data['id'];
            } else {
                continue; // Si no existe, saltamos este registro
            }
        }

        // Ahora insertamos/actualizamos el servicio funerario
        \App\Models\ServicioFunerario::updateOrCreate(
            ['afiliado_id' => $afiliadoId], 
            [
                'observaciones' => $data['observaciones'] ?? "Sin observaciones",
                'fecha_inicio'  => now(),
                'cancion_id'    => $data['cancion_id']
            ]
        );
    }
}

        // 4. Sincronizar Recuerdos
        if (!empty($request->recuerdos_seleccionados)) {
            $recuerdoId = $request->recuerdos_seleccionados[0];
            $suscripcion->recuerdos()->sync([
                $recuerdoId => [
                    'costo_unitario' => 0, // Ajustar si tienes el costo real
                    'created_at' => now(),
                    'updated_at' => now()
                ]
            ]);
        } else {
            $suscripcion->recuerdos()->detach();
        }

        return redirect()->back()->with('success', 'Guardado exitoso');

    } catch (\Exception $e) {
        \Log::error("Error detallado: " . $e->getMessage());
        return redirect()->back()->withErrors(['server_error' => 'Faltan datos obligatorios: ' . $e->getMessage()]);
    }
}

    public function store(Request $request) {
        $request->validate([
            'servicio_funerario_id' => 'required|exists:servicios_funerarios,id',
            'servicio_id' => 'required|exists:servicios,id',
            'configuracion' => 'required|array'
        ]);
        $personalizacion = Personalizacion::create($request->all());
        return response()->json($personalizacion, 201);
    }

    public function show($id) {
        $personalizacion = Personalizacion::find($id);
        if (!$personalizacion) return response()->json(['msg' => 'Personalización no encontrada'], 404);
        return response()->json($personalizacion, 200);
    }

    public function update(Request $request, $id) {
        $personalizacion = Personalizacion::find($id);
        if (!$personalizacion) return response()->json(['msg' => 'Personalización no encontrada'], 404);
        $personalizacion->update($request->all());
        return response()->json($personalizacion, 200);
    }

    public function destroy($id) {
        $personalizacion = Personalizacion::find($id);
        if (!$personalizacion) return response()->json(['msg' => 'Personalización no encontrada'], 404);
        $personalizacion->delete();
        return response()->json(['msg' => 'Personalización eliminada'], 200);
    }
}