<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\JadwalSlot;
use App\Models\Dokter;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Helpers\ContactHelper;

class BookingService
{
    public function createDraft(array $data)
    {
        $kontak = $data['kontak'];
        $nomorNormal = ContactHelper::normalisasiNomorHp($kontak);
        $kontakHash = hash('sha256', $nomorNormal);

        $existingBooking = Booking::where('kontak_hash', $kontakHash)->exists();
        $tipePasien = $existingBooking ? 'lama' : 'baru';

        return Booking::create([
            'nomor_booking' => 'BK-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
            'slot_id' => $data['slot_id'],
            'sesi_id' => $data['sesi_id'],
            'nama_pasien' => $data['nama_pasien'],
            'kontak_terenkripsi' => $nomorNormal,
            'kontak_hash' => $kontakHash,
            'tipe_pasien' => $tipePasien,
            'jenis_pembayaran' => $data['jenis_pembayaran'],
            'keluhan_singkat' => $data['keluhan_singkat'] ?? null,
            'status' => 'draft',
            'kadaluarsa_pada' => now()->addMinutes(15),
        ]);
    }

    public function confirm(string $nomorBooking)
    {
        return DB::transaction(function () use ($nomorBooking) {
            $booking = Booking::where('nomor_booking', $nomorBooking)
                ->where('status', 'draft')
                ->lockForUpdate()
                ->firstOrFail();

            $slot = JadwalSlot::where('id', $booking->slot_id)
                ->lockForUpdate()
                ->firstOrFail();

            $alreadyBooked = Booking::where('slot_id', $booking->slot_id)
                ->where('status', 'terjadwal')
                ->exists();

            if ($alreadyBooked) {
                throw new \Exception('Maaf, slot jadwal dokter ini baru saja terisi oleh pasien lain.');
            }

            // LOCK ENTITAS DOKTER UNTUK MENCEGAH RACE CONDITION 
            Dokter::where('id', $slot->dokter_id)->lockForUpdate()->first();

            $countToday = Booking::whereHas('slot', function ($query) use ($slot) {
                    $query->where('dokter_id', $slot->dokter_id)
                          ->where('tanggal', $slot->tanggal);
                })
                ->where('status', 'terjadwal')
                ->count();

            $nextQueueNumber = $countToday + 1;
            $nomorAntrean = 'KA' . str_pad($nextQueueNumber, 3, '0', STR_PAD_LEFT);

            $booking->update([
                'status' => 'terjadwal',
                'nomor_antrean' => $nomorAntrean,
                'kadaluarsa_pada' => null, 
            ]);

            return $booking;
        });
    }

    public function createDirectBooking(array $data)
    {
        return DB::transaction(function () use ($data) {
            $slot = JadwalSlot::where('id', $data['slot_id'])
                ->lockForUpdate()
                ->firstOrFail();

            $alreadyBooked = Booking::where('slot_id', $data['slot_id'])
                ->where('status', 'terjadwal')
                ->exists();

            if ($alreadyBooked) {
                throw new \Exception('Slot ini sudah dipesan oleh orang lain.');
            }

            $contact = $data['kontak'];
            $nomorNormal = ContactHelper::normalisasiNomorHp($contact);
            $kontakHash = hash('sha256', $nomorNormal);

            $existing = Booking::where('kontak_hash', $kontakHash)->exists();
            $tipePasien = $existing ? 'lama' : 'baru';

            // LOCK ENTITAS DOKTER UNTUK MENCEGAH RACE CONDITION B2 (Nomor Antrean)
            \App\Models\Dokter::where('id', $slot->dokter_id)->lockForUpdate()->first();

            $countToday = Booking::whereHas('slot', function ($query) use ($slot) {
                    $query->where('dokter_id', $slot->dokter_id)
                          ->where('tanggal', $slot->tanggal);
                })
                ->where('status', 'terjadwal')
                ->count();

            $nextQueueNumber = $countToday + 1;
            $nomorAntrean = 'KA' . str_pad($nextQueueNumber, 3, '0', STR_PAD_LEFT);

            $booking = Booking::create([
                'nomor_booking' => 'BK-' . date('Ymd') . '-' . strtoupper(Str::random(5)),
                'nomor_antrean' => $nomorAntrean,
                'slot_id' => $data['slot_id'],
                'nama_pasien' => $data['nama_pasien'],
                'kontak_terenkripsi' => $nomorNormal,
                'kontak_hash' => $kontakHash,
                'tipe_pasien' => $tipePasien,
                'jenis_pembayaran' => $data['jenis_pembayaran'],
                'status' => 'terjadwal',
            ]);

            $booking->load('slot.dokter.poli');

            return $booking;
        });
    }

    public function findByContact(string $contact)
    {
        $nomorNormal = ContactHelper::normalisasiNomorHp($contact);
        $kontakHash = hash('sha256', $nomorNormal);

        return Booking::with(['slot.dokter.poli'])
            ->where('kontak_hash', $kontakHash)
            ->get();
    }

    public function findActiveBySession(int $sesiId)
    {
        return Booking::with(['slot.dokter.poli'])
            ->where('sesi_id', $sesiId)
            ->whereNotIn('status', ['selesai', 'dibatalkan', 'expired'])
            ->get();
    }
}
