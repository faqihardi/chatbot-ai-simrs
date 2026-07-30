import React, { useState } from 'react';
import axios from 'axios';
import { CalendarDays, Clock, Stethoscope, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface BookingSuccessData {
    nomor_booking: string;
    nomor_antrean: string | null;
    nama_pasien: string;
    tipe_pasien: string;
    dokter: string;
    poli: string;
    jadwal: string;
}

interface JadwalCardProps {
    data: JadwalDataPayload;
    tokenSesi: string;
    onBookingSuccess: (bookingData: BookingSuccessData) => void;
}

export default function JadwalCard({ data, tokenSesi, onBookingSuccess }: JadwalCardProps) {
    const [open, setOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                onBookingSuccess({
                    nomor_booking: response.data.nomor_booking,
                    nomor_antrean: response.data.nomor_antrean,
                    nama_pasien: namaPasien,
                    tipe_pasien: jenisPembayaran,
                    dokter: selectedSlot?.dokter_nama || '',
                    poli: data.poli,
                    jadwal: `${selectedSlot?.tanggal} ${selectedSlot?.jam_mulai.substring(0, 5)}`
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
        <div className="w-full my-2 relative">
            <h3 className="flex items-center gap-2 text-primary font-bold mb-2">
                <Stethoscope className="h-4 w-4" /> Jadwal Dokter Tersedia - Poli {data.poli}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.slots.map((slot) => (
                    <Card key={slot.slot_id} className="hover:border-primary transition-all duration-200 shadow-none bg-background">
                        <CardContent className="p-4 flex flex-col gap-1">
                            <span className="font-bold text-foreground">{slot.dokter_nama}</span>
                            <span className="text-xs text-muted-foreground">{slot.spesialisasi}</span>
                            
                            <div className="flex gap-4 my-2 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <CalendarDays className="h-3 w-3" />
                                    <span>{slot.tanggal}</span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{slot.jam_mulai.substring(0, 5)} - {slot.jam_selesai.substring(0, 5)}</span>
                                </div>
                            </div>

                            <Button 
                                size="sm" 
                                className="w-full mt-2" 
                                onClick={() => handleOpen(slot)}
                            >
                                Pilih Slot
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <Card className="w-full max-w-md shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-primary text-primary-foreground p-4 flex justify-between items-center shrink-0">
                            <h2 className="font-bold">
                                {step === 1 ? 'Formulir Janji Temu' : 'Konfirmasi Janji Temu'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={handleClose} disabled={loading} className="hover:bg-primary-foreground/20 rounded-full h-8 w-8">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        
                        <div className="p-4 overflow-y-auto">
                            {error && (
                                <div className="mb-4 p-3 bg-destructive/15 text-destructive rounded-md text-sm border border-destructive/20">
                                    {error}
                                </div>
                            )}

                            {step === 1 ? (
                                <form onSubmit={handleSubmitDraft} className="flex flex-col gap-4">
                                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                                        <div className="font-bold text-primary">Dokter: {selectedSlot?.dokter_nama}</div>
                                        <div className="text-muted-foreground mt-1">Tanggal & Jam: {selectedSlot?.tanggal} @ {selectedSlot?.jam_mulai.substring(0, 5)}</div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="nama">Nama Pasien</Label>
                                        <Input id="nama" required value={namaPasien} onChange={(e) => setNamaPasien(e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="kontak">Nomor Kontak (WhatsApp)</Label>
                                        <Input id="kontak" required value={kontak} onChange={(e) => setKontak(e.target.value)} placeholder="0812xxxx" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Metode Pembayaran</Label>
                                        <div className="flex gap-4 items-center">
                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input type="radio" name="pay" value="umum" checked={jenisPembayaran === 'umum'} onChange={(e) => setJenisPembayaran(e.target.value)} className="accent-primary" /> Umum
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input type="radio" name="pay" value="bpjs" checked={jenisPembayaran === 'bpjs'} onChange={(e) => setJenisPembayaran(e.target.value)} className="accent-primary" /> BPJS
                                            </label>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                                <input type="radio" name="pay" value="asuransi" checked={jenisPembayaran === 'asuransi'} onChange={(e) => setJenisPembayaran(e.target.value)} className="accent-primary" /> Asuransi
                                            </label>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="keluhan">Keluhan Singkat (Opsional)</Label>
                                        <textarea 
                                            id="keluhan" 
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={keluhanSingkat} 
                                            onChange={(e) => setKeluhanSingkat(e.target.value)} 
                                        />
                                    </div>

                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>Batal</Button>
                                        <Button type="submit" disabled={loading}>
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lanjut'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col gap-4 text-sm">
                                    <p className="text-center text-muted-foreground">Anda akan mendaftar ke slot berikut:</p>
                                    
                                    <div className="border rounded-md p-4 space-y-3 bg-muted/20">
                                        <div>
                                            <span className="font-bold block text-xs uppercase text-muted-foreground">Dokter & Poli</span>
                                            <span>{selectedSlot?.dokter_nama} ({data.poli})</span>
                                        </div>
                                        <div>
                                            <span className="font-bold block text-xs uppercase text-muted-foreground">Jadwal</span>
                                            <span>{selectedSlot?.tanggal} ({selectedSlot?.jam_mulai.substring(0,5)} - {selectedSlot?.jam_selesai.substring(0,5)})</span>
                                        </div>
                                        <div>
                                            <span className="font-bold block text-xs uppercase text-muted-foreground">Nama Pasien</span>
                                            <span>{namaPasien}</span>
                                        </div>
                                        <div>
                                            <span className="font-bold block text-xs uppercase text-muted-foreground">Pembayaran</span>
                                            <span className="uppercase">{jenisPembayaran}</span>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400 rounded-md text-xs border border-yellow-200 dark:border-yellow-900">
                                        Slot ini hanya di-draft selama 15 menit. Silakan konfirmasi untuk mengunci pendaftaran.
                                    </div>

                                    <Button 
                                        className="w-full mt-2" 
                                        onClick={handleConfirmBooking} 
                                        disabled={loading}
                                        variant="default"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Konfirmasi Pendaftaran'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
