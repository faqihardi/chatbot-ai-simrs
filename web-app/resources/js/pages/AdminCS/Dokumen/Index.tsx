import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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

interface Dokumen {
    id: number;
    judul: string;
    kategori: string;
    sumber?: string;
    isi: string;
    aktif: boolean;
    versi: number;
    checksum: string;
    chunks_count?: number;
    created_at: string;
    updated_at: string;
}

interface PaginatedData<T> {
    data: T[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

export default function DokumenIndex({ dokumens, filters }: { dokumens: PaginatedData<Dokumen>, filters: { search?: string, status?: string } }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'semua');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Extraction states
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractError, setExtractError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        judul: '',
        kategori: '',
        sumber: '',
        isi: '',
        aktif: true,
    });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get('/admin/dokumen', { search, status }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, status]);

    // Smart Polling untuk status dokumen yang masih "Menunggu"
    useEffect(() => {
        const hasPendingDocuments = dokumens.data.some(
            (doc) => !doc.chunks_count || doc.chunks_count === 0
        );

        if (hasPendingDocuments) {
            const interval = setInterval(() => {
                router.reload({ only: ['dokumens'] });
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [dokumens.data]);

    // Menangkap parameter dari URL (misalnya dari Log Gagal)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('create') === 'true') {
            setEditingId(null);
            setData({
                judul: params.get('judul') || '',
                kategori: '',
                sumber: '',
                isi: '',
                aktif: true,
            });
            setIsModalOpen(true);
        }
    }, []);

    const openCreateModal = () => {
        setEditingId(null);
        reset();
        setExtractError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsModalOpen(true);
    };

    const openEditModal = (dokumen: Dokumen) => {
        setEditingId(dokumen.id);
        setData({
            judul: dokumen.judul,
            kategori: dokumen.kategori,
            sumber: dokumen.sumber || '',
            isi: dokumen.isi,
            aktif: !!dokumen.aktif,
        });
        setIsModalOpen(true);
    };


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi ukuran (Max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setExtractError('Ukuran file maksimal 5MB.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        // Validasi ekstensi
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext !== 'pdf' && ext !== 'docx') {
            setExtractError('Format file tidak didukung. Harap unggah PDF atau DOCX.');
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setExtractError(null);
        setIsExtracting(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/admin/dokumen/extract', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data && response.data.success) {
                // Set the extracted text into the form's 'isi' field
                setData('isi', response.data.text);
            }
        } catch (error: unknown) {
            console.error('Extraction error:', error);
            const err = error as { response?: { data?: { error?: string } } };
            setExtractError(err.response?.data?.error || 'Terjadi kesalahan saat mengekstrak dokumen.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingId) {
            put(`/admin/dokumen/${editingId}`, {
                onSuccess: () => setIsModalOpen(false),
            });
        } else {
            post('/admin/dokumen', {
                onSuccess: () => setIsModalOpen(false),
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Kelola Dokumen" />
            <div className="container max-w-6xl mx-auto py-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Kelola Dokumen</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Manajemen basis pengetahuan AI
                        </p>
                    </div>
                    <Button onClick={openCreateModal}>+ Tambah Baru</Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <Input
                            placeholder="Cari judul atau kategori..."
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
                                <SelectItem value="aktif">Aktif</SelectItem>
                                <SelectItem value="nonaktif">Nonaktif</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="rounded-md border bg-background overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold">Judul</TableHead>
                                <TableHead className="font-bold">Kategori</TableHead>
                                <TableHead className="font-bold">Versi</TableHead>
                                <TableHead className="font-bold text-center">Checksum</TableHead>
                                <TableHead className="font-bold text-center">Embeddings (Chunks)</TableHead>
                                <TableHead className="font-bold text-center">Aktif</TableHead>
                                <TableHead className="font-bold text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dokumens.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                        Belum ada dokumen.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                dokumens.data.map((row: Dokumen) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium max-w-[300px] truncate" title={row.judul}>
                                            {row.judul}
                                        </TableCell>
                                        <TableCell>{row.kategori}</TableCell>
                                        <TableCell>v{row.versi}</TableCell>
                                        <TableCell className="text-center font-mono text-xs text-muted-foreground" title={row.checksum}>
                                            {row.checksum ? row.checksum.substring(0, 8) + '...' : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.chunks_count && row.chunks_count > 0 ? (
                                                <Badge variant="outline" className="border-blue-500 text-blue-600 bg-blue-50">Selesai ({row.chunks_count} chunk)</Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">Menunggu</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {row.aktif ? (
                                                <Badge variant="default" className="bg-green-500">Ya</Badge>
                                            ) : (
                                                <Badge variant="secondary">Tidak</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" onClick={() => openEditModal(row)}>
                                                Edit
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {dokumens.links && dokumens.links.length > 3 && (
                    <div className="flex items-center justify-center pt-4">
                        <Pagination>
                            <PaginationContent>
                                {dokumens.links.map((link, idx: number) => {
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
                                                    onClick={(e) => {
                                                        if (!link.url) e.preventDefault();
                                                    }}
                                                    className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            ) : isNext ? (
                                                <PaginationNext
                                                    href={link.url || '#'}
                                                    onClick={(e) => {
                                                        if (!link.url) e.preventDefault();
                                                    }}
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

            {/* Modal Dialog */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{editingId ? 'Edit Dokumen' : 'Tambah Dokumen Baru'}</DialogTitle>
                            <DialogDescription>
                                {editingId
                                    ? 'Ubah isi dokumen. Proses Re-embedding akan dilakukan.'
                                    : 'Tambahkan dokumen ke basis pengetahuan.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="judul">Judul Dokumen</Label>
                                <Input
                                    id="judul"
                                    value={data.judul}
                                    onChange={(e) => setData('judul', e.target.value)}
                                    placeholder="Contoh: Prosedur Pendaftaran Pasien BPJS"
                                />
                                {errors.judul && <p className="text-sm text-destructive">{errors.judul}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="kategori">Kategori</Label>
                                    <Input
                                        id="kategori"
                                        value={data.kategori}
                                        onChange={(e) => setData('kategori', e.target.value)}
                                        placeholder="Contoh: Layanan, Administrasi"
                                    />
                                    {errors.kategori && <p className="text-sm text-destructive">{errors.kategori}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="sumber">Sumber (URL/Referensi)</Label>
                                    <Input
                                        id="sumber"
                                        value={data.sumber}
                                        onChange={(e) => setData('sumber', e.target.value)}
                                        placeholder="Opsional"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="isi">Isi Dokumen (Teks Lengkap)</Label>

                                <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/30">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div>
                                            <p className="font-semibold text-sm">Upload File</p>
                                            <p className="text-xs text-muted-foreground">Format PDF atau DOCX (Max 5MB).</p>
                                        </div>
                                        <div className="flex flex-1 w-full items-center gap-2 mt-2 sm:mt-0 sm:justify-end">
                                            <Input
                                                type="file"
                                                accept=".pdf,.docx"
                                                className="w-full sm:max-w-[260px] cursor-pointer"
                                                ref={fileInputRef}
                                                onChange={handleFileUpload}
                                                disabled={isExtracting}
                                            />
                                            {isExtracting && <span className="text-sm text-blue-500 font-medium">Mengekstrak...</span>}
                                        </div>
                                    </div>
                                    {extractError && <p className="text-sm text-destructive font-medium">{extractError}</p>}
                                </div>
                                <div className="text-center text-xs text-muted-foreground font-bold my-1">ATAU KETIK/PASTE MANUAL DI BAWAH</div>
                                <Textarea
                                    id="isi"
                                    value={data.isi}
                                    onChange={(e) => setData('isi', e.target.value)}
                                    placeholder="Ketik teks atau copy-paste isi dokumen di sini..."
                                    className="min-h-[200px]"
                                />
                                {errors.isi && <p className="text-sm text-destructive">{errors.isi}</p>}
                            </div>

                            <div className="flex items-center gap-4 mt-2">
                                <Label>Status Aktif</Label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="aktif"
                                            checked={data.aktif === true}
                                            onChange={() => setData('aktif', true)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span>Ya</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="aktif"
                                            checked={data.aktif === false}
                                            onChange={() => setData('aktif', false)}
                                            className="w-4 h-4 text-primary"
                                        />
                                        <span>Tidak</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={processing}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
