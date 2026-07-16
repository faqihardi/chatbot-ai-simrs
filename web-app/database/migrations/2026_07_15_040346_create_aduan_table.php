<?php

use App\Enums\AduanStatus;
use App\Enums\UrgensiAduan;
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
        Schema::create('aduan', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_tiket',30)->unique();
            $table->enum('tipe_pengadu',[
                'staf',
                'publik'
            ]);
            $table->foreignId('staf_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('sesi_id')->nullable()->constrained('sesi_percakapan')->nullOnDelete();
            $table->text('kontak_terenkripsi')->nullable();
            $table->string('kategori');
            $table->string('lokasi')->nullable();
            $table->longText('deskripsi');
            $table->enum('urgensi',[
                UrgensiAduan::Rendah->value,
                UrgensiAduan::Sedang->value,
                UrgensiAduan::Tinggi->value,
            ]);
            $table->enum('status',[
                AduanStatus::Baru->value,
                AduanStatus::Diproses->value,
                AduanStatus::Selesai->value,
                AduanStatus::Ditolak->value,
            ])->default(AduanStatus::Baru->value);
            $table->longText('tanggapan')->nullable();
            $table->timestamp('ditindaklanjuti_pada')->nullable();
            $table->timestamp('selesai_pada')->nullable();
            $table->timestamps();
            $table->index([
                'status',
                'urgensi'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aduan');
    }
};
