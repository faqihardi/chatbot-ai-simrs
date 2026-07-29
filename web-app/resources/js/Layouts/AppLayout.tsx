import React from 'react';
import Topbar from '../Components/Layout/Topbar';
import Sidebar from '../Components/Layout/Sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    return (
        <SidebarProvider>
            <Sidebar />
            <SidebarInset className="flex flex-col flex-1 h-screen w-full overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-6 w-full">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
