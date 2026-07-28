import React from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import { 
    Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
    Toolbar, IconButton, Divider, Box 
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { getMenusByRole } from '../../config/menu';

interface SidebarProps {
    open: boolean;
    handleDrawerClose: () => void;
    drawerWidth: number;
}

export default function Sidebar({ open, handleDrawerClose, drawerWidth }: SidebarProps) {
    const { auth } = usePage().props as any;
    const userRole = auth?.user?.role || 'admin_cs';

    const handleLogout = () => {
        router.post('/logout');
    };

    const menuItems = getMenusByRole(userRole);

    return (
        <Drawer
            variant="permanent"
            open={open}
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                ...(open && {
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        transition: (theme) => theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden',
                        backgroundColor: 'background.paper',
                    },
                }),
                ...(!open && {
                    '& .MuiDrawer-paper': {
                        transition: (theme) => theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                        width: (theme) => theme.spacing(7),
                        overflowX: 'hidden',
                        backgroundColor: 'background.paper',
                    },
                }),
            }}
        >
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}
            >
                <IconButton onClick={handleDrawerClose}>
                    <ChevronLeftIcon />
                </IconButton>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ display: 'block' }}>
                        <ListItemButton
                            component={Link}
                            href={item.link}
                            sx={{
                                minHeight: 48,
                                justifyContent: open ? 'initial' : 'center',
                                px: 2.5,
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: open ? 3 : 'auto',
                                    justifyContent: 'center',
                                    color: 'primary.main',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.title} sx={{ opacity: open ? 1 : 0 }} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <List>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 3 : 'auto',
                                justifyContent: 'center',
                                color: 'error.main'
                            }}
                        >
                            <ExitToAppIcon />
                        </ListItemIcon>
                        <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0, color: 'error.main' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
}
