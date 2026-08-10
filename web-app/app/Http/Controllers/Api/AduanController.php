<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AduanService;

class AduanController extends Controller
{
    protected $aduanService;

    public function __construct(AduanService $aduanService)
    {
        $this->aduanService = $aduanService;
    }

    public function internalSubmitComplaint(Request $request)
    {
        // Case adjustment from LLM response
        $request->merge([
            'submitter_type' => strtolower($request->submitter_type ?? '')
        ]);

        $request->validate([
            'submitter_type' => 'required|in:staf,publik',
            'category' => 'required|string',
            'description' => 'required|string',
            'location' => 'nullable|string',
            'urgency' => 'nullable|string',
            'contact' => 'nullable|string',
            'session_id' => 'nullable|string',
        ]);

        $aduan = $this->aduanService->submit($request->all());

        return response()->json([
            'success' => true,
            'nomor_tiket' => $aduan->nomor_tiket
        ]);
    }

    public function internalCheckComplaintStatus(Request $request)
    {
        $request->validate([
            'nomor_tiket' => 'required|string',
        ]);

        $aduan = $this->aduanService->checkStatus($request->nomor_tiket);

        if (!$aduan) {
            return response()->json([
                'success' => false,
                'message' => 'Aduan tidak ditemukan.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'aduan' => [
                'nomor_tiket' => $aduan->nomor_tiket,
                'kategori' => $aduan->kategori,
                'deskripsi' => $aduan->deskripsi,
                'status' => $aduan->status->value ?? $aduan->status,
                'tanggapan' => $aduan->tanggapan,
                'urgensi' => $aduan->urgensi->value ?? $aduan->urgensi,
                'created_at' => $aduan->created_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    public function internalFindComplaintsByContact(Request $request)
    {
        $request->validate([
            'kontak' => 'required|string',
        ]);

        $aduans = $this->aduanService->findByContact($request->kontak);

        $formatted = $aduans->map(function ($a) {
            return [
                'nomor_tiket' => $a->nomor_tiket,
                'kategori' => $a->kategori,
                'deskripsi' => $a->deskripsi,
                'tanggapan' => $a->tanggapan,
                'urgensi' => $a->urgensi->value ?? $a->urgensi,
                'status' => $a->status->value ?? $a->status,
                'created_at' => $a->created_at->format('Y-m-d H:i:s'),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'aduans' => $formatted
        ]);
    }
}
