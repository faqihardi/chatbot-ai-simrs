<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Aduan;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AduanController extends Controller
{
    public function index(Request $request)
    {
        $query = Aduan::query()->with('submitter'); // Load user details if submitter is staf

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

        return Inertia::render('AdminCS/Aduan/Index', [
            'aduans' => $aduans,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function update(Request $request, Aduan $aduan)
    {
        $validated = $request->validate([
            'status' => 'required|in:baru,diproses,selesai,ditolak',
            'tanggapan' => 'nullable|string',
        ]);

        // Logic to set timestamps based on status change
        if ($validated['status'] === 'diproses' && $aduan->status !== 'diproses' && !$aduan->ditindaklanjuti_pada) {
            $aduan->ditindaklanjuti_pada = now();
        }
        
        if (in_array($validated['status'], ['selesai', 'ditolak']) && !in_array($aduan->status, ['selesai', 'ditolak']) && !$aduan->selesai_pada) {
            $aduan->selesai_pada = now();
            // If it goes straight from baru to selesai, also set ditindaklanjuti_pada
            if (!$aduan->ditindaklanjuti_pada) {
                $aduan->ditindaklanjuti_pada = now();
            }
        }

        $aduan->status = $validated['status'];
        $aduan->tanggapan = $validated['tanggapan'];
        $aduan->save();

        return redirect()->back()->with('success', 'Status aduan berhasil diperbarui.');
    }
}
