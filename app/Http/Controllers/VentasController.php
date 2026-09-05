<?php

namespace App\Http\Controllers;

use App\Models\Pagos\Factura;
use App\Models\Pagos\Pago;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Suscripcion;
use App\Exports\FacturasExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Pagos\MetodoPago;
use App\Services\NotificacionService;
use Carbon\Carbon;

class VentasController extends Controller
{
    public function index(Request $request)
    {
        // 🆕 Obtener filtros de período
        $periodo = $request->get('periodo', 'mes');
        $fecha = $request->get('fecha') ? Carbon::parse($request->get('fecha')) : now();
        $metodo_pago_id = $request->get('metodo_pago'); // 🆕 Filtro por método de pago
        $estado_factura_id = $request->get('estado_factura'); // 🆕 Filtro por estado

        // 🆕 Calcular rango de fechas según período
        $rango = $this->calcularRangoFechas($periodo, $fecha);
        
        // 🆕 Datos filtrados por período
        $estadisticas = $this->obtenerEstadisticasPorPeriodo($rango['inicio'], $rango['fin'], $metodo_pago_id);
        
        // 🆕 Datos para gráficas diarias/semanales
        $datosGraficas = $this->obtenerDatosGraficas($periodo, $fecha, $metodo_pago_id);

        $queryFacturas = Factura::whereBetween('created_at', [$rango['inicio'], $rango['fin']]);
        
        // 🆕 Aplicar filtros adicionales
        if ($estado_factura_id) {
            $queryFacturas->where('estado_factura_id', $estado_factura_id);
        }

        $totalFacturas = $queryFacturas->count();
        $facturasPendientes = Factura::where('estado_factura_id', 1)
            ->whereBetween('created_at', [$rango['inicio'], $rango['fin']])
            ->count();

        $facturasPagadas = Factura::where('estado_factura_id', 2)
            ->whereBetween('created_at', [$rango['inicio'], $rango['fin']])
            ->count();

        $facturasAbonadas = Factura::where('estado_factura_id', 3)
            ->whereBetween('created_at', [$rango['inicio'], $rango['fin']])
            ->count();

        $ultimasFacturas = $queryFacturas
            ->with([
                'suscripcion.usuario',
                'suscripcion.plan',
                'estado',
                'usuario',
            ])
            ->latest()
            ->get();
        
        $suscripciones = Suscripcion::with([
            'usuario',
            'plan'
        ])->get();

        $metodosPago = MetodoPago::all();

        // 🆕 Datos adicionales para gráficas avanzadas
        $topClientes = $this->obtenerTopClientes($rango['inicio'], $rango['fin']);
        $metodosPagoData = $this->obtenerDatosMetodosPago($rango['inicio'], $rango['fin']);
        $comparativaPrevia = $this->obtenerComparativaPrevia($periodo, $fecha);
        $metaMensual = $this->obtenerMetaMensual($fecha);

        return Inertia::render('Admin/InformesVentas', [
            'estadisticas' => $estadisticas,
            'facturas' => $ultimasFacturas,
            'suscripciones' => $suscripciones,
            'metodosPago' => $metodosPago,
            'conteos' => [
                'totalFacturas' => $totalFacturas,
                'facturasPendientes' => $facturasPendientes,
                'facturasPagadas' => $facturasPagadas,
                'facturasAbonadas' => $facturasAbonadas,
            ],
            'datosGraficas' => $datosGraficas,
            'topClientes' => $topClientes,
            'metodosPagoData' => $metodosPagoData,
            'comparativaPrevia' => $comparativaPrevia,
            'metaMensual' => $metaMensual,
            'periodo' => $periodo,
            'fecha' => $fecha->format('Y-m-d'),
            'filtros' => [
                'metodo_pago' => $metodo_pago_id,
                'estado_factura' => $estado_factura_id,
            ]
        ]);
    }

    /**
     * 🆕 Calcula el rango de fechas según el período
     */
    private function calcularRangoFechas($periodo, $fecha)
    {
        switch ($periodo) {
            case 'dia':
                return [
                    'inicio' => $fecha->copy()->startOfDay(),
                    'fin' => $fecha->copy()->endOfDay(),
                ];
            case 'semana':
                return [
                    'inicio' => $fecha->copy()->startOfWeek(Carbon::MONDAY),
                    'fin' => $fecha->copy()->endOfWeek(Carbon::SUNDAY),
                ];
            case 'anio':
                return [
                    'inicio' => $fecha->copy()->startOfYear(),
                    'fin' => $fecha->copy()->endOfYear(),
                ];
            case 'mes':
            default:
                return [
                    'inicio' => $fecha->copy()->startOfMonth(),
                    'fin' => $fecha->copy()->endOfMonth(),
                ];
        }
    }

