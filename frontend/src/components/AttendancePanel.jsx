import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Divider, Chip, useTheme, alpha, CircularProgress, Grid } from '@mui/material';
import {
    PlayArrow as CheckInIcon,
    Stop as CheckOutIcon,
    AccessTime as TimeIcon,
    CalendarToday as DateIcon,
    Timer as TimerIcon
} from '@mui/icons-material';
import { attendanceAPI } from '../utils/api';

const AttendancePanel = ({ user, todayStatus, onStatusChange, profile }) => {
    const theme = useTheme();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            await attendanceAPI.checkIn();
            onStatusChange();
        } catch (error) {
            console.error('Check-in failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setLoading(true);
            await attendanceAPI.checkOut();
            onStatusChange();
        } catch (error) {
            console.error('Check-out failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getWorkDuration = () => {
        if (!todayStatus?.checkInTime) return '00:00:00';

        const startTime = new Date(todayStatus.checkInTime);
        const endTime = todayStatus.checkOutTime ? new Date(todayStatus.checkOutTime) : currentTime;

        const diff = Math.max(0, endTime - startTime);
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
    };

    const isCheckedIn = todayStatus?.checkInTime && !todayStatus?.checkOutTime;
    const isCheckedOut = !!todayStatus?.checkOutTime;
    const isNotStarted = !todayStatus?.checkInTime;

    const getStatusInfo = () => {
        if (isCheckedOut) return { label: 'CHECKED OUT', color: 'error', icon: <CheckOutIcon /> };
        if (isCheckedIn) return { label: 'CHECKED IN', color: 'success', icon: <CheckInIcon /> };
        return { label: 'NOT STARTED', color: 'default', icon: <TimeIcon /> };
    };

    const statusInfo = getStatusInfo();

    return (
        <Card sx={{
            height: '100%',
            p: 4,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: theme.shadows[10],
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.5)} 100%)`
        }}>
            {/* 1. Status Badge */}
            <Chip
                label={statusInfo.label}
                color={statusInfo.color}
                variant={statusInfo.color === 'default' ? 'outlined' : 'filled'}
                icon={statusInfo.icon}
                sx={{
                    fontWeight: 800,
                    mb: 3,
                    px: 1,
                    height: 32,
                    letterSpacing: 1
                }}
            />

            {/* 2. Current Date */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    General Shift (09:00 AM - 06:00 PM)
                </Typography>
            </Box>

            {/* 3. Timer */}
            <Box sx={{ mb: 4, width: '100%' }}>
                <Box sx={{
                    py: 4,
                    px: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    border: '1px dashed',
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    position: 'relative'
                }}>
                    <Typography variant="overline" color="text.secondary" fontWeight={600} letterSpacing={2}>
                        WORKING HOURS
                    </Typography>
                    <Typography
                        variant="h2"
                        fontWeight={800}
                        sx={{
                            my: 1,
                            fontVariantNumeric: 'tabular-nums',
                            color: isCheckedIn ? 'primary.main' : 'text.primary',
                            textShadow: isCheckedIn ? `0 0 20px ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
                        }}
                    >
                        {getWorkDuration()}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: isCheckedIn ? 'success.main' : 'text.secondary' }}>
                        <TimerIcon fontSize="small" sx={{ animation: isCheckedIn ? 'pulse 2s infinite' : 'none', '@keyframes pulse': { '0%': { opacity: 0.5 }, '50%': { opacity: 1 }, '100%': { opacity: 0.5 } } }} />
                        <Typography variant="caption" fontWeight={600}>
                            {isCheckedIn ? 'Live Running Timer' : 'Timer Stopped'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* 4. Action Button */}
            <Box sx={{ width: '100%', mb: 4, px: 2 }}>
                {isNotStarted && (
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleCheckIn}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckInIcon />}
                        sx={{ py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 700 }}
                    >
                        Check In
                    </Button>
                )}
                {isCheckedIn && (
                    <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        size="large"
                        onClick={handleCheckOut}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckOutIcon />}
                        sx={{ py: 1.5, borderRadius: 2, fontSize: '1.1rem', fontWeight: 700 }}
                    >
                        Check Out
                    </Button>
                )}
                {isCheckedOut && (
                    <Button
                        fullWidth
                        variant="outlined"
                        color="secondary"
                        disabled
                        sx={{ py: 1.5, borderRadius: 2, fontSize: '1rem', fontWeight: 700 }}
                    >
                        Shift Completed
                    </Button>
                )}
            </Box>

            {/* 5. Check In / Out Cards */}
            <Grid container spacing={2} sx={{ width: '100%', mb: 3 }}>
                <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                            Check In
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                            {todayStatus?.checkInTime ? new Date(todayStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                    </Card>
                </Grid>
                <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                            Check Out
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="error.main">
                            {todayStatus?.checkOutTime ? new Date(todayStatus.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            <Box sx={{ mt: 'auto' }}>
                <Typography variant="body2" color="text.secondary">
                    Total Working Hours: <Typography component="span" fontWeight={700} color="text.primary">{getWorkDuration()}</Typography>
                </Typography>
            </Box>

        </Card>
    );
};

export default AttendancePanel;
