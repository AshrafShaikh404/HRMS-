import { Grid, Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AttendanceWidget from './AttendanceWidget';
import LeaveBalanceCard from './LeaveBalanceCard';
import NotificationList from './NotificationList';
import StatsCard from '../StatsCard';
import StatsSummaryWidget from './StatsSummaryWidget';
import EmployeeOverviewCard from './EmployeeOverviewCard';
import QuickActionsCard from './QuickActionsCard';
import {
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
    PendingActions as PendingIcon
} from '@mui/icons-material';

const EmployeeDashboard = ({ user, data, onRefresh }) => {
    const navigate = useNavigate();
    const { leaveBalance, thisMonthAttendance, todayStatus, pendingLeavesCount, profile } = data;

    const stats = [
        {
            title: 'Attendance Rate',
            value: `${Math.round((thisMonthAttendance.present / (thisMonthAttendance.total || 1)) * 100)}% `,
            icon: <CheckCircleIcon />,
            color: 'success',
            subtitle: `${thisMonthAttendance.present} / ${thisMonthAttendance.total} days present`
        },
        {
            title: 'Absences',
            value: thisMonthAttendance.absent,
            icon: <WarningIcon />,
            color: 'error',
            subtitle: 'This month'
        },
        {
            title: 'Pending Leaves',
            value: pendingLeavesCount || 0,
            icon: <PendingIcon />,
            color: 'warning',
            subtitle: 'Requests'
        }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%' }}>
            {/* Header - Compact */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                    Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Welcome back, {user.name}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

                {/* SECTION 1: IDENTITY (Row 1: Profile) */}
                <Box>
                    <EmployeeOverviewCard user={user} profile={profile} />
                </Box>

                {/* SECTION 2: OPERATIONS (Row 2: Attendance | Stats | Quick Actions) */}
                <Box>
                    <Grid container spacing={3} alignItems="stretch">
                        {/* Attendance - 4 Cols */}
                        <Grid item xs={12} md={4} lg={4}>
                            <AttendanceWidget
                                user={user}
                                todayStatus={todayStatus}
                                onStatusChange={onRefresh}
                                profile={profile}
                            />
                        </Grid>

                        {/* Stats Summary - 4 Cols */}
                        <Grid item xs={12} md={4} lg={4}>
                            <StatsSummaryWidget stats={stats} />
                        </Grid>

                        {/* Quick Actions - 4 Cols */}
                        <Grid item xs={12} md={4} lg={4}>
                            <QuickActionsCard />
                        </Grid>
                    </Grid>
                </Box>

                {/* SECTION 3: LEAVES & UPDATES (Row 3) */}
                <Grid container spacing={3} alignItems="stretch">
                    {/* Left Side: Leave Balances (8 Cols) */}
                    <Grid item xs={12} lg={8}>
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, ml: 0.5 }}>Leave Balance</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <LeaveBalanceCard type="casual" {...leaveBalance.casual} onApply={() => navigate('/leaves')} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <LeaveBalanceCard type="sick" {...leaveBalance.sick} onApply={() => navigate('/leaves')} />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <LeaveBalanceCard type="earned" {...leaveBalance.earned} onApply={() => navigate('/leaves')} />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Right Side: Updates/Notifications (4 Cols) */}
                    <Grid item xs={12} lg={4}>
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, ml: 0.5 }}>Updates</Typography>
                            <Box sx={{ flex: 1 }}>
                                <NotificationList />
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

            </Box>
        </Box>
    );
};

export default EmployeeDashboard;
