import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import { Box, Typography, Alert, Card, CardContent, Grid, Chip, CircularProgress, List, ListItem, ListItemText, Button, useTheme, alpha } from '@mui/material';
import {
    TrendingUp as TrendIcon,
    PersonOutline as AttendanceIcon,
    Description as LeaveIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Stats Card Component for Admin/HR Dashboards
const StatsCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{
            position: 'absolute',
            right: -20,
            top: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: (theme) => alpha(theme.palette[color].main, 0.1),
        }} />
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 3,
                    backgroundColor: (theme) => alpha(theme.palette[color].main, 0.1),
                    color: `${color}.main`,
                    display: 'flex'
                }}>
                    {icon}
                </Box>
                {/* Optional Trend indicator can go here */}
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
                {value}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {subtitle}
                </Typography>
            )}
        </CardContent>
    </Card>
);

// Admin Dashboard Component
const AdminDashboard = ({ user, data }) => {
    const theme = useTheme();
    const { employeeStats, todayAttendance, pendingLeaves, departmentBreakdown, attendanceTrend } = data;

    // Safe defaults
    const stats = employeeStats || { total: 0, active: 0, inactive: 0 };
    const attendance = todayAttendance || { present: 0, absent: 0, onLeave: 0, attendancePercentage: 0 };
    const trend = attendanceTrend || [];
    const departments = departmentBreakdown || [];

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
                    Admin Overview
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Welcome back, {user.name}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Stats Cards */}
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Employees"
                        value={stats.total}
                        icon={<PeopleIcon />}
                        color="primary"
                        subtitle={`${stats.active} Active`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Present Today"
                        value={attendance.present}
                        icon={<AttendanceIcon />}
                        color="success"
                        subtitle={`${attendance.attendancePercentage}% Attendance`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="On Leave"
                        value={attendance.onLeave}
                        icon={<LeaveIcon />}
                        color="warning"
                        subtitle={`${pendingLeaves} Pending Requests`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Departments"
                        value={departments.length}
                        icon={<TrendIcon />}
                        color="info"
                        subtitle="Active Units"
                    />
                </Grid>

                {/* Main Content Area */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 4, height: '450px', mb: 3 }}>
                        <CardContent sx={{ height: '100%' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Attendance Trend</Typography>
                            <ResponsiveContainer width="100%" height="85%">
                                <LineChart data={trend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="count" stroke={theme.palette.primary.main} strokeWidth={4} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, height: '450px' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Department Distribution</Typography>
                            <List>
                                {departments.map((dept, index) => (
                                    <ListItem key={dept._id} divider={index !== departments.length - 1} disableGutters>
                                        <ListItemText
                                            primary={dept._id}
                                            primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }}
                                        />
                                        <Chip label={dept.count} size="small" color="primary" variant="outlined" />
                                    </ListItem>
                                ))}
                                {departments.length === 0 && (
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 4 }}>
                                        No departments found
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

const HRDashboard = ({ user, data }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { departmentStats, todayAttendance, attendanceTrend, pendingLeaves, payrollStatus, leaveBalanceWarnings, todayStatus } = data;

    // Provide default empty values to prevent crashes if data is partial
    const safeAttendance = todayAttendance || { present: 0, onLeave: 0, absent: 0 };
    const safeTrend = attendanceTrend || [];
    const safeLeaves = pendingLeaves || [];
    const safePayroll = payrollStatus || { totalDisbursement: 0, generated: 0 };
    const safeWarnings = leaveBalanceWarnings || [];

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -1 }}>
                    HR Insights
                </Typography>
                <Chip
                    icon={<TrendIcon />}
                    label={`Payroll: ₹${(safePayroll.totalDisbursement || 0).toLocaleString()}`}
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
                        value={safeAttendance.present}
                        icon={<AttendanceIcon />}
                        color="success"
                        subtitle={`${safeAttendance.onLeave} on leave today`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Pending Approvals"
                        value={safeLeaves.length}
                        icon={<LeaveIcon />}
                        color="warning"
                        subtitle="Action required"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Payroll"
                        value={safePayroll.generated}
                        icon={<TrendIcon />}
                        color="info"
                        subtitle="Payslips generated"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Absence Rate"
                        value={safeAttendance.absent}
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
                                <LineChart data={safeTrend}>
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
                                {safeWarnings.map((warning, index) => (
                                    <ListItem key={index} disableGutters divider={index !== safeWarnings.length - 1}>
                                        <ListItemText
                                            primary={warning.name}
                                            secondary={`Casual: ${warning.casualLeave} | Sick: ${warning.sickLeave}`}
                                            primaryTypographyProps={{ fontWeight: 700, variant: 'body2' }}
                                            secondaryTypographyProps={{ color: 'error.main', variant: 'caption' }}
                                        />
                                        <Button size="small" onClick={() => navigate('/leaves')}>Review</Button>
                                    </ListItem>
                                ))}
                                {safeWarnings.length === 0 && (
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

            const role = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();

            // Handle potential undefined role or role name
            if (!role) {
                setError('User role not defined');
                setLoading(false);
                return;
            }

            if (role === 'admin') {
                response = await dashboardAPI.getAdminDashboard();
            } else if (role === 'hr') {
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

    const role = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();

    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            {role === 'employee' ? (
                <EmployeeDashboard
                    user={user}
                    data={dashboardData}
                    onRefresh={() => fetchDashboardData(false)}
                />
            ) : role === 'admin' ? (
                <AdminDashboard user={user} data={dashboardData} />
            ) : (
                <HRDashboard user={user} data={dashboardData} />
            )}
        </Box>
    );
}

export default Dashboard;
