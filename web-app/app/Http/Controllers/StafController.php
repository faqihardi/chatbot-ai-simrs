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

    public function riwayatAduan(Request $request)
    {
        $query = Aduan::where('staf_id', Auth::id());

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_tiket', 'like', "%{$search}%")
                  ->orWhere('kategori', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status != 'semua' && $request->status != '') {
            $query->where('status', $request->status);
        }

        $aduans = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();
            
        return Inertia::render('Staf/RiwayatAduan', [
            'aduans' => $aduans,
            'filters' => $request->only(['search', 'status'])
        ]);
    }
}
