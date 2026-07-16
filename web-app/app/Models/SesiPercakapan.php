<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('sesi_percakapan')]
#[Fillable(['token_sesi','ip_address','user_agent'])]
class SesiPercakapan extends Model
{
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'sesi_id');
    }

    public function aduans(): HasMany
    {
        return $this->hasMany(Aduan::class,'sesi_id');
    }
}
