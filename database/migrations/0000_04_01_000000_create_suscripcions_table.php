<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
    Schema::create('suscripciones', function (Blueprint $table) {
    $table->id();
    $table->foreignId('usuario_id')->constrained('users'); // En Laravel la tabla es 'users'
    $table->foreignId('plan_id')->constrained('planes');
    $table->date('fecha_inicio');
    $table->string('estado', 50);
    $table->decimal('cuota_mensual', 10, 2);
    $table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suscripcions');
    }
};
