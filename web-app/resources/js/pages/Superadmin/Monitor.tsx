import React, { useState } from 'react';
import AppLayout from '../../Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
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
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Activity, CreditCard, Cpu, Clock } from 'lucide-react';

interface LogPemakaianApi {
    id: number;
    provider: string;
    model: string;
    jenis_panggilan: string;
    token_input: number;
    token_output: number | null;
    estimasi_biaya: number | null;
    durasi_ms: number;
    created_at: string;
}

interface PaginationData {
    current_page: number;
    data: LogPemakaianApi[];
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
    stats: {
        total_panggilan_hari_ini: number;
        gagal_groq_bulan_ini: number;
        rata_rata_latency: number;
    };
    logs: PaginationData;
    filters: {
        provider?: string;
        start_date?: string;
        end_date?: string;
    };
    auth: any;
}

export default function Monitor({ stats, logs, filters, auth }: PageProps) {
    const [provider, setProvider] = useState(filters.provider || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const applyFilters = () => {
        router.get('/superadmin/monitor', {
            provider: provider === 'all' ? undefined : provider,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title="Monitor Layanan AI" />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Monitor Layanan AI</h2>
                    <p className="text-muted-foreground text-sm mt-1">
                        Pantau metrik penggunaan API Groq/Gemini dan performa sistem.
                    </p>
                </div>
            </div>

            {/* 3 Statistik Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Panggilan (Hari Ini)</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_panggilan_hari_ini}</div>
                        <p className="text-xs text-muted-foreground">Panggilan API tercatat hari ini</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Gagal API Groq (Bulan Ini)</CardTitle>
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.gagal_groq_bulan_ini}</div>
                        <p className="text-xs text-muted-foreground">Kali sistem gagal terhubung ke Groq API</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rata-rata Latency</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rata_rata_latency} ms</div>
                        <p className="text-xs text-muted-foreground">Waktu respons rata-rata LLM</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabel Log Pemakaian API */}
            <div className="bg-card border rounded-lg shadow-sm">
                <div className="p-4 border-b bg-muted/40 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Semua Provider" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Provider</SelectItem>
                                <SelectItem value="gemini">Gemini</SelectItem>
                                <SelectItem value="openai">OpenAI</SelectItem>
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
                                <TableHead>Tanggal & Waktu</TableHead>
                                <TableHead>Provider</TableHead>
                                <TableHead>Model</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Tokens (In/Out)</TableHead>
                                <TableHead>Durasi (ms)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Tidak ada data log pemakaian API.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.data.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={log.provider === 'openai' ? 'destructive' : 'default'} className={log.provider === 'gemini' ? 'bg-blue-500 hover:bg-blue-600' : ''}>
                                                {log.provider.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{log.model}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.jenis_panggilan.toUpperCase()}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                                {log.token_input} / {log.token_output ?? '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>{log.durasi_ms}</TableCell>
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
