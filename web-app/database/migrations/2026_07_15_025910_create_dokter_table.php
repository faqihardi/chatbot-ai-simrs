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
        Schema::create('dokter', function (Blueprint $table) {
            $table->id();
            $table->foreignId('poli_id')->constrained('poli')->cascadeOnDelete();
            $table->string('kode', 20)->unique();
            $table->string('nama', 150);
            $table->string('spesialisasi', 150);
            $table->timestamps();
            $table->index('poli_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dokter');
    }
};
