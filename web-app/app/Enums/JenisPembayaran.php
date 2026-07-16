<?php

namespace App\Enums;

enum JenisPembayaran: string
{
    case Umum = 'umum';
    case Bpjs = 'bpjs';
    case Asuransi = 'asuransi';

    public function label(): string
    {
        return strtoupper($this->value);
    }
}