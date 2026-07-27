<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatController;

Route::inertia('/', 'welcome')->name('home');

use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\AduanController;
use App\Http\Controllers\Api\JadwalController;

// Chat Routes
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
