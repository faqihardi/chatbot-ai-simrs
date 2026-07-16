<?php

namespace App\Enums;

enum UserRole: string 
{
    case Staff = 'staf';
    case AdminCs = 'admin_cs';
    case SuperAdmin = 'superadmin';

    public function label(): string
    {
        return match ($this) {
            self::Staff => 'Staff',
            self::AdminCs => 'Admin Customer Service',
            self::SuperAdmin => 'Super Admin',
        };
    }
}