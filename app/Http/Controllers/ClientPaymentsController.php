<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pagos\Factura;
use Inertia\Inertia;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf; // Asegúrate de tener este import arriba del todo
use Illuminate\Support\Facades\DB;

class ClientPaymentsController extends Controller
{
    // Mostrar la vista de Cartera con los datos reales
    public function index()
    {
        // Obtenemos el historial de facturas vinculadas a las suscripciones del usuario logueado
        $facturas = Factura::whereHas('suscripcion', function($query) {
            $query->where('usuario_id', auth()->id());
        })
        ->orderBy('fecha_emision', 'desc')
        ->get();

        return Inertia::render('Clientes/Cartera', [
            'facturas' => $facturas
        ]);
    }

    // Procesar el pago simulado
    public function procesarPago($id)
    {
        $factura = Factura::findOrFail($id);

        // Cambiamos el estado a Pagado (Supongamos que tu ID de pagado es el 2)
        $factura->update([
            'estado_factura_id' => 2 
        ]);

        // Opcional: Aquí podrías disparar el correo de agradecimiento o comprobante de pago

        return redirect()->back();
    }

    public function descargarPdf($id)
{
    // Buscamos la factura asegurando que pertenezca al usuario autenticado
    $factura = Factura::where('id', $id)
        ->whereHas('suscripcion', function($query) {
            $query->where('usuario_id', auth()->id());
        })->firstOrFail();

    // Renderizamos la misma vista que usamos para el correo
    $pdf = Pdf::loadView('pdf.factura_comprobante', ['factura' => $factura]);

    // Forzamos la descarga del archivo en el navegador
    return $pdf->download("factura-mouren-{$factura->id}.pdf");
}

public function descargarEstadoCuenta()
{
    $usuario = auth()->user();

    // 1. Consulta directa y segura a la base de datos
    $facturas = DB::table('facturas')
        ->join('suscripciones', 'facturas.suscripcion_id', '=', 'suscripciones.id')
        ->where('suscripciones.usuario_id', $usuario->id)
        ->select('facturas.*')
        ->orderBy('facturas.id', 'desc')
        ->get();

    // 2. Calcular los totales de las facturas
    $totalDeuda = 0;
    $totalPagado = 0;

    foreach ($facturas as $factura) {
        if ($factura->estado_factura_id == 1) {
            $totalDeuda += (float) $factura->total;
        } elseif ($factura->estado_factura_id == 2) {
            $totalPagado += (float) $factura->total;
        }
    }

    // 3. Renderizar y descargar el PDF real usando la vista corregida
    $pdf = Pdf::loadView('pdf.estado_cuenta', [
        'usuario' => $usuario,
        'facturas' => $facturas,
        'totalDeuda' => $totalDeuda,
        'totalPagado' => $totalPagado,
        'fechaReporte' => now()->format('d/m/Y h:i A')
    ]);

    return $pdf->download("estado-cuenta-mouren-{$usuario->id}.pdf");
}
}