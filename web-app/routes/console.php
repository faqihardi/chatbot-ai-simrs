<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Booking;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduled Task untuk menghapus draft booking kadaluarsa setiap menit
Schedule::call(function () {
    Booking::where('status', 'draft')
        ->where('kadaluarsa_pada', '<', now())
        ->update(['status' => 'expired']);
})->everyMinute();
