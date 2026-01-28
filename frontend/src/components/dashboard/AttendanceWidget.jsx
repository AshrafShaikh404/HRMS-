import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Divider, CircularProgress, Chip, useTheme, alpha, Tooltip } from '@mui/material';
import { Login as CheckInIcon, Logout as CheckOutIcon, AccessTime, CheckCircle as CheckCircleIcon, Warning as WarningIcon, Schedule as ScheduleIcon } from '@mui/icons-material';
import { attendanceAPI } from '../../utils/api';

const AttendanceWidget = ({ user, todayStatus, onStatusChange, profile }) => {
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

    // Late Logic
    const isLate = () => {
        if (!todayStatus?.checkInTime) return false;

        const workingHoursStart = profile?.jobInfo?.location?.workingHours?.start || '09:00';
        const [startHour, startMinute] = workingHoursStart.split(':').map(Number);

        const checkIn = new Date(todayStatus.checkInTime);
        const scheduledStart = new Date(checkIn);
        scheduledStart.setHours(startHour, startMinute, 0, 0);

        // 15 min buffer
        const bufferTime = new Date(scheduledStart.getTime() + 15 * 60000);

        return checkIn > bufferTime;
    };

    return (
        <Card sx={{
            p: 3,
            borderRadius: 4,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Attendance</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </Typography>
                </Box>
                <Chip
                    label={isLate() ? 'Late Entry' : (isCheckedIn ? 'On Time' : 'Not Started')}
                    color={isLate() ? 'warning' : (isCheckedIn ? 'success' : 'default')}
                    size="small"
                    variant="outlined"
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
                <Box sx={{
                    position: 'relative',
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCheckedIn
                        ? `conic-gradient(${theme.palette.success.main} 0deg, ${alpha(theme.palette.success.main, 0.2)} 360deg)`
                        : alpha(theme.palette.divider, 0.1),
                    mb: 2
                }}>
                    <Box sx={{
                        width: 'calc(100% - 10px)',
                        height: 'calc(100% - 10px)',
                        borderRadius: '50%',
                        bgcolor: 'background.paper',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Typography variant="h4" fontWeight={700} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                            {getWorkDuration()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            WORKING HRS
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ mt: 'auto' }}>
                {!isCheckedIn && !isCheckedOut ? (
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading}
                        onClick={handleCheckIn}
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckInIcon />}
                        sx={{ borderRadius: 3 }}
                    >
                        Check In
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
                        sx={{ borderRadius: 3 }}
                    >
                        Check Out
                    </Button>
                ) : (
                    <Button
                        fullWidth
                        variant="outlined"
                        color="success"
                        disabled
                        startIcon={<CheckCircleIcon />}
                        sx={{ borderRadius: 3 }}
                    >
                        Shift Completed
                    </Button>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, px: 1 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Check In</Typography>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {todayStatus?.checkInTime ? new Date(todayStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                        </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">Check Out</Typography>
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
