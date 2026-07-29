<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Dokumen;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DokumenController extends Controller
{
    public function index(Request $request)
    {
        $query = Dokumen::query();

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('judul', 'like', "%{$search}%")
                  ->orWhere('kategori', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status != 'semua' && $request->status != '') {
            $query->where('aktif', $request->status === 'aktif');
        }

        $dokumens = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('AdminCS/Dokumen/Index', [
            'dokumens' => $dokumens,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'isi' => 'required|string',
            'sumber' => 'nullable|string',
            'aktif' => 'boolean',
        ]);

        $validated['dibuat_oleh'] = Auth::id();
        $validated['checksum'] = hash('sha256', $validated['isi']);
        $validated['versi'] = 1;

        $dokumen = Dokumen::create($validated);

        // Trigger FastAPI for processing chunks and embeddings
        $this->triggerFastApiReprocess($dokumen->id);

        return redirect()->back()->with('success', 'Dokumen berhasil ditambahkan dan diproses AI.');
    }

    public function update(Request $request, Dokumen $dokumen)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'kategori' => 'required|string|max:100',
            'isi' => 'required|string',
            'sumber' => 'nullable|string',
            'aktif' => 'boolean',
        ]);

        $validated['diubah_oleh'] = Auth::id();
        
        $newChecksum = hash('sha256', $validated['isi']);
        $isiBerubah = $newChecksum !== $dokumen->checksum;

        if ($isiBerubah) {
            $validated['checksum'] = $newChecksum;
            $validated['versi'] = $dokumen->versi + 1;
        }

        $dokumen->update($validated);

        if ($isiBerubah) {
            // Trigger FastAPI only if content changed
            $this->triggerFastApiReprocess($dokumen->id);
            $msg = 'Dokumen berhasil diperbarui dan diproses ulang oleh AI.';
        } else {
            $msg = 'Dokumen berhasil diperbarui (Isi tidak berubah, AI skip).';
        }

        return redirect()->back()->with('success', $msg);
    }

    public function destroy(Dokumen $dokumen)
    {
        // Instead of hard deleting, we typically set aktif = false for knowledge base
        // But if we actually delete, FastAPI should know, or cascade will handle chunk_dokumen
        $dokumen->delete();
        
        return redirect()->back()->with('success', 'Dokumen berhasil dihapus.');
    }

    private function triggerFastApiReprocess($dokumenId)
    {
        try {
            // Internal call to FastAPI to reprocess document
            $fastApiUrl = env('FASTAPI_URL', 'http://127.0.0.1:8001');
            $response = Http::post("{$fastApiUrl}/api/internal/documents/{$dokumenId}/reprocess");
            
            if (!$response->successful()) {
                Log::error("Gagal sinkronisasi dokumen $dokumenId ke FastAPI: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Exception sinkronisasi dokumen $dokumenId ke FastAPI: " . $e->getMessage());
        }
    }
}
