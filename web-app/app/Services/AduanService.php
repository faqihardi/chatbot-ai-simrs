<?php

namespace App\Services;

use App\Models\Aduan;
use App\Models\SesiPercakapan;
use Illuminate\Support\Str;

class AduanService
{
    /**
     * Endpoint internal untuk mensubmit aduan
     */
    public function submit(array $data)
    {
        $sesi_id = null;
        if (!empty($data['session_id'])) {
            $sesi = SesiPercakapan::where('token_sesi', $data['session_id'])->first();
            if ($sesi) {
                $sesi_id = $sesi->id;
            }
        }

        $urgencyInput = strtolower($data['urgency'] ?? 'sedang');
        if (!in_array($urgencyInput, ['rendah', 'sedang', 'tinggi'])) {
            $urgencyInput = 'sedang';
        }

        // Nomor tiket format YYMMDD######
        $nomorTiket = date('ymd') . strtoupper(Str::random(6));

        return Aduan::create([
            'nomor_tiket' => $nomorTiket,
            'tipe_pengadu' => $data['submitter_type'],
            'sesi_id' => $sesi_id,
            'kontak_terenkripsi' => $data['contact'] ?? null,
            'kategori' => $data['category'],
            'lokasi' => $data['location'] ?? null,
            'deskripsi' => $data['description'],
            'urgensi' => $urgencyInput,
            'status' => 'baru',
        ]);
    }

    /**
     * Endpoint internal untuk mengecek status aduan by nomor tiket
     */
    public function checkStatus(string $nomorTiket)
    {
        return Aduan::where('nomor_tiket', $nomorTiket)->first();
    }

    /**
     * Endpoint internal untuk mencari aduan by kontak
     */
    public function findByContact(string $contact)
    {
        return Aduan::all()->filter(function ($a) use ($contact) {
            return $a->kontak_terenkripsi === $contact;
        });
    }

    /**
     * Mengambil daftar aduan aktif untuk ditampilkan di UI (Auto-suggest)
     */
    public function findActiveBySession(int $sesiId)
    {
        return Aduan::where('sesi_id', $sesiId)
            ->whereNotIn('status', ['selesai', 'ditolak'])
            ->get();
    }
}
