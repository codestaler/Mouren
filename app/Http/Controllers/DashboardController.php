<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Afiliado;
use App\Models\Mascota;
use App\Models\Ceremonia;
use App\Models\SalaVelacion;
use App\Models\ServicioFunerario;
use App\Models\MetaIngreso;
use App\Models\Pagos\Pago;
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

        // 🆕 Filtro de periodo para la tarjeta "Ingresos vs Meta" (dia | semana | mes | anio)
        $periodo = $request->input('periodo', 'mes');
        if (!in_array($periodo, ['dia', 'semana', 'mes', 'anio'])) {
            $periodo = 'mes';
        }

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

        // 4. SERVICIOS EN PROCESO REALES: conectado al sistema de trazabilidad
        $serviciosEnProceso = \App\Models\ServicioFunerario::with([
                'afiliado', 'mascota', 'ceremonias.salaVelacion',
                'trazabilidades' => fn($q) => $q->orderByDesc('fecha')->orderByDesc('id'),
                'trazabilidades.etapa',
            ])
            ->whereHas('afiliado', fn($q) => $q->where('estado', 'Fallecido'))
            ->orWhereHas('mascota', fn($q) => $q->where('estado', 'Fallecido'))
            ->get()
            ->filter(function ($s) {
                $ultima = $s->trazabilidades->first();
                return !$ultima || $ultima->etapa->nombre !== 'Servicio Finalizado';
            })
            ->take(6)
            ->map(function ($s) {
                $sujeto = $s->afiliado ?? $s->mascota;
                $ceremonia = $s->ceremonias->first();
                return [
                    'id'          => $s->id,
                    'nombre'      => $sujeto->nombre ?? 'Sin nombre',
                    'tipo'        => $s->afiliado ? 'Humano' : 'Mascota',
                    'sala'        => $ceremonia->salaVelacion->nombre ?? 'No asignada',
                    'hora_inicio' => $ceremonia ? \Carbon\Carbon::parse($ceremonia->fecha_hora)->format('H:i') : '--:--',
                    'etapa'       => $s->trazabilidades->first()->etapa->nombre ?? 'Sin iniciar',
                ];
            })
            ->values();

        // 5. CÁLCULO REAL DE INGRESOS — 🆕 ahora suma PAGOS REALES (tabla `pagos`,
        // estado = 'aprobado'), no la cuota de suscripciones activas. Esto refleja
        // dinero que efectivamente entró, filtrado por el periodo elegido.
        $consultaIngresos = Pago::where('estado', 'aprobado');

        switch ($periodo) {
            case 'dia':
                $consultaIngresos->whereDate('fecha_pago', Carbon::today());
                break;
            case 'semana':
                $consultaIngresos->whereBetween('fecha_pago', [
                    Carbon::now()->startOfWeek(),
                    Carbon::now()->endOfWeek(),
                ]);
                break;
            case 'anio':
                $consultaIngresos->whereYear('fecha_pago', Carbon::now()->year);
                break;
            case 'mes':
            default:
                $consultaIngresos->whereMonth('fecha_pago', Carbon::now()->month)
                                  ->whereYear('fecha_pago', Carbon::now()->year);
                break;
        }

        $ingresosPeriodoReal = (float) $consultaIngresos->sum('monto');

        // 🆕 6. META DE INGRESOS: el admin la guarda para el mes actual desde el dashboard.
        // Si nunca ha configurado una, usamos 2.500.000 (el valor que ya traía el sistema).
        $metaMensualGuardada = MetaIngreso::where('mes', Carbon::now()->month)
            ->where('anio', Carbon::now()->year)
            ->value('monto');

        $metaMensual = $metaMensualGuardada !== null ? (float) $metaMensualGuardada : 2500000;

        // La meta siempre se guarda a nivel MENSUAL. Para que la barra de progreso
        // tenga sentido cuando el admin mira Día/Semana/Año, la prorrateamos:
        $metaPeriodo = match ($periodo) {
            'dia'    => $metaMensual / 30,
            'semana' => $metaMensual / 4.345, // semanas promedio por mes
            'anio'   => $metaMensual * 12,
            default  => $metaMensual, // mes
        };

        // 7. SALAS DE VELACIÓN OCUPADAS REALES
        $salasOcupadas = SalaVelacion::where('estado', 'Ocupada')->count();
        $totalSalas = SalaVelacion::count() ?: 5; 

        $metricas = [
            'totalUsuarios' => $totalUsuarios,
            'totalPersonas' => $totalPersonas,
            'totalMascotas' => $totalMascotas,
            'planMasElegido' => $planMasElegido,
            'ingresosMes' => $ingresosPeriodoReal,
            'metaMes' => round($metaPeriodo),
            'metaMensualConfigurada' => $metaMensual, // 🆕 valor "crudo" mensual, para precargar el modal de edición
            'salasOcupadas' => $salasOcupadas, 
            'totalSalas' => $totalSalas
        ];

        // 8. RETORNO ÚNICO AL FINAL DEL FLUJO
        return Inertia::render('Admin/Dashboard', [
            'metricas' => $metricas,
            'ceremoniasIniciales' => $ceremoniasIniciales,
            'serviciosEnProceso' => $serviciosEnProceso,
            'filtros' => [
                'mes' => (int)$mesFiltro,
                'anio' => (int)$anioFiltro,
                'periodo' => $periodo, // 🆕
            ]
        ]);
    }

    // 🆕 Guarda o actualiza la meta de ingresos del MES ACTUAL (siempre mensual,
    // aunque el admin esté viendo "Día" o "Año" en pantalla — la meta base es mensual).
    public function actualizarMeta(Request $request)
    {
        $request->validate([
            'monto' => 'required|numeric|min:0',
        ]);

        MetaIngreso::updateOrCreate(
            ['mes' => Carbon::now()->month, 'anio' => Carbon::now()->year],
            ['monto' => $request->monto]
        );

        return back()->with('success', 'Meta de ingresos actualizada correctamente.');
    }

