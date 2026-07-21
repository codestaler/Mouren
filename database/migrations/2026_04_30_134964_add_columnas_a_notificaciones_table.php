<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->string('titulo')->nullable()->after('usuario_id');
            $table->string('tipo')->default('general')->after('mensaje');
            $table->string('enlace')->nullable()->after('tipo');
        });
    }

    public function down(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropColumn(['titulo', 'tipo', 'enlace']);
        });
    }
};
