import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
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
import { CheckCircle2, PlusCircle, Search } from 'lucide-react';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface LogGagal {
    id: number;
    sesi_id: number | null;
    pertanyaan: string;
    alasan_gagal: string;
    skor_similarity_tertinggi: number | null;
    ditinjau: boolean;
    created_at: string;
}

interface PaginationData {
    current_page: number;
    data: LogGagal[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: { url: string | null; label: string; active: boolean }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface PageProps {
    logs: PaginationData;
    filters: {
        alasan_gagal?: string;
        start_date?: string;
        end_date?: string;
    };
    auth: any;
}

export default function LogGagal({ logs, filters, auth }: PageProps) {
    const [alasanGagal, setAlasanGagal] = useState(filters.alasan_gagal || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const applyFilters = () => {
        router.get('/admin/log-gagal', {
            alasan_gagal: alasanGagal === 'all' ? undefined : alasanGagal,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const markReviewed = (id: number) => {
        router.post(`/admin/log-gagal/${id}/review`, {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('Log ditandai sudah ditinjau.')
        });
    };

    const addToKnowledgeBase = (pertanyaan: string) => {
        // Redirect ke /admin/dokumen dengan parameter pencarian/prefill
        window.open(`/admin/dokumen?create=true&judul=${encodeURIComponent(pertanyaan)}`, '_blank');
    };

    return (
        <AppLayout>
            <Head title="Log Interaksi Gagal" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Log Interaksi Gagal</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Pantau riwayat interaksi pengguna di mana AI gagal merespons dengan baik.
                    </p>
                </div>
            </div>

            <div className="bg-card border rounded-lg shadow-sm">
                <div className="p-4 border-b bg-muted/40 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Select value={alasanGagal} onValueChange={setAlasanGagal}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Semua Alasan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Alasan</SelectItem>
                                <SelectItem value="dokumen_tidak_ditemukan">Dokumen Tidak Ditemukan</SelectItem>
                                <SelectItem value="intent_tidak_jelas">Intent Tidak Jelas</SelectItem>
                                <SelectItem value="tool_error">Tool Error</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)} 
                            className="w-[150px]"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)} 
                            className="w-[150px]"
                        />
                        <Button variant="secondary" onClick={applyFilters}>Filter</Button>
                    </div>
                </div>

                <div className="relative w-full overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Tanggal & Waktu</TableHead>
                                <TableHead>Pertanyaan</TableHead>
                                <TableHead>Alasan Gagal</TableHead>
                                <TableHead>Skor Similarity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Tidak ada data log interaksi gagal.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => (
                                    <TableRow key={log.id} className={log.ditinjau ? 'bg-muted/20' : ''}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate" title={log.pertanyaan}>
                                            {log.pertanyaan}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                log.alasan_gagal === 'dokumen_tidak_ditemukan' ? 'outline' : 
                                                log.alasan_gagal === 'intent_tidak_jelas' ? 'secondary' : 'destructive'
                                            }>
                                                {log.alasan_gagal.split('_').join(' ').toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {log.skor_similarity_tertinggi !== null ? (
                                                <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                                    {log.skor_similarity_tertinggi.toFixed(4)}
                                                </span>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {log.ditinjau ? (
                                                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                                                    Ditinjau
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100">
                                                    Baru
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {!log.ditinjau && (
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        onClick={() => markReviewed(log.id)}
                                                        title="Tandai Sudah Ditinjau"
                                                    >
                                                        <CheckCircle2 className="size-4 text-green-600" />
                                                    </Button>
                                                )}
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => addToKnowledgeBase(log.pertanyaan)}
                                                    title="Tambah ke Basis Pengetahuan"
                                                >
                                                    <PlusCircle className="size-4 text-primary" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="p-4 border-t flex items-center justify-between text-sm text-muted-foreground">
                    <div>
                        Menampilkan {logs.from || 0} hingga {logs.to || 0} dari {logs.total} data
                    </div>
                    {logs.last_page > 1 && (
                        <Pagination className="w-auto mx-0">
                            <PaginationContent>
                                {logs.prev_page_url && (
                                    <PaginationItem>
                                        <PaginationPrevious href={logs.prev_page_url} />
                                    </PaginationItem>
                                )}
                                {logs.links.filter(l => !l.label.includes('&laquo;') && !l.label.includes('&raquo;')).map((link, i) => (
                                    <PaginationItem key={i}>
                                        <PaginationLink 
                                            href={link.url || '#'} 
                                            isActive={link.active}
                                        >
                                            {link.label}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                                {logs.next_page_url && (
                                    <PaginationItem>
                                        <PaginationNext href={logs.next_page_url} />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
