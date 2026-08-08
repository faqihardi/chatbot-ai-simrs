<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\LogPemakaianApi;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MonitorController extends Controller
{
    public function index(Request $request)
    {
        // 1. Total Panggilan Hari Ini
        $totalPanggilanHariIni = LogPemakaianApi::whereDate('created_at', Carbon::today())->count();

        // 2. Estimasi Biaya (Dihapus)


        // 3. Jumlah Gagal Groq Bulan Ini (token 0)
        $gagalGroqBulanIni = LogPemakaianApi::whereMonth('created_at', Carbon::now()->month)
                                    ->whereYear('created_at', Carbon::now()->year)
                                    ->where('provider', 'groq')
                                    ->where('token_input', 0)
                                    ->count();

        // 4. Rata-rata Latency
        $rataRataLatency = LogPemakaianApi::avg('durasi_ms') ?? 0;

        // Table Data
        $query = LogPemakaianApi::query();

        if ($request->filled('provider')) {
            $query->where('provider', $request->provider);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('Superadmin/Monitor', [
            'stats' => [
                'total_panggilan_hari_ini' => $totalPanggilanHariIni,
                'gagal_groq_bulan_ini' => $gagalGroqBulanIni,
                'rata_rata_latency' => round($rataRataLatency, 2),
            ],
            'logs' => $logs,
            'filters' => $request->only(['provider', 'start_date', 'end_date'])
        ]);
    }
}
