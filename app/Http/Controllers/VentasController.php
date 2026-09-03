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
    'estado',
    'usuario', // 🆕
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
    if ($request->filled('suscripcion_id')) {
        // ✅ MODO 1: factura de una suscripción existente
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
        // 🆕 MODO 2: cliente con cuenta registrada, pero SIN suscripción activa
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
        // 🆕 MODO 3: cliente totalmente externo, sin cuenta en el sistema
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

    // 🆕 Notificamos al cliente dueño de esta factura (solo si tiene cuenta registrada
    // en el sistema — el Modo 3 es un cliente externo sin cuenta, así que no aplica)
    if ($factura->usuario_id) {
        NotificacionService::avisarUsuario(
            $factura->usuario_id,
            'Nueva factura generada',
            "Se generó tu factura #{$factura->id} por $" . number_format($factura->total, 0, ',', '.') . ".",
            'factura',
            '/pagos'
        );
    }

    // 🆕 Enviamos el correo con la factura adjunta, reutilizando el mismo Mailable
    // que ya usa el comando automático mensual. Si no hay correo, simplemente no se envía.
    if ($correoDestino) {
        try {
            \Illuminate\Support\Facades\Mail::to($correoDestino)->send(new \App\Mail\FacturaMensualMail($factura));
        } catch (\Exception $e) {
            \Log::error("Error enviando correo de factura manual #{$factura->id}: " . $e->getMessage());
            // No interrumpimos el flujo: la factura ya se creó correctamente,
            // solo el correo falló (se puede reenviar manualmente después si hace falta).
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
