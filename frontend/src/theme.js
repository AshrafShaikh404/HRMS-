import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        // GXON-like cool SaaS palette
        primary: {
            main: '#2563EB', // indigo / blue
            light: '#60A5FA',
            dark: '#1D4ED8',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0EA5E9', // cyan accent
            light: '#38BDF8',
            dark: '#0284C7',
            contrastText: '#ffffff',
        },
        success: {
            main: '#22C55E',
            light: '#4ADE80',
            dark: '#16A34A',
        },
        warning: {
            main: '#F97316',
            light: '#FDBA74',
            dark: '#EA580C',
        },
        error: {
            main: '#EF4444',
            light: '#FCA5A5',
            dark: '#B91C1C',
        },
        info: {
            main: '#0EA5E9',
            light: '#38BDF8',
            dark: '#0369A1',
        },
        purple: {
            main: '#6366F1',
            light: '#A5B4FC',
            dark: '#4F46E5',
        },
        background: {
            default: '#F6F7FB',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#0F172A',
            secondary: '#6B7280',
        },
        divider: '#E5E7EB',
    },
    typography: {
        fontFamily: '"Inter", "Poppins", "Roboto", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' },
        h2: { fontSize: '2.125rem', fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.01em' },
        h4: { fontSize: '1.50rem', fontWeight: 700, letterSpacing: '-0.01em' },
        h5: { fontSize: '1.25rem', fontWeight: 700 },
        h6: { fontSize: '1rem', fontWeight: 700 },
        subtitle1: { fontSize: '1rem', fontWeight: 600, color: '#777777' },
        subtitle2: { fontSize: '0.875rem', fontWeight: 600, color: '#777777' },
        body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
        body2: { fontSize: '0.875rem', lineHeight: 1.6 },
        button: { fontWeight: 700, textTransform: 'none', fontSize: '0.875rem' },
    },
    shape: {
        borderRadius: 16,
    },
    shadows: [
        'none',
        '0px 1px 2px rgba(0, 0, 0, 0.03)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.02)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.07), 0px 4px 6px -2px rgba(0, 0, 0, 0.03)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.09), 0px 10px 10px -5px rgba(0, 0, 0, 0.03)',
        ...Array(20).fill('none'),
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#F7F8FA',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        background: '#E5E7EB',
                        borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                        background: '#D1D5DB',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: '1px solid #E5E7EB',
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.02)',
                    transition: 'all 0.25s ease-in-out',
                    '&:hover': {
                        boxShadow: '0px 10px 20px -5px rgba(0, 0, 0, 0.05)',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    boxShadow: 'none',
                    fontWeight: 700,
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(255, 155, 68, 0.15)',
                    },
                },
                containedPrimary: {
                    '&:hover': {
                        boxShadow: '0px 8px 16px rgba(255, 155, 68, 0.2)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    borderRight: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    margin: '2px 12px',
                    padding: '10px 16px',
                    '&.Mui-selected': {
                        backgroundColor: alpha('#FF9B44', 0.1),
                        color: '#FF9B44',
                        '&:hover': {
                            backgroundColor: alpha('#FF9B44', 0.15),
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#FF9B44',
                        },
                        '& .MuiTypography-root': {
                            fontWeight: 700,
                        },
                    },
                    '&:hover': {
                        backgroundColor: alpha('#FF9B44', 0.05),
                        color: '#FF9B44',
                        '& .MuiListItemIcon-root': {
                            color: '#FF9B44',
                        },
                    }
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: 36,
                    color: '#8E8E8E',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 700,
                },
            },
        },
    },
});

export default theme;
