<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Agrega un token único, opcional, a cada afiliado. Se usa para generar
     * el enlace de "Enviar personalización" — el afiliado abre ese enlace
     * (sin necesitar cuenta ni login) y confirma su identidad con su cédula.
     *
     * Es 100% aditivo: no toca ninguna columna existente, y al ser nullable,
     * todos tus afiliados actuales quedan con token = NULL hasta que generes
     * el enlace de cada uno por primera vez (se crea automático en ese momento).
     */
    public function up(): void
    {
        Schema::table('afiliados', function (Blueprint $table) {
            $table->string('token', 64)->nullable()->unique()->after('cedula');
        });
    }

    public function down(): void
    {
        Schema::table('afiliados', function (Blueprint $table) {
            $table->dropColumn('token');
        });
    }
};
