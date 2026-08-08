import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '../../../Layouts/AppLayout';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Booking {
    id: number;
    nomor_booking: string;
    nomor_antrean: string | null;
    nama_pasien: string;
    kontak_terenkripsi: string;
    tipe_pasien: string;
    jenis_pembayaran: string | null;
    status: string;
    waktu_kadaluarsa: string | null;
    created_at: string;
    slot_id: number;
    slot?: {
        tanggal: string;
        jam_mulai: string;
        jam_selesai: string;
        dokter?: {
            nama: string;
            poli?: { nama: string };
        };
    };
}

interface PaginatedBooking {
    data: Booking[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export default function BookingIndex({ bookings, filters }: { bookings: PaginatedBooking, filters: { search?: string, status?: string } }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'semua');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

    const { data, setData, put, processing, reset } = useForm({
        status: 'terjadwal',
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get('/admin/booking', { search, status }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, status]);

    const openEditModal = (booking: Booking) => {
        setEditingBooking(booking);
        setData({
            status: booking.status,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingBooking) {
            put(`/admin/booking/${editingBooking.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'draft': return 'secondary';
            case 'terjadwal': return 'default';
            case 'selesai': return 'default';
            case 'dibatalkan': return 'destructive';
            case 'expired': return 'outline';
            default: return 'secondary';
        }
    };

    const formatTime = (timeString?: string | null) => {
        if (!timeString) return '';
        // "08:00:00" -> "08:00"
        return timeString.substring(0, 5);
    };

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
        });
    };

    return (
        <AppLayout>
            <Head title="Kelola Booking" />
            <div className="container max-w-6xl mx-auto py-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Booking</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manajemen jadwal kunjungan pasien
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari no. antrean, booking, atau nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="max-w-sm"
                        />
                    </div>
                    <div className="w-full sm:w-[200px]">
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semua">Semua Status</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="terjadwal">Terjadwal</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                                <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                                <SelectItem value="expired">Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border bg-background overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold">Antrean</TableHead>
                                <TableHead className="font-bold">Pasien</TableHead>
                                <TableHead className="font-bold">Poli & Dokter</TableHead>
                                <TableHead className="font-bold">Jadwal Kunjungan</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bookings.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Belum ada data booking.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings.data.map((row: Booking) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium text-lg">
                                            {row.nomor_antrean || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{row.nama_pasien || '-'}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {row.tipe_pasien === 'baru' ? 'Pasien Baru' : 'Lama'} • {row.jenis_pembayaran}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{row.slot?.dokter?.poli?.nama}</span>
                                                <span className="text-sm text-muted-foreground">{row.slot?.dokter?.nama}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span>{formatDate(row.slot?.tanggal)}</span>
                                                <span className="text-sm font-medium">
                                                    {formatTime(row.slot?.jam_mulai)} - {formatTime(row.slot?.jam_selesai)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(row.status)}
                                                className={row.status === 'selesai' ? 'bg-green-500' : ''}>
                                                {row.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
                                                Aksi
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {bookings.links && bookings.links.length > 3 && (
                    <div className="flex items-center justify-center pt-4">
                        <Pagination>
                            <PaginationContent>
                                {bookings.links.map((link, idx: number) => {
                                    const isPrevious = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');

                                    if (!link.url && (isPrevious || isNext)) {
                                        return null;
                                    }

                                    return (
                                        <PaginationItem key={idx}>
                                            {isPrevious ? (
                                                <PaginationPrevious
                                                    href={link.url || '#'}
                                                    onClick={(e) => { if (!link.url) e.preventDefault(); }}
                                                    className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            ) : isNext ? (
                                                <PaginationNext
                                                    href={link.url || '#'}
                                                    onClick={(e) => { if (!link.url) e.preventDefault(); }}
                                                    className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            ) : (
                                                <PaginationLink
                                                    href={link.url || '#'}
                                                    isActive={link.active}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            )}
                                        </PaginationItem>
                                    );
                                })}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>

            {/* Modal Dialog Tindak Lanjut Booking */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Tindak Lanjut Booking</DialogTitle>
                            <DialogDescription>
                                Perbarui status pemesanan jadwal untuk <strong>{editingBooking?.nama_pasien}</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-6">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Ubah Status</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="terjadwal">Terjadwal</SelectItem>
                                        <SelectItem value="selesai">Selesai</SelectItem>
                                        <SelectItem value="dibatalkan">Dibatalkan</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={processing}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                Simpan Status
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
