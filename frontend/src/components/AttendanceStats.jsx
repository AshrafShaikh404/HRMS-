import { Grid, Paper, Typography, Box, alpha } from '@mui/material';
import {
    CheckCircle as PresentIcon,
    Cancel as AbsentIcon,
    AccessTime as TimeIcon,
    EventBusy as LeaveIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2.5,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            transition: 'all 0.2s',
            '&:hover': {
                borderColor: `${color}.main`,
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }
        }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box
                sx={{
                    bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
                    color: `${color}.main`,
                    p: 1,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {icon}
            </Box>
        </Box>
        <Box>
            <Typography variant="h4" fontWeight="700" color="text.primary" sx={{ mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="500">
                {title}
            </Typography>
        </Box>
    </Paper>
);

const AttendanceStats = ({ summary }) => {
    if (!summary) return null;

    return (
        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Present Today"
                    value={summary.presentDays || 0}
                    icon={<PresentIcon sx={{ fontSize: 24 }} />}
                    color="success"
                    subtitle="Employees checked in"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Absent"
                    value={summary.absentDays || 0}
                    icon={<AbsentIcon sx={{ fontSize: 24 }} />}
                    color="error"
                    subtitle="Unaccounted absence"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="On Leave"
                    value={summary.leaveDays || 0}
                    icon={<LeaveIcon sx={{ fontSize: 24 }} />}
                    color="info"
                    subtitle="Approved leaves"
                />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatCard
                    title="Avg Working Hrs"
                    value={summary.avgWorkingHours || '0'}
                    icon={<TimeIcon sx={{ fontSize: 24 }} />}
                    color="warning"
                    subtitle="Per employee"
                />
            </Grid>
        </Grid>
    );
};

export default AttendanceStats;
