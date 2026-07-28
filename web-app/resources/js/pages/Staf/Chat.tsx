import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Box, Paper } from '@mui/material';
import AppLayout from '../../Layouts/AppLayout';
import ChatbotUI from '../ChatbotUI';

export default function Chat() {
    const { auth } = usePage().props as any;
    
    // We pass staf_id to ChatbotUI as initial metadata if supported by backend,
    // or just let the chat component handle it normally for now.
    // In ChatbotUI we can inject it into the first message or let the AI ask if needed.
    
    return (
        <AppLayout>
            <Head title="Chat Internal" />
            <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
                <Paper sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', borderRadius: 2 }}>
                    {/* Reuse the existing ChatbotUI component */}
                    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                        <ChatbotUI />
                    </Box>
                </Paper>
            </Box>
        </AppLayout>
    );
}
