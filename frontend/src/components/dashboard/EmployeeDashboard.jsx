import React from 'react';
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
import { generateEmployeeData } from '../../utils/dashboardData';

const EmployeeDashboard = ({ user, data, onRefresh }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    // Merge real data with rich dummy data fallbacks
    const dummy = generateEmployeeData(user);
    const profile = data.profile || dummy.profile;
    const leaveBalance = data.leaveBalance || dummy.leaveBalance;
    const thisMonthAttendance = data.thisMonthAttendance || dummy.thisMonthAttendance;
    const todayStatus = data.todayStatus || dummy.todayStatus;
    const lastPayslip = data.lastPayslip || dummy.lastPayslip;
    const pendingCount = data.pendingLeavesCount || dummy.pendingLeavesCount;

    const stats = [
        {
            title: 'Attendance Rate',
            value: `${Math.round((thisMonthAttendance.present / (thisMonthAttendance.total || 1)) * 100)}%`,
            icon: <CheckCircleIcon />,
            color: 'success',
            trend: '+2.5%',
            linkText: 'View Details'
        },
        {
            title: 'Monthly Absences',
            value: thisMonthAttendance.absent,
            icon: <WarningIcon />,
            color: 'error',
            trend: '-1.2%',
            linkText: 'View Details'
        },
        {
            title: 'Pending Leaves',
            value: pendingCount,
            icon: <PendingIcon />,
            color: 'warning',
            trend: '0%',
            linkText: 'View Leaves'
        }
    ];

    return (
        <Box sx={{
            minHeight: '100%',
            px: { xs: 2.5, md: 4 }, // Aligned with Admin
            py: { xs: 3, md: 4 },
            bgcolor: 'background.default'
        }}>
            {/* Header / Breadcrumbs */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary' }}>Employee Dashboard</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Dashboard</Typography>
                    <Typography variant="body2" color="text.secondary">/</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>Overview</Typography>
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
                            Welcome Back, {profile.name.split(' ')[0]}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                You've completed
                            </Typography>
                            <Typography variant="body1" sx={{ color: 'primary.main', fontWeight: 800 }}>
                                {Math.round((thisMonthAttendance.present / (thisMonthAttendance.total || 1)) * 100)}%
                            </Typography>
                            <Typography variant="body1" color="text.secondary" fontWeight={500}>
                                of your goals this month. Keep it up!
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md="auto">
                        <Box sx={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            p: 2.5,
                            px: 3.5,
                            borderRadius: 3,
                            bgcolor: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            minWidth: 160
                        }}>
                            <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.7rem' }}>
                                EMPLOYEE CODE
                            </Typography>
                            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2, mt: 0.5, color: '#1f1f1f' }}>
                                {profile.employeeCode}
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ mt: 0.75 }}>
                                {profile.designation}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    <Grid container spacing={3}>
                        {stats.map((stat, index) => (
                            <Grid item xs={12} sm={4} key={index}>
                                <StatsCard {...stat} />
                            </Grid>
                        ))}

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 2.5, ml: 0.5, fontWeight: 800 }}>Daily Tracker</Typography>
                            <AttendanceWidget
                                user={user}
                                todayStatus={todayStatus}
                                onStatusChange={onRefresh}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Typography variant="h6" sx={{ mb: 2.5, ml: 0.5, fontWeight: 800 }}>Financial Snapshot</Typography>
                            <Card sx={{
                                height: 260,
                                borderRadius: 4,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                p: 4,
                                color: '#fff',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                border: 'none',
                                boxShadow: '0 10px 30px rgba(255, 155, 68, 0.25)'
                            }}>
                                <Box sx={{ position: 'relative', zIndex: 1 }}>
                                    <Typography variant="overline" sx={{ opacity: 0.9, fontWeight: 800, letterSpacing: 3, fontSize: '0.75rem' }}>NET SALARY PAYOUT</Typography>
                                    {lastPayslip ? (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="h3" fontWeight={900} sx={{ letterSpacing: -1 }}>
                                                ₹{lastPayslip.netSalary.toLocaleString()}
                                            </Typography>
                                            <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600, mt: 1 }}>
                                                For {new Date(lastPayslip.year, lastPayslip.month - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Typography variant="h4" fontWeight={800} sx={{ mt: 2 }}>Details Pending</Typography>
                                    )}
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    onClick={() => navigate('/payroll')}
                                    sx={{
                                        p: 1.75,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(255,255,255,0.25)',
                                        backdropFilter: 'blur(10px)',
                                        fontWeight: 800,
                                        textTransform: 'none',
                                        fontSize: '0.94rem',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' }
                                    }}
                                >
                                    Download Monthly Payslip
                                </Button>

                                {/* Aesthetic background circle */}
                                <Box sx={{
                                    position: 'absolute',
                                    top: -20,
                                    right: -20,
                                    width: 150,
                                    height: 150,
                                    borderRadius: '50%',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    zIndex: 0
                                }} />
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 2 }}>
                                <Typography variant="h6" fontWeight={800}>Leave Balances</Typography>
                                <Button
                                    endIcon={<ChevronRightIcon />}
                                    onClick={() => navigate('/leaves')}
                                    sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'none' }}
                                >
                                    View All Records
                                </Button>
                            </Box>
                            <Grid container spacing={3}>
                                {Object.entries(leaveBalance).map(([key, bal]) => (
                                    <Grid item xs={12} sm={4} key={key}>
                                        <LeaveBalanceCard
                                            type={key}
                                            {...bal}
                                            onApply={() => navigate('/leaves')}
                                            sx={{
                                                border: '1px solid #E5E7EB',
                                                borderRadius: 4,
                                                p: 3,
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                                                }
                                            }}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <NotificationList />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 800 }}>Holiday Calendar</Typography>
                            <Card sx={{
                                borderRadius: 4,
                                border: '1px solid #E5E7EB',
                                overflow: 'hidden',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                            }}>
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
