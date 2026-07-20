import { createTheme, Theme } from '@mui/material/styles';

type PaletteMode = 'light' | 'dark';

export const getTheme = (mode: PaletteMode): Theme => {
    return createTheme({
        palette: {
            mode,
            ...(mode === 'light'
                ? {
                      // Light mode palette
                      primary: { main: '#16B3AC', light: '#4FC7C1', dark: '#108680', contrastText: '#0B1413' },
                      secondary: { main: '#DBD400', light: '#E8E23D', dark: '#A49F00', contrastText: '#25230A' },
                      error: { main: '#D4463A' },
                      warning: { main: '#F2A93B', contrastText: '#25230A' },
                      success: { main: '#2E9E6B' },
                      info: { main: '#3E8FD0' },
                      background: { default: '#FAFCFB', paper: '#FFFFFF' },
                      text: { primary: '#16211F', secondary: '#5C6B68' },
                      divider: '#E3E8E7',
                  }
                : {
                      // Dark mode palette
                      primary: { main: '#3FD0C6', light: '#7AE0D8', dark: '#16B3AC', contrastText: '#0B1413' },
                      secondary: { main: '#E8E23D', light: '#F0EC7A', dark: '#DBD400', contrastText: '#1A1900' },
                      error: { main: '#FF7B6C', contrastText: '#25230A' },
                      warning: { main: '#FFC163', contrastText: '#25230A' },
                      success: { main: '#4CC98F', contrastText: '#25230A' },
                      info: { main: '#6BB6F5', contrastText: '#25230A' },
                      background: { default: '#0E1615', paper: '#16211F' },
                      text: { primary: '#EAF3F1', secondary: '#9FB0AD' },
                      divider: '#2A3A37',
                  }),
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    containedPrimary: ({ theme }) => ({
                        // PENTING: Gunakan primary.dark sebagai background di Light mode untuk teks putih
                        backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.dark : theme.palette.primary.main,
                        color: '#FFFFFF',
                        '&:hover': {
                            backgroundColor: theme.palette.mode === 'light' ? '#0a635f' : theme.palette.primary.dark,
                        }
                    }),
                    containedSecondary: ({ theme }) => ({
                        // PENTING: Jangan pernah pakai teks putih di atas secondary (kuning)
                        color: theme.palette.secondary.contrastText,
                    }),
                },
            },
        },
    });
};
