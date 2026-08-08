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
        $userId = Auth::id();
        // Tampilkan aduan milik staf (by staf_id) ATAU aduan dari sesi chat milik staf ini
        // Fallback untuk aduan yang dibuat via sesi anonim (staf_id=null) tapi sesinya terhubung ke user ini
        $sesiIds = \App\Models\SesiPercakapan::where('user_id', $userId)->pluck('id');
        $query = Aduan::where(function($q) use ($userId, $sesiIds) {
            $q->where('staf_id', $userId)
              ->orWhere(function($q2) use ($sesiIds) {
                  $q2->whereNull('staf_id')->whereIn('sesi_id', $sesiIds);
              });
        });

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
