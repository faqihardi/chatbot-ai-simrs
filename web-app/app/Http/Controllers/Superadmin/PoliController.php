<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\Poli;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PoliController extends Controller
{
    public function index()
    {
        $poli = Poli::withCount('dokters')->latest()->get();

        return Inertia::render('Superadmin/Poli', [
            'poli' => $poli,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:10|unique:poli',
            'nama' => 'required|string|max:255',
        ]);

        Poli::create($validated);

        return redirect()->back()->with('success', 'Poliklinik berhasil ditambahkan.');
    }

    public function update(Request $request, Poli $poli)
    {
        $validated = $request->validate([
            'kode' => 'required|string|max:10|unique:poli,kode,' . $poli->id,
            'nama' => 'required|string|max:255',
        ]);

        $poli->update($validated);

        return redirect()->back()->with('success', 'Data Poliklinik berhasil diperbarui.');
    }

    public function destroy(Poli $poli)
    {
        // Cek apakah poli memiliki dokter
        if ($poli->dokters()->exists()) {
            return redirect()->back()->with('error', 'Tidak dapat menghapus Poliklinik karena masih ada dokter yang bertugas di Poli ini.');
        }

        $poli->delete();

        return redirect()->back()->with('success', 'Poliklinik berhasil dihapus.');
    }
}
