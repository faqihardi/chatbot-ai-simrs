<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\ChatController;

Route::inertia('/', 'welcome')->name('home');

// Chat Routes
Route::get('/chat', [ChatController::class, 'index'])->name('chat');
Route::post('/api/chat/session', [ChatController::class, 'createSession']);
Route::post('/api/chat/message', [ChatController::class, 'sendMessage']);
