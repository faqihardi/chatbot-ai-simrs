<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Dokumen;
use App\Models\Aduan;
use App\Models\Booking;

class AdminCsController extends Controller
{
    public function dashboard()
    {
        // 1. Calculate 4 core metrics
        $totalDokumen = Dokumen::count();
        $dokumenAktif = Dokumen::where('aktif', true)->count();
        
        $totalAduan = Aduan::count();
        $aduanBaru = Aduan::where('status', 'baru')->count();
        $aduanSelesai = Aduan::where('status', 'selesai')->count();
        
        $totalBooking = Booking::count();
        $bookingTerjadwal = Booking::where('status', 'terjadwal')->count();
        $bookingHariIni = Booking::whereHas('slot', function($q) {
            $q->whereDate('tanggal', now()->toDateString());
        })->where('status', 'terjadwal')->count();

        // 2. Fetch recent lists (max 5 items)
        $recentAduans = Aduan::orderBy('created_at', 'desc')->take(5)->get()->map(function($a) {
            return [
                'id' => $a->id,
                'nomor_tiket' => $a->nomor_tiket,
                'kategori' => $a->kategori,
                'status' => $a->status,
                'tanggal' => $a->created_at->format('d M Y, H:i'),
            ];
        });

        $recentBookings = Booking::with(['slot.dokter.poli'])->orderBy('created_at', 'desc')->take(5)->get()->map(function($b) {
            return [
                'id' => $b->id,
                'nomor_antrean' => $b->nomor_antrean ?? '-',
                'nama_pasien' => $b->nama_pasien,
                'poli' => $b->slot->dokter->poli->nama ?? '-',
                'jadwal' => $b->slot ? $b->slot->tanggal . ' ' . substr($b->slot->jam_mulai, 0, 5) : '-',
                'status' => $b->status,
            ];
        });

        return Inertia::render('AdminCS/Dashboard', [
            'metrics' => [
                'dokumen' => [
                    'total' => $totalDokumen,
                    'aktif' => $dokumenAktif,
                ],
                'aduan' => [
                    'total' => $totalAduan,
                    'baru' => $aduanBaru,
                    'selesai' => $aduanSelesai,
                ],
                'booking' => [
                    'total' => $totalBooking,
                    'terjadwal' => $bookingTerjadwal,
                    'hari_ini' => $bookingHariIni,
                ]
            ],
            'recentAduans' => $recentAduans,
            'recentBookings' => $recentBookings,
        ]);
    }
}
