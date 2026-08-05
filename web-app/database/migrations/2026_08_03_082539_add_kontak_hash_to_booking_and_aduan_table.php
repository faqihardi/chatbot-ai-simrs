<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Booking;
use App\Models\Aduan;
use App\Helpers\ContactHelper;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('booking', function (Blueprint $table) {
            $table->string('kontak_hash', 64)->nullable()->index()->after('kontak_terenkripsi');
        });

        Schema::table('aduan', function (Blueprint $table) {
            $table->string('kontak_hash', 64)->nullable()->index()->after('kontak_terenkripsi');
        });

        // Backfill data for Booking
        $bookings = Booking::all();
        foreach ($bookings as $booking) {
            if ($booking->kontak_terenkripsi) {
                $nomorNormal = ContactHelper::normalisasiNomorHp($booking->kontak_terenkripsi);
                $booking->kontak_hash = hash('sha256', $nomorNormal);
                // mencegah isu perbedaan format saat deskripsi.
                $booking->kontak_terenkripsi = $nomorNormal; 
                $booking->save();
            }
        }

        // Backfill data for Aduan
        $aduans = Aduan::all();
        foreach ($aduans as $aduan) {
            if ($aduan->kontak_terenkripsi) {
                $nomorNormal = ContactHelper::normalisasiNomorHp($aduan->kontak_terenkripsi);
                $aduan->kontak_hash = hash('sha256', $nomorNormal);
                $aduan->kontak_terenkripsi = $nomorNormal;
                $aduan->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_and_aduan', function (Blueprint $table) {
            //
        });
    }
};
