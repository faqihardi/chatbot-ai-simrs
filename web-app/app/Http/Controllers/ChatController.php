<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\SesiPercakapan;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class ChatController extends Controller
{
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
        // Set Timeout 2 menit
        set_time_limit(120);

        $request->validate([
            'token_sesi' => 'required|string',
            'message' => 'required|string',
            'history' => 'array',
        ]);

        // Verifikasi apakah sesi valid
        $sesi = SesiPercakapan::where('token_sesi', $request->token_sesi)->first();
        if (!$sesi) {
            return response()->json(['error' => 'Sesi tidak valid atau telah kadaluarsa'], 401);
        }

        try {
            // Proxy request ke FastAPI (AI Service) : port 8001
            $response = Http::timeout(60)->post('http://127.0.0.1:8001/chat', [
                'message' => $request->message,
                'history' => $request->history ?? [],
                'session_id' => $request->token_sesi,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return response()->json(['reply' => 'Maaf, layanan AI sedang mengalami gangguan internal.'], 500);
        } catch (\Exception $e) {
            return response()->json(['reply' => 'Maaf, tidak dapat terhubung ke AI Service.'], 500);
        }
    }
}
