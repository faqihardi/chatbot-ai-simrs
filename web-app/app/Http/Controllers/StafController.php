<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Aduan;
use Illuminate\Support\Facades\Auth;

class StafController extends Controller
{
    public function chat()
    {
        return Inertia::render('Staf/Chat');
    }

    public function riwayatAduan()
    {
        $aduans = Aduan::where('staf_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
            
        return Inertia::render('Staf/RiwayatAduan', [
            'aduans' => $aduans
        ]);
    }
}
