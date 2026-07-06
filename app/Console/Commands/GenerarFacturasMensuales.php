<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Suscripcion; 
use App\Models\Pagos\Factura; 
use App\Mail\FacturaMensualMail;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class GenerarFacturasMensuales extends Command
{
    // Nombre con el que ejecutas el comando manualmente
    protected $signature = 'mouren:enviar-facturas'; 
    protected $description = 'Revisa suscripciones activas de Mouren y genera la factura mensual correspondiente';

    public function handle()
    {
        $this->info('Iniciando procesamiento de facturas de Mouren...');

        // 1. Filtramos exactamente por el string 'activo' que está en tu BD
        $suscripciones = Suscripcion::with(['usuario', 'plan'])
            ->where('estado', 'activo') 
            ->get();

        if ($suscripciones->isEmpty()) {
            $this->warn('Alerta: No se encontraron suscripciones con estado "activo" en la base de datos.');
            return 0;
        }

        $this->comment("Se encontraron {$suscripciones->count()} suscripciones activas. Procesando...");

        foreach ($suscripciones as $suscripcion) {
            
            // Buscamos el cliente usando la relación relacional
            $cliente = $suscripcion->usuario ?? $suscripcion->user;

            if (!$cliente || !$cliente->email) {
                $this->error("❌ La suscripción ID {$suscripcion->id} no tiene un usuario o email vinculado. Saltando...");
                continue;
            }

            // 100% DINÁMICO: Extraemos el valor directamente de la columna cuota_mensual de tu BD
            $valorTotal = $suscripcion->cuota_mensual;
            $nombrePlan = $suscripcion->plan->nombre ?? 'Plan Previsión';

            // 2. Insertamos la factura en la BD asociando el modelo correcto de Mouren
            $factura = Factura::create([
                'suscripcion_id'     => $suscripcion->id,
                'fecha_emision'      => Carbon::now()->format('Y-m-d'),
                'fecha_vencimiento'  => Carbon::now()->addDays(10)->format('Y-m-d'),
                'total'              => $valorTotal, // Toma el valor exacto (24900, 16350 o 8200)
                'estado_factura_id'  => 1, // 1 = Pendiente
            ]);

            try {
                // 3. Enviamos el correo adjuntando la factura real
                Mail::to($cliente->email)->send(new FacturaMensualMail($factura));
                
                $this->info("✔ Factura #{$factura->id} (\${$valorTotal}) generada para: {$cliente->email} [Plan: {$nombrePlan}]");
                
                // Respiro de 2 segundos para que el plan gratuito de Mailtrap no se bloquee por velocidad
                

            } catch (\Exception $e) {
                $this->error("❌ Error enviando correo para la suscripción ID {$suscripcion->id}: " . $e->getMessage());
            }
            sleep(8);
        }
        
        $this->info('¡Proceso de facturación completado con éxito!');
        return 0;
    }
}