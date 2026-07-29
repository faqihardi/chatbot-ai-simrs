import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        const initialMode = savedMode === 'light' || savedMode === 'dark' 
            ? savedMode 
            : (prefersDark ? 'dark' : 'light');
            
        setMode(initialMode);
        
        if (initialMode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        setMounted(true);
    }, []);

    const toggleMode = () => {
        setMode((prev) => {
            const newMode = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('simrs-theme-mode', newMode);
            
            if (newMode === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            
            return newMode;
        });
    };

    if (!mounted) {
        return null;
    }

    return (
        <ThemeModeContext.Provider value={{ mode, toggleMode }}>
            {children}
        </ThemeModeContext.Provider>
    );
};
