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
import { Textarea } from "@/components/ui/textarea";

interface Aduan {
    id: number;
    nomor_tiket: string;
    kategori: string;
    tingkat_urgensi: string | null;
    status: string;
    tanggapan: string | null;
    tipe_pengirim: string;
    staf_id?: number | null;
    staf?: { name: string, no_hp?: string, departemen?: string };
    deskripsi: string;
    lokasi_kejadian?: string | null;
    kontak_terenkripsi?: string | null;
    created_at: string;
    ditindaklanjuti_pada: string | null;
    selesai_pada: string | null;
}

interface PaginatedAduan {
    data: Aduan[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export default function AduanIndex({ aduans, filters }: { aduans: PaginatedAduan, filters: { search?: string, status?: string } }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'semua');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAduan, setEditingAduan] = useState<Aduan | null>(null);

    const { data, setData, put, processing, errors, reset } = useForm({
        status: 'baru',
        tanggapan: '',
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get('/admin/aduan', { search, status }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, status]);

    const openEditModal = (aduan: Aduan) => {
        setEditingAduan(aduan);
        setData({
            status: aduan.status,
            tanggapan: aduan.tanggapan || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAduan) {
            put(`/admin/aduan/${editingAduan.id}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'baru': return 'default';
            case 'diproses': return 'outline';
            case 'selesai': return 'default'; // Maybe use green bg
            case 'ditolak': return 'destructive';
            default: return 'secondary';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <AppLayout>
            <Head title="Kelola Aduan" />
            <div className="container max-w-6xl mx-auto py-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Aduan</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Pusat resolusi keluhan dari pasien dan staf
                        </p>
                    </div>
                    {/* Aduan usually not created by AdminCS, they only respond to it */}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari nomor tiket atau kategori..."
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
                                <SelectItem value="baru">Baru</SelectItem>
                                <SelectItem value="diproses">Diproses</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                                <SelectItem value="ditolak">Ditolak</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border bg-background overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold">No. Tiket</TableHead>
                                <TableHead className="font-bold">Kategori</TableHead>
                                <TableHead className="font-bold">Tingkat Urgensi</TableHead>
                                <TableHead className="font-bold">Tanggal</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {aduans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        Belum ada aduan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                aduans.data.map((row: Aduan) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">{row.nomor_tiket}</TableCell>
                                        <TableCell>{row.kategori}</TableCell>
                                        <TableCell>
                                            {row.tingkat_urgensi ? (
                                                <Badge variant="outline" className="capitalize">{row.tingkat_urgensi}</Badge>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">
                                            {formatDate(row.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(row.status)}
                                                className={row.status === 'selesai' ? 'bg-green-500' : ''}>
                                                {row.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
                                                Tindak Lanjuti
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {aduans.links && aduans.links.length > 3 && (
                    <div className="flex items-center justify-center pt-4">
                        <Pagination>
                            <PaginationContent>
                                {aduans.links.map((link, idx: number) => {
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

            {/* Modal Dialog Tindak Lanjut Aduan */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Tindak Lanjut Aduan #{editingAduan?.nomor_tiket}</DialogTitle>
                            <DialogDescription>
                                Perbarui status aduan dan berikan tanggapan untuk pengguna.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 py-4">
                            {/* Read-only details */}
                            <div className="p-4 bg-muted/50 rounded-lg space-y-3 text-sm">
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Kategori:</span>
                                    <span className="col-span-2 font-medium">{editingAduan?.kategori}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Urgensi:</span>
                                    <span className="col-span-2 font-medium capitalize">{editingAduan?.tingkat_urgensi || '-'}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    <span className="text-muted-foreground">Pengirim:</span>
                                    <span className="col-span-2 font-medium">
                                        {editingAduan?.tipe_pengirim === 'staf' && editingAduan?.staf
                                            ? `Staf: ${editingAduan.staf.name}`
                                            : `Pasien (Kontak: ${editingAduan?.kontak_terenkripsi || 'Anonim'})`}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 gap-1 pt-2 border-t">
                                    <span className="text-muted-foreground">Deskripsi Aduan:</span>
                                    <p className="font-medium whitespace-pre-wrap">{editingAduan?.deskripsi}</p>
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="status">Ubah Status</Label>
                                <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="baru">Baru</SelectItem>
                                        <SelectItem value="diproses">Diproses</SelectItem>
                                        <SelectItem value="selesai">Selesai</SelectItem>
                                        <SelectItem value="ditolak">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="tanggapan">Tanggapan Solusi / Keterangan</Label>
                                <Textarea
                                    id="tanggapan"
                                    value={data.tanggapan}
                                    onChange={(e) => setData('tanggapan', e.target.value)}
                                    placeholder="Tuliskan tanggapan atas aduan ini (akan terlihat oleh pelapor saat mengecek nomor tiket)..."
                                    className="min-h-[100px]"
                                />
                                {errors.tanggapan && <p className="text-sm text-destructive">{errors.tanggapan}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={processing}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
