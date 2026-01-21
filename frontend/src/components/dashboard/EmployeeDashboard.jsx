import { Grid, Box, Typography, Card, alpha, useTheme, Button, ThemeProvider, createTheme } from '@mui/material';
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
    // Force Dark Theme for Employee Dashboard
    const darkTheme = createTheme({
        palette: {
            mode: 'dark',
            primary: {
                main: '#818cf8', // Indigo 400
                light: '#a5b4fc',
                dark: '#6366f1',
                contrastText: '#0f172a'
            },
            secondary: {
                main: '#38bdf8', // Sky 400
            },
            background: {
                default: '#0f172a', // Slate 900
                paper: '#1e293b',   // Slate 800
            },
            text: {
                primary: '#f8fafc', // Slate 50
                secondary: '#94a3b8', // Slate 400
            },
            success: { main: '#34d399' },
            error: { main: '#f87171' },
            warning: { main: '#fbbf24' },
            divider: 'rgba(148, 163, 184, 0.12)'
        },
        typography: {
            fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
            h3: { fontWeight: 800, letterSpacing: '-0.02em' },
            h4: { fontWeight: 700, letterSpacing: '-0.02em' },
            h6: { fontWeight: 700 },
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: '#1e293b',
                        borderRadius: 24,
                    }
                }
            },
            MuiPaper: {
                styleOverrides: {
                    root: { backgroundImage: 'none' }
                }
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        fontSize: '0.92rem',
                    }
                }
            }
        }
    });

    const navigate = useNavigate();
    const { leaveBalance, thisMonthAttendance, todayStatus, lastPayslip, profile } = data;

    const stats = [
        {
            title: 'Attendance Rate',
            value: `${Math.round((thisMonthAttendance.present / (thisMonthAttendance.total || 1)) * 100)}%`,
            icon: <CheckCircleIcon />,
            color: 'success',
            subtitle: `${thisMonthAttendance.present} of ${thisMonthAttendance.total} days`
        },
        {
            title: 'Monthly Absences',
            value: thisMonthAttendance.absent,
            icon: <WarningIcon />,
            color: 'error',
            subtitle: 'Including unpaid leaves'
        },
        {
            title: 'Pending Requests',
            value: data.pendingLeavesCount || 0,
            icon: <PendingIcon />,
            color: 'warning',
            subtitle: 'Awaiting approval'
        }
    ];

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{
                position: 'relative',
                minHeight: '100%',
                bgcolor: 'background.default',
                mx: -2, // Negative margin to counteract parent padding if necessary, or just rely on background color
                px: { xs: 2, md: 3 },
                py: 3,
                mt: -2 // Pull up to cover potential white gaps from parent
            }}>
                {/* Elegant Header */}
                <Box sx={{
                    mb: 4,
                    p: { xs: 3, md: 5 },
                    borderRadius: 6,
                    bgcolor: 'background.paper',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: `radial-gradient(circle, ${alpha(darkTheme.palette.primary.main, 0.15)} 0%, transparent 70%)`
                    }} />

                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} md={8}>
                            <Typography variant="h3" gutterBottom sx={{ color: 'text.primary' }}>
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, <span style={{ color: darkTheme.palette.primary.main }}>{profile.name.split(' ')[0]}</span>
                            </Typography>
                            <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ opacity: 0.9 }}>
                                You are doing great! You've completed <Typography component="span" variant="h6" fontWeight={800} color="primary.main">{Math.round((thisMonthAttendance.present / (thisMonthAttendance.total || 1)) * 100)}%</Typography> of your working month.
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                            <Box sx={{
                                display: 'inline-flex',
                                flexDirection: 'column',
                                bgcolor: alpha(darkTheme.palette.action.hover, 0.1),
                                p: 2,
                                px: 3,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: alpha(darkTheme.palette.divider, 0.1)
                            }}>
                                <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1.5 }}>
                                    DESIGNATION
                                </Typography>
                                <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ mt: 0.5 }}>
                                    {profile.designation}
                                </Typography>
                                <Typography variant="caption" fontWeight={700} sx={{ color: 'primary.light', mt: 0.5, bgcolor: alpha(darkTheme.palette.primary.main, 0.1), px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                                    {profile.employeeCode}
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Grid container spacing={3}>
                    {/* Left Column: Stats, Attendance, Finance */}
                    <Grid item xs={12} lg={8}>
                        <Grid container spacing={3}>
                            {/* Stats Row */}
                            {stats.map((stat, index) => (
                                <Grid item xs={12} sm={4} key={index}>
                                    <StatsCard {...stat} sx={{
                                        borderRadius: 6,
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }} />
                                </Grid>
                            ))}

                            {/* Attendance Section */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{ mb: 2, ml: 1, color: 'text.primary' }}>Today's Tracker</Typography>
                                <AttendanceWidget
                                    user={user}
                                    todayStatus={todayStatus}
                                    onStatusChange={onRefresh}
                                />
                            </Grid>

                            {/* Financial Snapshot */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="h6" sx={{ mb: 2, ml: 1, color: 'text.primary' }}>Financial Overview</Typography>
                                <Card sx={{
                                    borderRadius: 6,
                                    background: `linear-gradient(135deg, ${darkTheme.palette.primary.dark} 0%, ${alpha(darkTheme.palette.primary.main, 0.8)} 100%)`,
                                    p: 3,
                                    color: '#fff',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: `0 20px 40px ${alpha(darkTheme.palette.primary.main, 0.25)}`
                                }}>
                                    <Box sx={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                                    <Box sx={{ position: 'absolute', bottom: -50, left: -20, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />

                                    <Box sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Box>
                                            <Typography variant="overline" sx={{ opacity: 0.9, fontWeight: 700, letterSpacing: 2 }}>LAST PAYOUT</Typography>
                                            {lastPayslip ? (
                                                <Box>
                                                    <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 0.5 }}>
                                                        ₹{lastPayslip.netSalary.toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500 }}>
                                                        Credited: {new Date(lastPayslip.year, lastPayslip.month - 1).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                                    </Typography>
                                                </Box>
                                            ) : (
                                                <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>No activity yet</Typography>
                                            )}
                                        </Box>

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            disabled={!lastPayslip}
                                            startIcon={<DownloadIcon />}
                                            onClick={() => navigate('/payroll')}
                                            sx={{
                                                mt: 3,
                                                borderRadius: 4,
                                                py: 1.2,
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                backdropFilter: 'blur(10px)',
                                                color: '#fff',
                                                fontWeight: 800,
                                                boxShadow: 'none',
                                                border: '1px solid rgba(255,255,255,0.3)',
                                                '&:hover': {
                                                    bgcolor: 'rgba(255,255,255,0.3)',
                                                    transform: 'translateY(-2px)'
                                                }
                                            }}
                                        >
                                            Download Slip
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>

                            {/* Leave Management */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, mt: 1 }}>
                                    <Typography variant="h6" sx={{ ml: 1, color: 'text.primary' }}>Leave Balances</Typography>
                                    <Button
                                        endIcon={<ChevronRightIcon />}
                                        sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 3 }}
                                        onClick={() => navigate('/leaves')}
                                    >
                                        View History
                                    </Button>
                                </Box>
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
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Right Column: Notifications & Calendar */}
                    <Grid item xs={12} lg={4}>
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <NotificationList />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ mb: 2, ml: 1 }}>
                                    <Typography variant="h6" sx={{ color: 'text.primary' }}>Calendar</Typography>
                                </Box>
                                <Card sx={{
                                    borderRadius: 6,
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    bgcolor: 'background.paper'
                                }}>
                                    {/* Wrapping SharedCalendar to ensure it inherits dark mode styles if possible, 
                                        or at least looks contained on the dark card */}
                                    <SharedCalendar user={user} height="360px" embedded={true} />
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </ThemeProvider>
    );
};

export default EmployeeDashboard;
