<?php

namespace App\Services;

use App\Models\JadwalSlot;

class JadwalService
{
    /**
     * Mengembalikan daftar jadwal yang belum dibooking (mempersiapkan arsitektur untuk Fase 6).
     */
    public function getAvailableSlots(?string $poli, ?string $tanggal)
    {
        $query = JadwalSlot::with(['dokter.poli'])
            ->whereDoesntHave('booking', function ($q) {
                $q->where('status', 'terjadwal');
            });

        if ($poli) {
            $query->whereHas('dokter.poli', function ($q) use ($poli) {
                $q->whereRaw('LOWER(nama) = ?', [strtolower($poli)]);
            });
        }

        if ($tanggal) {
            $query->where('tanggal', $tanggal);
        }

        return $query->get();
    }
}
