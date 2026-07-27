<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\JadwalService;

class JadwalController extends Controller
{
    protected $jadwalService;

    public function __construct(JadwalService $jadwalService)
    {
        $this->jadwalService = $jadwalService;
    }

    public function internalGetSchedules(Request $request)
    {
        $request->validate([
            'poli' => 'nullable|string',
            'tanggal' => 'nullable|date',
        ]);

        $slots = $this->jadwalService->getAvailableSlots(
            $request->poli,
            $request->tanggal
        );

        $formatted = $slots->map(function ($s) {
            return [
                'id' => $s->id,
                'dokter_nama' => $s->dokter->nama,
                'poli_nama' => $s->dokter->poli->nama,
                'tanggal' => $s->tanggal,
                'jam_mulai' => substr($s->jam_mulai, 0, 5),
                'jam_selesai' => substr($s->jam_selesai, 0, 5),
                'kuota_tersisa' => $s->kuota_maksimal - $s->booking()->where('status', 'terjadwal')->count(),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'schedules' => $formatted
        ]);
    }
}
