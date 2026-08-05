<?php

namespace App\Models;

use App\Enums\BookingStatus;
use App\Enums\JenisPembayaran;
use App\Enums\TipePasien;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('booking')]
#[Fillable(['nomor_booking','nomor_antrean','slot_id','sesi_id','nama_pasien','kontak_terenkripsi','kontak_hash','tipe_pasien','jenis_pembayaran','keluhan_singkat','status','kadaluarsa_pada','konfirmasi_direncanakan_pada','konfirmasi_terkirim_pada',])]
class Booking extends Model
{
    protected function casts(): array
    {
        return [
            'kontak_terenkripsi' => 'encrypted',
            'status' => BookingStatus::class,
            'tipe_pasien' => TipePasien::class,
            'jenis_pembayaran' => JenisPembayaran::class,
            'kadaluarsa_pada' => 'datetime',
            'konfirmasi_direncanakan_pada' => 'datetime',
            'konfirmasi_terkirim_pada' => 'datetime',
        ];
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(JadwalSlot::class,'slot_id');
    }

    public function sesi(): BelongsTo
    {
        return $this->belongsTo(SesiPercakapan::class,'sesi_id');
    }
}
