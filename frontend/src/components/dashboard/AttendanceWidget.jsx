import { useState, useEffect } from 'react';
import { Box, Card, Typography, Button, Divider, CircularProgress, Chip } from '@mui/material';
import { Login as CheckInIcon, Logout as CheckOutIcon, AccessTime } from '@mui/icons-material';
import { attendanceAPI } from '../../utils/api';

const AttendanceWidget = ({ user, todayStatus, onStatusChange }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);

    // Status can be: 'checked-in', 'checked-out', 'absent' (not started yet)
    // todayStatus prop provides initial state from dashboard API

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCheckIn = async () => {
        try {
            setLoading(true);
            await attendanceAPI.checkIn();
            onStatusChange(); // Refresh parent data
        } catch (error) {
            console.error('Check-in failed:', error);
            // Handle error (maybe show snackbar)
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setLoading(true);
            await attendanceAPI.checkOut();
            onStatusChange(); // Refresh parent data
        } catch (error) {
            console.error('Check-out failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate duration if checked in
    const getWorkDuration = () => {
        if (!todayStatus) return '00:00:00';

        let startTime = null;
        if (todayStatus.checkInTime) {
            startTime = new Date(todayStatus.checkInTime);
        }

        if (!startTime) return '00:00:00';

        // If checked out, show final worked hours
        if (todayStatus.checkOutTime) {
            // If the backend provides formatted workedHours, use it. 
            // Otherwise calculate simple diff (though breaks/lunch might complicate this)
            if (todayStatus.workedHours) return `${todayStatus.workedHours}h`;

            const endTime = new Date(todayStatus.checkOutTime);
            const diff = endTime - startTime;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            return `${hours}h ${minutes}m`;
        }

        // Timer for active session
        const diff = currentTime - startTime;
        if (diff < 0) return '00:00:00';

        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const isCheckedIn = todayStatus?.checkInTime && !todayStatus?.checkOutTime;
    const isCheckedOut = !!todayStatus?.checkOutTime;

    return (
        <Card sx={{ p: 3, height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    Today's Date
                </Typography>
                <Typography variant="h6" fontWeight={700}>
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </Typography>
            </Box>

            <Box sx={{
                position: 'relative',
                width: 180,
                height: 180,
                borderRadius: '50%',
                bgcolor: isCheckedIn ? '#ECFDF5' : '#F3F4F6',
                color: isCheckedIn ? '#10B981' : '#6B7280',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '4px solid',
                borderColor: isCheckedIn ? '#10B981' : '#E5E7EB',
                mb: 3
            }}>
                <AccessTime sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                <Typography variant="h4" fontWeight={800} sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {isCheckedOut ? (todayStatus.workedHours || 'Done') : getWorkDuration()}
                </Typography>
                <Typography variant="caption" fontWeight={600} sx={{ mt: 0.5, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {isCheckedIn ? 'Working Time' : (isCheckedOut ? 'Total Hours' : 'Not Started')}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                {!isCheckedIn && !isCheckedOut && (
                    <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckInIcon />}
                        onClick={handleCheckIn}
                        disabled={loading}
                        sx={{ borderRadius: 2, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}
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
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckOutIcon />}
                        onClick={handleCheckOut}
                        disabled={loading}
                        sx={{ borderRadius: 2 }}
                    >
                        Check Out
                    </Button>
                )}

                {isCheckedOut && (
                    <Button fullWidth variant="outlined" disabled sx={{ borderRadius: 2 }}>
                        Day Completed
                    </Button>
                )}
            </Box>

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', width: '100%' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">Check In</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                        {todayStatus?.checkInTime ? new Date(todayStatus.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box>
                    <Typography variant="caption" color="text.secondary">Check Out</Typography>
                    <Typography variant="subtitle2" fontWeight={700}>
                        {todayStatus?.checkOutTime ? new Date(todayStatus.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
};

export default AttendanceWidget;
