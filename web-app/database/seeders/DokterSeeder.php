<?php

namespace Database\Seeders;

use App\Models\Dokter;
use App\Models\Poli;
use Illuminate\Database\Seeder;

class DokterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dokterPerPoli = [
            'INT' => [
                ['kode' => 'D001', 'nama' => 'dr. Andi Wijaya, Sp.PD', 'spesialisasi' => 'Penyakit Dalam'],
                ['kode' => 'D002', 'nama' => 'dr. Sari Puspita, Sp.PD', 'spesialisasi' => 'Penyakit Dalam'],
            ],
            'OBG' => [
                ['kode' => 'D003', 'nama' => 'dr. Rini Hartati, Sp.OG', 'spesialisasi' => 'Obstetri & Ginekologi'],
            ],
            'ANK' => [
                ['kode' => 'D004', 'nama' => 'dr. Budi Santoso, Sp.A', 'spesialisasi' => 'Anak'],
                ['kode' => 'D005', 'nama' => 'dr. Maya Anggraini, Sp.A', 'spesialisasi' => 'Anak'],
            ],
            'THT' => [
                ['kode' => 'D006', 'nama' => 'dr. Hendra Gunawan, Sp.THT', 'spesialisasi' => 'THT'],
            ],
            'MTA' => [
                ['kode' => 'D007', 'nama' => 'dr. Fitri Lestari, Sp.M', 'spesialisasi' => 'Mata'],
            ],
            'GGI' => [
                ['kode' => 'D008', 'nama' => 'drg. Agus Prasetyo', 'spesialisasi' => 'Gigi Umum'],
            ],
        ];

        foreach ($dokterPerPoli as $kodePoli => $dokterList) {
            $poli = Poli::where('kode', $kodePoli)->first();

            foreach ($dokterList as $dokter) {
                Dokter::create([
                    'poli_id' => $poli->id,
                    ...$dokter,
                ]);
            }
        }
    }
}
