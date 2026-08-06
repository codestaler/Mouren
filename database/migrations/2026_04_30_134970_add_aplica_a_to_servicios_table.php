<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            // 🆕 'ambos' como default: TODOS tus servicios actuales van a seguir
            // apareciendo tanto en humanos como en mascotas hasta que tú decidas
            // ir reclasificando cada uno. Nada se rompe ni desaparece.
            $table->enum('aplica_a', ['humano', 'mascota', 'ambos'])
                ->default('ambos')
                ->after('precio'); // ajusta 'precio' si tu columna de referencia se llama distinto
        });
    }

    public function down(): void
    {
        Schema::table('servicios', function (Blueprint $table) {
            $table->dropColumn('aplica_a');
        });
    }
};
