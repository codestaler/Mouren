<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Afiliado;
use App\Models\Mascota;
use App\Models\Ceremonia;
use App\Models\SalaVelacion;
use App\Models\ServicioFunerario;
use Illuminate\Http\Request; // <-- Asegúrate de incluir Request para los filtros
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // 0. Captura de filtros para el calendario interactivo
        $mesFiltro = $request->input('mes', Carbon::now()->month);
        $anioFiltro = $request->input('anio', Carbon::now()->year);

        // 1. Conteo Real de la Base de Datos
        $totalUsuarios = User::count();
        $totalPersonas = Afiliado::count();
        $totalMascotas = Mascota::count();

        // 2. Consulta Real del Plan más elegido del mes
        $planMasElegidoData = DB::table('suscripciones')
            ->join('planes', 'suscripciones.plan_id', '=', 'planes.id')
            ->select('planes.nombre', DB::raw('count(suscripciones.id) as total'))
            ->groupBy('planes.id', 'planes.nombre')
            ->orderByDesc('total')
            ->first();

        $planMasElegido = $planMasElegidoData ? $planMasElegidoData->nombre : 'Ninguno este mes';

        // 3. CALENDARIO REAL: Detalles completos de las ceremonias filtradas por mes/año
        $ceremoniasIniciales = Ceremonia::with(['servicioFunerario.afiliado', 'servicioFunerario.mascota', 'salaVelacion'])
            ->whereMonth('fecha_hora', $mesFiltro)
            ->whereYear('fecha_hora', $anioFiltro)
            ->get()
            ->map(function($ceremonia) {
                $servicio = $ceremonia->servicioFunerario;
                $nombreSujeto = 'Sin asignar';
                $tipo = 'Servicio';

                if ($servicio && $servicio->afiliado) {
                    $nombreSujeto = $servicio->afiliado->nombre;
                    $tipo = 'Familiar';
                } elseif ($servicio && $servicio->mascota) {
                    $nombreSujeto = $servicio->mascota->nombre;
                    $tipo = 'Mascota';
                }

                return [
                    'id' => $ceremonia->id,
                    'dia' => Carbon::parse($ceremonia->fecha_hora)->day,
                    'hora' => Carbon::parse($ceremonia->fecha_hora)->format('g:i A'),
                    'nombre' => $nombreSujeto,
                    'tipo' => $tipo,
                    'sala' => $ceremonia->salaVelacion ? $ceremonia->salaVelacion->nombre : 'Sin sala asignada',
                    'observaciones' => $ceremonia->observaciones
                ];
            })
            ->values() 
            ->toArray();

        // 4. SERVICIOS EN PROCESO REALES: Ajustado para acoplarse con los emojis de React
        $serviciosEnProceso = ServicioFunerario::with(['afiliado', 'mascota'])
            ->latest()
            ->take(4)
            ->get()
            ->map(function($servicio) {
                $nombreSujeto = 'Sin asignar';
                $tipo = 'Desconocido';

                if ($servicio->afiliado) {
                    $nombreSujeto = $servicio->afiliado->nombre;
                    $tipo = 'Humano';
                } elseif ($servicio->mascota) {
                    $nombreSujeto = $servicio->mascota->nombre . ' - Mascota';
                    $tipo = 'Mascota';
                }

                return [
                    'name' => $nombreSujeto,
                    'plan' => 'Servicio de ' . $tipo . ' (En proceso)'
                ];
            })
            ->values() 
            ->toArray(); 

        // 5. CÁLCULO REAL DE INGRESOS
        $ingresosMesReal = DB::table('suscripciones')
            ->where('estado', 'Activo')
            ->whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year) 
            ->sum('cuota_mensual');

        // 6. SALAS DE VELACIÓN OCUPADAS REALES
        $salasOcupadas = SalaVelacion::where('estado', 'Ocupada')->count();
        $totalSalas = SalaVelacion::count() ?: 5; 

        $metricas = [
            'totalUsuarios' => $totalUsuarios,
            'totalPersonas' => $totalPersonas,
            'totalMascotas' => $totalMascotas,
            'planMasElegido' => $planMasElegido,
            'ingresosMes' => (float) $ingresosMesReal, 
            'metaMes' => 2500000,
            'salasOcupadas' => $salasOcupadas, 
            'totalSalas' => $totalSalas
        ];

        // 7. RETORNO ÚNICO AL FINAL DEL FLUJO
        return Inertia::render('Admin/Dashboard', [
            'metricas' => $metricas,
            'ceremoniasIniciales' => $ceremoniasIniciales,
            'serviciosEnProceso' => $serviciosEnProceso,
            'filtros' => [
                'mes' => (int)$mesFiltro,
                'anio' => (int)$anioFiltro
            ]
        ]);
    }

