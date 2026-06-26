<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MailController;

Route::post('/send', [MailController::class, 'send']);
Route::get('/health', [MailController::class, 'health']);
