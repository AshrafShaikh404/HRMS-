import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Divider, CircularProgress, Chip } from '@mui/material';
import { Login as CheckInIcon, Logout as CheckOutIcon, AccessTime } from '@mui/icons-material';
import { attendanceAPI } from '../../utils/api';

const AttendanceWidget = ({ user, todayStatus, onStatusChange }) => {
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

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isCheckedIn = todayStatus?.checkInTime && !todayStatus?.checkOutTime;
    const isCheckedOut = !!todayStatus?.checkOutTime;

    return (
        <Card sx={{
            p: 3,
            height: '100%',
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Accent */}
            <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: alpha(isCheckedIn ? theme.palette.success.main : theme.palette.primary.main, 0.05),
                zIndex: 0
            }} />

            <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom sx={{ mb: 1 }}>
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                </Typography>

                <Box sx={{
                    position: 'relative',
                    width: 160,
                    height: 160,
                    borderRadius: '50%',
                    margin: '0 auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCheckedIn
                        ? `conic-gradient(${theme.palette.success.main} 80%, ${alpha(theme.palette.success.main, 0.1)} 0)`
                        : isCheckedOut
                            ? `conic-gradient(${theme.palette.primary.main} 100%, #f0f0f0 0)`
                            : '#f8f9fa',
                    mb: 3,
                    p: 1 // Padding for the ring
                }}>
                    <Box sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                    }}>
                        <Typography variant="h4" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums', color: isCheckedIn ? 'success.main' : 'text.primary' }}>
                            {getWorkDuration()}
                        </Typography>
                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            {isCheckedIn ? 'Working' : isCheckedOut ? 'Total' : 'Start'}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    {!isCheckedIn && !isCheckedOut ? (
                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            onClick={handleCheckIn}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckInIcon />}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                fontWeight: 700,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`
                            }}
                        >
                            Punch In
                        </Button>
                    ) : isCheckedIn ? (
                        <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            size="large"
                            disabled={loading}
                            onClick={handleCheckOut}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckOutIcon />}
                            sx={{
                                borderRadius: 3,
                                py: 1.5,
                                fontWeight: 700,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`
                            }}
                        >
                            Punch Out
                        </Button>
                    ) : (
                        <Chip
                            label="Attendance Marked"
                            color="primary"
                            variant="outlined"
                            sx={{ width: '100%', py: 2.5, borderRadius: 3, fontWeight: 700, fontSize: '0.9rem' }}
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Check In</Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {todayStatus?.checkInTime ? new Date(todayStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Check Out</Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {todayStatus?.checkOutTime ? new Date(todayStatus.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
};

export default AttendanceWidget;
