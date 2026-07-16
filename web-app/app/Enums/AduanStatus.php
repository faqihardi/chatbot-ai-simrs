<?php

namespace App\Enums;

enum AduanStatus: string
{
    case Baru = 'baru';
    case Diproses = 'diproses';
    case Selesai = 'selesai';
    case Ditolak = 'ditolak';

    public function label(): string
    {
        return match ($this) {
            self::Baru => 'Baru',
            self::Diproses => 'Diproses',
            self::Selesai => 'Selesai',
            self::Ditolak => 'Ditolak',
        };
    }
}