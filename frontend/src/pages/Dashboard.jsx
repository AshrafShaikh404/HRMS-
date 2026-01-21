import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { dashboardAPI } from '../utils/api';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';

// Placeholder for Admin/HR dashboards if we decide to extract them too
import { Grid, Typography } from '@mui/material';
import { People, CheckCircle, Cancel, Work } from '@mui/icons-material';
import StatsCard from '../components/dashboard/StatsCard';
import AttendanceChart from '../components/dashboard/AttendanceChart';
import DepartmentChart from '../components/dashboard/DepartmentChart';
import RecentActivity from '../components/dashboard/RecentActivity';

const AdminDashboard = ({ user, data }) => {
    // Transform API data for charts
    const attendanceTrendData = data.attendanceTrend?.map(item => ({
        date: item.date,
        count: item.count
    })) || [];

    const departmentData = data.departmentBreakdown || [];

    return (
        <Box>
            {/* Welcome Section */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                    Welcome back, {user.name?.split(' ')[0]} 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here's what's happening in your organization today.
                </Typography>
            </Box>

            {/* Stats Cards Row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Total Employees"
                        value={data.employeeStats?.total}
                        icon={<People />}
                        trend="+2 this month"
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="On Time Today"
                        value={`${data.todayAttendance?.attendancePercentage}%`}
                        icon={<CheckCircle />}
                        color="success"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Absent Today"
                        value={data.todayAttendance?.absent}
                        icon={<Cancel />}
                        trend="On Leave: 0"
                        color="error"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatsCard
                        title="Pending Leaves"
                        value={data.pendingLeaves}
                        icon={<Work />}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Main Charts Row */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={8}>
                    <AttendanceChart data={attendanceTrendData} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <DepartmentChart data={departmentData} />
                </Grid>
            </Grid>

            {/* Activity Row */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <RecentActivity activities={data.recentActivities || []} />
                </Grid>
                {/* You can add another widget here like 'Today's Absentees' or 'Upcoming Holidays' */}
            </Grid>
        </Box>
    );
};

const HRDashboard = ({ user, data }) => (
    <Box>
        <Alert severity="info" sx={{ mt: 2 }}>HR Dashboard (Current View - No changes requested yet)</Alert>
        {/* We can move the original HR dashboard code here later if needed */}
    </Box>
);

function Dashboard({ user }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    const fetchDashboardData = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            let response;

            const role = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();

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
