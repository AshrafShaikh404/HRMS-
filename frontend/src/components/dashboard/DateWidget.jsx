import { useState, useEffect } from 'react';
import { Card, Typography, Button, Box } from '@mui/material';

const DateWidget = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => tick(), 1000);
        return () => clearInterval(timer);
    }, []);

    const tick = () => {
        setTime(new Date());
    };

    const formatDate = (date) => {
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('en-GB', options);
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-GB', { hour12: false });
    };

    const formatDay = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    };

    return (
        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
                {formatDate(time)}
            </Typography>
            <Typography variant="h3" fontWeight={700} color="primary.main" sx={{ my: 1 }}>
                {formatTime(time)}
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={500} sx={{ mb: 3 }}>
                {formatDay(time)} | 10AM - 7PM
            </Typography>

            <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{
                    mt: 'auto',
                    bgcolor: '#2563EB',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#1D4ED8' }
                }}
            >
                Sign In
            </Button>
        </Card>
    );
};

export default DateWidget;
