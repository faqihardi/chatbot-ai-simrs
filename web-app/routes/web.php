<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatController;

Route::inertia('/', 'welcome')->name('home');

// Chat Routes
Route::get('/chat', [ChatController::class, 'index'])->name('chat');
Route::post('/api/chat/session', [ChatController::class, 'createSession']);
Route::get('/api/chat/session/data', [ChatController::class, 'getSessionData']);
Route::post('/api/chat/message', [ChatController::class, 'sendMessage']);

// Internal AI endpoints (bypasses CSRF, protected by other means usually)
Route::post('/api/internal/jadwal', [ChatController::class, 'internalGetSchedules']);
Route::post('/api/internal/booking', [ChatController::class, 'internalBookAppointment']);
Route::post('/api/internal/booking/active', [ChatController::class, 'internalCheckAppointments']);
Route::post('/api/internal/complaints', [ChatController::class, 'internalSubmitComplaint']);
Route::post('/api/internal/complaints/status', [ChatController::class, 'internalCheckComplaintStatus']);
Route::post('/api/internal/complaints/find', [ChatController::class, 'internalFindComplaintsByContact']);