    /**
     * 🆕 Obtiene estadísticas para el período seleccionado
     */
    private function obtenerEstadisticasPorPeriodo($inicio, $fin, $metodo_pago_id = null)
    {
        $queryPagos = Pago::where('estado', 'aprobado')
            ->whereBetween('fecha_pago', [$inicio, $fin]);

        if ($metodo_pago_id) {
            $queryPagos->where('metodo_pago_id', $metodo_pago_id);
        }

        $ingresos = $queryPagos->sum('monto');

        $facturasTotales = Factura::whereBetween('created_at', [$inicio, $fin])
            ->sum('total');

        $facturasPagadas = Factura::where('estado_factura_id', 2)
            ->whereBetween('created_at', [$inicio, $fin])
            ->sum('total');

        return [
            'ingresos' => $ingresos,
            'facturasTotales' => $facturasTotales,
            'facturasPagadas' => $facturasPagadas,
            'facturasPendientes' => $facturasTotales - $facturasPagadas,
        ];
    }

    /**
     * 🆕 Obtiene datos para las gráficas (ingresos por día, métodos de pago, etc.)
     */
    private function obtenerDatosGraficas($periodo, $fecha, $metodo_pago_id = null)
    {
        if ($periodo === 'dia') {
            $datos = [];
            for ($i = 0; $i < 24; $i++) {
                $inicio = $fecha->copy()->hour($i)->startOfHour();
                $fin = $fecha->copy()->hour($i)->endOfHour();
                
                $query = Pago::where('estado', 'aprobado')
                    ->whereBetween('fecha_pago', [$inicio, $fin]);
                
                if ($metodo_pago_id) {
                    $query->where('metodo_pago_id', $metodo_pago_id);
                }

                $monto = $query->sum('monto');
                
                $datos[] = [
                    'hora' => $i . ':00',
                    'monto' => $monto,
                ];
            }
            return $datos;
        } elseif ($periodo === 'semana') {
            $datos = [];
            $inicio = $fecha->copy()->startOfWeek(Carbon::MONDAY);
            $diasSemana = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
            
            for ($i = 0; $i < 7; $i++) {
                $diaActual = $inicio->copy()->addDays($i);
                
                $query = Pago::where('estado', 'aprobado')
                    ->whereBetween('fecha_pago', [$diaActual->copy()->startOfDay(), $diaActual->copy()->endOfDay()]);
                
                if ($metodo_pago_id) {
                    $query->where('metodo_pago_id', $metodo_pago_id);
                }

                $monto = $query->sum('monto');
                
                $datos[] = [
                    'dia' => $diasSemana[$i],
                    'monto' => $monto,
                ];
            }
            return $datos;
        } else {
            $datos = [];
            if ($periodo === 'mes') {
                $inicio = $fecha->copy()->startOfMonth();
                $diasEnMes = $fecha->daysInMonth;
                
                for ($i = 1; $i <= $diasEnMes; $i++) {
                    $diaActual = $fecha->copy()->day($i);
                    
                    $query = Pago::where('estado', 'aprobado')
                        ->whereBetween('fecha_pago', [$diaActual->copy()->startOfDay(), $diaActual->copy()->endOfDay()]);
                    
                    if ($metodo_pago_id) {
                        $query->where('metodo_pago_id', $metodo_pago_id);
                    }

                    $monto = $query->sum('monto');
                    
                    $datos[] = [
                        'dia' => $i,
                        'monto' => $monto,
                    ];
                }
            } else {
                for ($i = 1; $i <= 12; $i++) {
                    $mesActual = $fecha->copy()->month($i);
                    
                    $query = Pago::where('estado', 'aprobado')
                        ->whereBetween('fecha_pago', [$mesActual->copy()->startOfMonth(), $mesActual->copy()->endOfMonth()]);
                    
                    if ($metodo_pago_id) {
                        $query->where('metodo_pago_id', $metodo_pago_id);
                    }

                    $monto = $query->sum('monto');
                    
                    $datos[] = [
                        'mes' => ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][$i - 1],
                        'monto' => $monto,
                    ];
                }
            }
            return $datos;
        }
    }

    /**
     * 🆕 Obtiene top 5 clientes por ingresos
     */
    private function obtenerTopClientes($inicio, $fin)
    {
        $pagos = Pago::where('estado', 'aprobado')
            ->whereBetween('fecha_pago', [$inicio, $fin])
            ->with('factura.usuario', 'factura.suscripcion.usuario')
            ->get();

        $clientes = [];
        foreach ($pagos as $pago) {
            $nombre = $pago->factura?->usuario?->nombre ?? 
                      $pago->factura?->suscripcion?->usuario?->nombre ?? 
                      $pago->factura?->cliente_nombre ?? 'Desconocido';
            
            if (!isset($clientes[$nombre])) {
                $clientes[$nombre] = 0;
            }
            $clientes[$nombre] += $pago->monto;
        }

        arsort($clientes);
        $topClientes = array_slice($clientes, 0, 5, true);

        return array_map(function($nombre, $monto) {
            return ['cliente' => $nombre, 'monto' => $monto];
        }, array_keys($topClientes), array_values($topClientes));
    }

    /**
     * 🆕 Obtiene datos de métodos de pago
     */
    private function obtenerDatosMetodosPago($inicio, $fin)
    {
        $pagos = Pago::where('estado', 'aprobado')
            ->whereBetween('fecha_pago', [$inicio, $fin])
            ->with('metodoPago')
            ->get()
            ->groupBy('metodoPago.nombre')
            ->map(fn($group) => $group->sum('monto'));

        return $pagos->map(function($monto, $metodo) {
            return ['metodo' => $metodo, 'monto' => $monto];
        })->values();
    }

    /**
     * 🆕 Obtiene comparativa con período anterior
     */
    private function obtenerComparativaPrevia($periodo, $fecha)
    {
        $rangoActual = $this->calcularRangoFechas($periodo, $fecha);
        $diferenciaDias = $rangoActual['fin']->diffInDays($rangoActual['inicio']);

        if ($periodo === 'dia') {
            $fechaPrevia = $fecha->copy()->subDay();
        } elseif ($periodo === 'semana') {
            $fechaPrevia = $fecha->copy()->subWeek();
        } elseif ($periodo === 'mes') {
            $fechaPrevia = $fecha->copy()->subMonth();
        } else {
            $fechaPrevia = $fecha->copy()->subYear();
        }

        $rangoPrevia = $this->calcularRangoFechas($periodo, $fechaPrevia);

        $ingresosActual = Pago::where('estado', 'aprobado')
            ->whereBetween('fecha_pago', [$rangoActual['inicio'], $rangoActual['fin']])
            ->sum('monto');

        $ingresosPrevia = Pago::where('estado', 'aprobado')
            ->whereBetween('fecha_pago', [$rangoPrevia['inicio'], $rangoPrevia['fin']])
            ->sum('monto');

        $porcentajecambio = $ingresosPrevia > 0 
            ? (($ingresosActual - $ingresosPrevia) / $ingresosPrevia) * 100 
            : 0;

        return [
            'ingresosActual' => $ingresosActual,
            'ingresosPrevia' => $ingresosPrevia,
            'porcentajecambio' => round($porcentajecambio, 2),
            'cambioPositivo' => $porcentajecambio >= 0,
        ];
    }

    /**
     * 🆕 Obtiene meta mensual configurada
     */
    private function obtenerMetaMensual($fecha)
    {
        // Por ahora retorna una meta estática, puedes guardarla en BD después
        return 5000000; // 5 millones de pesos
    }

    public function store(Request $request)
    {
        if ($request->filled('suscripcion_id')) {
            $request->validate([
                'suscripcion_id'     => 'required|exists:suscripciones,id',
                'fecha_emision'      => 'required|date',
                'fecha_vencimiento'  => 'required|date|after_or_equal:fecha_emision',
                'total'              => 'required|numeric|min:0',
            ]);

            $suscripcion = \App\Models\Suscripcion::with('usuario')->findOrFail($request->suscripcion_id);

            $factura = Factura::create([
                'suscripcion_id'     => $request->suscripcion_id,
                'usuario_id'         => $suscripcion->usuario_id,
                'fecha_emision'      => $request->fecha_emision,
                'fecha_vencimiento'  => $request->fecha_vencimiento,
                'total'              => $request->total,
                'estado_factura_id'  => 1,
            ]);

            $correoDestino = $suscripcion->usuario?->email;

        } elseif ($request->filled('usuario_id')) {
            $request->validate([
                'usuario_id'         => 'required|exists:users,id',
                'concepto'           => 'required|string|max:255',
                'fecha_emision'      => 'required|date',
                'fecha_vencimiento'  => 'required|date|after_or_equal:fecha_emision',
                'total'              => 'required|numeric|min:0',
            ]);

            $usuarioSeleccionado = \App\Models\User::findOrFail($request->usuario_id);

            $factura = Factura::create([
                'suscripcion_id'     => null,
                'usuario_id'         => $request->usuario_id,
                'cliente_nombre'     => $usuarioSeleccionado->nombre ?? $usuarioSeleccionado->name,
                'cliente_cedula'     => $usuarioSeleccionado->cedula,
                'cliente_telefono'   => $usuarioSeleccionado->telefono,
                'cliente_email'      => $usuarioSeleccionado->email,
                'concepto'           => $request->concepto,
                'fecha_emision'      => $request->fecha_emision,
                'fecha_vencimiento'  => $request->fecha_vencimiento,
                'total'              => $request->total,
                'estado_factura_id'  => 1,
            ]);

            $correoDestino = $usuarioSeleccionado->email;

        } else {
            $request->validate([
                'cliente_nombre'     => 'required|string|max:150',
                'cliente_cedula'     => 'required|string|max:20',
                'cliente_telefono'   => 'nullable|string|max:20',
                'cliente_email'      => 'nullable|email',
                'concepto'           => 'required|string|max:255',
                'fecha_emision'      => 'required|date',
                'fecha_vencimiento'  => 'required|date|after_or_equal:fecha_emision',
                'total'              => 'required|numeric|min:0',
            ]);

            $factura = Factura::create([
                'suscripcion_id'     => null,
                'cliente_nombre'     => $request->cliente_nombre,
                'cliente_cedula'     => $request->cliente_cedula,
                'cliente_telefono'   => $request->cliente_telefono,
                'cliente_email'      => $request->cliente_email,
                'concepto'           => $request->concepto,
                'fecha_emision'      => $request->fecha_emision,
                'fecha_vencimiento'  => $request->fecha_vencimiento,
                'total'              => $request->total,
                'estado_factura_id'  => 1,
            ]);

            $correoDestino = $request->cliente_email;
        }

        if ($factura->usuario_id) {
            NotificacionService::avisarUsuario(
                $factura->usuario_id,
                'Nueva factura generada',
                "Se generó tu factura #{$factura->id} por $" . number_format($factura->total, 0, ',', '.') . ".",
                'factura',
                '/pagos'
            );
        }

        if ($correoDestino) {
            try {
                \Illuminate\Support\Facades\Mail::to($correoDestino)->send(new \App\Mail\FacturaMensualMail($factura));
            } catch (\Exception $e) {
                \Log::error("Error enviando correo de factura manual #{$factura->id}: " . $e->getMessage());
            }
        }

        return back()->with('success', 'Factura creada correctamente.' . (!$correoDestino ? ' (Sin correo para notificar)' : ''));
    }

    public function exportarExcel()
    {
        return Excel::download(
            new FacturasExport,
            'Facturas_Mouren.xlsx'
        );
    }

    public function descargarPdf($id)
    {
        $factura = Factura::with([
            'suscripcion.usuario',
            'suscripcion.plan',
            'estado'
        ])->findOrFail($id);

        return Pdf::loadView('pdf.factura_comprobante', [
            'factura' => $factura,
        ])->download('Factura-'.$factura->id.'.pdf');
    }

    public function anular($id)
    {
        $factura = \App\Models\Pagos\Factura::findOrFail($id);

        if ($factura->estado_factura_id == 2) {
            return back()->withErrors([
                'error' => 'No se puede anular una factura que ya fue pagada.'
            ]);
        }

        $factura->estado_factura_id = 4;
        $factura->save();

        return back()->with('success', 'Factura anulada correctamente.');
    }

    public function buscarUsuarioRegistrado(Request $request)
    {
        $query = trim($request->input('query', ''));

        if (strlen($query) < 2) {
            return response()->json([], 200);
        }

        $usuarios = \App\Models\User::where('cedula', 'like', "%{$query}%")
            ->orWhere('nombre', 'like', "%{$query}%")
            ->limit(10)
            ->get(['id', 'nombre', 'cedula', 'email']);

        return response()->json($usuarios, 200);
    }
}
