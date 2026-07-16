<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Override;

#[Table('jadwal_slot')]
#[Fillable(['dokter_id','tanggal','jam_mulai','jam_selesai'])]
class JadwalSlot extends Model
{
    public function casts(): array
    {
        return [
            'tanggal' => 'date',
            'jam_mulai' => 'datetime:H:i',
            'jam_selesai' => 'datetime:H:i',
        ];
    }

    public function dokter(): BelongsTo
    {
        return $this->belongsTo(Dokter::class);
    }

    public function bookings(): HasMany
    {
        return $this->HasMany(Booking::class, 'slot_id');
    }
}
