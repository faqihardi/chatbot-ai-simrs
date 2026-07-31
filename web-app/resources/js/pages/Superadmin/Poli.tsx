import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, PlusCircle, Trash2, Hospital } from 'lucide-react';
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

interface Poli {
    id: number;
    kode: string;
    nama: string;
    dokters_count: number;
}

export default function PoliMaster({ poli }: { poli: Poli[] }) {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPoli, setSelectedPoli] = useState<Poli | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        kode: '',
        nama: '',
    });

    const openAddModal = () => {
        clearErrors();
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (p: Poli) => {
        clearErrors();
        reset();
        setData({
            kode: p.kode,
            nama: p.nama,
        });
        setSelectedPoli(p);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (p: Poli) => {
        if (p.dokters_count > 0) {
            toast.error("Poliklinik ini memiliki dokter terdaftar dan tidak dapat dihapus.");
            return;
        }
        setSelectedPoli(p);
        setIsDeleteModalOpen(true);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/superadmin/poli', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPoli) return;
        put(`/superadmin/poli/${selectedPoli.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDeleteSubmit = () => {
        if (!selectedPoli) return;
        destroy(`/superadmin/poli/${selectedPoli.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Master Data Poliklinik" />

            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Master Data Poliklinik</h1>
                        <p className="text-muted-foreground">Kelola data poliklinik di rumah sakit.</p>
                    </div>
                    <Button onClick={openAddModal} className="gap-2">
                        <PlusCircle className="size-4" />
                        Tambah Poli
                    </Button>
                </div>

                <div className="border rounded-md bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode Poli</TableHead>
                                <TableHead>Nama Poliklinik</TableHead>
                                <TableHead className="text-center">Jumlah Dokter</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {poli.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                                        Tidak ada data poliklinik.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                poli.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-mono text-sm">{p.kode}</TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Hospital className="size-4 text-muted-foreground" />
                                                {p.nama}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary">{p.dokters_count} Dokter</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => openEditModal(p)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => openDeleteModal(p)}
                                                    disabled={p.dokters_count > 0}
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
                        <DialogTitle>Tambah Poliklinik</DialogTitle>
                        <DialogDescription>
                            Tambahkan data poliklinik baru ke sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="kode">Kode Poli</Label>
                                <Input 
                                    id="kode" 
                                    value={data.kode} 
                                    onChange={e => setData('kode', e.target.value)} 
                                    placeholder="Contoh: UMUM, GIGI"
                                />
                                {errors.kode && <p className="text-sm text-destructive">{errors.kode}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nama">Nama Poliklinik</Label>
                                <Input 
                                    id="nama" 
                                    value={data.nama} 
                                    onChange={e => setData('nama', e.target.value)} 
                                    placeholder="Contoh: Poli Umum"
                                />
                                {errors.nama && <p className="text-sm text-destructive">{errors.nama}</p>}
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
                        <DialogTitle>Edit Poliklinik</DialogTitle>
                        <DialogDescription>
                            Ubah kode atau nama poliklinik.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-kode">Kode Poli</Label>
                                <Input 
                                    id="edit-kode" 
                                    value={data.kode} 
                                    onChange={e => setData('kode', e.target.value)} 
                                />
                                {errors.kode && <p className="text-sm text-destructive">{errors.kode}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-nama">Nama Poliklinik</Label>
                                <Input 
                                    id="edit-nama" 
                                    value={data.nama} 
                                    onChange={e => setData('nama', e.target.value)} 
                                />
                                {errors.nama && <p className="text-sm text-destructive">{errors.nama}</p>}
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
                            Apakah Anda yakin ingin menghapus poliklinik <strong>{selectedPoli?.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
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
