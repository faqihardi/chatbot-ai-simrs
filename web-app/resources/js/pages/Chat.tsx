import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Box, 
    Paper, 
    Typography, 
    TextField, 
    IconButton, 
    List, 
    ListItem, 
    ListItemText, 
    CircularProgress, 
    Divider 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import ThemeToggleButton from '../Components/ThemeToggleButton';
import JadwalCard from '../Components/JadwalCard';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const renderMessageContent = (content: string) => {
        // Regex pattern matches
        const jadwalRegex = /<JadwalData>([\s\S]*?)<\/JadwalData>/;
        const bookingSuccessRegex = /<BookingSuccess>([\s\S]*?)<\/BookingSuccess>/;
        const appointmentsRegex = /<AppointmentsList>([\s\S]*?)<\/AppointmentsList>/;
        const complaintStatusRegex = /<ComplaintStatus>([\s\S]*?)<\/ComplaintStatus>/;
        const complaintsListRegex = /<ComplaintsList>([\s\S]*?)<\/ComplaintsList>/;

        let cleanText = content;
        let scheduleData = null;
        let bookingSuccessData = null;
        let appointmentsListData = null;
        let complaintStatusData = null;
        let complaintsListData = null;

        // 1. Check for schedules
        const jadwalMatch = content.match(jadwalRegex);
        if (jadwalMatch) {
            cleanText = cleanText.replace(jadwalRegex, '');
            try {
                scheduleData = JSON.parse(jadwalMatch[1].trim());
            } catch (e) {
                console.error("Failed to parse JadwalData JSON", e);
            }
        }

        // 2. Check for booking success
        const bookingMatch = content.match(bookingSuccessRegex);
        if (bookingMatch) {
            cleanText = cleanText.replace(bookingSuccessRegex, '');
            try {
                bookingSuccessData = JSON.parse(bookingMatch[1].trim());
            } catch (e) {
                console.error("Failed to parse BookingSuccess JSON", e);
            }
        }

        // 3. Check for appointments list
        const appointmentsMatch = content.match(appointmentsRegex);
        if (appointmentsMatch) {
            cleanText = cleanText.replace(appointmentsRegex, '');
            try {
                appointmentsListData = JSON.parse(appointmentsMatch[1].trim());
            } catch (e) {
                console.error("Failed to parse AppointmentsList JSON", e);
            }
        }

        // 4. Check for complaint status
        const complaintStatusMatch = content.match(complaintStatusRegex);
        if (complaintStatusMatch) {
            cleanText = cleanText.replace(complaintStatusRegex, '');
            try {
                complaintStatusData = JSON.parse(complaintStatusMatch[1].trim());
            } catch (e) {
                console.error("Failed to parse ComplaintStatus JSON", e);
            }
        }

        // 5. Check for complaints list
        const complaintsListMatch = content.match(complaintsListRegex);
        if (complaintsListMatch) {
            cleanText = cleanText.replace(complaintsListRegex, '');
            try {
                complaintsListData = JSON.parse(complaintsListMatch[1].trim());
            } catch (e) {
                console.error("Failed to parse ComplaintsList JSON", e);
            }
        }

        return (
            <Box>
                {cleanText.trim() && (
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: (scheduleData || bookingSuccessData || appointmentsListData || complaintStatusData || complaintsListData) ? 1.5 : 0 }}>
                        {cleanText}
                    </Typography>
                )}
                
                {scheduleData && token && (
                    <JadwalCard 
                        data={scheduleData} 
                        tokenSesi={token} 
                        onBookingSuccess={(bookingResult) => {
                            setMessages((prev) => [
                                ...prev,
                                {
                                    role: 'assistant',
                                    content: `Pendaftaran berhasil!\n\n<BookingSuccess>${JSON.stringify(bookingResult)}</BookingSuccess>`
                                }
                            ]);
                        }}
                    />
                )}

                {bookingSuccessData && (
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            borderLeft: 4, 
                            borderColor: 'success.main',
                            bgcolor: 'background.default',
                            borderRadius: 1.5,
                            mt: 1
                        }}
                    >
                        <Typography variant="subtitle2" color="success.main" fontWeight="bold" gutterBottom>
                            Konfirmasi Booking Sukses
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Nomor Booking:</Typography>
                                <Typography variant="body2" fontWeight="bold">{bookingSuccessData.nomor_booking}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.light', p: 1, borderRadius: 1, my: 1, color: 'primary.contrastText' }}>
                                <Typography variant="body2" fontWeight="bold">Nomor Antrean:</Typography>
                                <Typography variant="h5" fontWeight="black">{bookingSuccessData.nomor_antrean}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Dokter:</Typography>
                                <Typography variant="body2">{bookingSuccessData.dokter_nama}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Poli:</Typography>
                                <Typography variant="body2">{bookingSuccessData.poli_nama}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="caption" color="text.secondary">Jadwal:</Typography>
                                <Typography variant="body2">{bookingSuccessData.tanggal} @ {bookingSuccessData.jam}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                )}

                {appointmentsListData && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                        <Typography variant="subtitle2" color="primary" fontWeight="bold">
                            Daftar Janji Temu Aktif Anda
                        </Typography>
                        {appointmentsListData.bookings.map((app: any, idx: number) => (
                            <Paper 
                                key={idx} 
                                variant="outlined" 
                                sx={{ 
                                    p: 1.5, 
                                    borderRadius: 1.5,
                                    bgcolor: 'background.default',
                                    borderLeft: 4,
                                    borderColor: app.status === 'terjadwal' ? 'info.main' : 'text.disabled'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight="bold" color="primary">{app.dokter_nama}</Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            px: 1, 
                                            py: 0.2, 
                                            borderRadius: 1, 
                                            bgcolor: app.status === 'terjadwal' ? 'info.light' : 'action.disabledBackground',
                                            color: app.status === 'terjadwal' ? 'info.contrastText' : 'text.secondary',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {app.status}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block">Poli: {app.poli_nama}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block">Jadwal: {app.tanggal} @ {app.jam}</Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, borderTop: 1, pt: 0.5, borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary">No. Booking: {app.nomor_booking}</Typography>
                                    {app.nomor_antrean && (
                                        <Typography variant="caption" fontWeight="bold">Antrean: {app.nomor_antrean}</Typography>
                                    )}
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                )}

                {complaintStatusData && (
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 2, 
                            borderLeft: 4, 
                            borderColor: complaintStatusData.aduan.status === 'selesai' ? 'success.main' : 'warning.main',
                            bgcolor: 'background.default',
                            borderRadius: 1.5,
                            mt: 1
                        }}
                    >
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Status Tiket Aduan: <Typography component="span" fontWeight="bold" color="text.primary">{complaintStatusData.aduan.nomor_tiket}</Typography>
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">Status:</Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>{complaintStatusData.aduan.status}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">Kategori:</Typography>
                            <Typography variant="body2">{complaintStatusData.aduan.kategori}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">Urgensi:</Typography>
                            <Typography variant="body2">{complaintStatusData.aduan.urgensi}</Typography>
                        </Box>
                        {complaintStatusData.aduan.tanggapan && (
                            <Box sx={{ mt: 1.5, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="caption" fontWeight="bold" display="block">Tanggapan Petugas:</Typography>
                                <Typography variant="body2">{complaintStatusData.aduan.tanggapan}</Typography>
                            </Box>
                        )}
                    </Paper>
                )}

                {complaintsListData && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                        <Typography variant="subtitle2" color="primary" fontWeight="bold">
                            Daftar Riwayat Aduan Anda
                        </Typography>
                        {complaintsListData.aduans.map((ad: any, idx: number) => (
                            <Paper 
                                key={idx} 
                                variant="outlined" 
                                sx={{ 
                                    p: 1.5, 
                                    borderRadius: 1.5,
                                    bgcolor: 'background.default',
                                    borderLeft: 4,
                                    borderColor: ad.status === 'selesai' ? 'success.main' : (ad.status === 'ditolak' ? 'error.main' : 'warning.main')
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2" fontWeight="bold">Tiket: {ad.nomor_tiket}</Typography>
                                    <Typography 
                                        variant="caption" 
                                        sx={{ 
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold',
                                            color: ad.status === 'selesai' ? 'success.main' : (ad.status === 'ditolak' ? 'error.main' : 'warning.main')
                                        }}
                                    >
                                        {ad.status}
                                    </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" display="block">Kategori: {ad.kategori}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block">Dibuat: {ad.created_at}</Typography>
                            </Paper>
                        ))}
                    </Box>
                )}
            </Box>
        );
    };

    // Initialize session token
    useEffect(() => {
        const initSession = async () => {
            let savedToken = localStorage.getItem('simrs_session_token');
            if (!savedToken) {
                try {
                    const response = await axios.post('/api/chat/session');
                    savedToken = response.data.token_sesi;
                    if (savedToken) {
                        localStorage.setItem('simrs_session_token', savedToken);
                    }
                } catch (error) {
                    console.error("Failed to create chat session:", error);
                }
            }
            setToken(savedToken);
            
            // Welcome message
            setMessages([
                { role: 'assistant', content: 'Halo! Saya asisten virtual RS Techno Medic. Ada yang bisa saya bantu terkait jadwal, pendaftaran, atau layanan kami?' }
            ]);
        };

        initSession();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !token) return;

        const userMessage: Message = { role: 'user', content: input };
        
        // Simpan hanya N pesan terakhir (misal 6 terakhir) untuk konteks backend
        const history = messages.slice(-6);
        
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('/api/chat/message', {
                token_sesi: token,
                message: userMessage.content,
                history: history
            });

            const botMessage: Message = { role: 'assistant', content: response.data.reply };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Maaf, terjadi kesalahan pada server atau sesi Anda kadaluarsa. Silakan muat ulang halaman.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Box sx={{ 
            height: '100vh', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            bgcolor: 'background.default',
            p: 2 
        }}>
            <Paper 
                elevation={3} 
                sx={{ 
                    width: '100%', 
                    maxWidth: 600, 
                    height: '90vh', 
                    display: 'flex', 
                    flexDirection: 'column',
                    overflow: 'hidden',
                    borderRadius: 3
                }}
            >
                {/* Header */}
                <Box sx={{ 
                    p: 2, 
                    bgcolor: 'primary.main', 
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SmartToyIcon />
                        <Typography variant="h6" fontWeight="bold">
                            CS RS Techno Medic
                        </Typography>
                    </Box>
                    <ThemeToggleButton />
                </Box>
                <Divider />

                {/* Chat Area */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'background.paper' }}>
                    <List>
                        {messages.map((msg, index) => (
                            <ListItem 
                                key={index} 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    mb: 1 
                                }}
                            >
                                <Box sx={{ 
                                    maxWidth: '80%', 
                                    display: 'flex', 
                                    alignItems: 'flex-start',
                                    gap: 1,
                                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                                }}>
                                    {/* Icon Profil */}
                                    <Box sx={{ 
                                        bgcolor: msg.role === 'user' ? 'secondary.main' : 'primary.light',
                                        color: msg.role === 'user' ? 'secondary.contrastText' : 'primary.contrastText',
                                        borderRadius: '50%',
                                        p: 1,
                                        display: 'flex'
                                    }}>
                                        {msg.role === 'user' ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                                    </Box>
                                    
                                    {/* Bubble Text */}
                                    <Paper 
                                        elevation={1} 
                                        sx={{ 
                                            p: 1.5, 
                                            bgcolor: msg.role === 'user' ? 'primary.main' : 'background.default',
                                            color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                                            borderRadius: 2,
                                            borderTopRightRadius: msg.role === 'user' ? 0 : 8,
                                            borderTopLeftRadius: msg.role === 'assistant' ? 0 : 8,
                                            minWidth: (msg.content.includes('<JadwalData>') || msg.content.includes('<BookingSuccess>') || msg.content.includes('<AppointmentsList>')) ? '320px' : 'auto'
                                        }}
                                    >
                                        {renderMessageContent(msg.content)}
                                    </Paper>
                                </Box>
                            </ListItem>
                        ))}
                        {loading && (
                            <ListItem sx={{ justifyContent: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={20} />
                                    <Typography variant="body2" color="text.secondary">AI sedang mengetik...</Typography>
                                </Box>
                            </ListItem>
                        )}
                        <div ref={messagesEndRef} />
                    </List>
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Ketik pertanyaan Anda..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading || !token}
                            size="small"
                            multiline
                            maxRows={3}
                        />
                        <IconButton 
                            color="primary" 
                            onClick={handleSend} 
                            disabled={loading || !input.trim() || !token}
                            sx={{ 
                                bgcolor: 'primary.main', 
                                color: 'primary.contrastText',
                                '&:hover': { bgcolor: 'primary.dark' }
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}
