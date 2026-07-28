import React, { useState } from 'react';
import { Box, CssBaseline } from '@mui/material';
import Topbar from '../components/Layout/Topbar';
import Sidebar from '../components/Layout/Sidebar';

const drawerWidth = 240;

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const [open, setOpen] = useState(true);

    const handleDrawerOpen = () => setOpen(true);
    const handleDrawerClose = () => setOpen(false);

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            
            <Topbar 
                open={open} 
                handleDrawerOpen={handleDrawerOpen} 
                drawerWidth={drawerWidth} 
            />

            <Sidebar 
                open={open} 
                handleDrawerClose={handleDrawerClose} 
                drawerWidth={drawerWidth} 
            />

            {/* Content Area */}
            <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10, minHeight: '100vh', backgroundColor: 'background.default' }}>
                {children}
            </Box>
        </Box>
    );
}
