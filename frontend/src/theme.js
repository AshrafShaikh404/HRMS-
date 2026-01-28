import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#FF9B44', // SmartHR Orange
            light: '#ffb373',
            dark: '#e68a30',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#008CBA', // SmartHR Teal/Blue
            light: '#33a3c8',
            dark: '#006d91',
            contrastText: '#ffffff',
        },
        success: {
            main: '#55CE63', // SmartHR Green
            light: '#77d882',
            dark: '#45b351',
        },
        warning: {
            main: '#f62d51', // SmartHR Pink/Red
            light: '#f85774',
            dark: '#d12644',
        },
        error: {
            main: '#f62d51',
            light: '#f85774',
            dark: '#d12644',
        },
        info: {
            main: '#008CBA',
            light: '#33a3c8',
            dark: '#006d91',
        },
        purple: {
            main: '#7460ee',
            light: '#9080f1',
            dark: '#5d4bc6',
        },
        background: {
            default: '#F7F8FA', // SmartHR specific light grey
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1f1f1f',
            secondary: '#777777',
        },
        divider: '#eeeeee',
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
