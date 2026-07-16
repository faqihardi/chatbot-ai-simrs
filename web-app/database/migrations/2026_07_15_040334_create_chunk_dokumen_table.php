<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chunk_dokumen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dokumen_id')->constrained('dokumen')->cascadeOnDelete();
            $table->integer('urutan_chunk');
            $table->longText('isi_potongan');
            $table->integer('panjang_karakter');
            $table->jsonb('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->unique([
                'dokumen_id',
                'urutan_chunk'
            ]);
            $table->index('dokumen_id');
        });

        // DB::statement("
        //     ALTER TABLE chunk_dokumen ADD COLUMN embedding vector(3072)
        // ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chunk_dokumen');
    }
};
