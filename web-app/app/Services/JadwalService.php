<?php

namespace App\Services;

use App\Models\JadwalSlot;
use Illuminate\Support\Facades\DB;
use Exception;
use Carbon\Carbon;

class JadwalService
{
    /**
     * Mengembalikan daftar jadwal yang belum dibooking (mempersiapkan arsitektur untuk Fase 6).
     */
    public function getAvailableSlots(?string $poli, ?string $tanggal)
    {
        $query = JadwalSlot::with(['dokter.poli'])
            ->whereDoesntHave('bookings', function ($q) {
                $q->whereIn('status', ['terjadwal', 'selesai']);
            });

        $now = now();
        $query->where(function ($q) use ($now) {
            $q->where('tanggal', '>', $now->format('Y-m-d'))
              ->orWhere(function ($subq) use ($now) {
                  $subq->where('tanggal', '=', $now->format('Y-m-d'))
                       ->where('jam_mulai', '>', $now->format('H:i:s'));
              });
        });

        if ($poli) {
            $query->whereHas('dokter.poli', function ($q) use ($poli) {
                $q->whereRaw('LOWER(nama) = ?', [strtolower($poli)]);
            });
        }

        if ($tanggal) {
            $query->where('tanggal', $tanggal);
        }

        return $query->get();
    }

    public function getSlotsWithStatus(int $dokterId, string $tanggal)
    {
        $slots = JadwalSlot::with('bookings')
            ->where('dokter_id', $dokterId)
            ->where('tanggal', $tanggal)
            ->orderBy('jam_mulai')
            ->get();

        return $slots->map(function ($slot) {
            $hasTerjadwal = $slot->bookings->where('status', 'terjadwal')->isNotEmpty();
            $hasSelesai = $slot->bookings->where('status', 'selesai')->isNotEmpty();
            $hasAnyHistory = $slot->bookings->isNotEmpty();
            
            $statusBadge = 'Kosong';
            if ($hasTerjadwal) {
                $statusBadge = 'Terjadwal';
            } elseif ($hasSelesai) {
                $statusBadge = 'Selesai';
            }
            
            return [
                'id' => $slot->id,
                'jam_mulai' => Carbon::parse($slot->jam_mulai)->format('H:i'),
                'jam_selesai' => Carbon::parse($slot->jam_selesai)->format('H:i'),
                'status' => $statusBadge,
                'can_delete' => !$hasAnyHistory
            ];
        });
    }

    public function generateBatchSlots(int $dokterId, string $tanggal, string $jamMulai, string $jamSelesai, int $durasi)
    {
        $start = Carbon::parse("$tanggal $jamMulai");
        $end = Carbon::parse("$tanggal $jamSelesai");

        if ($start->greaterThanOrEqualTo($end)) {
            throw new Exception("Jam mulai harus sebelum jam selesai.");
        }

        // Generate slots array (belum di-insert)
        $slotsToInsert = [];
        $current = $start->copy();

        while ($current->copy()->addMinutes($durasi)->lessThanOrEqualTo($end)) {
            $slotEnd = $current->copy()->addMinutes($durasi);
            
            $slotsToInsert[] = [
                'dokter_id' => $dokterId,
                'tanggal' => $tanggal,
                'jam_mulai' => $current->format('H:i'),
                'jam_selesai' => $slotEnd->format('H:i'),
                'created_at' => now(),
                'updated_at' => now(),
            ];
            
            $current = $slotEnd;
        }

        if (empty($slotsToInsert)) {
            throw new Exception("Durasi terlalu panjang untuk rentang waktu yang diberikan.");
        }

        DB::transaction(function () use ($dokterId, $tanggal, $jamMulai, $jamSelesai, $slotsToInsert) {
            // Lock entitas dokter (Pessimistic Locking) untuk mencegah race condition
            \App\Models\Dokter::where('id', $dokterId)->lockForUpdate()->first();

            // Cek Overlap di dalam transaksi setelah di-lock
            $hasOverlap = JadwalSlot::where('dokter_id', $dokterId)
                ->where('tanggal', $tanggal)
                ->where(function ($q) use ($jamMulai, $jamSelesai) {
                    $q->where('jam_mulai', '<', $jamSelesai)
                      ->where('jam_selesai', '>', $jamMulai);
                })->exists();

            if ($hasOverlap) {
                throw new Exception("Gagal membuat jadwal: Terdapat irisan (overlap) dengan jadwal slot yang sudah ada.");
            }

            JadwalSlot::insert($slotsToInsert);
        });

        return count($slotsToInsert);
    }

    public function deleteSlotIfNoHistory(int $slotId)
    {
        DB::transaction(function () use ($slotId) {
            // Pessimistic Locking agar tidak terjadi TOCTOU (Time-of-Check to Time-of-Use)
            $slot = JadwalSlot::withCount('bookings')
                ->lockForUpdate()
                ->findOrFail($slotId);

            if ($slot->bookings_count > 0) {
                throw new Exception("Slot ini tidak dapat dihapus karena pernah memiliki riwayat booking.");
            }

            $slot->delete();
        });
    }
}
