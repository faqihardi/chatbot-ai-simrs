import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import { 
    AppBar, Toolbar, IconButton, Typography, Box, Avatar, Menu, MenuItem, ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { useThemeMode } from '../../context/ThemeModeContext';

interface TopbarProps {
    open: boolean;
    handleDrawerOpen: () => void;
    drawerWidth: number;
}

export default function Topbar({ open, handleDrawerOpen, drawerWidth }: TopbarProps) {
    const { auth } = usePage().props as any;
    const { mode, toggleMode } = useThemeMode();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <AppBar 
            position="fixed" 
            sx={{ 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                transition: (theme) => theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                ...(open && {
                    marginLeft: drawerWidth,
                    width: `calc(100% - ${drawerWidth}px)`,
                    transition: (theme) => theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }),
                backgroundColor: mode === 'light' ? 'primary.main' : 'background.paper',
                color: mode === 'light' ? '#fff' : 'text.primary',
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{ mr: 2, ...(open && { display: 'none' }) }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    SIMRS Chatbot Admin
                </Typography>

                <IconButton color="inherit" onClick={toggleMode} sx={{ mr: 2 }}>
                    {mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleMenuOpen}>
                    <Typography variant="body1" sx={{ mr: 1, display: { xs: 'none', sm: 'block' } }}>
                        {auth?.user?.name || 'User'}
                    </Typography>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                        {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                </Box>
                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <ExitToAppIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <Typography color="error">Logout</Typography>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}
