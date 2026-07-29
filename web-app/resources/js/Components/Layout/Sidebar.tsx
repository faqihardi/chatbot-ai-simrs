import React from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import { LogOut, SquareTerminal } from 'lucide-react';
import { getMenusByRole } from '../../config/menu';
import {
    Sidebar as ShadcnSidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';

export default function Sidebar() {
    const { props, url } = usePage() as any;
    const auth = props.auth;
    const userRole = auth?.user?.role || 'admin_cs';
    const { state } = useSidebar();
    
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        sessionStorage.removeItem('simrs_chat_messages');
        router.post('/logout');
    };

    const menuItems = getMenusByRole(userRole);

    const roleTitles: Record<string, string> = {
        'staf': 'SIMRS Staf',
        'admin_cs': 'SIMRS Admin CS',
        'superadmin': 'SIMRS Superadmin',
    };
    const sidebarTitle = roleTitles[userRole] || 'SIMRS Portal';

    return (
        <ShadcnSidebar variant="inset" collapsible="icon" className="border-r border-border">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" className="w-full justify-start hover:bg-transparent">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <span className="text-xs font-bold font-mono">RM</span>
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold text-foreground tracking-tight">{sidebarTitle}</span>
                                <span className="text-xs text-muted-foreground">{userRole}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item, index) => {
                                // Strict match for base dashboard URLs to prevent matching subpaths like /admin/dokumen
                                const isDashboard = item.link === '/admin' || item.link === '/superadmin';
                                const isActive = isDashboard ? url === item.link : (url?.startsWith(item.link) || false);
                                
                                // The icon from config might be a MUI icon component.
                                return (
                                    <SidebarMenuItem key={index}>
                                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                                            <Link href={item.link} className="flex items-center gap-3">
                                                <span className={isActive ? "text-primary" : "text-muted-foreground"}>
                                                    {item.icon}
                                                </span>
                                                <span className={isActive ? "font-medium text-foreground" : ""}>
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton onClick={handleLogout} tooltip="Logout" className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <LogOut className="size-4" />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </ShadcnSidebar>
    );
}
