import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
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
import { router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function RiwayatAduan({ aduans, filters }: { aduans: any, filters: any }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'semua');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get('/staf/riwayat-aduan', { search, status }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            });
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [search, status]);

    const getStatusVariant = (status: string) => {
        switch(status) {
            case 'baru': return 'default';
            case 'diproses': return 'secondary';
            case 'selesai': return 'default'; // In tailwind we'll override color for success
            case 'ditolak': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusColor = (status: string) => {
        if (status === 'selesai') return 'bg-green-500 hover:bg-green-600';
        if (status === 'diproses') return 'bg-yellow-500 hover:bg-yellow-600 text-white';
        return '';
    };

    return (
        <AppLayout>
            <Head title="Riwayat Aduan Saya" />
            <div className="container max-w-5xl mx-auto py-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Riwayat Aduan Saya</h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        (read-only, staf tidak bisa ubah status sendiri)
                    </p>
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
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="font-bold">Tanggal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {aduans.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        Belum ada riwayat aduan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                aduans.data.map((row: any) => (
                                    <TableRow key={row.id}>
                                        <TableCell className="font-medium">{row.nomor_tiket}</TableCell>
                                        <TableCell>{row.kategori}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(row.status) as any} className={getStatusColor(row.status)}>
                                                {row.status.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(row.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}</TableCell>
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
                                {aduans.links.map((link: any, idx: number) => {
                                    const isPrevious = link.label.includes('Previous');
                                    const isNext = link.label.includes('Next');
                                    
                                    if (!link.url && (isPrevious || isNext)) {
                                        return null; // Don't render disabled prev/next buttons for cleaner look
                                    }

                                    return (
                                        <PaginationItem key={idx}>
                                            {isPrevious ? (
                                                <PaginationPrevious 
                                                    href={link.url || '#'} 
                                                    onClick={(e) => {
                                                        if(!link.url) e.preventDefault();
                                                    }}
                                                    className={!link.url ? 'pointer-events-none opacity-50' : ''}
                                                />
                                            ) : isNext ? (
                                                <PaginationNext 
                                                    href={link.url || '#'} 
                                                    onClick={(e) => {
                                                        if(!link.url) e.preventDefault();
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
        </AppLayout>
    );
}
