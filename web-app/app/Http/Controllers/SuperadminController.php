<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SuperadminController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Superadmin/Dashboard');
    }
}
