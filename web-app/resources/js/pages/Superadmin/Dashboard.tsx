import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '../../Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    FileText, 
    AlertTriangle, 
    CalendarDays, 
    CheckCircle2, 
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DashboardMetrics {
    dokumen: {
        total: number;
        aktif: number;
    };
    aduan: {
        total: number;
        baru: number;
        selesai: number;
    };
    booking: {
        total: number;
        terjadwal: number;
        hari_ini: number;
    };
    api_cost: string;
}

interface RecentAduan {
    id: number;
    nomor_tiket: string;
    kategori: string;
    status: string;
    created_at: string;
}

interface RecentBooking {
    id: number;
    nomor_antrean: string;
    nama_pasien: string;
    poli: string;
    jadwal: string;
    status: string;
}

interface DashboardProps {
    metrics: DashboardMetrics;
    recentAduans: RecentAduan[];
    recentBookings: RecentBooking[];
}

export default function SuperadminDashboard({ metrics, recentAduans, recentBookings }: DashboardProps) {
    const getStatusVariant = (status: string) => {
        switch(status) {
            case 'baru': return 'default';
            case 'diproses': return 'outline';
            case 'selesai': return 'default';
            case 'ditolak': return 'destructive';
            case 'terjadwal': return 'default';
            case 'draft': return 'secondary';
            case 'dibatalkan': return 'destructive';
            default: return 'secondary';
        }
    };

    return (
        <AppLayout>
            <Head title="Dashboard Superadmin" />
            <div className="container max-w-7xl mx-auto py-6 space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard Superadmin</h1>
                    <p className="text-muted-foreground mt-1">
                        Ikhtisar sistem pelayanan informasi, keluhan, dan pendaftaran.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Dokumen Aktif (KB)</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.dokumen.aktif}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dari total {metrics.dokumen.total} dokumen terdaftar
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Aduan Baru Masuk</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.aduan.baru}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Butuh segera ditindaklanjuti
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Booking Hari Ini</CardTitle>
                            <CalendarDays className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.booking.hari_ini}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dari total {metrics.booking.terjadwal} booking aktif
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Aduan Diselesaikan</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.aduan.selesai}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Dari total {metrics.aduan.total} riwayat aduan
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-primary">Biaya API Bulan Ini</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">{metrics.api_cost}</div>
                            <p className="text-xs text-primary/80 mt-1">
                                Estimasi tagihan Gemini API
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Lists Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    
                    {/* Recent Aduan */}
                    <Card className="col-span-1 border-t-4 border-t-red-500">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Aduan Terbaru</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">5 keluhan terakhir dari pengguna.</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/aduan">
                                    Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentAduans.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">Belum ada aduan masuk.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tiket</TableHead>
                                            <TableHead>Kategori</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentAduans.map((aduan: RecentAduan) => (
                                            <TableRow key={aduan.id}>
                                                <TableCell className="font-medium">{aduan.nomor_tiket}</TableCell>
                                                <TableCell>{aduan.kategori}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={getStatusVariant(aduan.status)} className={aduan.status === 'selesai' ? 'bg-green-500' : ''}>
                                                        {aduan.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Booking */}
                    <Card className="col-span-1 border-t-4 border-t-blue-500">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Booking Terbaru</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">5 registrasi janji temu terakhir.</p>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/admin/booking">
                                    Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {recentBookings.length === 0 ? (
                                <div className="text-center py-6 text-muted-foreground">Belum ada registrasi janji temu.</div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Pasien</TableHead>
                                            <TableHead>Poli</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recentBookings.map((booking: RecentBooking) => (
                                            <TableRow key={booking.id}>
                                                <TableCell>
                                                    <div className="font-medium">{booking.nama_pasien}</div>
                                                    <div className="text-xs text-muted-foreground">{booking.nomor_antrean}</div>
                                                </TableCell>
                                                <TableCell>{booking.poli}</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant={getStatusVariant(booking.status)}>
                                                        {booking.status.toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}
