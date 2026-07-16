<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('chunk_dokumen')]
#[Fillable(['dokumen_id','urutan_chunk','isi_potongan','panjang_karakter','metadata'])]
class ChunkDokumen extends Model
{
    public $timestamps = false;
    const UPDATED_AT = null;

    protected function casts(): array
    {
        return [
            'metadata'=>'array',
            'created_at'=>'datetime',
        ];
    }

    public function dokumen(): BelongsTo
    {
        return $this->belongsTo(Dokumen::class);
    }
}
