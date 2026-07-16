<?php

namespace App\Enums;

enum BookingStatus: string
{
    case Draft = 'draft';
    case Terjadwal = 'terjadwal';
    case Selesai = 'selesai';
    case Dibatalkan = 'dibatalkan';
    case Expired = 'expired';

    public function label(): string
    {
        return match ($this) {
            self::Draft => 'Draft',
            self::Terjadwal => 'Terjadwal',
            self::Selesai => 'Selesai',
            self::Dibatalkan => 'Dibatalkan',
            self::Expired => 'Expired',
        };
    }
}