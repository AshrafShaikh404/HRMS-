import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import {
    Box,
    Card,
    Typography,
    Grid,
    Chip,
    Skeleton,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    Avatar,
    IconButton
} from '@mui/material';
import {
    People as PeopleIcon,
    TrendingUp as TrendingUpIcon,
    EventNote as EventNoteIcon,
    Payments as PaymentsIcon,
    Business as BusinessIcon,
    Warning as WarningIcon,
    Schedule as ScheduleIcon,
    Notifications as NotificationsIcon,
    MoreVert as MoreVertIcon,
    Home as HomeIcon,
    CalendarToday,
    FileDownloadOutlined,
    EditOutlined,
    Add as AddIcon
} from '@mui/icons-material';
import { Button, Breadcrumbs, Link as MuiLink } from '@mui/material'; // Added Breadcrumbs
import StatsCard from '../components/StatsCard'; // New Component
import AttendanceDonut from '../components/AttendanceDonut';
import DepartmentChart from '../components/DepartmentChart';
import ScheduleWidget from '../components/ScheduleWidget';
// import StatCard from '../components/StatCard'; // OLD Component - Removing
// import StatCard from '../components/StatCard'; // OLD Component - Removing

function Dashboard({ user }) {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            let response;
            if (user.role === 'admin') {
                response = await dashboardAPI.getAdminDashboard();
            } else if (user.role === 'hr') {
                response = await dashboardAPI.getHRDashboard();
            } else {
                response = await dashboardAPI.getEmployeeDashboard();
            }

            setDashboardData(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

    const StatValue = ({ value, label, color }) => (
        <Box sx={{ textAlign: 'start' }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {label}
            </Typography>
        </Box>
    );

    const getAttendancePieData = (data) => {
        if (!data) return [];
        return [
            { name: 'Present', value: data.present || 0 },
            { name: 'Absent', value: data.absent || 0 },
            { name: 'On Leave', value: data.onLeave || 0 }
        ];
    };

    if (loading) {
        return (
            <Box>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Skeleton variant="text" width={200} height={40} />
                        <Skeleton variant="text" width={300} height={24} />
                    </Box>
                    <Skeleton variant="circular" width={40} height={40} />
                </Box>
                <Grid container spacing={3}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid key={i} item xs={12} sm={6} md={3}>
                            <Skeleton variant="rounded" height={160} />
                        </Grid>
                    ))}
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rounded" height={400} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rounded" height={400} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            {/* Page Header - Row 1 */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
                        Admin Dashboard
                    </Typography>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ fontSize: '0.875rem' }}>
                        <MuiLink underline="hover" color="inherit" href="/" sx={{ display: 'flex', alignItems: 'center' }}>
                            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                            Dashboard
                        </MuiLink>
                        <Typography color="text.primary">Admin Dashboard</Typography>
                    </Breadcrumbs>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<FileDownloadOutlined />}
                        sx={{ bgcolor: 'white', color: 'text.secondary', borderColor: 'divider', textTransform: 'none' }}
                    >
                        Export
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<CalendarToday />}
                        sx={{ bgcolor: 'white', color: 'text.secondary', borderColor: 'divider', textTransform: 'none' }}
                    >
                        2024 - 2025
                    </Button>
                </Box>
            </Box>

            {/* Welcome Banner - Row 2 */}
            <Card elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                            src={user.avatar}
                            alt={user.name}
                            sx={{ width: 64, height: 64, border: '3px solid', borderColor: 'primary.lighter' }}
                        >
                            {user.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h5" fontWeight={700}>
                                    Welcome Back, {user.name}
                                </Typography>
                                <IconButton size="small">
                                    <EditOutlined fontSize="small" />
                                </IconButton>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                                You have <Typography component="span" color="primary.main" fontWeight={600}>{dashboardData?.pendingLeaves || 0} Pending Approvals</Typography> & <Typography component="span" color="primary.main" fontWeight={600}>{dashboardData?.todayAttendance?.onLeave || 0} Leave Requests</Typography>
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                                bgcolor: '#111827', // Dark navy
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': { bgcolor: '#374151' }
                            }}
                        >
                            Add Schedule
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            color="primary"
                            sx={{
                                textTransform: 'none',
                                borderColor: 'primary.main',
                                borderWidth: 1.5,
                                '&:hover': { borderWidth: 1.5, bgcolor: 'primary.lighter' }
                            }}
                        >
                            Add Requests
                        </Button>
                    </Box>
                </Box>
            </Card>

            {/* Admin Dashboard */}
            {user.role === 'admin' && dashboardData && (
                <Grid container spacing={3}>
                    {/* Key Metrics */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Total Employees"
                            value={dashboardData.employeeStats?.total || 0}
                            trend="up"
                            trendValue="12%"
                            icon={<PeopleIcon />}
                            color="primary"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Today's Attendance"
                            value={dashboardData.todayAttendance?.present || 0}
                            trend="up"
                            trendValue="5%"
                            icon={<TrendingUpIcon />}
                            color="success"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Leave Requests"
                            value={dashboardData.pendingLeaves || 0}
                            trend="down"
                            trendValue="2"
                            icon={<EventNoteIcon />}
                            color="warning"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Departments"
                            value={dashboardData.departmentBreakdown?.length || 0}
                            icon={<BusinessIcon />}
                            color="info"
                        />
                    </Grid>

                    {/* Charts Section */}
                    <Grid item xs={12} md={8}>
                        <Card elevation={0} sx={{ p: 4, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <AttendanceDonut
                                data={getAttendancePieData(dashboardData.todayAttendance)}
                                title="Attendance Overview"
                            />
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <DepartmentChart
                                data={dashboardData.departmentBreakdown}
                            />
                        </Card>
                    </Grid>

                    {/* Recent Activities & Details */}
                    {dashboardData.recentActivities && (
                        <Grid item xs={12} md={6}>
                            <ScheduleWidget
                                title="Recent Activities"
                                activities={dashboardData.recentActivities.map(emp => ({
                                    title: `New Employee: ${emp.name}`,
                                    time: emp.department,
                                    date: new Date(emp.addedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short' }),
                                    type: 'Hiring'
                                }))}
                            />
                        </Grid>
                    )}
                </Grid>
            )}

            {/* HR Dashboard */}
            {user.role === 'hr' && dashboardData && (
                <Grid container spacing={3}>
                    {/* Key Metrics */}
                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Total Staff"
                            value={dashboardData.departmentStats?.reduce((sum, d) => sum + d.count, 0) || 0}
                            trend="neutral"
                            icon={<PeopleIcon />}
                            color="primary"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Attendance"
                            value={`${((dashboardData.todayAttendance?.present / (dashboardData.departmentStats?.reduce((sum, d) => sum + d.count, 0) || 1)) * 100).toFixed(0)}%`}
                            trend="neutral"
                            trendValue={`${dashboardData.todayAttendance?.absent || 0} Absent`}
                            icon={<TrendingUpIcon />}
                            color="success"
                        />
                    </Grid>


                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Payroll"
                            value={`₹${(dashboardData.payrollStatus?.totalDisbursement || 0).toLocaleString()}`}
                            icon={<PaymentsIcon />}
                            color="info"
                        />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StatsCard
                            title="Pending Approvals"
                            value={dashboardData.pendingLeaves?.length || 0}
                            trend="warning"
                            trendValue="Action Required"
                            icon={<EventNoteIcon />}
                            color="warning"
                        />
                    </Grid>

                    {/* Chart & Trend */}
                    <Grid item xs={12} md={8}>
                        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <AttendanceChart
                                data={dashboardData.attendanceTrend?.map(d => ({
                                    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
                                    Present: d.count
                                }))}
                                title="Attendance Trend (Last 7 Days)"
                            />
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        {/* Can reuse department chart or other metrics here */}
                        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <DepartmentChart data={dashboardData.departmentStats} />
                        </Card>
                    </Grid>

                    {/* Detailed Lists */}
                    {dashboardData.leaveBalanceWarnings && dashboardData.leaveBalanceWarnings.length > 0 && (
                        <Grid item xs={12} md={6}>
                            <Card elevation={0} sx={{ p: 0, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <WarningIcon color="error" />
                                    <Typography variant="h6" fontWeight={600}>Low Leave Balances</Typography>
                                </Box>
                                <List disablePadding>
                                    {dashboardData.leaveBalanceWarnings.map((emp, index) => (
                                        <ListItem key={index} sx={{ px: 3, py: 2 }} divider={index < dashboardData.leaveBalanceWarnings.length - 1}>
                                            <ListItemText
                                                primary={<Typography variant="subtitle2" fontWeight={600}>{emp.name}</Typography>}
                                                secondary={`Casual: ${emp.casualLeave}, Sick: ${emp.sickLeave}`}
                                            />
                                            <Chip label="Low Balance" color="error" size="small" variant="soft" />
                                        </ListItem>
                                    ))}
                                </List>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* Employee Dashboard */}
            {user.role === 'employee' && dashboardData && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <Grid item xs={12} md={4}>
                            <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.main', mr: 2 }}>
                                        <PeopleIcon />
                                    </Avatar>
                                    <Typography variant="h6" fontWeight={700}>My Profile</Typography>
                                </Box>
                                <Box sx={{ mt: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography color="text.secondary">Code</Typography>
                                        <Typography fontWeight={600}>{dashboardData.profile?.employeeCode}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography color="text.secondary">Department</Typography>
                                        <Typography fontWeight={600}>{dashboardData.profile?.department}</Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Designation</Typography>
                                        <Typography fontWeight={600}>{dashboardData.profile?.designation}</Typography>
                                    </Box>
                                </Box>
                            </Card>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} md={8}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <Grid item xs={12} sm={6}>
                                    <StatsCard
                                        title="Casual Leave"
                                        value={dashboardData.leaveBalance?.casual?.remaining || 0}
                                        trend="neutral"
                                        trendValue={`Total: ${dashboardData.leaveBalance?.casual?.total || 0}`}
                                        icon={<EventNoteIcon />}
                                        color="info"
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Grid item xs={12} sm={6}>
                                    <StatsCard
                                        title="Sick Leave"
                                        value={dashboardData.leaveBalance?.sick?.remaining || 0}
                                        trend="neutral"
                                        trendValue={`Total: ${dashboardData.leaveBalance?.sick?.total || 0}`}
                                        icon={<EventNoteIcon />}
                                        color="secondary"
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

export default Dashboard;
