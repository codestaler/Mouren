<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('email');
            $table->string('idioma', 5)->default('es')->after('avatar');
            $table->enum('tema', ['claro', 'oscuro'])->default('claro')->after('idioma');
            $table->boolean('notificaciones_activadas')->default(true)->after('tema');
            $table->text('two_factor_secret')->nullable()->after('notificaciones_activadas');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_secret');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'avatar', 'idioma', 'tema', 'notificaciones_activadas',
                'two_factor_secret', 'two_factor_confirmed_at',
            ]);
        });
    }
};