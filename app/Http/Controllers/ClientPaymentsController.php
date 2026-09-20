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
        $usuario = auth()->user();

        // 🆕 ARREGLADO: antes esto SOLO buscaba por la relación 'suscripcion'.
        // Si una factura tenía el usuario_id puesto directo en la tabla facturas
        // (sin pasar por una suscripción activa/válida — por ejemplo, después de
        // un cambio de titular, o una factura generada por otro flujo), esta
        // consulta jamás la encontraba y el usuario no la veía en su Cartera,
        // aunque sí existiera y estuviera pendiente.
        // Mismo patrón que ya usa correctamente ChatMascotaController::ejecutarTool()
        // en su caso 'mostrar_facturas': revisa AMBOS caminos con un OR.
        $facturas = Factura::where(function ($query) use ($usuario) {
            $query->whereHas('suscripcion', function ($q) use ($usuario) {
                $q->where('usuario_id', $usuario->id);
            })
            ->orWhere('usuario_id', $usuario->id);
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
        $usuario = auth()->user();

        // 🆕 ARREGLADO (seguridad): antes esto buscaba la factura SIN verificar
        // que fuera del usuario logueado — cualquiera podía marcar como pagada
        // la factura de otra persona con solo cambiar el número en la URL.
        // Mismo patrón de verificación que en index()/descargarPdf().
        $factura = Factura::where('id', $id)
            ->where(function ($query) use ($usuario) {
                $query->whereHas('suscripcion', function ($q) use ($usuario) {
                    $q->where('usuario_id', $usuario->id);
                })
                ->orWhere('usuario_id', $usuario->id);
            })
            ->firstOrFail();

        // Cambiamos el estado a Pagado (Supongamos que tu ID de pagado es el 2)
        $factura->update([
            'estado_factura_id' => 2 
        ]);

        // Opcional: Aquí podrías disparar el correo de agradecimiento o comprobante de pago

        return redirect()->back();
    }

    public function descargarPdf($id)
{
    $usuario = auth()->user();

    // 🆕 ARREGLADO: mismo problema que en index() — el chequeo de seguridad
    // solo validaba la relación 'suscripcion'. Si tu factura es de las que
    // tienen el usuario_id directo, esto te daba 404 aunque la factura sí
    // fuera tuya. Ahora revisa ambos caminos, igual que el resto.
    $factura = Factura::where('id', $id)
        ->where(function ($query) use ($usuario) {
            $query->whereHas('suscripcion', function ($q) use ($usuario) {
                $q->where('usuario_id', $usuario->id);
            })
            ->orWhere('usuario_id', $usuario->id);
        })
        ->firstOrFail();

    // Renderizamos la misma vista que usamos para el correo
    $pdf = Pdf::loadView('pdf.factura_comprobante', ['factura' => $factura]);

    // Forzamos la descarga del archivo en el navegador
    return $pdf->download("factura-mouren-{$factura->id}.pdf");
}

public function descargarEstadoCuenta()
{
    $usuario = auth()->user();

    // 🆕 ARREGLADO: el INNER JOIN con suscripciones dejaba exactamente el mismo
    // hueco que en index() — las facturas con usuario_id directo (sin pasar por
    // una suscripción) quedaban afuera del PDF del estado de cuenta también.
    // Cambié a LEFT JOIN (para no descartar filas sin suscripcion_id válido) y
    // agregué el OR sobre facturas.usuario_id, mismo patrón de siempre.
    $facturas = DB::table('facturas')
        ->leftJoin('suscripciones', 'facturas.suscripcion_id', '=', 'suscripciones.id')
        ->where(function ($query) use ($usuario) {
            $query->where('suscripciones.usuario_id', $usuario->id)
                  ->orWhere('facturas.usuario_id', $usuario->id);
        })
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
