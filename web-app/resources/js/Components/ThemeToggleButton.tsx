import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeMode } from '../context/ThemeModeContext';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ThemeToggleButton() {
    const { mode, toggleMode } = useThemeMode();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleMode} className="rounded-full">
                        {mode === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{mode === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
