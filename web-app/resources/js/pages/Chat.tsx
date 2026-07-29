import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { usePage, Head } from '@inertiajs/react';
import { Send, Bot, User, Mic, Square, Loader2, CalendarDays, Clock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import ThemeToggleButton from '../Components/ThemeToggleButton';
import JadwalCard from '../Components/JadwalCard';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatProps {
    embedded?: boolean;
}

export default function Chat({ embedded = false }: ChatProps) {
    const { auth } = usePage().props as any;
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const renderMessageContent = (content: string) => {
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

        const jadwalMatch = content.match(jadwalRegex);
        if (jadwalMatch) {
            cleanText = cleanText.replace(jadwalRegex, '');
            try { scheduleData = JSON.parse(jadwalMatch[1].trim()); } catch (e) { console.error(e); }
        }

        const bookingMatch = content.match(bookingSuccessRegex);
        if (bookingMatch) {
            cleanText = cleanText.replace(bookingSuccessRegex, '');
            try { bookingSuccessData = JSON.parse(bookingMatch[1].trim()); } catch (e) { console.error(e); }
        }

        const appointmentsMatch = content.match(appointmentsRegex);
        if (appointmentsMatch) {
            cleanText = cleanText.replace(appointmentsRegex, '');
            try { appointmentsListData = JSON.parse(appointmentsMatch[1].trim()); } catch (e) { console.error(e); }
        }

        const complaintStatusMatch = content.match(complaintStatusRegex);
        if (complaintStatusMatch) {
            cleanText = cleanText.replace(complaintStatusRegex, '');
            try { complaintStatusData = JSON.parse(complaintStatusMatch[1].trim()); } catch (e) { console.error(e); }
        }

        const complaintsListMatch = content.match(complaintsListRegex);
        if (complaintsListMatch) {
            cleanText = cleanText.replace(complaintsListRegex, '');
            try { complaintsListData = JSON.parse(complaintsListMatch[1].trim()); } catch (e) { console.error(e); }
        }

        return (
            <div className="flex flex-col gap-2">
                {cleanText.trim() && (
                    <p className="whitespace-pre-line text-sm leading-relaxed">{cleanText}</p>
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
                    <Card className="border-l-4 border-l-green-500 bg-green-50/50 dark:bg-green-950/20 mt-2">
                        <CardHeader className="pb-2 pt-4 px-4">
                            <CardTitle className="text-green-700 dark:text-green-400 text-sm font-bold">
                                Konfirmasi Booking Sukses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Nomor Booking:</span>
                                <span className="font-bold">{bookingSuccessData.nomor_booking}</span>
                            </div>
                            <div className="flex justify-between items-center bg-green-100 dark:bg-green-900/40 p-2 rounded-md my-2 text-green-900 dark:text-green-100">
                                <span className="font-bold">Nomor Antrean:</span>
                                <span className="text-xl font-black">{bookingSuccessData.nomor_antrean}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Dokter:</span>
                                <span>{bookingSuccessData.dokter_nama}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Poli:</span>
                                <span>{bookingSuccessData.poli_nama}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Jadwal:</span>
                                <span>{bookingSuccessData.tanggal} @ {bookingSuccessData.jam}</span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {appointmentsListData && (
                    <div className="flex flex-col gap-2 mt-2">
                        <span className="text-sm font-bold text-primary">Daftar Janji Temu Aktif Anda</span>
                        {appointmentsListData.bookings.map((app: any, idx: number) => (
                            <Card key={idx} className={`border-l-4 ${app.status === 'terjadwal' ? 'border-l-blue-500' : 'border-l-gray-400'}`}>
                                <CardContent className="p-3 text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold text-primary">{app.dokter_nama}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${app.status === 'terjadwal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <span className="block text-muted-foreground">Poli: {app.poli_nama}</span>
                                    <span className="block text-muted-foreground">Jadwal: {app.tanggal} @ {app.jam}</span>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">No. Booking: {app.nomor_booking}</span>
                                        {app.nomor_antrean && <span className="font-bold">Antrean: {app.nomor_antrean}</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {complaintStatusData && (
                    <Card className={`border-l-4 mt-2 ${complaintStatusData.aduan.status === 'selesai' ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
                        <CardContent className="p-3 text-sm">
                            <span className="block text-muted-foreground mb-2">
                                Status Tiket Aduan: <span className="font-bold text-foreground">{complaintStatusData.aduan.nomor_tiket}</span>
                            </span>
                            <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-bold uppercase">{complaintStatusData.aduan.status}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Kategori:</span>
                                <span>{complaintStatusData.aduan.kategori}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span className="text-muted-foreground">Urgensi:</span>
                                <span>{complaintStatusData.aduan.urgensi}</span>
                            </div>
                            {complaintStatusData.aduan.tanggapan && (
                                <div className="mt-2 p-2 bg-muted rounded-md">
                                    <span className="block font-bold mb-1">Tanggapan Petugas:</span>
                                    <span>{complaintStatusData.aduan.tanggapan}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {complaintsListData && (
                    <div className="flex flex-col gap-2 mt-2">
                        <span className="text-sm font-bold text-primary">Daftar Riwayat Aduan Anda</span>
                        {complaintsListData.aduans.map((ad: any, idx: number) => (
                            <Card key={idx} className={`border-l-4 ${ad.status === 'selesai' ? 'border-l-green-500' : ad.status === 'ditolak' ? 'border-l-red-500' : 'border-l-yellow-500'}`}>
                                <CardContent className="p-3 text-sm">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold">Tiket: {ad.nomor_tiket}</span>
                                        <span className={`text-xs font-bold uppercase ${ad.status === 'selesai' ? 'text-green-600' : ad.status === 'ditolak' ? 'text-red-600' : 'text-yellow-600'}`}>
                                            {ad.status}
                                        </span>
                                    </div>
                                    <span className="block text-muted-foreground">Kategori: {ad.kategori}</span>
                                    <span className="block text-muted-foreground">Dibuat: {ad.created_at}</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    };

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

            let initialMessages: Message[] = [
                { role: 'assistant', content: 'Halo! Saya asisten virtual RS Techno Medic. Ada yang bisa saya bantu terkait jadwal, pendaftaran, atau layanan kami?' }
            ];

            if (savedToken) {
                try {
                    const dataRes = await axios.get(`/api/chat/session/data?token_sesi=${savedToken}`);
                    if (dataRes.data && dataRes.data.success) {
                        const { bookings, aduans } = dataRes.data;
                        let contextMsg = "";

                        if (bookings.length > 0) {
                            contextMsg += `\n\n<AppointmentsList>${JSON.stringify({ bookings })}</AppointmentsList>`;
                        }
                        if (aduans.length > 0) {
                            contextMsg += `\n\n<ComplaintsList>${JSON.stringify({ aduans })}</ComplaintsList>`;
                        }

                        if (contextMsg !== "") {
                            initialMessages.push({
                                role: 'assistant',
                                content: `Selamat datang kembali! Berikut adalah data aktif Anda saat ini:${contextMsg}`
                            });
                        }
                    }
                } catch (err) {
                    console.error("Failed to load session data:", err);
                }
            }

            setMessages(initialMessages);
        };

        const savedMessages = sessionStorage.getItem('simrs_chat_messages');
        if (savedMessages) {
            try {
                const parsedMessages = JSON.parse(savedMessages);
                if (parsedMessages.length > 0) {
                    const savedToken = localStorage.getItem('simrs_session_token');
                    setToken(savedToken);
                    setMessages(parsedMessages);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse saved messages", e);
            }
        }
        
        initSession();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('simrs_chat_messages', JSON.stringify(messages));
        }
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || !token) return;

        const userMessage: Message = { role: 'user', content: input };
        const history = messages.slice(-6);

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post('/api/chat/message', {
                token_sesi: token,
                message: userMessage.content,
                history: history,
                user_role: auth?.user?.role || 'publik'
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

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
        } else {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Maaf, browser Anda tidak mendukung fitur input suara.");
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.lang = 'id-ID';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsRecording(true);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput((prev) => (prev ? prev + ' ' : '') + transcript);
            };
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error:", event.error);
                setIsRecording(false);
            };
            recognition.onend = () => setIsRecording(false);

            recognitionRef.current = recognition;
            recognition.start();
        }
    };

    return (
        <div className={`flex flex-col bg-background ${embedded ? 'h-full w-full' : 'h-screen items-center justify-center p-4 md:p-6'}`}>
            <Head title="Chat" />
            <Card className={`flex flex-col overflow-hidden w-full ${embedded ? 'h-full border-none shadow-none rounded-none' : 'max-w-2xl h-[90vh] shadow-lg border rounded-xl'}`}>
                
                {!embedded && (
                    <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
                        <div className="flex items-center gap-2">
                            <Bot className="h-6 w-6" />
                            <h2 className="font-bold text-lg">CS RS Techno Medic</h2>
                        </div>
                        <ThemeToggleButton />
                    </div>
                )}
                {!embedded && <Separator />}

                <ScrollArea className="flex-1 p-4 bg-muted/20">
                    <div className="flex flex-col gap-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-start gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm ${msg.role === 'user' ? 'bg-secondary text-secondary-foreground' : 'bg-primary text-primary-foreground'}`}>
                                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={`rounded-2xl px-4 py-3 shadow-sm border text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground border-transparent rounded-tr-sm' : 'bg-background text-foreground border-border rounded-tl-sm'}`}>
                                        {renderMessageContent(msg.content)}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    <span>AI sedang mengetik...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                <div className="p-3 bg-background border-t">
                    <div className="flex gap-2 items-center">
                        <Input
                            className="flex-1"
                            placeholder={isRecording ? "Sedang mendengarkan..." : "Ketik pertanyaan Anda..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            disabled={loading || !token}
                        />
                        <Button
                            variant={isRecording ? "destructive" : "secondary"}
                            size="icon"
                            onClick={toggleRecording}
                            disabled={loading || !token}
                            className="shrink-0"
                        >
                            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        </Button>
                        <Button
                            size="icon"
                            onClick={handleSend}
                            disabled={loading || !input.trim() || !token}
                            className="shrink-0"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
