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
    Schema::create('users', function (Blueprint $table) {
        $table->id();
        
        // --- Campos que venían de Personas ---
        $table->string('nombre', 100);
        $table->string('cedula', 20)->unique();
        $table->foreignId('tipo_documento_id')->constrained('tipos_documento');
        $table->date('fecha_nacimiento');
        $table->foreignId('genero_id')->constrained('generos');
        $table->string('telefono', 20);

        // --- Campos originales de Users ---
        $table->string('email')->unique();
        $table->string('password');
        $table->foreignId('estado_id')->constrained('estados_usuario');
        $table->foreignId('tipo_usuario_id')->constrained('tipos_usuario');
        
        $table->timestamps();
    });


        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
