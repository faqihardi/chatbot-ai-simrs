import React from 'react';
import { IconButton, Tooltip, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeMode } from '../context/ThemeModeContext';

export default function ThemeToggleButton() {
    const { mode, toggleMode } = useThemeMode();
    const theme = useTheme();

    return (
        <Tooltip title={mode === 'dark' ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}>
            <IconButton onClick={toggleMode} color="inherit" aria-label="toggle theme">
                {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
        </Tooltip>
    );
}
