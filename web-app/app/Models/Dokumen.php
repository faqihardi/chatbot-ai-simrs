<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('dokumen')]
#[Fillable(['judul','kategori','isi','sumber','aktif','versi','checksum','dibuat_oleh','diubah_oleh'])]
class Dokumen extends Model
{
    protected function casts(): array
    {
        return [
            'aktif'=>'boolean',
        ];
    }

    public function chunks(): HasMany
    {
        return $this->hasMany(ChunkDokumen::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class,'dibuat_oleh');
    }

    public function editor(): BelongsTo
    {
        return $this->belongsTo(User::class,'diubah_oleh');
    }
}
