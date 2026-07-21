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

class VentasController extends Controller
{
    public function index()
    {
        $totalFacturas = Factura::count();

        $facturasPendientes = Factura::where('estado_factura_id',1)->count();

        $facturasPagadas = Factura::where('estado_factura_id',2)->count();

        $facturasAbonadas = Factura::where('estado_factura_id',3)->count();

        $ingresos = Pago::where('estado','aprobado')
            ->sum('monto');

        $ultimoMes = Pago::where('estado','aprobado')
            ->whereMonth('fecha_pago',now()->month)
            ->sum('monto');

        $ultimasFacturas = Factura::with([
    'suscripcion.usuario',
    'suscripcion.plan',
    'estado'
])
->latest()
->take(10)
->get();
        
            $suscripciones = Suscripcion::with([
    'usuario',
    'plan'
])->get();

$metodosPago = MetodoPago::all();

        return Inertia::render('Admin/InformesVentas', [
    'estadisticas' => [
        'ingresos' => $ingresos,
        'ultimoMes' => $ultimoMes,
        'totalFacturas' => $totalFacturas,
        'facturasPendientes' => $facturasPendientes,
        'facturasPagadas' => $facturasPagadas,
        'facturasAbonadas' => $facturasAbonadas,
        
    ],

    'facturas' => $ultimasFacturas,

    'suscripciones' => $suscripciones,

    'metodosPago' => $metodosPago,
]);
    }

    public function store(Request $request)
{
    $request->validate([
        'suscripcion_id'     => 'required|exists:suscripciones,id',
        'fecha_emision'      => 'required|date',
        'fecha_vencimiento'  => 'required|date|after_or_equal:fecha_emision',
        'total'              => 'required|numeric|min:0',
    ]);

    Factura::create([
        'suscripcion_id'     => $request->suscripcion_id,
        'fecha_emision'      => $request->fecha_emision,
        'fecha_vencimiento'  => $request->fecha_vencimiento,
        'total'              => $request->total,
        'estado_factura_id'  => 1, // Pendiente
    ]);

    return back()->with('success', 'Factura creada correctamente.');
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

    $pdf = Pdf::loadView('pdf.factura_comprobante', [
    'factura' => $factura,
]);

    return Pdf::loadView('pdf.factura_comprobante', [
    'factura' => $factura,
])->download('Factura-'.$factura->id.'.pdf');
}

public function anular($id)
{
    $factura = \App\Models\Pagos\Factura::findOrFail($id);

    // Si ya está pagada no permitimos anularla
    if ($factura->estado_factura_id == 2) {
        return back()->withErrors([
            'error' => 'No se puede anular una factura que ya fue pagada.'
        ]);
    }

    $factura->estado_factura_id = 4; // Anulado
    $factura->save();

    return back()->with('success', 'Factura anulada correctamente.');
}
}