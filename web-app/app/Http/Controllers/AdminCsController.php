<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminCsController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('AdminCS/Dashboard');
    }
}
