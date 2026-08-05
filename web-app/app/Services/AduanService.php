<?php

namespace App\Services;

use App\Models\Aduan;
use App\Models\SesiPercakapan;
use Illuminate\Support\Str;
use App\Helpers\ContactHelper;

class AduanService
{
    /**
     * Endpoint internal untuk mensubmit aduan
     */
    public function submit(array $data)
    {
        $sesi_id = null;
        $staf_id = null;
        $kontak = $data['contact'] ?? null;
        
        if (!empty($data['session_id'])) {
            $sesi = SesiPercakapan::where('token_sesi', $data['session_id'])->first();
            if ($sesi) {
                if ($data['submitter_type'] === 'staf' && $sesi->user_id) {
                    $staf_id = $sesi->user_id;
                    $sesi_id = null;
                    $kontak = null;
                } else {
                    $sesi_id = $sesi->id;
                }
            }
        }

        $urgencyInput = strtolower($data['urgency'] ?? 'sedang');
        if (!in_array($urgencyInput, ['rendah', 'sedang', 'tinggi'])) {
            $urgencyInput = 'sedang';
        }

        // Nomor tiket format YYMMDD######
        $nomorTiket = date('ymd') . strtoupper(Str::random(6));

        $nomorNormal = $kontak ? ContactHelper::normalisasiNomorHp($kontak) : null;
        $kontakHash = $nomorNormal ? hash('sha256', $nomorNormal) : null;

        return Aduan::create([
            'nomor_tiket' => $nomorTiket,
            'tipe_pengadu' => $data['submitter_type'],
            'staf_id' => $staf_id,
            'sesi_id' => $sesi_id,
            'kontak_terenkripsi' => $nomorNormal,
            'kontak_hash' => $kontakHash,
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
        $nomorNormal = ContactHelper::normalisasiNomorHp($contact);
        $kontakHash = hash('sha256', $nomorNormal);

        return Aduan::where('kontak_hash', $kontakHash)->get();
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
