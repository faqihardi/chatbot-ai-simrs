<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Dokter;
use App\Services\JadwalService;
use Exception;

class GenerateSlotController extends Controller
{
    protected $jadwalService;

    public function __construct(JadwalService $jadwalService)
    {
        $this->jadwalService = $jadwalService;
    }

    public function index()
    {
        $dokters = Dokter::with('poli')->get()->map(function ($d) {
            return [
                'id' => $d->id,
                'nama' => $d->nama . ' - ' . ($d->poli->nama ?? 'Umum')
            ];
        });

        return Inertia::render('Superadmin/Jadwal/Generate', [
            'dokters' => $dokters
        ]);
    }

    public function fetch(Request $request)
    {
        $request->validate([
            'dokter_id' => 'required|exists:dokter,id',
            'tanggal' => 'required|date'
        ]);

        $slots = $this->jadwalService->getSlotsWithStatus(
            $request->dokter_id,
            $request->tanggal
        );

        return response()->json($slots);
    }

    public function store(Request $request)
    {
        $request->validate([
            'dokter_id' => 'required|exists:dokter,id',
            'tanggal' => 'required|date',
            'jam_mulai' => 'required|date_format:H:i',
            'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
            'durasi' => 'required|integer|min:5|max:120',
        ]);

        try {
            $count = $this->jadwalService->generateBatchSlots(
                $request->dokter_id,
                $request->tanggal,
                $request->jam_mulai,
                $request->jam_selesai,
                $request->durasi
            );

            return redirect()->back()->with('success', "Berhasil membuat $count slot jadwal baru.");
        } catch (Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    public function destroy($id)
    {
        try {
            $this->jadwalService->deleteSlotIfNoHistory($id);
            return response()->json(['success' => true, 'message' => 'Slot berhasil dihapus.']);
        } catch (Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }
}
