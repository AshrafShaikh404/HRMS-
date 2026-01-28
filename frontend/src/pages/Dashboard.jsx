import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';
import { Box, Typography, Alert, Card, CardContent, Grid, Chip, CircularProgress, List, ListItem, ListItemText, Button, useTheme, alpha } from '@mui/material';
import {
    TrendingUp as TrendIcon,
    PersonOutline as AttendanceIcon,
    Description as LeaveIcon,
    People as PeopleIcon,
    CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import { generateAdminData, generateHRData, generateEmployeeData } from '../utils/dashboardData';

import StatsCard from '../components/StatsCard';

// Admin Dashboard Component
const AdminDashboard = ({ user, data }) => {
    const theme = useTheme();
    const dummy = generateAdminData();
    const attendance = data.todayAttendance || dummy.todayAttendance;
    const trend = data.attendanceTrend || dummy.attendanceTrend;

    // Extended dummy stats for the 8-card grid as per specific requirements
    const extendedStats = [
        { title: 'Attendance', value: '120', icon: <AttendanceIcon />, trend: '+2.1%', color: 'success', linkText: 'View Details' },
        { title: 'Projects', value: '98', icon: <LeaveIcon />, trend: '-2.1%', color: 'secondary', linkText: 'View All' },
        { title: 'Clients', value: '45', icon: <PeopleIcon />, trend: '+1.1%', color: 'info', linkText: 'View All' },
        { title: 'Tasks', value: '154', icon: <TrendIcon />, trend: '+11.2%', color: 'warning', linkText: 'View All' },
        { title: 'Earnings', value: '$21,445', icon: <TrendIcon />, trend: '+10.2%', color: 'success', linkText: 'View Transactions' },
        { title: 'Profit', value: '$5,544', icon: <TrendIcon />, trend: '+2.1%', color: 'purple', linkText: 'View Earnings' },
        { title: 'Job Applicants', value: '98', icon: <PeopleIcon />, trend: '+5.1%', color: 'warning', linkText: 'View All' },
        { title: 'New Hire', value: '12', icon: <PeopleIcon />, trend: '+14.2%', color: 'info', linkText: 'View Candidates' },
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.default', minHeight: '100%' }}>
            {/* Header / Breadcrumbs */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary' }}>Admin Dashboard</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">/</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>Admin Dashboard</Typography>
                </Box>
            </Box>

            {/* SmartHR Welcome Section - Refined Alignment */}
            <Card sx={{
                mb: 4,
                p: { xs: 3, md: 4 },
                bgcolor: '#fff',
                borderRadius: 4,
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                border: '1px solid #E5E7EB'
            }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Box
                            component="img"
                            src={user.profileImage || "https://randomuser.me/api/portraits/men/32.jpg"}
                            sx={{
                                width: { xs: 70, md: 90 },
                                height: { xs: 70, md: 90 },
                                borderRadius: '50%',
                                border: '4px solid #F3F4F6',
                                objectFit: 'cover',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm>
                        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: -0.5, mb: 1 }}>
                            Welcome Back, {user.name.split(' ')[0]}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                You have
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 800 }}>
                                21 Pending Approvals
                            </Typography>
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                &
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'secondary.main', fontWeight: 800 }}>
                                14 Leave Requests
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md="auto">
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Button
                                variant="contained"
                                sx={{
                                    bgcolor: '#1f1f1f',
                                    '&:hover': { bgcolor: '#000' },
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    textTransform: 'none'
                                }}
                            >
                                Add Schedule
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.5,
                                    textTransform: 'none'
                                }}
                            >
                                Add Project
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            <Grid container spacing={3}>
                {/* 8-Card Stats Grid */}
                {extendedStats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatsCard {...stat} />
                    </Grid>
                ))}

                {/* Attendance Analytics (lg=8) */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ height: '100%', p: 3, borderRadius: 4, border: '1px solid #E5E7EB' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.2 }}>Attendance Analytics</Typography>
                        </Box>
                        <Box sx={{ height: 380 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trend}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.12} />
                                            <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fontWeight: 700, fill: '#8E8E8E' }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fontWeight: 700, fill: '#8E8E8E' }}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: 12,
                                            border: 'none',
                                            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                            padding: '12px'
                                        }}
                                        labelStyle={{ fontWeight: 800, marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke={theme.palette.primary.main}
                                        strokeWidth={5}
                                        fill="url(#colorCount)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </Box>
                    </Card>
                </Grid>

                {/* Employees By Department (lg=4) */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: '100%', p: 3, borderRadius: 4, border: '1px solid #E5E7EB' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.2 }}>Employees By Department</Typography>
                            <Box sx={{
                                fontSize: '0.75rem',
                                px: 2,
                                py: 1,
                                bgcolor: '#F9FAFB',
                                border: '1px solid #E5E7EB',
                                borderRadius: 2,
                                fontWeight: 800,
                                color: 'text.secondary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <CalendarIcon sx={{ fontSize: '1rem' }} />
                                This Week
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                            {[
                                { name: 'UI/UX Design', value: 80 },
                                { name: 'Development', value: 110 },
                                { name: 'Management', value: 80 },
                                { name: 'HR Department', value: 30 },
                                { name: 'Quality Testing', value: 50 },
                                { name: 'Marketing', value: 100 },
                            ].map((dept) => (
                                <Box key={dept.name}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>{dept.name}</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>{Math.round((dept.value / 120) * 100)}%</Typography>
                                    </Box>
                                    <Box sx={{ height: 10, bgcolor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' }}>
                                        <Box sx={{
                                            width: `${(dept.value / 120) * 100}%`,
                                            height: '100%',
                                            bgcolor: 'primary.main',
                                            borderRadius: 5,
                                            boxShadow: '0 2px 4px rgba(255, 155, 68, 0.2)'
                                        }} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        <Box sx={{ mt: 5, pt: 3, borderTop: '1px dashed #E5E7EB', textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                                <Box component="span" sx={{ color: 'success.main', fontWeight: 900, mr: 1 }}>●</Box>
                                Overall growth <Typography component="span" variant="caption" sx={{ color: 'success.main', fontWeight: 900 }}>+20%</Typography> from last week
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

// HR Dashboard Component
const HRDashboard = ({ user, data }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dummy = generateHRData();
    const attendance = data.todayAttendance || dummy.todayAttendance;
    const payroll = data.payrollStatus || dummy.payrollStatus;
    const leaves = data.pendingLeaves || dummy.pendingLeaves;
    const efficiency = dummy.efficiencyTrend;

    return (
        <Box sx={{ p: { xs: 2, md: 4 } }}>
            {/* Header Breadcrumbs */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700 }}>HR Dashboard</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">Home</Typography>
                    <Typography variant="body2" color="text.secondary">/</Typography>
                    <Typography variant="body2" fontWeight={600}>HR Dashboard</Typography>
                </Box>
            </Box>

            {/* SmartHR Welcome Section for HR - Refined Alignment */}
            <Card sx={{
                mb: 4,
                p: { xs: 2.5, md: 3 },
                border: 'none',
                boxShadow: 'none',
                bgcolor: '#fff',
                borderRadius: 4,
                border: '1px solid #eee'
            }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Box
                            component="img"
                            src={user.profileImage || "https://randomuser.me/api/portraits/men/32.jpg"}
                            sx={{
                                width: { xs: 60, md: 80 },
                                height: { xs: 60, md: 80 },
                                borderRadius: '50%',
                                border: '4px solid #f7f7f7',
                                objectFit: 'cover'
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm>
                        <Typography variant="h5" fontWeight={700} sx={{ letterSpacing: -0.5 }}>
                            Welcome back, {user.name.split(' ')[0]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={500} sx={{ mt: 0.5 }}>
                            There are <Typography component="span" variant="body2" sx={{ color: 'warning.main', fontWeight: 700 }}>{leaves.length} Pending Leave Applications</Typography> that require your immediate attention.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md="auto">
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    fontWeight: 700,
                                    textTransform: 'none'
                                }}
                                onClick={() => navigate('/leaves')}
                            >
                                Review Leaves
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{
                                    borderRadius: 2,
                                    px: 3,
                                    py: 1,
                                    fontWeight: 700,
                                    textTransform: 'none'
                                }}
                                onClick={() => navigate('/payroll')}
                            >
                                Process Payroll
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard title="Present Today" value={attendance.present} icon={<AttendanceIcon />} color="success" trend="+5%" linkText="View Attendance" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard title="Pending Approvals" value={leaves.length} icon={<LeaveIcon />} color="warning" trend="+2" linkText="View Leaves" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard title="Payroll Done" value={`${payroll.generated}/${payroll.generated + (payroll.pending || 0)}`} icon={<TrendIcon />} color="info" trend="100%" linkText="View Payroll" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard title="Total Payout" value={`₹${(payroll.totalDisbursement || 0).toLocaleString()}`} icon={<PeopleIcon />} color="purple" trend="+3.2%" linkText="View Details" />
                </Grid>

                {/* Efficiency Chart */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ height: 420, p: 3, borderRadius: 2, border: '1px solid #eee' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 4 }}>Departmental Workforce Index</Typography>
                        <ResponsiveContainer width="100%" height="80%">
                            <BarChart data={efficiency} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                                <Tooltip
                                    cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                                    contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}
                                />
                                <Bar
                                    dataKey="value"
                                    fill={theme.palette.secondary.main}
                                    radius={[0, 8, 8, 0]}
                                    barSize={20}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Grid>

                {/* Leave List */}
                <Grid item xs={12} lg={4}>
                    <Card sx={{ height: 420, p: 3, borderRadius: 2, border: '1px solid #eee' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight={700}>Pending Leaves</Typography>
                            <Button size="small" onClick={() => navigate('/leaves')}>View All</Button>
                        </Box>
                        <List disablePadding>
                            {leaves.slice(0, 4).map((leave, index) => (
                                <ListItem key={leave.id} sx={{ px: 0, py: 1.5, borderBottom: index !== Math.min(leaves.length, 4) - 1 ? '1px solid #eee' : 'none' }}>
                                    <ListItemText
                                        primary={<Typography variant="body2" fontWeight={700}>{leave.name}</Typography>}
                                        secondary={`${leave.type} • ${leave.duration}`}
                                    />
                                    <Chip
                                        label="Review"
                                        size="small"
                                        onClick={() => navigate('/leaves')}
                                        sx={{
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            color: 'secondary.main',
                                            fontWeight: 700,
                                            cursor: 'pointer',
                                            borderRadius: 1,
                                            '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.2) }
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
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
