import { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Slide } from '@mui/material';

const NotificationContext = createContext();

function SlideTransition(props) {
    return <Slide {...props} direction="down" />;
}

export function NotificationProvider({ children }) {
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        severity: 'info', // 'success', 'error', 'warning', 'info'
    });

    const showNotification = useCallback((message, severity = 'info') => {
        setNotification({
            open: true,
            message,
            severity,
        });
    }, []);

    const hideNotification = useCallback(() => {
        setNotification((prev) => ({
            ...prev,
            open: false,
        }));
    }, []);

    const showSuccess = useCallback((message) => {
        showNotification(message, 'success');
    }, [showNotification]);

    const showError = useCallback((message) => {
        showNotification(message, 'error');
    }, [showNotification]);

    const showWarning = useCallback((message) => {
        showNotification(message, 'warning');
    }, [showNotification]);

    const showInfo = useCallback((message) => {
        showNotification(message, 'info');
    }, [showNotification]);

    return (
        <NotificationContext.Provider
            value={{
                showNotification,
                showSuccess,
                showError,
                showWarning,
                showInfo,
            }}
        >
            {children}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={hideNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                TransitionComponent={SlideTransition}
            >
                <Alert
                    onClose={hideNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        boxShadow: 3,
                        fontWeight: 500,
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
