<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Table;

#[Table('log_interaksi_gagal')]
class LogInteraksiGagal extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'sesi_id',
        'pertanyaan',
        'alasan_gagal',
        'skor_similarity_tertinggi',
        'ditinjau',
    ];

    public function sesi()
    {
        return $this->belongsTo(SesiPercakapan::class, 'sesi_id');
    }
}
