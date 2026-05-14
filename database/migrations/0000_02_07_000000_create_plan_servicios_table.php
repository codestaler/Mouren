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
    Schema::create('plan_servicio', function (Blueprint $table) {
        $table->id();
        $table->foreignId('plan_id')->constrained('planes')->onDelete('cascade');
        $table->foreignId('servicio_id')->constrained('servicios')->onDelete('cascade');
        $table->integer('cantidad')->default(1); // Por si el plan incluye 2 ramos, por ejemplo
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plan_servicios');
    }
};
