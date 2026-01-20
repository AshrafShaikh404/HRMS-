import { Grid, Box, Typography, Card, alpha, useTheme, Button } from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    PendingActions as PendingIcon,
    Download as DownloadIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import AttendanceWidget from './AttendanceWidget';
import LeaveBalanceCard from './LeaveBalanceCard';
import NotificationList from './NotificationList';
import SharedCalendar from '../SharedCalendar';
import StatsCard from '../StatsCard';

const EmployeeDashboard = ({ user, data, onRefresh }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { leaveBalance, thisMonthAttendance, todayStatus, lastPayslip, profile } = data;

    const stats = [
        {
            title: 'Present Days (Month)',
            value: thisMonthAttendance.present,
            icon: <CheckCircleIcon />,
            color: 'success',
            subtitle: `of ${thisMonthAttendance.total} working days`
        },
        {
            title: 'Absent Days',
            value: thisMonthAttendance.absent,
            icon: <WarningIcon />,
            color: 'error'
        },
        {
            title: 'Pending Leaves',
            value: data.pendingLeavesCount || 0, // Placeholder if not in API yet
            icon: <PendingIcon />,
            color: 'warning'
        }
    ];

    return (
        <Box>
            {/* Header Section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom sx={{ letterSpacing: -1 }}>
                        Hello, {profile.name.split(' ')[0]}! 👋
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Heres whats happening with your profile today.
                    </Typography>
                </Box>
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Typography variant="body2" color="text.secondary" textAlign="right">
                        Employee ID: <strong>{profile.employeeCode}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="right">
                        {profile.designation} | {profile.department}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* Left Column: Actions & Stats */}
                <Grid item xs={12} lg={8}>
                    <Grid container spacing={3}>
                        {/* Attendance Tracker */}
                        <Grid item xs={12} md={6}>
                            <AttendanceWidget
                                user={user}
                                todayStatus={todayStatus}
                                onStatusChange={onRefresh}
                            />
                        </Grid>

                        {/* Summary Stats */}
                        <Grid item xs={12} md={6}>
                            <Grid container spacing={2}>
                                {stats.map((stat, index) => (
                                    <Grid item xs={12} key={index}>
                                        <StatsCard {...stat} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        {/* Leave Section */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
                                <Typography variant="h6" fontWeight={700}>Leave Balance</Typography>
                                <Button
                                    endIcon={<ChevronRightIcon />}
                                    size="small"
                                    onClick={() => navigate('/leaves')}
                                >
                                    View History
                                </Button>
                            </Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                    <LeaveBalanceCard
                                        type="casual"
                                        {...leaveBalance.casual}
                                        onApply={() => navigate('/leaves')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <LeaveBalanceCard
                                        type="sick"
                                        {...leaveBalance.sick}
                                        onApply={() => navigate('/leaves')}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <LeaveBalanceCard
                                        type="earned"
                                        {...leaveBalance.earned}
                                        onApply={() => navigate('/leaves')}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>

                        {/* Payroll Snippet */}
                        <Grid item xs={12}>
                            <Card sx={{
                                borderRadius: 4,
                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                                border: '1px dashed',
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                p: 3
                            }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Latest Payslip
                                        </Typography>
                                        {lastPayslip ? (
                                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                                <Typography variant="h5" fontWeight={800}>
                                                    ₹{lastPayslip.netSalary.toLocaleString()}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    for {new Date(lastPayslip.year, lastPayslip.month - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                                </Typography>
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">No payslips generated yet.</Typography>
                                        )}
                                    </Box>
                                    <Button
                                        variant="contained"
                                        disabled={!lastPayslip}
                                        startIcon={<DownloadIcon />}
                                        onClick={() => navigate('/payroll')}
                                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Download PDF
                                    </Button>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>

                {/* Right Column: Notifications & Calendar */}
                <Grid item xs={12} lg={4}>
                    <Grid container spacing={3}>
                        {/* Notifications */}
                        <Grid item xs={12}>
                            <NotificationList />
                        </Grid>

                        {/* Mini Calendar */}
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: 4, pt: 2, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                <SharedCalendar user={user} height="400px" embedded={true} />
                            </Card>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EmployeeDashboard;
