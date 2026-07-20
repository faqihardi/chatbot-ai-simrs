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
                                        }}
                                    >
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                            {msg.content}
                                        </Typography>
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
