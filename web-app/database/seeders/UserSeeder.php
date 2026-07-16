<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'Superadmin Demo',
                'email' => 'superadmin@simrs-chatbot.test',
                'role' => 'superadmin',
            ],
            [
                'name' => 'Admin CS Demo',
                'email' => 'admincs@simrs-chatbot.test',
                'role' => 'admin_cs',
            ],
            [
                'name' => 'Perawat Dewi',
                'email' => 'staf.dewi@simrs-chatbot.test',
                'role' => 'staf',
            ],
            [
                'name' => 'IT Farhan',
                'email' => 'staf.farhan@simrs-chatbot.test',
                'role' => 'staf',
            ],
        ];

        foreach ($users as $user) {
            User::create([
                ...$user,
                'password' => Hash::make('janscuk'),
                'email_verified_at' => now(),
            ]);
        }
    }
}
