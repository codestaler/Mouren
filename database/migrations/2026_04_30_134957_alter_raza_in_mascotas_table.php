<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::table('mascotas', function (Blueprint $table) {
        // Borramos el campo de texto viejo
        $table->dropColumn('raza');
        // Añadimos la clave foránea apuntando a nuestra nueva tabla de razas
        $table->foreignId('raza_id')->nullable()->after('especie_id')->constrained('razas')->onDelete('set null');
    });
}

public function down(): void
{
    Schema::table('mascotas', function (Blueprint $table) {
        $table->dropForeign(['raza_id']);
        $table->dropColumn('raza_id');
        $table->string('raza')->nullable()->after('especie_id');
    });
}
};
