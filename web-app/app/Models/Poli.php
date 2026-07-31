<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('poli')]
#[Fillable(['kode','nama'])]
class Poli extends Model
{
    public function dokters(): HasMany
    {
        return $this->hasMany(Dokter::class);
    }
}
