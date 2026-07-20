import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../theme';

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    mode: ThemeMode;
    toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
    const context = useContext(ThemeModeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeModeProvider');
    }
    return context;
};

interface ProviderProps {
    children: ReactNode;
}

export const ThemeModeProvider: React.FC<ProviderProps> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const savedMode = localStorage.getItem('simrs-theme-mode') as ThemeMode;
        if (savedMode === 'light' || savedMode === 'dark') {
            setMode(savedMode);
        } else {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setMode(prefersDark ? 'dark' : 'light');
        }
        setMounted(true);
    }, []);

    const toggleMode = () => {
        setMode((prev) => {
            const newMode = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('simrs-theme-mode', newMode);
            return newMode;
        });
    };

    const theme = useMemo(() => getTheme(mode), [mode]);

    // Handle hydration mismatch
    if (!mounted) {
        return null;
    }

    return (
        <ThemeModeContext.Provider value={{ mode, toggleMode }}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ThemeModeContext.Provider>
    );
};
