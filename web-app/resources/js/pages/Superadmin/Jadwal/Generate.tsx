import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { CalendarDays, Clock, Trash2, PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Dokter {
    id: number;
    nama: string;
}

interface Slot {
    id: number;
    jam_mulai: string;
    jam_selesai: string;
    status: string;
    can_delete: boolean;
}

export default function GenerateSlot({ dokters }: { dokters: Dokter[] }) {
    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, errors, reset } = useForm({
        dokter_id: '',
        tanggal: today,
        jam_mulai: '08:00',
        jam_selesai: '12:00',
        durasi: 20,
    });

    const [slots, setSlots] = useState<Slot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [previewCount, setPreviewCount] = useState(0);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [slotToDelete, setSlotToDelete] = useState<number | null>(null);

    const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

    // Hitung preview dinamis
    useEffect(() => {
        if (data.jam_mulai && data.jam_selesai && data.durasi > 0) {
            const [startH, startM] = data.jam_mulai.split(':').map(Number);
            const [endH, endM] = data.jam_selesai.split(':').map(Number);

            const startTotalMinutes = startH * 60 + startM;
            const endTotalMinutes = endH * 60 + endM;

            const diff = endTotalMinutes - startTotalMinutes;
            if (diff > 0) {
                setPreviewCount(Math.floor(diff / data.durasi));
            } else {
                setPreviewCount(0);
            }
        }
    }, [data.jam_mulai, data.jam_selesai, data.durasi]);

    // Fetch existing slots
    const fetchSlots = async () => {
        if (!data.dokter_id || !data.tanggal) return;

        setLoadingSlots(true);
        try {
            const response = await axios.get('/superadmin/jadwal-slot/fetch', {
                params: {
                    dokter_id: data.dokter_id,
                    tanggal: data.tanggal
                }
            });
            setSlots(response.data);
            setSelectedSlots([]); // Reset selections on fetch
        } catch (error) {
            console.error("Failed to fetch slots", error);
        } finally {
            setLoadingSlots(false);
        }
    };

    useEffect(() => {
        fetchSlots();
    }, [data.dokter_id, data.tanggal]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (previewCount <= 0) {
            toast.error("Durasi atau jam tidak valid.");
            return;
        }

        post('/superadmin/jadwal-slot/generate', {
            onSuccess: () => {
                fetchSlots(); // Refresh table
                reset('jam_mulai', 'jam_selesai'); // Reset jam untuk generasi berikutnya
            },
        });
    };

    const confirmDelete = (id: number) => {
        setSlotToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!slotToDelete) return;
        setDeleteModalOpen(false);

        try {
            const response = await axios.delete(`/superadmin/jadwal-slot/${slotToDelete}`);
            if (response.data.success) {
                toast.success(response.data.message);
                fetchSlots();
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal menghapus slot';
            toast.error(msg);
        } finally {
            setSlotToDelete(null);
        }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const deletableIds = slots.filter(s => s.can_delete).map(s => s.id);
            setSelectedSlots(deletableIds);
        } else {
            setSelectedSlots([]);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedSlots(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleDeleteBatch = async () => {
        if (selectedSlots.length === 0) return;
        if (!confirm(`Yakin ingin menghapus ${selectedSlots.length} slot jadwal terpilih?`)) return;

        try {
            const response = await axios.delete('/superadmin/jadwal-slot/batch', {
                data: { ids: selectedSlots }
            });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchSlots();
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gagal menghapus slot batch';
            toast.error(msg);
        }
    };

    return (
        <AppLayout>
            <Head title="Generate Jadwal Slot" />

            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Generate Jadwal Slot</h1>
                    <p className="text-muted-foreground">Buat jadwal dokter massal secara otomatis per hari.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Form Section */}
                    <div className="md:col-span-1 bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
                        <div className="flex items-center gap-2 border-b border-border pb-4">
                            <CalendarDays className="size-5 text-primary" />
                            <h2 className="text-lg font-semibold">Form Generasi</h2>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Dokter</label>
                                <select
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.dokter_id}
                                    onChange={e => setData('dokter_id', e.target.value)}
                                    required
                                >
                                    <option value="">- Pilih Dokter -</option>
                                    {dokters.map(d => (
                                        <option key={d.id} value={d.id}>{d.nama}</option>
                                    ))}
                                </select>
                                {errors.dokter_id && <p className="text-destructive text-xs mt-1">{errors.dokter_id}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Tanggal</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.tanggal}
                                    onChange={e => setData('tanggal', e.target.value)}
                                    required
                                />
                                {errors.tanggal && <p className="text-destructive text-xs mt-1">{errors.tanggal}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jam Mulai</label>
                                    <input
                                        type="time"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={data.jam_mulai}
                                        onChange={e => setData('jam_mulai', e.target.value)}
                                        required
                                    />
                                    {errors.jam_mulai && <p className="text-destructive text-xs mt-1">{errors.jam_mulai}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Jam Selesai</label>
                                    <input
                                        type="time"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        value={data.jam_selesai}
                                        onChange={e => setData('jam_selesai', e.target.value)}
                                        required
                                    />
                                    {errors.jam_selesai && <p className="text-destructive text-xs mt-1">{errors.jam_selesai}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Durasi per Slot (menit)</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="120"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={data.durasi}
                                    onChange={e => setData('durasi', parseInt(e.target.value))}
                                    required
                                />
                                {errors.durasi && <p className="text-destructive text-xs mt-1">{errors.durasi}</p>}
                            </div>

                            {/* Preview */}
                            <div className="bg-muted p-4 rounded-lg flex items-center gap-3">
                                <Clock className="size-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Preview</p>
                                    <p className="text-xs text-muted-foreground">Akan membuat <strong className="text-foreground">{previewCount}</strong> slot jadwal.</p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing || previewCount <= 0 || !data.dokter_id}
                                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50"
                            >
                                <PlusCircle className="size-4" />
                                Generate Slot
                            </button>
                        </form>
                    </div>

                    {/* Table Section */}
                    <div className="md:col-span-2 bg-card border border-border rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
                            <h2 className="text-lg font-semibold">Slot Tersedia</h2>
                            {!data.dokter_id && <span className="text-sm text-muted-foreground">Pilih dokter untuk melihat jadwal</span>}
                        </div>

                        {loadingSlots ? (
                            <div className="text-center py-10 text-muted-foreground animate-pulse">Memuat data jadwal...</div>
                        ) : slots.length === 0 && data.dokter_id ? (
                            <div className="text-center py-10">
                                <div className="inline-flex items-center justify-center size-12 rounded-full bg-muted mb-4">
                                    <CalendarDays className="size-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-base font-medium">Belum Ada Jadwal</h3>
                                <p className="text-sm text-muted-foreground mt-1">Gunakan form di samping untuk mulai men-generate slot.</p>
                            </div>
                        ) : slots.length > 0 ? (
                            <div className="flex flex-col gap-4">
                                {selectedSlots.length > 0 && (
                                    <div className="flex items-center justify-between bg-destructive/10 text-destructive px-4 py-2 rounded-md">
                                        <span className="text-sm font-medium">{selectedSlots.length} slot terpilih</span>
                                        <button
                                            onClick={handleDeleteBatch}
                                            className="text-xs font-bold bg-destructive text-destructive-foreground px-3 py-1 rounded-md hover:bg-destructive/90"
                                        >
                                            Hapus Terpilih
                                        </button>
                                    </div>
                                )}
                                <div className="relative overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs uppercase bg-muted text-muted-foreground">
                                            <tr>
                                                <th className="px-4 py-3 w-10">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-input text-primary focus:ring-primary"
                                                        onChange={handleSelectAll}
                                                        checked={slots.filter(s => s.can_delete).length > 0 && selectedSlots.length === slots.filter(s => s.can_delete).length}
                                                        disabled={slots.filter(s => s.can_delete).length === 0}
                                                    />
                                                </th>
                                                <th className="px-4 py-3 font-medium">Waktu</th>
                                                <th className="px-4 py-3 font-medium">Status</th>
                                                <th className="px-4 py-3 font-medium text-right">Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {slots.map((slot) => (
                                                <tr key={slot.id} className="hover:bg-muted/50">
                                                    <td className="px-4 py-3">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-input text-primary focus:ring-primary disabled:opacity-50"
                                                            checked={selectedSlots.includes(slot.id)}
                                                            onChange={() => toggleSelect(slot.id)}
                                                            disabled={!slot.can_delete}
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        {slot.jam_mulai} - {slot.jam_selesai}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {(() => {
                                                            let displayStatus = slot.status;
                                                            let badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'; // Kosong

                                                            if (data.tanggal) {
                                                                const slotDateTime = new Date(`${data.tanggal}T${slot.jam_selesai}`);
                                                                if (slotDateTime < new Date() && slot.status.toLowerCase() === 'kosong') {
                                                                    displayStatus = 'Expired';
                                                                    badgeClass = 'bg-muted text-muted-foreground';
                                                                }
                                                            }

                                                            if (displayStatus.toLowerCase() === 'terjadwal') {
                                                                badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
                                                            } else if (displayStatus.toLowerCase() === 'selesai') {
                                                                badgeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
                                                            }

                                                            return (
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                                                                    {displayStatus}
                                                                </span>
                                                            );
                                                        })()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {slot.can_delete ? (
                                                            <button
                                                                onClick={() => confirmDelete(slot.id)}
                                                                className="text-destructive hover:text-destructive/80 font-medium inline-flex items-center gap-1"
                                                            >
                                                                <Trash2 className="size-4" />
                                                                Hapus
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground inline-flex items-center gap-1" title="Slot ini memiliki histori booking">
                                                                <AlertCircle className="size-3" />
                                                                Terkunci
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>

            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus slot jadwal ini? Slot yang dihapus tidak dapat dikembalikan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium border border-input bg-background rounded-md hover:bg-accent"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
                        >
                            Ya, Hapus
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