public function gestionUsuarios()
{
    // 1. Total de usuarios afiliados (Con suscripciones activas en el sistema)
    $totalAfiliados = DB::table('suscripciones')
        ->where('estado', 'Activo')
        ->count();

    // 2. Personas atendidas: Contamos las ceremonias que tienen un servicio funerario válido asignado (Basado en image_6e546b.png)
    $personasAtendidas = Ceremonia::whereNotNull('servicio_funerario_id')->count();

    // 3. Nuevos afiliados en el mes actual usando created_at de la tabla afiliados
    $nuevosAfiliadosMes = Afiliado::whereMonth('created_at', Carbon::now()->month)
        ->whereYear('created_at', Carbon::now()->year)
        ->count();

    // 4. Fallecimientos Huella Eterna (Mascotas por especie_id)
    $totalMascotasFallecidas = Mascota::where('estado', 'fallecido')->count() ?: 1;
    
    // Asumiendo que en especie_id: 1 = Gato, 2 = Perro. El resto va a otros.
    $gatos = Mascota::where('estado', 'fallecido')->where('especie_id', 1)->count();
    $perros = Mascota::where('estado', 'fallecido')->where('especie_id', 2)->count();
    $otrosMascotas = $totalMascotasFallecidas - ($gatos + $perros);

    $fallecimientosHuellaEterna = [
        'gatos'  => round(($gatos / $totalMascotasFallecidas) * 100),
        'perros' => round(($perros / $totalMascotasFallecidas) * 100),
        'otros'  => round(($otrosMascotas / $totalMascotasFallecidas) * 100),
    ];

    // 5. Fallecimientos por Género (Tabla users usando el campo genero y estado fallecido)
    $totalUsersFallecidos = User::where('estado_id', 'fallecido')->count() ?: 1;
    
    $mujeres = User::where('estado_id', 'fallecido')->where('genero_id', '2')->count();
    $hombres = User::where('estado_id', 'fallecido')->where('genero_id', '1')->count();
    $noEspecificado = $totalUsersFallecidos - ($mujeres + $hombres);

    $fallecimientosGenero = [
        'mujeres'        => round(($mujeres / $totalUsersFallecidos) * 100),
        'hombres'        => round(($hombres / $totalUsersFallecidos) * 100),
        'noEspecificado' => round(($noEspecificado / $totalUsersFallecidos) * 100),
    ];

    // 6. Planes más elegidos por los usuarios (Suscripciones agrupadas por el plan)
    $totalSuscripciones = DB::table('suscripciones')->count() ?: 1;
    $suscripcionesPorPlan = DB::table('suscripciones')
        ->join('planes', 'suscripciones.plan_id', '=', 'planes.id')
        ->select('planes.nombre', DB::raw('count(suscripciones.id) as total'))
        ->groupBy('planes.id', 'planes.nombre')
        ->orderByDesc('total')
        ->take(6)
        ->get();

    $coloresPlanes = ['bg-[#F2E394]', 'bg-[#A26D4F]', 'bg-[#D9B44A]', 'bg-[#4CD97B]', 'bg-[#94B2F2]', 'bg-[#E28494]'];
    
    $planesMasElegidos = $suscripcionesPorPlan->map(function($item, $index) use ($totalSuscripciones, $coloresPlanes) {
        return [
            'nombre' => $item->nombre,
            'pct'    => round(($item->total / $totalSuscripciones) * 100),
            'color'  => $coloresPlanes[$index] ?? 'bg-[#BCAAA4]'
        ];
    })->toArray();

    // 7. Afiliados por Tipo (Comparación física de la tabla afiliados frente a mascotas)
    $cantHumanos = Afiliado::count();
    $cantMascotas = Mascota::count();
    $totalTipos = ($cantHumanos + $cantMascotas) ?: 1;

    $afiliadosTipo = [
        'personas' => round(($cantHumanos / $totalTipos) * 100),
        'mascotas' => round(($cantMascotas / $totalTipos) * 100),
    ];

    // Estructuramos el array final para mandarlo limpio a Inertia
    $datosUsuarios = [
        'totalAfiliados'             => $totalAfiliados,
        'personasAtendidas'           => $personasAtendidas,
        'nuevosAfiliadosMes'          => $nuevosAfiliadosMes,
        'fallecimientosHuellaEterna' => $fallecimientosHuellaEterna,
        'fallecimientosGenero'       => $fallecimientosGenero,
        'planesMasElegidos'          => $planesMasElegidos,
        'afiliadosTipo'              => $afiliadosTipo,
    ];

    return Inertia::render('Admin/GestionUsuarios', [
        'datosUsuarios' => $datosUsuarios
    ]);
}
}