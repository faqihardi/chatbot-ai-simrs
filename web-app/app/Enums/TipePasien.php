<?php

namespace App\Enums;

enum TipePasien: string
{
    case Baru = 'baru';
    case Lama = 'lama';

    public function label(): string
    {
        return ucfirst($this->value);
    }
}