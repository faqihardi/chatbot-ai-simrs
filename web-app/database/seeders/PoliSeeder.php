<?php

namespace Database\Seeders;

use App\Models\Poli;
use Illuminate\Database\Seeder;

class PoliSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $poliList = [
            ['kode' => 'INT', 'nama' => 'Penyakit Dalam'],
            ['kode' => 'OBG', 'nama' => 'Obstetri & Ginekologi'],
            ['kode' => 'ANK', 'nama' => 'Anak'],
            ['kode' => 'THT', 'nama' => 'Telinga Hidung Tenggorokan'],
            ['kode' => 'MTA', 'nama' => 'Mata'],
            ['kode' => 'GGI', 'nama' => 'Gigi & Mulut'],
        ];

        foreach ($poliList as $poli) {
            Poli::create($poli);
        }
    }
}
