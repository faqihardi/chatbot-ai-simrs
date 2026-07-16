<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('dokter')]
#[Fillable(['poli_id','kode','nama','spesialisasi'])]
class Dokter extends Model
{
    public function poli(): BelongsTo
    {
        return $this->belongsTo(Poli::class);
    }

    public function jadwalSlots(): HasMany
    {
        return $this->hasMany(JadwalSlot::class);
    }
}
