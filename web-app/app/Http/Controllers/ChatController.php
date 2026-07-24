<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\SesiPercakapan;
use App\Models\Booking;
use App\Models\JadwalSlot;
use App\Models\Aduan;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
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
            'user_role' => 'nullable|string',
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
     * Membuat draft booking 
     */
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

        // Deteksi pasien baru/lama
        $kontak = $request->kontak;
        $existingBooking = Booking::all()->first(function ($b) use ($kontak) {
            return $b->kontak_terenkripsi === $kontak;
        });
        $tipePasien = $existingBooking ? 'lama' : 'baru';

        // Buat draft booking (kadaluarsa dalam 15 menit)
        $booking = Booking::create([
            'nomor_booking' => 'BK-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
            'slot_id' => $request->slot_id,
            'sesi_id' => $sesi->id,
            'nama_pasien' => $request->nama_pasien,
            'kontak_terenkripsi' => $kontak,
            'tipe_pasien' => $tipePasien,
            'jenis_pembayaran' => $request->jenis_pembayaran,
            'keluhan_singkat' => $request->keluhan_singkat,
            'status' => 'draft',
            'kadaluarsa_pada' => now()->addMinutes(15),
        ]);

        return response()->json([
            'success' => true,
            'booking' => $booking
        ]);
    }

    /**
     * Mengkonfirmasi draft booking menjadi terjadwal
     */
    public function confirmBooking(Request $request)
    {
        $request->validate([
            'nomor_booking' => 'required|string|exists:booking,nomor_booking',
        ]);

        return DB::transaction(function () use ($request) {
            $booking = Booking::where('nomor_booking', $request->nomor_booking)
                ->where('status', 'draft')
                ->lockForUpdate()
                ->firstOrFail();

            // Lock jadwal_slot untuk mencegah double booking
            $slot = JadwalSlot::where('id', $booking->slot_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Cek apakah slot sudah dibooking oleh booking lain yang 'terjadwal'
            $alreadyBooked = Booking::where('slot_id', $booking->slot_id)
                ->where('status', 'terjadwal')
                ->exists();

            if ($alreadyBooked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Maaf, slot jadwal dokter ini baru saja terisi oleh pasien lain.'
                ], 422);
            }

            // Generate nomor antrean (reset per dokter per hari)
            $countToday = Booking::whereHas('slot', function ($query) use ($slot) {
                    $query->where('dokter_id', $slot->dokter_id)
                          ->where('tanggal', $slot->tanggal);
                })
                ->where('status', 'terjadwal')
                ->count();

            $nextQueueNumber = $countToday + 1;
            $nomorAntrean = 'KA' . str_pad($nextQueueNumber, 3, '0', STR_PAD_LEFT);

            // Update booking status
            $booking->update([
                'status' => 'terjadwal',
                'nomor_antrean' => $nomorAntrean,
                'kadaluarsa_pada' => null, // Hapus masa kadaluarsa 
            ]);

            return response()->json([
                'success' => true,
                'nomor_booking' => $booking->nomor_booking,
                'nomor_antrean' => $booking->nomor_antrean,
                'message' => 'Pendaftaran Anda berhasil dikonfirmasi!'
            ]);
        });
    }

    /**
     * Endpoint internal (call from FastAPI) untuk memeriksa janji temu aktif berdasarkan kontak
     */
    public function internalCheckAppointments(Request $request)
    {
        $request->validate([
            'kontak' => 'required|string',
        ]);

        $kontak = $request->kontak;
        
        // Ambil semua booking, filter berdasarkan kontak yang terenkripsi
        $bookings = Booking::with(['slot.dokter.poli'])
            ->get()
            ->filter(function ($b) use ($kontak) {
                return $b->kontak_terenkripsi === $kontak;
            });

        $formatted = $bookings->map(function ($b) {
            return [
                'nomor_booking' => $b->nomor_booking,
                'nomor_antrean' => $b->nomor_antrean,
                'dokter_nama' => $b->slot->dokter->nama,
                'poli_nama' => $b->slot->dokter->poli->nama,
                'tanggal' => $b->slot->tanggal,
                'jam' => substr($b->slot->jam_mulai, 0, 5) . ' - ' . substr($b->slot->jam_selesai, 0, 5),
                'status' => $b->status->value,
            ];
        })->values();

        return response()->json([
            'success' => true,
            'bookings' => $formatted
        ]);
    }

    /**
     * Endpoint internal (call from FastAPI) untuk membuat booking secara langsung (text-based booking)
     */
    public function internalBookAppointment(Request $request)
    {
        $request->validate([
            'slot_id' => 'required|exists:jadwal_slot,id',
            'patient_name' => 'required|string',
            'contact' => 'required|string',
            'payment_type' => 'nullable|string',
        ]);

        // Mapping jenis pembayaran string ke enum value
        $paymentType = strtolower($request->payment_type ?? 'umum');
        if (!in_array($paymentType, ['umum', 'bpjs', 'asuransi'])) {
            $paymentType = 'umum';
        }

        return DB::transaction(function () use ($request, $paymentType) {
            // Lock slot
            $slot = JadwalSlot::where('id', $request->slot_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Cek double booking
            $alreadyBooked = Booking::where('slot_id', $request->slot_id)
                ->where('status', 'terjadwal')
                ->exists();

            if ($alreadyBooked) {
                return response()->json([
                    'success' => false,
                    'message' => 'Slot ini sudah dipesan oleh orang lain.'
                ], 422);
            }

            // Cek tipe pasien
            $contact = $request->contact;
            $existing = Booking::all()->first(function ($b) use ($contact) {
                return $b->kontak_terenkripsi === $contact;
            });
            $tipePasien = $existing ? 'lama' : 'baru';

            // Generate nomor antrean
            $countToday = Booking::whereHas('slot', function ($query) use ($slot) {
                    $query->where('dokter_id', $slot->dokter_id)
                          ->where('tanggal', $slot->tanggal);
                })
                ->where('status', 'terjadwal')
                ->count();

            $nextQueueNumber = $countToday + 1;
            $nomorAntrean = 'KA' . str_pad($nextQueueNumber, 3, '0', STR_PAD_LEFT);

            // Buat booking terjadwal langsung
            $booking = Booking::create([
                'nomor_booking' => 'BK-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                'nomor_antrean' => $nomorAntrean,
                'slot_id' => $request->slot_id,
                'nama_pasien' => $request->patient_name,
                'kontak_terenkripsi' => $contact,
                'tipe_pasien' => $tipePasien,
                'jenis_pembayaran' => $paymentType,
                'status' => 'terjadwal',
            ]);

            return response()->json([
                'success' => true,
                'nomor_booking' => $booking->nomor_booking,
                'nomor_antrean' => $booking->nomor_antrean,
                'dokter_nama' => $slot->dokter->nama,
                'poli_nama' => $slot->dokter->poli->nama,
                'tanggal' => $slot->tanggal,
                'jam' => substr($slot->jam_mulai, 0, 5) . ' - ' . substr($slot->jam_selesai, 0, 5),
            ]);
        });
    }
    /**
     * Endpoint internal untuk mensubmit aduan
     */
    public function internalSubmitComplaint(Request $request)
    {
        $request->validate([
            'submitter_type' => 'required|in:staf,publik',
            'category' => 'required|string',
            'description' => 'required|string',
            'location' => 'nullable|string',
            'urgency' => 'nullable|string',
            'contact' => 'nullable|string',
            'session_id' => 'nullable|string', // token_sesi
        ]);

        $sesi_id = null;
        if ($request->session_id) {
            $sesi = SesiPercakapan::where('token_sesi', $request->session_id)->first();
            if ($sesi) {
                $sesi_id = $sesi->id;
            }
        }

        $urgencyInput = strtolower($request->urgency ?? 'sedang');
        if (!in_array($urgencyInput, ['rendah', 'sedang', 'tinggi'])) {
            $urgencyInput = 'sedang';
        }

        // Nomor tiket format YYMMDD######
        $nomorTiket = date('ymd') . strtoupper(Str::random(6));

        $aduan = \App\Models\Aduan::create([
            'nomor_tiket' => $nomorTiket,
            'tipe_pengadu' => $request->submitter_type,
            'sesi_id' => $sesi_id,
            'kontak_terenkripsi' => $request->contact,
            'kategori' => $request->category,
            'lokasi' => $request->location,
            'deskripsi' => $request->description,
            'urgensi' => $urgencyInput,
            'status' => 'baru',
        ]);

        return response()->json([
            'success' => true,
            'nomor_tiket' => $aduan->nomor_tiket
        ]);
    }

    /**
     * Endpoint internal untuk mengecek status aduan by nomor tiket
     */
    public function internalCheckComplaintStatus(Request $request)
    {
        $request->validate([
            'nomor_tiket' => 'required|string',
        ]);

        $aduan = \App\Models\Aduan::where('nomor_tiket', $request->nomor_tiket)->first();

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
                'status' => $aduan->status->value,
                'tanggapan' => $aduan->tanggapan,
                'urgensi' => $aduan->urgensi->value,
                'created_at' => $aduan->created_at->format('Y-m-d H:i:s'),
            ]
        ]);
    }

    /**
     * Endpoint internal untuk mencari aduan by kontak
     */
    public function internalFindComplaintsByContact(Request $request)
    {
        $request->validate([
            'kontak' => 'required|string',
        ]);

        $kontak = $request->kontak;
        $aduans = \App\Models\Aduan::all()->filter(function ($a) use ($kontak) {
            return $a->kontak_terenkripsi === $kontak;
        });

        $formatted = $aduans->map(function ($a) {
            return [
                'nomor_tiket' => $a->nomor_tiket,
                'kategori' => $a->kategori,
                'status' => $a->status->value,
                'created_at' => $a->created_at->format('Y-m-d H:i:s'),
            ];
        })->values();

        return response()->json([
            'success' => true,
            'aduans' => $formatted
        ]);
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

        // Ambil booking aktif yang terhubung ke sesi ini
        $bookings = Booking::with(['slot.dokter.poli'])
            ->where('sesi_id', $sesi->id)
            ->whereNotIn('status', ['selesai', 'dibatalkan', 'expired'])
            ->get();

        $formattedBookings = $bookings->map(function ($b) {
            return [
                'nomor_booking' => $b->nomor_booking,
                'nomor_antrean' => $b->nomor_antrean,
                'dokter_nama' => $b->slot->dokter->nama,
                'poli_nama' => $b->slot->dokter->poli->nama,
                'tanggal' => $b->slot->tanggal,
                'jam' => substr($b->slot->jam_mulai, 0, 5) . ' - ' . substr($b->slot->jam_selesai, 0, 5),
                'status' => $b->status->value,
            ];
        })->values();

        // Ambil aduan aktif yang terhubung ke sesi ini
        $aduans = Aduan::where('sesi_id', $sesi->id)
            ->whereNotIn('status', ['selesai', 'ditolak'])
            ->get();

        $formattedAduans = $aduans->map(function ($a) {
            return [
                'nomor_tiket' => $a->nomor_tiket,
                'kategori' => $a->kategori,
                'status' => $a->status->value,
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
