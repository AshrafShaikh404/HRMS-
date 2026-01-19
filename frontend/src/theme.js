import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#FF5B37', // SmartHR Coral
            light: '#FF8A70',
            dark: '#E0411F',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#6B7280', // Cool Gray
            light: '#9CA3AF',
            dark: '#374151',
            contrastText: '#ffffff',
        },
        success: {
            main: '#10B981', // Emerald
            light: '#34D399',
            dark: '#059669',
        },
        warning: {
            main: '#F59E0B', // Amber
            light: '#FBBF24',
            dark: '#D97706',
        },
        error: {
            main: '#EF4444', // Red
            light: '#F87171',
            dark: '#B91C1C',
        },
        info: {
            main: '#3FC1C9', // Teal/Cyan accent
            light: '#72DCDF',
            dark: '#2A8F96',
        },
        background: {
            default: '#F8F9FA', // Light Gray Body
            paper: '#FFFFFF',   // White Cards
            sidebar: '#FFFFFF', // White Sidebar
        },
        text: {
            primary: '#111827', // Dark Navy/Slate
            secondary: '#6B7280', // Gray
        },
        divider: '#E5E7EB',
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
        h1: { fontSize: '2.25rem', fontWeight: 700, letterSpacing: '-0.02em' },
        h2: { fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.01em' },
        h3: { fontSize: '1.5rem', fontWeight: 600 },
        h4: { fontSize: '1.25rem', fontWeight: 600 },
        h5: { fontSize: '1.125rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
        subtitle1: { fontSize: '1rem', fontWeight: 500 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
        body1: { fontSize: '0.9375rem', lineHeight: 1.5 },
        body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
        button: { fontWeight: 600, textTransform: 'none', fontSize: '0.9375rem' },
    },
    shape: {
        borderRadius: 10,
    },
    shadows: [
        'none',
        '0px 2px 4px rgba(17, 24, 39, 0.04)', // 1: Very subtle
        '0px 4px 6px -1px rgba(0, 0, 0, 0.05), 0px 2px 4px -1px rgba(0, 0, 0, 0.03)', // 2: Soft card
        '0px 10px 15px -3px rgba(0, 0, 0, 0.05), 0px 4px 6px -2px rgba(0, 0, 0, 0.025)', // 3: Elevated
        ...Array(22).fill('none'),
    ],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#F8F9FA',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 20px',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 4px 12px rgba(255, 91, 55, 0.15)',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #FF5B37 0%, #FF4010 100%)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid #F3F4F6',
                },
                elevation1: {
                    boxShadow: '0px 2px 4px rgba(17, 24, 39, 0.04)',
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
                    borderRadius: 8,
                    margin: '4px 8px',
                    '&.Mui-selected': {
                        backgroundColor: alpha('#FF5B37', 0.08),
                        color: '#FF5B37',
                        '&:hover': {
                            backgroundColor: alpha('#FF5B37', 0.12),
                        },
                        '& .MuiListItemIcon-root': {
                            color: '#FF5B37',
                        },
                    },
                },
            },
        },
        MuiListItemIcon: {
            styleOverrides: {
                root: {
                    minWidth: 40,
                    color: '#9CA3AF',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    fontWeight: 500,
                },
            },
        },
    },
});

export default theme;
