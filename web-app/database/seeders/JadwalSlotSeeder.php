<?php

namespace Database\Seeders;

use App\Models\Dokter;
use App\Models\JadwalSlot;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class JadwalSlotSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dokterList = Dokter::all();
        $jumlahHari = 7;
        $jamMulaiHari = '08:00';
        $jamSelesaiHari = '12:00';
        $durasiSlotMenit = 20;

        foreach ($dokterList as $dokter) {
            for ($h = 1; $h <= $jumlahHari; $h++) {
                $tanggal = Carbon::today()->addDays($h);

                // Skip Hari Minggu 
                if ($tanggal->isSunday()) {
                    continue;
                }

                $waktu = Carbon::parse($tanggal->toDateString() . ' ' . $jamMulaiHari);
                $batasAkhir = Carbon::parse($tanggal->toDateString() . ' ' . $jamSelesaiHari);

                while ($waktu->lt($batasAkhir)) {
                    $jamSelesaiSlot = $waktu->copy()->addMinutes($durasiSlotMenit);

                    JadwalSlot::create([
                        'dokter_id' => $dokter->id,
                        'tanggal' => $tanggal->toDateString(),
                        'jam_mulai' => $waktu->format('H:i:s'),
                        'jam_selesai' => $jamSelesaiSlot->format('H:i:s'),
                    ]);

                    $waktu->addMinutes($durasiSlotMenit);
                }
            }
        }
    }
}
