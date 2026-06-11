<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Suscripcion; // Ajusta según tu namespace real
use App\Models\Pagos\Factura;
use App\Mail\FacturaMensualMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class GenerarFacturasMensuales extends Command
{
    // Nombre con el que puedes ejecutarlo manualmente
    protected $signature = 'mouren:generar-facturas';
    protected $description = 'Revisa suscripciones activas y genera la factura mensual correspondiente';

    public function handle()
{
    $this->info('Iniciando procesamiento de facturas...');

    // 1. Traemos TODAS las suscripciones para probar sin importar el estado en local
    $suscripciones = Suscripcion::all();

    if ($suscripciones->isEmpty()) {
        $this->warn('Alerta: No hay absolutamente ninguna suscripción registrada en la base de datos.');
        return 0;
    }

    $this->comment("Se encontraron {$suscripciones->count()} suscripciones en total. Procesando...");

    foreach ($suscripciones as $suscripcion) {
        
        // 2. Insertamos la factura en la BD con los datos reales de tu modelo
        $factura = Factura::create([
            'suscripcion_id'     => $suscripcion->id,
            'fecha_emision'      => \Carbon\Carbon::now()->format('Y-m-d'),
            'fecha_vencimiento'  => \Carbon\Carbon::now()->addDays(10)->format('Y-m-d'),
            'total'              => $suscripcion->cuota_mensual ?? 45000, // Usa tu campo cuota_mensual
            'estado_factura_id'  => 1, // 1 = Pendiente
        ]);

        // 3. Buscamos el correo usando tu relación (puede ser 'usuario' o 'user')
        $cliente = $suscripcion->usuario ?? $suscripcion->user;

        if ($cliente && $cliente->email) {
            Mail::to($cliente->email)->send(new \App\Mail\FacturaMensualMail($factura));
            $this->info("✔ Factura #{$factura->id} generada y enviada a Mailtrap para: {$cliente->email}");
        } else {
            $this->error("❌ La suscripción ID {$suscripcion->id} no tiene un usuario o email vinculado.");
        }
    }

    $this->info('¡Proceso de facturación completado con éxito!');
}
}