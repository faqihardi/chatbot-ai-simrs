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

        $dokumens = $query->withCount('chunks')->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

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
        \Log::info('Request payload:', $request->all());
        \Log::info('Validated payload:', $validated);

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

    public function extractText(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120|mimes:pdf,docx' // Max 5MB
        ]);

        $file = $request->file('file');
        
        // Strict MIME check
        $mime = $file->getMimeType();
        if (!in_array($mime, ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
            return response()->json(['error' => 'Format file tidak didukung. Harap unggah PDF atau DOCX yang valid.'], 400);
        }

        // Simpan ke storage sementara lokal dengan nama file yang aman (hindari spasi/karakter aneh)
        $extension = $file->getClientOriginalExtension();
        $safeFilename = 'temp_' . time() . '_' . uniqid() . '.' . $extension;
        $path = $file->storeAs('dokumen-uploads', $safeFilename, 'local');
        $fullPath = \Illuminate\Support\Facades\Storage::disk('local')->path($path);

        $extractedText = '';

        try {
            if ($mime === 'application/pdf') {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($fullPath);
                $extractedText = $pdf->getText();
            } else {
                // DOCX
                $phpWord = \PhpOffice\PhpWord\IOFactory::load($fullPath);
                foreach ($phpWord->getSections() as $section) {
                    foreach ($section->getElements() as $element) {
                        $isHeading = false;
                        $className = get_class($element);
                        $styleName = '';

                        if (strpos($className, 'Title') !== false) {
                            $isHeading = true;
                        } else {
                            $pStyle = method_exists($element, 'getParagraphStyle') ? $element->getParagraphStyle() : null;
                            $style = method_exists($element, 'getStyle') ? $element->getStyle() : null;
                            
                            if (is_string($pStyle)) $styleName = $pStyle;
                            elseif (is_string($style)) $styleName = $style;
                            elseif ($pStyle && method_exists($pStyle, 'getStyleName')) $styleName = (string)$pStyle->getStyleName();
                            elseif ($style && method_exists($style, 'getStyleName')) $styleName = (string)$style->getStyleName();
                            
                            $styleNameLower = strtolower($styleName);
                            if (strpos($styleNameLower, 'heading') !== false || strpos($styleNameLower, 'title') !== false || strpos($styleNameLower, 'judul') !== false) {
                                $isHeading = true;
                            }
                        }

                        $prefix = $isHeading ? "\n## " : "";

                        $textContent = "";
                        if (method_exists($element, 'getText')) {
                            $textContent = $element->getText();
                        } elseif (method_exists($element, 'getElements')) {
                            foreach ($element->getElements() as $childElement) {
                                if (method_exists($childElement, 'getText')) {
                                    $textContent .= $childElement->getText();
                                }
                            }
                        }

                        if (trim($textContent) !== '') {
                            \Log::info("Element parsed: Class=$className, Style=$styleName, isHeading=" . ($isHeading ? 'true' : 'false') . ", Text=" . substr($textContent, 0, 30));
                            $extractedText .= $prefix . $textContent . "\n";
                        }
                    }
                }
            }

            // Bersihkan teks dari spasi kosong berlebih
            $extractedText = trim(preg_replace('/\n{3,}/', "\n\n", $extractedText));
            
            // Hapus file sementara
            @unlink($fullPath);

            return response()->json(['success' => true, 'text' => $extractedText]);

        } catch (\Exception $e) {
            // Hapus file jika gagal
            @unlink($fullPath);
            Log::error('Ekstraksi file gagal: ' . $e->getMessage());
            return response()->json(['error' => 'Gagal mengekstrak teks dari file. Pastikan file tidak rusak atau terenkripsi.'], 500);
        }
    }

    private function triggerFastApiReprocess($dokumenId)
    {
        try {
            // Internal call to FastAPI to reprocess document
            $fastApiUrl = env('FASTAPI_URL', 'http://127.0.0.1:8001');
            $internalSecret = env('INTERNAL_API_SECRET', '');
            $response = Http::withHeaders([
                'X-Internal-Secret' => $internalSecret
            ])->post("{$fastApiUrl}/api/internal/documents/{$dokumenId}/reprocess");
            
            if (!$response->successful()) {
                Log::error("Gagal sinkronisasi dokumen $dokumenId ke FastAPI: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("Exception sinkronisasi dokumen $dokumenId ke FastAPI: " . $e->getMessage());
        }
    }
}
