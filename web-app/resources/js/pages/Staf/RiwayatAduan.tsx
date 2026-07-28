import React from 'react';
import { Head } from '@inertiajs/react';
import { 
    Container, Typography, Box, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Chip
} from '@mui/material';
import AppLayout from '../../Layouts/AppLayout';

export default function RiwayatAduan({ aduans }: { aduans: any[] }) {

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'baru': return 'info';
            case 'diproses': return 'warning';
            case 'selesai': return 'success';
            case 'ditolak': return 'error';
            default: return 'default';
        }
    };

    return (
        <AppLayout>
            <Head title="Riwayat Aduan Saya" />
            <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">Riwayat Aduan Saya</Typography>
                </Box>

                <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: 'primary.light' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>No. Tiket</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Kategori</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tanggal</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {aduans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                                        Belum ada riwayat aduan.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                aduans.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell fontWeight="bold">{row.nomor_tiket}</TableCell>
                                        <TableCell>{row.kategori}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={row.status.toUpperCase()} 
                                                color={getStatusColor(row.status) as any}
                                                size="small" 
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(row.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric'
                                        })}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    (read-only, staf tidak bisa ubah status sendiri)
                </Typography>
            </Container>
        </AppLayout>
    );
}
