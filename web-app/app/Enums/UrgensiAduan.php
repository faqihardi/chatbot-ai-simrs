<?php

namespace App\Enums;

enum UrgensiAduan: string
{
    case Rendah = 'rendah';
    case Sedang = 'sedang';
    case Tinggi = 'tinggi';
    
    public function label(): string
    {
        return ucfirst($this->value);
    }
}