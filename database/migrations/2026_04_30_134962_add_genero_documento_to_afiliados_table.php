<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('afiliados', function (Blueprint $table) {
            $table->foreignId('genero_id')->nullable()->after('nombre')->constrained('generos');
            $table->foreignId('tipo_documento_id')->nullable()->after('genero_id')->constrained('tipos_documento');
            $table->string('cedula', 20)->nullable()->unique()->after('tipo_documento_id');
            $table->date('fecha_nacimiento')->nullable()->after('cedula');
        });
    }

    public function down(): void
    {
        Schema::table('afiliados', function (Blueprint $table) {
            $table->dropForeign(['genero_id']);
            $table->dropForeign(['tipo_documento_id']);
            $table->dropUnique(['cedula']);
            $table->dropColumn(['genero_id', 'tipo_documento_id', 'cedula', 'fecha_nacimiento']);
        });
    }
};