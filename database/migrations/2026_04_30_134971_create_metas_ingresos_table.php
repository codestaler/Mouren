<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('metas_ingresos', function (Blueprint $table) {
            $table->id();
            $table->unsignedTinyInteger('mes');   // 1 a 12
            $table->unsignedSmallInteger('anio'); // ej. 2026
            $table->decimal('monto', 14, 2);
            $table->timestamps();

            // Solo puede existir UNA meta por mes/año — evita duplicados
            $table->unique(['mes', 'anio']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('metas_ingresos');
    }
};
