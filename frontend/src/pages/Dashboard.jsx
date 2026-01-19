import { useState, useEffect } from 'react';
import { Grid, Box, Typography, Card, CircularProgress, Alert } from '@mui/material';
import {
    People as PeopleIcon,
    AssignmentInd as AttendanceIcon,
    BeachAccess as LeaveIcon,
    MonetizationOn as PayrollIcon,
    Work as WorkIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import StatsCard from '../components/StatsCard';
import AttendanceChart from '../components/AttendanceChart';
import DepartmentChart from '../components/DepartmentChart';
import SharedCalendar from '../components/SharedCalendar';

import { dashboardAPI } from '../utils/api';

function Dashboard({ user }) {
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

    // Helper to generate stats based on role
    const getStats = () => {
        if (user.role === 'admin') {
            const { employeeStats, todayAttendance } = dashboardData;
            return [
                {
                    title: 'Total Employees',
                    value: employeeStats.total,
                    icon: <PeopleIcon />,
                    color: 'primary',
                    trend: 'neutral' // You can calculate trend if you have historical data
                },
                {
                    title: 'Active Employees',
                    value: employeeStats.active,
                    icon: <WorkIcon />,
                    color: 'success',
                },
                {
                    title: 'Present Today',
                    value: todayAttendance.present,
                    icon: <AttendanceIcon />,
                    color: 'info',
                    trendValue: `${todayAttendance.attendancePercentage}%`
                },
                {
                    title: 'On Leave',
                    value: todayAttendance.onLeave,
                    icon: <LeaveIcon />,
                    color: 'warning'
                }
            ];
        } else if (user.role === 'hr') {
            const { departmentStats, todayAttendance, payrollStatus, pendingLeaves } = dashboardData;
            const totalEmployees = departmentStats.reduce((acc, curr) => acc + curr.count, 0);

            return [
                {
                    title: 'Total Employees',
                    value: totalEmployees,
                    icon: <PeopleIcon />,
                    color: 'primary'
                },
                {
                    title: 'Present Today',
                    value: todayAttendance.present,
                    icon: <AttendanceIcon />,
                    color: 'success'
                },
                {
                    title: 'Pending Leaves',
                    value: pendingLeaves.length, // accessing length of array
                    icon: <LeaveIcon />,
                    color: 'warning'
                },
                {
                    title: 'Payroll Generated',
                    value: payrollStatus.generated,
                    icon: <PayrollIcon />,
                    color: 'info'
                }
            ];
        } else {
            // Employee view
            const { leaveBalance, thisMonthAttendance, todayStatus } = dashboardData;
            return [
                {
                    title: 'Present Days (Month)',
                    value: thisMonthAttendance.present,
                    icon: <CheckCircleIcon />,
                    color: 'success'
                },
                {
                    title: 'Casual Leave Bal',
                    value: leaveBalance.casual.remaining,
                    icon: <LeaveIcon />,
                    color: 'primary'
                },
                {
                    title: 'Sick Leave Bal',
                    value: leaveBalance.sick.remaining,
                    icon: <LeaveIcon />,
                    color: 'warning'
                },
                {
                    title: 'Today Status',
                    value: todayStatus.status.toUpperCase(),
                    icon: <AttendanceIcon />,
                    color: todayStatus.status === 'present' ? 'success' : 'error'
                }
            ];
        }
    };

    const stats = getStats();

    // Prepare chart data
    let attendanceChartData = [];
    let departmentChartData = [];

    if (user.role === 'admin') {
        const { todayAttendance, departmentBreakdown } = dashboardData;
        attendanceChartData = [{
            name: 'Today',
            Present: todayAttendance.present,
            Absent: todayAttendance.absent,
            Leave: todayAttendance.onLeave
        }];
        departmentChartData = departmentBreakdown;

    } else if (user.role === 'hr') {
        const { todayAttendance, departmentStats } = dashboardData;
        attendanceChartData = [{
            name: 'Today',
            Present: todayAttendance.present,
            Absent: todayAttendance.absent,
            Leave: todayAttendance.onLeave
        }];
        departmentChartData = departmentStats;
    }
    // Employees don't get these charts in this version, or we could show personal attendance trends

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Welcome back, {user?.name || 'User'} 👋
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Dashboard Overview
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Attendance Widget for Employee and HR */}
                {stats.map((stat, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <StatsCard {...stat} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts Section - Only for Admin and HR */}
            {['admin', 'hr'].includes(user.role) && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ height: '100%', p: 2 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Attendance Overview (Today)
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <AttendanceChart data={attendanceChartData} />
                            </Box>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', p: 2 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                                Department Distribution
                            </Typography>
                            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <DepartmentChart data={departmentChartData} />
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Calendar Section */}
            <Box sx={{ mt: 4 }}>
                <SharedCalendar user={user} height="500px" embedded={true} />
            </Box>
        </Box>
    );
}

export default Dashboard;
