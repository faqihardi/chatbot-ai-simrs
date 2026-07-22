import React, { useState } from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Box, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    TextField, 
    FormControl, 
    FormLabel, 
    RadioGroup, 
    FormControlLabel, 
    Radio, 
    Alert,
    CircularProgress,
    Paper,
    Grid
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import axios from 'axios';

interface Slot {
    slot_id: number;
    dokter_nama: string;
    spesialisasi: string;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
}

interface JadwalDataPayload {
    type: string;
    poli: string;
    slots: Slot[];
}

interface JadwalCardProps {
    data: JadwalDataPayload;
    tokenSesi: string;
    onBookingSuccess: (bookingData: any) => void;
}

export default function JadwalCard({ data, tokenSesi, onBookingSuccess }: JadwalCardProps) {
    const [open, setOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [step, setStep] = useState(1); // 1: Input details, 2: Confirm draft
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [namaPasien, setNamaPasien] = useState('');
    const [kontak, setKontak] = useState('');
    const [jenisPembayaran, setJenisPembayaran] = useState('umum');
    const [keluhanSingkat, setKeluhanSingkat] = useState('');
    const [draftBooking, setDraftBooking] = useState<any>(null);

    const handleOpen = (slot: Slot) => {
        setSelectedSlot(slot);
        setStep(1);
        setError(null);
        setOpen(true);
    };

    const handleClose = () => {
        if (!loading) {
            setOpen(false);
            setDraftBooking(null);
        }
    };

    const handleSubmitDraft = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/booking/draft', {
                slot_id: selectedSlot.slot_id,
                token_sesi: tokenSesi,
                nama_pasien: namaPasien,
                kontak: kontak,
                jenis_pembayaran: jenisPembayaran,
                keluhan_singkat: keluhanSingkat
            });

            if (response.data.success) {
                setDraftBooking(response.data.booking);
                setStep(2);
            } else {
                setError(response.data.message || 'Gagal membuat draft pendaftaran.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Terjadi kesalahan sistem saat mendaftar.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!draftBooking) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/booking/confirm', {
                nomor_booking: draftBooking.nomor_booking
            });

            if (response.data.success) {
                setOpen(false);
                // Call parent callback to render the success state in chat
                onBookingSuccess({
                    nomor_booking: response.data.nomor_booking,
                    nomor_antrean: response.data.nomor_antrean,
                    dokter_nama: selectedSlot?.dokter_nama,
                    poli_nama: data.poli,
                    tanggal: selectedSlot?.tanggal,
                    jam: `${selectedSlot?.jam_mulai.substring(0, 5)} - ${selectedSlot?.jam_selesai.substring(0, 5)}`
                });
            } else {
                setError(response.data.message || 'Gagal mengonfirmasi pendaftaran.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal mengonfirmasi pendaftaran karena slot sudah penuh.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ width: '100%', my: 1 }}>
            <Typography variant="subtitle2" color="primary" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MedicalServicesIcon fontSize="small" /> Jadwal Dokter Tersedia - Poli {data.poli}
            </Typography>
            
            <Grid container spacing={2}>
                {data.slots.map((slot) => (
                    <Grid item xs={12} sm={6} key={slot.slot_id}>
                        <Card variant="outlined" sx={{ 
                            borderRadius: 2, 
                            boxShadow: 'none', 
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                            transition: 'all 0.2s'
                        }}>
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                    {slot.dokter_nama}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                    {slot.spesialisasi}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarMonthIcon fontSize="inherit" color="action" />
                                        <Typography variant="caption">{slot.tanggal}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <AccessTimeIcon fontSize="inherit" color="action" />
                                        <Typography variant="caption">
                                            {slot.jam_mulai.substring(0, 5)} - {slot.jam_selesai.substring(0, 5)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Button 
                                    size="small" 
                                    variant="contained" 
                                    fullWidth 
                                    color="primary" 
                                    onClick={() => handleOpen(slot)}
                                    sx={{ mt: 1, borderRadius: 1.5 }}
                                >
                                    Pilih Slot
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog Form Booking */}
            <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 'bold' }}>
                    {step === 1 ? 'Formulir Janji Temu' : 'Konfirmasi Janji Temu'}
                </DialogTitle>
                
                {step === 1 ? (
                    <form onSubmit={handleSubmitDraft}>
                        <DialogContent dividers>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            <Typography variant="subtitle2" color="primary" gutterBottom>
                                Dokter: {selectedSlot?.dokter_nama} ({selectedSlot?.spesialisasi})
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                Tanggal & Jam: {selectedSlot?.tanggal} @ {selectedSlot?.jam_mulai.substring(0, 5)}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                <TextField
                                    label="Nama Pasien"
                                    required
                                    fullWidth
                                    value={namaPasien}
                                    onChange={(e) => setNamaPasien(e.target.value)}
                                    size="small"
                                />
                                <TextField
                                    label="Nomor Kontak (WhatsApp)"
                                    required
                                    fullWidth
                                    value={kontak}
                                    onChange={(e) => setKontak(e.target.value)}
                                    size="small"
                                    helperText="Gunakan format internasional atau lokal (contoh: 0812xxxx)"
                                />
                                
                                <FormControl component="fieldset">
                                    <FormLabel component="legend">Metode Pembayaran</FormLabel>
                                    <RadioGroup 
                                        row 
                                        value={jenisPembayaran} 
                                        onChange={(e) => setJenisPembayaran(e.target.value)}
                                    >
                                        <FormControlLabel value="umum" control={<Radio size="small" />} label="Umum" />
                                        <FormControlLabel value="bpjs" control={<Radio size="small" />} label="BPJS" />
                                        <FormControlLabel value="asuransi" control={<Radio size="small" />} label="Asuransi" />
                                    </RadioGroup>
                                </FormControl>

                                <TextField
                                    label="Keluhan Singkat (Opsional)"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={keluhanSingkat}
                                    onChange={(e) => setKeluhanSingkat(e.target.value)}
                                    size="small"
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} disabled={loading}>Batal</Button>
                            <Button type="submit" variant="contained" disabled={loading}>
                                {loading ? <CircularProgress size={24} /> : 'Lanjut'}
                            </Button>
                        </DialogActions>
                    </form>
                ) : (
                    <DialogContent dividers>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        <Typography variant="body1" align="center" gutterBottom>
                            Anda akan mendaftar ke slot berikut:
                        </Typography>
                        
                        <Paper variant="outlined" sx={{ p: 2, my: 2, bgcolor: 'background.default' }}>
                            <Typography variant="subtitle2" fontWeight="bold">Dokter & Poli:</Typography>
                            <Typography variant="body2" gutterBottom>{selectedSlot?.dokter_nama} ({data.poli})</Typography>
                            
                            <Typography variant="subtitle2" fontWeight="bold">Jadwal:</Typography>
                            <Typography variant="body2" gutterBottom>{selectedSlot?.tanggal} ({selectedSlot?.jam_mulai.substring(0,5)} - {selectedSlot?.jam_selesai.substring(0,5)})</Typography>
                            
                            <Typography variant="subtitle2" fontWeight="bold">Nama Pasien:</Typography>
                            <Typography variant="body2" gutterBottom>{namaPasien}</Typography>

                            <Typography variant="subtitle2" fontWeight="bold">Jenis Pembayaran:</Typography>
                            <Typography variant="body2" sx={{ textTransform: 'uppercase' }}>{jenisPembayaran}</Typography>
                        </Paper>

                        <Alert severity="warning" sx={{ mt: 1 }}>
                            Slot ini hanya di-draft selama 15 menit. Silakan konfirmasi untuk mengunci pendaftaran.
                        </Alert>

                        <Box sx={{ mt: 2, display: 'flex', justifyItems: 'center', justifyContent: 'center' }}>
                            <Button 
                                variant="contained" 
                                color="success" 
                                onClick={handleConfirmBooking} 
                                disabled={loading}
                                fullWidth
                                size="large"
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Konfirmasi Pendaftaran'}
                            </Button>
                        </Box>
                    </DialogContent>
                )}
            </Dialog>
        </Box>
    );
}
