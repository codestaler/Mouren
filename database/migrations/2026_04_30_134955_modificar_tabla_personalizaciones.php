<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('personalizaciones', function (Blueprint $table) {

            $table->foreignId('suscripcion_id')
                ->nullable()
                ->after('id')
                ->constrained('suscripciones')
                ->cascadeOnDelete();

        });
    }

    public function down(): void
    {
        Schema::table('personalizaciones', function (Blueprint $table) {

            $table->dropForeign(['suscripcion_id']);
            $table->dropColumn('suscripcion_id');

        });
    }
};