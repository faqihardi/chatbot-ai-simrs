import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, PlusCircle, Trash2, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Poli {
    id: number;
    nama: string;
}

interface Dokter {
    id: number;
    kode: string;
    nama: string;
    spesialisasi: string;
    poli_id: number;
    poli_name: string;
    jadwal_slots_count: number;
}

export default function DokterMaster({ dokters, polis }: { dokters: Dokter[], polis: Poli[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDokter, setSelectedDokter] = useState<Dokter | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
        spesialisasi: '',
        poli_id: '',
    });

    const openAddModal = () => {
        clearErrors();
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (d: Dokter) => {
        clearErrors();
        reset();
        setData({
            kode: d.kode,
            nama: d.nama,
            spesialisasi: d.spesialisasi,
            poli_id: d.poli_id.toString(),
        });
        setSelectedDokter(d);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (d: Dokter) => {
        if (d.jadwal_slots_count > 0) {
            toast.error("Dokter ini memiliki jadwal slot atau riwayat booking aktif dan tidak dapat dihapus.");
            return;
        }
        setSelectedDokter(d);
        setIsDeleteModalOpen(true);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/superadmin/dokter', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedDokter) return;
        put(`/superadmin/dokter/${selectedDokter.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDeleteSubmit = () => {
        if (!selectedDokter) return;
        destroy(`/superadmin/dokter/${selectedDokter.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Master Data Dokter" />

            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Master Data Dokter</h1>
                        <p className="text-muted-foreground">Kelola profil dokter dan tugas polikliniknya.</p>
                    </div>
                    <Button onClick={openAddModal} className="gap-2">
                        <PlusCircle className="size-4" />
                        Tambah Dokter
                    </Button>
                </div>

                <div className="border rounded-md bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama Dokter</TableHead>
                                <TableHead>Spesialisasi</TableHead>
                                <TableHead>Poliklinik</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {dokters.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        Tidak ada data dokter.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                dokters.map((d) => (
                                    <TableRow key={d.id}>
                                        <TableCell className="font-mono text-sm">{d.kode}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Stethoscope className="size-4 text-muted-foreground" />
                                                {d.nama}
                                            </div>
                                        </TableCell>
                                        <TableCell>{d.spesialisasi}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{d.poli_name}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => openEditModal(d)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => openDeleteModal(d)}
                                                    disabled={d.jadwal_slots_count > 0}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Dokter</DialogTitle>
                        <DialogDescription>
                            Tambahkan profil dokter baru dan tugaskan ke poliklinik.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="kode">Kode Dokter</Label>
                                <Input 
                                    id="kode" 
                                    value={data.kode} 
                                    onChange={e => setData('kode', e.target.value)} 
                                    placeholder="Contoh: D01"
                                />
                                {errors.kode && <p className="text-sm text-destructive">{errors.kode}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Dokter</Label>
                                <Input 
                                    id="nama" 
                                    value={data.nama} 
                                    onChange={e => setData('nama', e.target.value)} 
                                    placeholder="Contoh: dr. John Doe"
                                />
                                {errors.nama && <p className="text-sm text-destructive">{errors.nama}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spesialisasi">Spesialisasi</Label>
                                <Input 
                                    id="spesialisasi" 
                                    value={data.spesialisasi} 
                                    onChange={e => setData('spesialisasi', e.target.value)} 
                                    placeholder="Contoh: Dokter Umum"
                                />
                                {errors.spesialisasi && <p className="text-sm text-destructive">{errors.spesialisasi}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="poli_id">Poliklinik</Label>
                                <Select value={data.poli_id} onValueChange={(v) => setData('poli_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih poliklinik" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {polis.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.poli_id && <p className="text-sm text-destructive">{errors.poli_id}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Dokter</DialogTitle>
                        <DialogDescription>
                            Ubah profil atau poliklinik tempat dokter bertugas.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-kode">Kode Dokter</Label>
                                <Input 
                                    id="edit-kode" 
                                    value={data.kode} 
                                    onChange={e => setData('kode', e.target.value)} 
                                />
                                {errors.kode && <p className="text-sm text-destructive">{errors.kode}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-nama">Nama Dokter</Label>
                                <Input 
                                    id="edit-nama" 
                                    value={data.nama} 
                                    onChange={e => setData('nama', e.target.value)} 
                                />
                                {errors.nama && <p className="text-sm text-destructive">{errors.nama}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-spesialisasi">Spesialisasi</Label>
                                <Input 
                                    id="edit-spesialisasi" 
                                    value={data.spesialisasi} 
                                    onChange={e => setData('spesialisasi', e.target.value)} 
                                />
                                {errors.spesialisasi && <p className="text-sm text-destructive">{errors.spesialisasi}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-poli_id">Poliklinik</Label>
                                <Select value={data.poli_id} onValueChange={(v) => setData('poli_id', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih poliklinik" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {polis.map(p => (
                                            <SelectItem key={p.id} value={p.id.toString()}>{p.nama}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.poli_id && <p className="text-sm text-destructive">{errors.poli_id}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan Perubahan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Modal */}
            <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus dokter <strong>{selectedDokter?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4">
                        <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Batal</Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteSubmit} disabled={processing}>
                            Ya, Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
