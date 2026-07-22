<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatController;

Route::inertia('/', 'welcome')->name('home');

// Chat Routes
Route::get('/chat', [ChatController::class, 'index'])->name('chat');
Route::post('/api/chat/session', [ChatController::class, 'createSession']);
Route::post('/api/chat/message', [ChatController::class, 'sendMessage']);

// Booking Routes
Route::post('/api/booking/draft', [ChatController::class, 'createDraftBooking']);
Route::post('/api/booking/confirm', [ChatController::class, 'confirmBooking']);

// Internal API Routes (for FastAPI proxy communication)
Route::post('/api/internal/booking', [ChatController::class, 'internalBookAppointment']);
Route::post('/api/internal/appointments', [ChatController::class, 'internalCheckAppointments']);
