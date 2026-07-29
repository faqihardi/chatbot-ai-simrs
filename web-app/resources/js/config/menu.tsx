import React from 'react';
import { LayoutDashboard, FileText, AlertTriangle, CalendarDays, Users, MessageSquare } from 'lucide-react';

export interface MenuItemConfig {
    title: string;
    icon: React.ReactNode;
    link: string;
    roles: string[];
}

export const menuConfig: MenuItemConfig[] = [
    // Superadmin Menus
    { title: 'Dashboard', icon: <LayoutDashboard className="size-4" />, link: '/superadmin', roles: ['superadmin'] },
    { title: 'Kelola Pengguna', icon: <Users className="size-4" />, link: '/superadmin/users', roles: ['superadmin'] },
    { title: 'Generator Jadwal', icon: <CalendarDays className="size-4" />, link: '/superadmin/jadwal', roles: ['superadmin'] },
    
    // Admin CS Menus
    { title: 'Dashboard', icon: <LayoutDashboard className="size-4" />, link: '/admin', roles: ['admin_cs'] },
    { title: 'Kelola Dokumen', icon: <FileText className="size-4" />, link: '/admin/dokumen', roles: ['admin_cs'] },
    { title: 'Kelola Aduan', icon: <AlertTriangle className="size-4" />, link: '/admin/aduan', roles: ['admin_cs'] },
    { title: 'Kelola Booking', icon: <CalendarDays className="size-4" />, link: '/admin/booking', roles: ['admin_cs'] },
    
    // Staf Menus
    { title: 'Chat', icon: <MessageSquare className="size-4" />, link: '/staf/chat', roles: ['staf'] },
    { title: 'Riwayat Aduan Saya', icon: <FileText className="size-4" />, link: '/staf/riwayat-aduan', roles: ['staf'] },
];

export const getMenusByRole = (role: string) => {
    return menuConfig.filter(menu => menu.roles.includes(role));
};
