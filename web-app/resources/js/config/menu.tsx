import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArticleIcon from '@mui/icons-material/Article';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EventNoteIcon from '@mui/icons-material/EventNote';
import GroupIcon from '@mui/icons-material/Group';

export interface MenuItemConfig {
    title: string;
    icon: React.ReactNode;
    link: string;
    roles: string[];
}

export const menuConfig: MenuItemConfig[] = [
    // Superadmin Menus
    { title: 'Dashboard', icon: <DashboardIcon />, link: '/superadmin', roles: ['superadmin'] },
    { title: 'Kelola Pengguna', icon: <GroupIcon />, link: '/superadmin/users', roles: ['superadmin'] },
    { title: 'Generator Jadwal', icon: <EventNoteIcon />, link: '/superadmin/jadwal', roles: ['superadmin'] },
    
    // Admin CS Menus
    { title: 'Dashboard', icon: <DashboardIcon />, link: '/admin', roles: ['admin_cs'] },
    { title: 'Kelola Dokumen', icon: <ArticleIcon />, link: '/admin/dokumen', roles: ['admin_cs'] },
    { title: 'Kelola Aduan', icon: <ReportProblemIcon />, link: '/admin/aduan', roles: ['admin_cs'] },
    { title: 'Kelola Booking', icon: <EventNoteIcon />, link: '/admin/booking', roles: ['admin_cs'] },
];

export const getMenusByRole = (role: string) => {
    return menuConfig.filter(menu => menu.roles.includes(role));
};
