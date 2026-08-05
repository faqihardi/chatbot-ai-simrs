<?php

namespace App\Helpers;

class ContactHelper
{
    /**
     * Menormalisasi format nomor HP (membuang spasi/strip, dan menggunakan format awalan 62).
     */
    public static function normalisasiNomorHp(string $input): string
    {
        // Hapus semua karakter kecuali angka dan plus
        $nomor = preg_replace('/[^0-9+]/', '', $input);

        // Jika mulai dengan '+62', ubah menjadi '62'
        if (str_starts_with($nomor, '+62')) {
            $nomor = '62' . substr($nomor, 3);
        }
        // Jika mulai dengan '08', ubah menjadi '628'
        elseif (str_starts_with($nomor, '08')) {
            $nomor = '628' . substr($nomor, 2);
        }
        // Jika mulai dengan '8', ubah menjadi '628' (asumsi nomor lokal Indonesia)
        elseif (str_starts_with($nomor, '8')) {
            $nomor = '628' . substr($nomor, 1);
        }

        return $nomor;
    }
}
