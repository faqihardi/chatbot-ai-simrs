import React from 'react';
import { LayoutDashboard, FileText, AlertTriangle, CalendarDays, Users, MessageSquare } from 'lucide-react';

export interface MenuItemConfig {
    title: string;
    icon: React.ReactNode;
    link: string;
    roles: string[];
}

export const menuConfig: MenuItemConfig[] = [
    // Dashboards
    { title: 'Dashboard', icon: <LayoutDashboard className="size-4" />, link: '/admin', roles: ['admin_cs'] },
    { title: 'Dashboard', icon: <LayoutDashboard className="size-4" />, link: '/superadmin', roles: ['superadmin'] },

    // Admin CS Menus (Inherited by Superadmin except Dashboard)
    { title: 'Dokumen', icon: <FileText className="size-4" />, link: '/admin/dokumen', roles: ['admin_cs', 'superadmin'] },
    { title: 'Aduan', icon: <AlertTriangle className="size-4" />, link: '/admin/aduan', roles: ['admin_cs', 'superadmin'] },
    { title: 'Booking', icon: <CalendarDays className="size-4" />, link: '/admin/booking', roles: ['admin_cs', 'superadmin'] },
    { title: 'Log Gagal', icon: <AlertTriangle className="size-4" />, link: '/admin/log-gagal', roles: ['admin_cs', 'superadmin'] },
    
    // Superadmin Specific Menus
    { title: 'Users', icon: <Users className="size-4" />, link: '/superadmin/users', roles: ['superadmin'] },
    { title: 'Poli', icon: <FileText className="size-4" />, link: '/superadmin/poli', roles: ['superadmin'] },
    { title: 'Dokter', icon: <Users className="size-4" />, link: '/superadmin/dokter', roles: ['superadmin'] },
    { title: 'Gen.Slot', icon: <CalendarDays className="size-4" />, link: '/superadmin/jadwal-slot/generate', roles: ['superadmin'] },
    { title: 'Monitor', icon: <AlertTriangle className="size-4" />, link: '/superadmin/monitor', roles: ['superadmin'] },
    
    // Staf Menus
    { title: 'Chat', icon: <MessageSquare className="size-4" />, link: '/staf/chat', roles: ['staf'] },
    { title: 'Riwayat Aduan Saya', icon: <FileText className="size-4" />, link: '/staf/riwayat-aduan', roles: ['staf'] },
];

export const getMenusByRole = (role: string) => {
    return menuConfig.filter(menu => menu.roles.includes(role));
};
