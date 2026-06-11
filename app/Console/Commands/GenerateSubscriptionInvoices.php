<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Suscripcion;
use App\Models\Pagos\Factura; // Usamos el namespace correcto de tu modelo
use App\Mail\InvoicePendingMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class GenerateSubscriptionInvoices extends Command
{
    protected $signature = 'subscriptions:generate-invoices';
    protected $description = 'Genera facturas automáticas mensuales (o por hora para pruebas) basadas en la suscripción';

    public function handle()
    {
        $this->info('Iniciando proceso de facturación automática en Mouren...');

        // 1. Buscar suscripciones activas pendientes de facturar (Filtro: 1 hora para tus pruebas)
        $suscripciones = Suscripcion::where('estado', 'activa')
            ->where(function($query) {
                $query->whereNull('ultima_facturacion_at')
                      ->orWhere('ultima_facturacion_at', '<=', Carbon::now()->subHour());
            })->get();

        if ($suscripciones->isEmpty()) {
            $this->comment('No hay suscripciones activas que requieran una nueva factura en este momento.');
            return 0;
        }

        foreach ($suscripciones as $suscripcion) {
            
            // ID del estado "Pendiente" en tu tabla 'estado_facturas'. 
            // ¡Cambia el 1 por el ID real que uses en tu base de datos!
            $idEstadoPendiente = 1; 

            // 2. Crear la factura usando los campos EXACTOS de tu $fillable
            $factura = Factura::create([
                'suscripcion_id'     => $suscripcion->id,
                'fecha_emision'      => Carbon::now(),
                'fecha_vencimiento'  => Carbon::now()->addDays(5), // 5 días de gracia para pagar
                'total'              => $suscripcion->cuota_mensual, // Hereda el costo de tu suscripción
                'estado_factura_id'  => $idEstadoPendiente,
            ]);

            // 3. Actualizar la fecha de control en la suscripción
            $suscripcion->update([
                'ultima_facturacion_at' => Carbon::now()
            ]);

            // 4. Enviar el correo usando la relación 'usuario' de tu modelo Suscripcion
            $cliente = $suscripcion->usuario; 
            if ($cliente && $cliente->email) {
                Mail::to($cliente->email)->send(new InvoicePendingMail($factura, $cliente));
            }

            $this->info("Factura #{$factura->id} generada con éxito para la suscripción ID: {$suscripcion->id}");
        }

        $this->info('¡Proceso de facturación completado para Mouren!');
        return 0;
    }
}