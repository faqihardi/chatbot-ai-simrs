import React from 'react';
import { usePage, router } from '@inertiajs/react';
import { Moon, Sun, Menu, User, LogOut } from 'lucide-react';
import { useThemeMode } from '../../context/ThemeModeContext';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function Topbar() {
    const { auth } = usePage().props as any;
    const { mode, toggleMode } = useThemeMode();
    const { state } = useSidebar();
    
    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        router.post('/logout');
    };

    return (
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-4 border-b bg-background px-4 sm:px-6">
            <Tooltip>
                <TooltipTrigger asChild>
                    <div>
                        <SidebarTrigger className="-ml-1" />
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                    <p>Toggle Sidebar</p>
                </TooltipContent>
            </Tooltip>
            
            {/* Logo Placeholder - visible mostly on small screens or when sidebar is closed */}
            <div className={`flex items-center transition-opacity ${state === 'expanded' ? 'hidden sm:flex sm:opacity-0 w-0' : 'opacity-100 mr-2'}`}>
                <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="8" fill="currentColor" fillOpacity="0.2"/>
                    <path d="M16 8L24 24H8L16 8Z" fill="currentColor"/>
                </svg>
                <span className="ml-2 font-bold hidden sm:block">SIMRS</span>
            </div>

            <div className="flex-1">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem className="hidden sm:block">
                            <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden sm:block" />
                        <BreadcrumbItem>
                            <BreadcrumbPage className="capitalize">
                                {typeof window !== 'undefined' ? window.location.pathname.split('/').filter(x => x).pop() || 'Home' : 'Home'}
                            </BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
            
            <div className="flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={toggleMode}>
                            {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                        <p>Ganti Tema</p>
                    </TooltipContent>
                </Tooltip>

                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary/10 text-primary">
                                            {auth?.user?.name ? auth.user.name.charAt(0).toUpperCase() : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Profil Saya</p>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuItem className="flex-col items-start">
                            <div className="text-sm font-medium">{auth?.user?.name || 'User'}</div>
                            <div className="text-xs text-muted-foreground">{auth?.user?.email || 'user@example.com'}</div>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
