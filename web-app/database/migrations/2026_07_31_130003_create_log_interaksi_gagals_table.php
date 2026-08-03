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
        Schema::create('log_interaksi_gagal', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sesi_id')->nullable()->constrained('sesi_percakapan')->nullOnDelete();
            $table->text('pertanyaan');
            $table->string('alasan_gagal', 50); // 'dokumen_tidak_ditemukan', 'intent_tidak_jelas', 'tool_error'
            $table->float('skor_similarity_tertinggi')->nullable();
            $table->boolean('ditinjau')->default(false);
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_interaksi_gagal');
    }
};
