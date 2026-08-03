<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LogInteraksiGagal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LogGagalController extends Controller
{
    public function index(Request $request)
    {
        $query = LogInteraksiGagal::query();

        if ($request->filled('alasan_gagal')) {
            $query->where('alasan_gagal', $request->alasan_gagal);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('created_at', [
                $request->start_date . ' 00:00:00',
                $request->end_date . ' 23:59:59'
            ]);
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('AdminCS/LogGagal', [
            'logs' => $logs,
            'filters' => $request->only(['alasan_gagal', 'start_date', 'end_date'])
        ]);
    }

    public function markReviewed(LogInteraksiGagal $log)
    {
        $log->update(['ditinjau' => true]);
        return redirect()->back()->with('success', 'Log berhasil ditandai sudah ditinjau.');
    }
}
