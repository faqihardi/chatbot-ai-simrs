import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import { toast } from 'sonner';
import { PlusCircle, Pencil, Trash2, Shield, User as UserIcon } from 'lucide-react';

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

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
    created_at: string;
}

export default function UsersMaster({ users }: { users: User[] }) {
    const { auth } = usePage().props as any;
    const currentUser = auth.user;

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'staf',
    });

    const openAddModal = () => {
        clearErrors();
        reset();
        setIsAddModalOpen(true);
    };

    const openEditModal = (user: User) => {
        clearErrors();
        reset();
        setData({
            name: user.name,
            email: user.email,
            password: '', // Blank for edit
            role: user.role,
        });
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/superadmin/users', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        put(`/superadmin/users/${selectedUser.id}`, {
            onSuccess: () => {
                setIsEditModalOpen(false);
                reset();
            }
        });
    };

    const handleDeleteSubmit = () => {
        if (!selectedUser) return;
        destroy(`/superadmin/users/${selectedUser.id}`, {
            onSuccess: () => {
                setIsDeleteModalOpen(false);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Master Data Users" />

            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Master Data Users</h1>
                        <p className="text-muted-foreground">Kelola pengguna sistem, staf, dan admin.</p>
                    </div>
                    <Button onClick={openAddModal} className="gap-2">
                        <PlusCircle className="size-4" />
                        Tambah User
                    </Button>
                </div>

                <div className="border rounded-md bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Tanggal Terdaftar</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                                        Tidak ada data pengguna.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'superadmin' ? (
                                                    <Shield className="size-4 text-primary" />
                                                ) : (
                                                    <UserIcon className="size-4 text-muted-foreground" />
                                                )}
                                                {user.name}
                                                {currentUser.id === user.id && (
                                                    <Badge variant="outline" className="ml-2 text-[10px]">Anda</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                user.role === 'superadmin' ? 'default' : 
                                                user.role === 'admin_cs' ? 'secondary' : 'outline'
                                            }>
                                                {user.role_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.created_at}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => openEditModal(user)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => openDeleteModal(user)}
                                                    disabled={user.id === currentUser.id}
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

            {/* Add User Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah User Baru</DialogTitle>
                        <DialogDescription>
                            Tambahkan pengguna baru ke dalam sistem.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input 
                                    id="name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input 
                                    id="email" 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)} 
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input 
                                    id="password" 
                                    type="password" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staf">Staff</SelectItem>
                                        <SelectItem value="admin_cs">Admin Customer Service</SelectItem>
                                        <SelectItem value="superadmin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
                            <Button type="submit" disabled={processing}>Simpan</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit User Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                        <DialogDescription>
                            Ubah informasi pengguna. Biarkan password kosong jika tidak ingin mengubahnya.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Nama Lengkap</Label>
                                <Input 
                                    id="edit-name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email</Label>
                                <Input 
                                    id="edit-email" 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)} 
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">Password Baru (Opsional)</Label>
                                <Input 
                                    id="edit-password" 
                                    type="password" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                    placeholder="Biarkan kosong jika tidak diubah"
                                />
                                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-role">Role</Label>
                                <Select value={data.role} onValueChange={(v) => setData('role', v)} disabled={selectedUser?.id === currentUser.id}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="staf">Staff</SelectItem>
                                        <SelectItem value="admin_cs">Admin Customer Service</SelectItem>
                                        <SelectItem value="superadmin">Super Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                                {selectedUser?.id === currentUser.id && (
                                    <p className="text-xs text-muted-foreground mt-1">Anda tidak dapat mengubah role Anda sendiri.</p>
                                )}
                                {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
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
                            Apakah Anda yakin ingin menghapus pengguna <strong>{selectedUser?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
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
