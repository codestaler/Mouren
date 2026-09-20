<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Igual que la migración vieja de afiliado_id, pero con un chequeo
     * Schema::hasColumn() antes de agregarla. Así, sin importar si la base
     * de datos de Railway ya tiene la columna (porque el dump la trajo) o
     * no la tiene (porque nunca corrió esa migración vieja ahí), esta
     * migración es segura de correr — no falla en ningún caso.
     */
    public function up(): void
    {
        if (!Schema::hasColumn('personalizaciones', 'afiliado_id')) {
            Schema::table('personalizaciones', function (Blueprint $table) {
                $table->unsignedBigInteger('afiliado_id')->nullable()->after('servicio_id');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('personalizaciones', 'afiliado_id')) {
            Schema::table('personalizaciones', function (Blueprint $table) {
                $table->dropColumn('afiliado_id');
            });
        }
    }
};
