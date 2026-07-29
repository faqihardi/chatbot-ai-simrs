<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use Inertia\Inertia;

class BookingController extends Controller
{
    public function index(Request $request)
    {
        $query = Booking::query()->with(['dokter', 'poli', 'slot']);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('nomor_booking', 'like', "%{$search}%")
                  ->orWhere('nomor_antrean', 'like', "%{$search}%")
                  ->orWhere('nama_pasien', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->status != 'semua' && $request->status != '') {
            $query->where('status', $request->status);
        }

        $bookings = $query->orderBy('created_at', 'desc')->paginate(10)->withQueryString();

        return Inertia::render('AdminCS/Booking/Index', [
            'bookings' => $bookings,
            'filters' => $request->only(['search', 'status'])
        ]);
    }

    public function update(Request $request, Booking $booking)
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,terjadwal,selesai,dibatalkan,expired',
        ]);

        $booking->status = $validated['status'];
        $booking->save();

        return redirect()->back()->with('success', 'Status booking berhasil diperbarui.');
    }
}
