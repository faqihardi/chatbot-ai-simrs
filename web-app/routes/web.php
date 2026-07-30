<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StafController;
use App\Http\Controllers\AdminCsController;
use App\Http\Controllers\SuperadminController;
use App\Http\Controllers\Superadmin\GenerateSlotController;

use App\Http\Controllers\Admin\DokumenController as AdminDokumenController;
use App\Http\Controllers\Admin\AduanController as AdminAduanController;
use App\Http\Controllers\Admin\BookingController as AdminBookingController;

use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\AduanController;
use App\Http\Controllers\Api\JadwalController;

Route::inertia('/', 'welcome')->name('home');

// Auth Routes
Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Staf Routes
Route::middleware(['auth', 'role:staf'])->group(function () {
    Route::get('/staf/chat', [StafController::class, 'chat'])->name('staf.chat');
    Route::get('/staf/riwayat-aduan', [StafController::class, 'riwayatAduan'])->name('staf.riwayat_aduan');
});

// Admin CS Routes
Route::middleware(['auth', 'role:admin_cs'])->group(function () {
    Route::get('/admin', [AdminCsController::class, 'dashboard'])->name('admin.dashboard');
    Route::post('/admin/dokumen/extract', [AdminDokumenController::class, 'extractText'])->name('admin.dokumen.extract');
    Route::resource('/admin/dokumen', AdminDokumenController::class);
    Route::resource('/admin/aduan', AdminAduanController::class)->only(['index', 'update']);
    Route::resource('/admin/booking', AdminBookingController::class)->only(['index', 'update']);
    Route::get('/admin/log-gagal', function() { return inertia('AdminCS/LogGagal'); })->name('admin.log_gagal');
});

// Superadmin Routes
Route::middleware(['auth', 'role:superadmin'])->group(function () {
    Route::get('/superadmin', [SuperadminController::class, 'dashboard'])->name('superadmin.dashboard');
    Route::get('/superadmin/users', function() { return inertia('Superadmin/Users'); })->name('superadmin.users');
    Route::get('/superadmin/poli', function() { return inertia('Superadmin/Poli'); })->name('superadmin.poli');
    Route::get('/superadmin/dokter', function() { return inertia('Superadmin/Dokter'); })->name('superadmin.dokter');
    
    // Jadwal Slot Generator
    Route::get('/superadmin/jadwal-slot/generate', [GenerateSlotController::class, 'index'])->name('superadmin.jadwal.generate');
    Route::get('/superadmin/jadwal-slot/fetch', [GenerateSlotController::class, 'fetch'])->name('superadmin.jadwal.fetch');
    Route::post('/superadmin/jadwal-slot/generate', [GenerateSlotController::class, 'store'])->name('superadmin.jadwal.store');
    Route::delete('/superadmin/jadwal-slot/{id}', [GenerateSlotController::class, 'destroy'])->name('superadmin.jadwal.destroy');
});

// Chat Routes (Public)
Route::get('/chat', [ChatController::class, 'index'])->name('chat');
Route::post('/api/chat/session', [ChatController::class, 'createSession']);
Route::get('/api/chat/session/data', [ChatController::class, 'getSessionData']);
Route::post('/api/chat/message', [ChatController::class, 'sendMessage']);

// UI Draft/Confirm endpoints
Route::post('/api/chat/booking/draft', [BookingController::class, 'createDraftBooking']);
Route::post('/api/chat/booking/confirm', [BookingController::class, 'confirmBooking']);

// Internal AI endpoints (bypasses CSRF, protected by other means usually)
Route::post('/api/internal/jadwal', [JadwalController::class, 'internalGetSchedules']);
Route::post('/api/internal/booking', [BookingController::class, 'internalBookAppointment']);
Route::post('/api/internal/appointments', [BookingController::class, 'internalCheckAppointments']);
Route::post('/api/internal/complaints', [AduanController::class, 'internalSubmitComplaint']);
Route::post('/api/internal/complaints/status', [AduanController::class, 'internalCheckComplaintStatus']);
Route::post('/api/internal/complaints/find', [AduanController::class, 'internalFindComplaintsByContact']);
