import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';

import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Typography,
    Card,
    CardContent,
    useTheme,
    alpha,
    Divider,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Button,
    Box,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import {
    People as PeopleIcon,
    CheckCircle as AttendanceIcon,
    EventBusy as LeaveIcon,
    RecentActors as RecentIcon,
    ArrowForward as ArrowIcon,
    TrendingUp as TrendIcon
} from '@mui/icons-material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import StatsCard from '../components/StatsCard';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = ({ data }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { employeeStats, todayAttendance, pendingLeaves, departmentBreakdown, recentActivities } = data;

    const COLORS = [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main, theme.palette.info.main];

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 4, letterSpacing: -1 }}>
                System Overview
            </Typography>

            <Grid container spacing={3}>
                {/* Stats Row */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Employees"
                        value={employeeStats.total}
                        icon={<PeopleIcon />}
                        color="primary"
                        subtitle={`${employeeStats.active} Active`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Today's Attendance"
                        value={`${todayAttendance.attendancePercentage}%`}
                        icon={<AttendanceIcon />}
                        color="success"
                        subtitle={`${todayAttendance.present} Present`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Pending Leaves"
                        value={pendingLeaves}
                        icon={<LeaveIcon />}
                        color="warning"
                        subtitle="Awaiting action"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Inactive Records"
                        value={employeeStats.inactive}
                        icon={<RecentIcon />}
                        color="error"
                        subtitle="Disabled accounts"
                    />
                </Grid>

                {/* Charts Row */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 4, height: '400px' }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Department Distribution</Typography>
                            <ResponsiveContainer width="100%" height="85%">
                                <BarChart data={departmentBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                                    <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="count" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, height: '400px', display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ flexGrow: 1, overflow: 'hidden' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>Recent Joinees</Typography>
                                <Button size="small" endIcon={<ArrowIcon />} onClick={() => navigate('/employees')}>View All</Button>
                            </Box>
                            <List disablePadding>
                                {recentActivities.map((emp, index) => (
                                    <ListItem key={index} disableGutters sx={{ py: 1.5 }}>
                                        <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, mr: 2 }}>
                                            {emp.name.charAt(0)}
                                        </Avatar>
                                        <ListItemText
                                            primary={emp.name}
                                            secondary={emp.department}
                                            primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
                                            secondaryTypographyProps={{ variant: 'caption' }}
                                        />
                                        <Typography variant="caption" color="text.disabled">
                                            {new Date(emp.addedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

const HRDashboard = ({ user, data }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { departmentStats, todayAttendance, attendanceTrend, pendingLeaves, payrollStatus, leaveBalanceWarnings, todayStatus } = data;

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
                    HR Insights
                </Typography>
                <Chip
                    icon={<TrendIcon />}
                    label={`Payroll: ₹${payrollStatus.totalDisbursement.toLocaleString()}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, borderRadius: 2 }}
                />
            </Box>

            <Grid container spacing={3}>
                {/* Stats cards for HR */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Current Presence"
                        value={todayAttendance.present}
                        icon={<AttendanceIcon />}
                        color="success"
                        subtitle={`${todayAttendance.onLeave} on leave today`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Pending Approvals"
                        value={pendingLeaves.length}
                        icon={<LeaveIcon />}
                        color="warning"
                        subtitle="Action required"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Payroll"
                        value={payrollStatus.generated}
                        icon={<TrendIcon />}
                        color="info"
                        subtitle="Payslips generated"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Absence Rate"
                        value={todayAttendance.absent}
                        icon={<PeopleIcon />}
                        color="error"
                        subtitle="Unaccounted today"
                    />
                </Grid>

                {/* Trend Chart */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 4, height: '400px' }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Attendance Trend (Last 7 Days)</Typography>
                            <ResponsiveContainer width="100%" height="85%">
                                <LineChart data={attendanceTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={4} dot={{ r: 6, fill: theme.palette.primary.main, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, height: '400px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Leave Warnings</Typography>
                            <List disablePadding>
                                {leaveBalanceWarnings.map((warning, index) => (
                                    <ListItem key={index} disableGutters divider={index !== leaveBalanceWarnings.length - 1}>
                                        <ListItemText
                                            primary={warning.name}
                                            secondary={`Casual: ${warning.casualLeave} | Sick: ${warning.sickLeave}`}
                                            primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
                                            secondaryTypographyProps={{ color: 'error.main', variant: 'caption' }}
                                        />
                                        <Button size="small" onClick={() => navigate('/leaves')}>Review</Button>
                                    </ListItem>
                                ))}
                                {leaveBalanceWarnings.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                                        No balance warnings
                                    </Typography>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchDashboardData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            let response;

            if (user.role === 'admin') {
                response = await dashboardAPI.getAdminDashboard();
            } else if (user.role === 'hr') {
                response = await dashboardAPI.getHRDashboard();
            } else {
                response = await dashboardAPI.getEmployeeDashboard();
            }

            if (response.data.success) {
                setDashboardData(response.data.data);
            } else {
                setError('Failed to load dashboard data');
            }
        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setError(err.message || 'Error connecting to server');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role) {
            fetchDashboardData();
        }
    }, [user]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!dashboardData) return null;

    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            {user.role === 'employee' ? (
                <EmployeeDashboard
                    user={user}
                    data={dashboardData}
                    onRefresh={() => fetchDashboardData(false)}
                />
            ) : user.role === 'admin' ? (
                <AdminDashboard user={user} data={dashboardData} />
            ) : (
                <HRDashboard user={user} data={dashboardData} />
            )}
        </Box>
    );
}

export default Dashboard;
