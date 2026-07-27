<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\SesiPercakapan;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use App\Services\BookingService;
use App\Services\AduanService;

class ChatController extends Controller
{
    protected $bookingService;
    protected $aduanService;

    public function __construct(BookingService $bookingService, AduanService $aduanService)
    {
        $this->bookingService = $bookingService;
        $this->aduanService = $aduanService;
    }

    public function index()
    {
        return Inertia::render('Chat');
    }

    public function createSession(Request $request)
    {
        $sesi = SesiPercakapan::create([
            'token_sesi' => Str::uuid()->toString(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['token_sesi' => $sesi->token_sesi]);
    }

    /**
     * Menerima pesan dari React, forward ke FastAPI, dan kembalikan response
     */
    public function sendMessage(Request $request)
    {
        set_time_limit(120);

        $request->validate([
            'token_sesi' => 'required|string',
            'message' => 'required|string',
            'history' => 'array',
            'user_role' => 'nullable|string',
        ]);

        $sesi = SesiPercakapan::where('token_sesi', $request->token_sesi)->first();
        if (!$sesi) {
            return response()->json(['error' => 'Sesi tidak valid atau telah kadaluarsa'], 401);
        }

        try {
            $response = Http::timeout(60)->post('http://127.0.0.1:8001/chat', [
                'message' => $request->message,
                'history' => $request->history ?? [],
                'session_id' => $request->token_sesi,
                'user_role' => $request->user_role ?? 'publik',
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return response()->json(['reply' => 'Maaf, layanan AI sedang mengalami gangguan internal.'], 500);
        } catch (\Exception $e) {
            return response()->json(['reply' => 'Maaf, tidak dapat terhubung ke AI Service.'], 500);
        }
    }

    /**
     * Endpoint untuk mengambil data sesi, booking, dan aduan aktif saat halaman direload
     */
    public function getSessionData(Request $request)
    {
        $request->validate([
            'token_sesi' => 'required|string',
        ]);

        $sesi = SesiPercakapan::where('token_sesi', $request->token_sesi)->first();

        if (!$sesi) {
            return response()->json(['success' => false, 'message' => 'Sesi tidak ditemukan'], 404);
        }

        $bookings = $this->bookingService->findActiveBySession($sesi->id);
        $formattedBookings = $bookings->map(function ($b) {
            return [
                'nomor_booking' => $b->nomor_booking,
                'nomor_antrean' => $b->nomor_antrean,
                'dokter_nama' => $b->slot->dokter->nama,
                'poli_nama' => $b->slot->dokter->poli->nama,
                'tanggal' => $b->slot->tanggal,
                'jam' => substr($b->slot->jam_mulai, 0, 5) . ' - ' . substr($b->slot->jam_selesai, 0, 5),
                'status' => $b->status->value ?? $b->status,
            ];
        })->values();

        $aduans = $this->aduanService->findActiveBySession($sesi->id);
        $formattedAduans = $aduans->map(function ($a) {
            return [
                'nomor_tiket' => $a->nomor_tiket,
                'kategori' => $a->kategori,
                'status' => $a->status->value ?? $a->status,
                'created_at' => $a->created_at->format('Y-m-d H:i:s'),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'bookings' => $formattedBookings,
            'aduans' => $formattedAduans
        ]);
    }
}
