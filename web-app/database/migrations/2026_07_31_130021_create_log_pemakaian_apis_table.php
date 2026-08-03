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
        Schema::create('log_pemakaian_api', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50); // 'gemini'/'openai'
            $table->string('model');
            $table->string('jenis_panggilan', 50); // 'chat'/'embedding'
            $table->integer('token_input');
            $table->integer('token_output')->nullable();
            $table->decimal('estimasi_biaya', 10, 6)->nullable();
            $table->integer('durasi_ms');
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_pemakaian_api');
    }
};
