<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            // 🆕 Hacemos que suscripcion_id ya NO sea obligatorio.
            // Las facturas existentes NO se ven afectadas (siguen con su valor actual).
            $table->foreignId('suscripcion_id')->nullable()->change();

            // 🆕 Datos del cliente cuando NO hay suscripción de por medio
            // (servicio completo cobrado a alguien no afiliado)
            $table->string('cliente_nombre')->nullable()->after('suscripcion_id');
            $table->string('cliente_cedula', 20)->nullable()->after('cliente_nombre');
            $table->string('cliente_telefono', 20)->nullable()->after('cliente_cedula');
            $table->string('cliente_email')->nullable()->after('cliente_telefono');
            $table->string('concepto')->nullable()->after('cliente_email'); // ej: "Servicio funerario completo - Juan Pérez"
        });
    }

    public function down(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            $table->dropColumn(['cliente_nombre', 'cliente_cedula', 'cliente_telefono', 'cliente_email', 'concepto']);
            $table->foreignId('suscripcion_id')->nullable(false)->change();
        });
    }
};
