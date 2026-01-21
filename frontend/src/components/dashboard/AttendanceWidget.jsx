import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Divider, CircularProgress, Chip, useTheme, alpha } from '@mui/material';
import { Login as CheckInIcon, Logout as CheckOutIcon, AccessTime, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
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
            p: 2.5,
            borderRadius: 6,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            background: (theme) => theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
                : `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
        }}>
            {/* Soft decorative background accents */}
            <Box sx={{
                position: 'absolute',
                top: -80,
                left: -80,
                width: 200,
                height: 200,
                borderRadius: '50%',
                bgcolor: alpha(isCheckedIn ? theme.palette.success.main : theme.palette.primary.main, 0.03),
                zIndex: 0
            }} />

            <Box sx={{ position: 'relative', zIndex: 1, width: '100%' }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1.5, display: 'block', mb: 0 }}>
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()}
                </Typography>
                <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 2 }}>
                    {currentTime.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>

                {/* Advanced Layered Clock Design */}
                <Box sx={{
                    position: 'relative',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCheckedIn
                        ? `conic-gradient(${theme.palette.success.main} 0deg, ${theme.palette.success.light} 120deg, ${alpha(theme.palette.success.main, 0.1)} 120.1deg)`
                        : isCheckedOut
                            ? `conic-gradient(${theme.palette.primary.main} 0deg, ${theme.palette.primary.light} 360deg)`
                            : alpha(theme.palette.action.disabledBackground, 0.5),
                    mb: 2.5,
                    boxShadow: isCheckedIn ? `0 0 30px ${alpha(theme.palette.success.main, 0.2)}` : 'none',
                    transition: 'all 0.5s ease-in-out'
                }}>
                    {/* Inner White Ring Layer */}
                    <Box sx={{
                        width: 'calc(100% - 8px)',
                        height: 'calc(100% - 8px)',
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'inset 0 4px 15px rgba(0,0,0,0.04)',
                        position: 'relative',
                        zIndex: 2
                    }}>
                        <Typography
                            variant="h4"
                            fontWeight={800}
                            sx={{
                                fontVariantNumeric: 'tabular-nums',
                                color: isCheckedIn ? 'success.main' : isCheckedOut ? 'primary.main' : 'text.disabled',
                                fontSize: '1.5rem',
                                letterSpacing: -0.5
                            }}
                        >
                            {getWorkDuration()}
                        </Typography>
                        <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8, fontSize: '0.65rem' }}>
                            {isCheckedIn ? 'Working' : isCheckedOut ? 'Shift Done' : 'Not Active'}
                        </Typography>
                    </Box>

                    {/* Floating Pulse (Only when checked in) */}
                    {isCheckedIn && (
                        <Box sx={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            border: `2px solid ${theme.palette.success.main}`,
                            animation: 'pulse 2s infinite ease-in-out',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)', opacity: 0.5 },
                                '100%': { transform: 'scale(1.1)', opacity: 0 }
                            }
                        }} />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, mb: 2.5 }}>
                    {!isCheckedIn && !isCheckedOut ? (
                        <Button
                            fullWidth
                            variant="contained"
                            size="medium"
                            disabled={loading}
                            onClick={handleCheckIn}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckInIcon />}
                            sx={{
                                borderRadius: 3,
                                py: 1,
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                                transition: 'all 0.3s',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                                }
                            }}
                        >
                            Initialize Work
                        </Button>
                    ) : isCheckedIn ? (
                        <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            size="medium"
                            disabled={loading}
                            onClick={handleCheckOut}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckOutIcon />}
                            sx={{
                                borderRadius: 3,
                                py: 1.2,
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                                boxShadow: `0 8px 25px ${alpha(theme.palette.error.main, 0.3)}`,
                                '&:hover': {
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            Complete Shift
                        </Button>
                    ) : (
                        <Box sx={{
                            width: '100%',
                            p: 1.5,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            border: '1px solid',
                            borderColor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1
                        }}>
                            <CheckCircleIcon color="primary" sx={{ fontSize: 20 }} />
                            <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                                SHIFT COMPLETED
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    py: 1.5,
                    px: 1,
                    bgcolor: alpha(theme.palette.divider, 0.03),
                    borderRadius: 3
                }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.25, fontSize: '0.7rem' }}>Punch In</Typography>
                        <Typography variant="subtitle2" fontWeight={800}>
                            {todayStatus?.checkInTime ? new Date(todayStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ opacity: 0.5 }} />
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: 'block', mb: 0.25, fontSize: '0.7rem' }}>Punch Out</Typography>
                        <Typography variant="subtitle2" fontWeight={800}>
                            {todayStatus?.checkOutTime ? new Date(todayStatus.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
};

export default AttendanceWidget;
