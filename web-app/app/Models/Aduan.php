<?php

namespace App\Models;

use App\Enums\AduanStatus;
use App\Enums\UrgensiAduan;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('aduan')]
#[Fillable(['nomor_tiket','tipe_pengadu','staf_id','sesi_id','kontak_terenkripsi','kontak_hash','kategori','lokasi','deskripsi','urgensi','status','tanggapan','ditindaklanjuti_pada','selesai_pada'])]
class Aduan extends Model
{
    protected function casts(): array
    {
        return [
            'kontak_terenkripsi'=>'encrypted',
            'urgensi'=>UrgensiAduan::class,
            'status'=>AduanStatus::class,
            'ditindaklanjuti_pada'=>'datetime',
            'selesai_pada'=>'datetime',
        ];
    }

    public function staf(): BelongsTo
    {
        return $this->belongsTo(User::class,'staf_id');
    }

    public function sesi(): BelongsTo
    {
        return $this->belongsTo(SesiPercakapan::class,'sesi_id');
    }
}
