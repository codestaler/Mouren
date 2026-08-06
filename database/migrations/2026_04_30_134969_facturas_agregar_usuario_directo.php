<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            // 🆕 Permite ligar la factura DIRECTAMENTE a un usuario registrado
            // (sin pasar por una suscripción) — para clientes con cuenta pero sin plan activo.
            $table->foreignId('usuario_id')->nullable()->after('suscripcion_id')->constrained('users');
        });
    }

    public function down(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            $table->dropForeign(['usuario_id']);
            $table->dropColumn('usuario_id');
        });
    }
};
