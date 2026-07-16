<?php

use App\Enums\BookingStatus;
use App\Enums\JenisPembayaran;
use App\Enums\TipePasien;
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
        Schema::create('booking', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_booking', 30)->unique();
            $table->foreignId('slot_id')->constrained('jadwal_slot')->cascadeOnDelete();
            $table->foreignId('sesi_id')->nullable()->constrained('sesi_percakapan')->nullOnDelete();
            $table->string('nama_pasien',150);
            $table->text('kontak_terenkripsi');
            $table->enum('tipe_pasien',[
                TipePasien::Baru->value,
                TipePasien::Lama->value,
            ]);
            $table->enum('jenis_pembayaran',[
                JenisPembayaran::Umum->value,
                JenisPembayaran::Bpjs->value,
                JenisPembayaran::Asuransi->value,
            ]);
            $table->text('keluhan_singkat')->nullable();
            $table->enum('status',[
                BookingStatus::Draft->value,
                BookingStatus::Terjadwal->value,
                BookingStatus::Selesai->value,
                BookingStatus::Dibatalkan->value,
                BookingStatus::Expired->value,
            ])->default(BookingStatus::Draft->value);
            $table->timestamp('kadaluarsa_pada')->nullable();
            $table->timestamp('konfirmasi_direncanakan_pada')->nullable();
            $table->timestamp('konfirmasi_terkirim_pada')->nullable();
            $table->timestamps();
            $table->index(['status', 'kadaluarsa_pada']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking');
    }
};
