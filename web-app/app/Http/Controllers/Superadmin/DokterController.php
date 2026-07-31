<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Dokter;
use App\Models\Poli;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DokterController extends Controller
{
    public function index()
    {
        $dokters = Dokter::with('poli')
            ->withCount('jadwalSlots')
            ->latest()
            ->get()
            ->map(function ($dokter) {
                return [
                    'id' => $dokter->id,
                    'kode' => $dokter->kode,
                    'nama' => $dokter->nama,
                    'spesialisasi' => $dokter->spesialisasi,
                    'poli_id' => $dokter->poli_id,
                    'poli_name' => $dokter->poli->nama ?? '-',
                    'jadwal_slots_count' => $dokter->jadwal_slots_count,
                ];
            });
            
        $polis = Poli::orderBy('nama')->get();

        return Inertia::render('Superadmin/Dokter', [
            'dokters' => $dokters,
            'polis' => $polis,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'poli_id' => 'required|exists:poli,id',
            'kode' => 'required|string|max:10|unique:dokter',
            'nama' => 'required|string|max:255',
            'spesialisasi' => 'required|string|max:255',
        ]);

        Dokter::create($validated);

        return redirect()->back()->with('success', 'Dokter berhasil ditambahkan.');
    }

    public function update(Request $request, Dokter $dokter)
    {
        $validated = $request->validate([
            'poli_id' => 'required|exists:poli,id',
            'kode' => 'required|string|max:10|unique:dokter,kode,' . $dokter->id,
            'nama' => 'required|string|max:255',
            'spesialisasi' => 'required|string|max:255',
        ]);

        $dokter->update($validated);

        return redirect()->back()->with('success', 'Data Dokter berhasil diperbarui.');
    }

    public function destroy(Dokter $dokter)
    {
        if ($dokter->jadwalSlots()->exists()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus Dokter karena memiliki jadwal slot aktif atau riwayat booking.');
        }

        $dokter->delete();

        return redirect()->back()->with('success', 'Dokter berhasil dihapus.');
    }
}