public function gestionUsuarios()
{
    $datosUsuarios = $this->calcularDatosUsuarios();

    return Inertia::render('Admin/GestionUsuarios', [
        'datosUsuarios'  => $datosUsuarios,
        'usuarios'       => \App\Models\User::with(['genero', 'tipoDocumento', 'estado'])->orderByDesc('created_at')->get(),
        'estados'        => \App\Models\EstadoUsuario::all(),
        'generos'        => \App\Models\Genero::all(),
        'tiposDocumento'  => \App\Models\TipoDocumento::all(),
    ]);
}

private function calcularDatosUsuarios()
{
    // 1. Total de usuarios afiliados (Con suscripciones activas en el sistema)
    $totalAfiliados = DB::table('suscripciones')
        ->where('estado', 'Activo')
        ->count();

    // 2. Personas atendidas
    $personasAtendidas = Ceremonia::whereNotNull('servicio_funerario_id')->count();

    // 3. Nuevos afiliados en el mes actual
    $nuevosAfiliadosMes = Afiliado::whereMonth('created_at', Carbon::now()->month)
        ->whereYear('created_at', Carbon::now()->year)
        ->count();

    // 4. Fallecimientos Huella Eterna (Mascotas por especie_id)
    $totalMascotasFallecidas = Mascota::where('estado', 'fallecido')->count() ?: 1;

    $gatos = Mascota::where('estado', 'fallecido')->where('especie_id', 1)->count();
    $perros = Mascota::where('estado', 'fallecido')->where('especie_id', 2)->count();
    $otrosMascotas = $totalMascotasFallecidas - ($gatos + $perros);

    $fallecimientosHuellaEterna = [
        'gatos'  => round(($gatos / $totalMascotasFallecidas) * 100),
        'perros' => round(($perros / $totalMascotasFallecidas) * 100),
        'otros'  => round(($otrosMascotas / $totalMascotasFallecidas) * 100),
    ];

    // 5. Fallecimientos por Género (Tabla afiliados, comparando contra la tabla generos)
    $totalAfiliadosFallecidos = Afiliado::where('estado', 'Fallecido')->count() ?: 1;

    $generosFallecidos = DB::table('afiliados')
        ->leftJoin('generos', 'afiliados.genero_id', '=', 'generos.id')
        ->where('afiliados.estado', 'Fallecido')
        ->select(DB::raw('COALESCE(generos.nombre, "No especificado") as genero'), DB::raw('count(*) as total'))
        ->groupBy('generos.nombre')
        ->get();

    $mujeres = 0;
    $hombres = 0;
    $noEspecificado = 0;

    foreach ($generosFallecidos as $g) {
        $nombreGenero = strtolower($g->genero);
        if (str_contains($nombreGenero, 'femenino') || str_contains($nombreGenero, 'mujer')) {
            $mujeres += $g->total;
        } elseif (str_contains($nombreGenero, 'masculino') || str_contains($nombreGenero, 'hombre')) {
            $hombres += $g->total;
        } else {
            $noEspecificado += $g->total;
        }
    }

    $fallecimientosGenero = [
        'mujeres'        => round(($mujeres / $totalAfiliadosFallecidos) * 100),
        'hombres'        => round(($hombres / $totalAfiliadosFallecidos) * 100),
        'noEspecificado' => round(($noEspecificado / $totalAfiliadosFallecidos) * 100),
    ];

    // 6. Planes más elegidos
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

    // 7. Afiliados por Tipo
    $cantHumanos = Afiliado::count();
    $cantMascotas = Mascota::count();
    $totalTipos = ($cantHumanos + $cantMascotas) ?: 1;

    $afiliadosTipo = [
        'personas' => round(($cantHumanos / $totalTipos) * 100),
        'mascotas' => round(($cantMascotas / $totalTipos) * 100),
    ];

    // 8. Fallecimientos por rango de edad (calculado desde fecha_nacimiento de afiliados fallecidos)
    $afiliadosFallecidosConFecha = Afiliado::where('estado', 'Fallecido')
        ->whereNotNull('fecha_nacimiento')
        ->get();

    $totalConEdad = $afiliadosFallecidosConFecha->count() ?: 1;

    $rangos = [
        'ninos'          => 0,
        'adolescentes'   => 0,
        'jovenes'        => 0,
        'adultos'        => 0,
        'adultosMayores' => 0,
        'longevas'       => 0,
    ];

    foreach ($afiliadosFallecidosConFecha as $afi) {
        $edad = Carbon::parse($afi->fecha_nacimiento)->age;

        if ($edad <= 12) {
            $rangos['ninos']++;
        } elseif ($edad <= 17) {
            $rangos['adolescentes']++;
        } elseif ($edad <= 29) {
            $rangos['jovenes']++;
        } elseif ($edad <= 49) {
            $rangos['adultos']++;
        } elseif ($edad <= 69) {
            $rangos['adultosMayores']++;
        } else {
            $rangos['longevas']++;
        }
    }

    $rangosEdad = [
        ['etiqueta' => 'Niños (0 - 12 años)', 'pct' => round(($rangos['ninos'] / $totalConEdad) * 100), 'color' => 'bg-[#FFF9E6]'],
        ['etiqueta' => 'Adolescentes (13 - 17 años)', 'pct' => round(($rangos['adolescentes'] / $totalConEdad) * 100), 'color' => 'bg-[#F5E6CC]'],
        ['etiqueta' => 'Jóvenes adultos (18 - 29 años)', 'pct' => round(($rangos['jovenes'] / $totalConEdad) * 100), 'color' => 'bg-[#EAD4B3]'],
        ['etiqueta' => 'Adultos (30 - 49 años)', 'pct' => round(($rangos['adultos'] / $totalConEdad) * 100), 'color' => 'bg-[#DFBF99]'],
        ['etiqueta' => 'Adultos mayores (50 - 69 años)', 'pct' => round(($rangos['adultosMayores'] / $totalConEdad) * 100), 'color' => 'bg-[#D4AA80]'],
        ['etiqueta' => 'Personas longevas (70+ años)', 'pct' => round(($rangos['longevas'] / $totalConEdad) * 100), 'color' => 'bg-[#C99566]'],
    ];

    return [
        'totalAfiliados'             => $totalAfiliados,
        'personasAtendidas'          => $personasAtendidas,
        'nuevosAfiliadosMes'         => $nuevosAfiliadosMes,
        'fallecimientosHuellaEterna' => $fallecimientosHuellaEterna,
        'fallecimientosGenero'       => $fallecimientosGenero,
        'planesMasElegidos'          => $planesMasElegidos,
        'afiliadosTipo'              => $afiliadosTipo,
        'rangosEdad'                 => $rangosEdad,
    ];
}

public function exportarPdf()
{
    $datos = $this->calcularDatosUsuarios();

    $afiliadosDetalle = Afiliado::with(['usuario', 'genero', 'tipoDocumento', 'suscripcion.plan'])->get();

    $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reportes.gestion-usuarios-pdf', [
        'datos'     => $datos,
        'afiliados' => $afiliadosDetalle,
        'fecha'     => Carbon::now()->format('d/m/Y H:i'),
    ]);

    

    return $pdf->download('reporte-mouren-' . Carbon::now()->format('Y-m-d') . '.pdf');
}

public function exportarExcel()
{
    return \Maatwebsite\Excel\Facades\Excel::download(
        new \App\Exports\AfiliadosExport,
        'reporte-afiliados-' . Carbon::now()->format('Y-m-d') . '.xlsx'
    );
}
}
