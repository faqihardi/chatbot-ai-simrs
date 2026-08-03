<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Attributes\Table;

#[Table('log_pemakaian_api')]
class LogPemakaianApi extends Model
{
    const UPDATED_AT = null;

    protected $fillable = [
        'provider',
        'model',
        'jenis_panggilan',
        'token_input',
        'token_output',
        'estimasi_biaya',
        'durasi_ms',
    ];
}
