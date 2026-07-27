<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\BookingService;
use App\Models\SesiPercakapan;

class BookingController extends Controller
{
    protected $bookingService;

    public function __construct(BookingService $bookingService)
    {
        $this->bookingService = $bookingService;
    }

    public function createDraftBooking(Request $request)
    {
        $request->validate([
            'slot_id' => 'required|exists:jadwal_slot,id',
            'token_sesi' => 'required|string',
            'nama_pasien' => 'required|string|max:150',
            'kontak' => 'required|string',
            'jenis_pembayaran' => 'required|in:umum,bpjs,asuransi',
            'keluhan_singkat' => 'nullable|string',
        ]);

        $sesi = SesiPercakapan::where('token_sesi', $request->token_sesi)->firstOrFail();

        $booking = $this->bookingService->createDraft([
            'slot_id' => $request->slot_id,
            'sesi_id' => $sesi->id,
            'nama_pasien' => $request->nama_pasien,
            'kontak' => $request->kontak,
            'jenis_pembayaran' => $request->jenis_pembayaran,
            'keluhan_singkat' => $request->keluhan_singkat,
        ]);

        return response()->json([
            'success' => true,
            'booking' => $booking
        ]);
    }

    public function confirmBooking(Request $request)
    {
        $request->validate([
            'nomor_booking' => 'required|string|exists:booking,nomor_booking',
        ]);

        try {
            $booking = $this->bookingService->confirm($request->nomor_booking);

            return response()->json([
                'success' => true,
                'nomor_booking' => $booking->nomor_booking,
                'nomor_antrean' => $booking->nomor_antrean,
                'message' => 'Pendaftaran Anda berhasil dikonfirmasi!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function internalBookAppointment(Request $request)
    {
        $request->validate([
            'slot_id' => 'required|exists:jadwal_slot,id',
            'patient_name' => 'required|string',
            'contact' => 'required|string',
            'payment_type' => 'nullable|string',
        ]);

        $paymentType = strtolower($request->payment_type ?? 'umum');
        if (!in_array($paymentType, ['umum', 'bpjs', 'asuransi'])) {
            $paymentType = 'umum';
        }

        try {
            $booking = $this->bookingService->createDirectBooking([
                'slot_id' => $request->slot_id,
                'nama_pasien' => $request->patient_name,
                'kontak' => $request->contact,
                'jenis_pembayaran' => $paymentType,
            ]);

            return response()->json([
                'success' => true,
                'nomor_booking' => $booking->nomor_booking,
                'nomor_antrean' => $booking->nomor_antrean,
                'dokter_nama' => $booking->slot->dokter->nama,
                'poli_nama' => $booking->slot->dokter->poli->nama,
                'tanggal' => $booking->slot->tanggal,
                'jam' => substr($booking->slot->jam_mulai, 0, 5) . ' - ' . substr($booking->slot->jam_selesai, 0, 5),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }

    public function internalCheckAppointments(Request $request)
    {
        $request->validate([
            'kontak' => 'required|string',
        ]);

        $bookings = $this->bookingService->findByContact($request->kontak);

        $formatted = $bookings->map(function ($b) {
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

        return response()->json([
            'success' => true,
            'bookings' => $formatted
        ]);
    }
}
