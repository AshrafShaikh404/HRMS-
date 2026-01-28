import { useState, useEffect } from 'react';

import { dashboardAPI } from '../utils/api';

import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';

import StatsCardNew from '../components/dashboard/StatsCardNew';

import EmployeesByDepartmentChart from '../components/dashboard/EmployeesByDepartmentChart';
import EmployeeStatusCard from '../components/dashboard/EmployeeStatusCard';
import AttendanceOverviewChart from '../components/dashboard/AttendanceOverviewChart';
import ClockInOutList from '../components/dashboard/ClockInOutList';
import JobsApplicantsCard from '../components/dashboard/JobsApplicantsCard';
import EmployeesListCard from '../components/dashboard/EmployeesListCard';
import TodoCard from '../components/dashboard/TodoCard';
import ProjectsTableCard from '../components/dashboard/ProjectsTableCard';
import TasksStatisticsCard from '../components/dashboard/TasksStatisticsCard';
import SchedulesCard from '../components/dashboard/SchedulesCard';
import RecentActivitiesCard from '../components/dashboard/RecentActivitiesCard';
import BirthdayCard from '../components/dashboard/BirthdayCard';

import { Box, Typography, Alert, Card, CardContent, Grid, Chip, CircularProgress, List, ListItem, ListItemText, Button, useTheme, alpha } from '@mui/material';

import {

    TrendingUp as TrendIcon,

    PersonOutline as AttendanceIcon,

    Description as LeaveIcon,

    People as PeopleIcon,

    CalendarToday as CalendarIcon,

    Business as BusinessIcon,

    Work as WorkIcon,

    Badge as BadgeIcon,

    ContactSupport as SupportIcon,

    Home as HomeIcon,

    Edit as EditIcon,

    FileDownload as ExportIcon,

    CalendarMonth as CalendarMonthIcon,

    KeyboardArrowDown as ArrowDownIcon,

    Assignment as ProjectIcon,

    Group as ClientIcon,

    Task as TaskIcon,

    AttachMoney as MoneyIcon,

    TrendingUp as ProfitIcon,

    PersonAdd as ApplicantIcon,

    AccountBalance as EarningsIcon

} from '@mui/icons-material';

import { useAuth } from '../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';

import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';



import { generateAdminData, generateHRData, generateEmployeeData } from '../utils/dashboardData';



// Admin Dashboard Component

const AdminDashboard = ({ user, data }) => {

    const theme = useTheme();

    const navigate = useNavigate();

    const adminDummy = generateAdminData();



    // Static data for statistics cards (matching reference design)

    const statsCards = [

        {

            id: 1,

            title: 'Attendance Overview',

            value: '120/154',

            icon: AttendanceIcon,

            color: '#FF9B44',

            trend: '+2.1%',

            trendDirection: 'up',

            linkText: 'View Details'

        },

        {

            id: 2,

            title: 'Number of Projects',

            value: '90/125',

            icon: ProjectIcon,

            color: '#2D6A6A',

            trend: '-2.1%',

            trendDirection: 'down',

            linkText: 'View All'

        },

        {

            id: 3,

            title: 'Number of Clients',

            value: '69/86',

            icon: ClientIcon,

            color: '#3B82F6',

            trend: '+11.2%',

            trendDirection: 'up',

            linkText: 'View All'

        },

        {

            id: 4,

            title: 'Total no of Tasks',

            value: '25/28',

            icon: TaskIcon,

            color: '#E91E63',

            trend: '+11.2%',

            trendDirection: 'up',

            linkText: 'View All'

        },

        {

            id: 5,

            title: 'Earnings this Week',

            value: '$21,445',

            icon: MoneyIcon,

            color: '#9C27B0',

            trend: '+30.2%',

            trendDirection: 'up',

            linkText: 'View Transactions'

        },

        {

            id: 6,

            title: 'Profit This Week',

            value: '$5,544',

            icon: ProfitIcon,

            color: '#F44336',

            trend: '+12.3%',

            trendDirection: 'up',

            linkText: 'View Earnings'

        },

        {

            id: 7,

            title: 'New Applicants',

            value: '98',

            icon: ApplicantIcon,

            color: '#4CAF50',

            trend: '+2.1%',

            trendDirection: 'up',

            linkText: 'View All'

        },

        {

            id: 8,

            title: 'Earnings This month',

            value: '45/48',

            icon: EarningsIcon,

            color: '#1f1f1f',

            trend: '+11.2%',

            trendDirection: 'up',

            linkText: 'View Candidates'

        }

    ];



    const attendanceData = data.attendanceHistory || adminDummy.attendanceTrend;

    const departmentData = data.departmentStats || adminDummy.departmentBreakdown?.map(d => ({ name: d._id, value: d.count }));



    return (

        <Box sx={{ width: '100%', bgcolor: '#F9FAFB', minHeight: '100vh', p: 3 }}>

            {/* Header Section with Breadcrumbs and Actions */}

            <Box sx={{

                display: 'flex',

                justifyContent: 'space-between',

                alignItems: 'center',

                mb: 3,

                flexWrap: 'wrap',

                gap: 2

            }}>

                {/* Left: Title and Breadcrumbs */}

                <Box>

                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1f1f1f', mb: 0.5 }}>

                        Admin Dashboard

                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                        <HomeIcon sx={{ fontSize: 16, color: '#6B7280' }} />

                        <Typography variant="body2" sx={{ color: '#6B7280', display: 'flex', alignItems: 'center', gap: 1 }}>
                            / Dashboard / <Box component="span" sx={{ color: '#1f1f1f', fontWeight: 600 }}>Admin Dashboard</Box>
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ExportIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#6B7280',
                            borderColor: '#E5E7EB',
                            bgcolor: '#fff',
                            '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
                        }}
                    >
                        Export
                        <ArrowDownIcon sx={{ ml: 0.5, fontSize: 18 }} />
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<CalendarMonthIcon />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#6B7280',
                            borderColor: '#E5E7EB',
                            bgcolor: '#fff',
                            '&:hover': { bgcolor: '#F9FAFB', borderColor: '#D1D5DB' }
                        }}
                    >
                        2024 - 2025
                    </Button>
                </Box>
            </Box>

            {/* SmartHR Welcome Card */}
            <Card sx={{
                p: { xs: 3, md: 4 },
                mb: 4,
                borderRadius: 4,
                bgcolor: '#fff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                border: '1px solid #E5E7EB',
                position: 'relative',
                overflow: 'visible'
            }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Box sx={{ position: 'relative' }}>
                            <Box
                                component="img"
                                src={user.profileImage || "https://randomuser.me/api/portraits/men/32.jpg"}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: '50%',
                                    border: '3px solid #FF9B44',
                                    p: 0.5,
                                    objectFit: 'cover'
                                }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={12} sm>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f1f1f' }}>
                                Welcome Back, {user?.name?.split(' ')[0] || 'System'}
                            </Typography>
                            <EditIcon sx={{ fontSize: 18, color: '#9CA3AF', cursor: 'pointer' }} />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>
                            You have <Box component="span" sx={{ color: '#4F46E5', fontWeight: 600 }}>{data.pendingRequests || 21} Pending Approvals</Box> & <Box component="span" sx={{ color: '#FF9B44', fontWeight: 600 }}>{data.onLeaveToday || 14} Leave Requests</Box>
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md="auto">
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<CalendarIcon sx={{ fontSize: 20 }} />}
                                sx={{
                                    bgcolor: '#1f1f1f',
                                    color: '#fff',
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    '&:hover': { bgcolor: '#000' },
                                    boxShadow: 'none'
                                }}
                            >
                                Add Schedule
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<WorkIcon sx={{ fontSize: 20 }} />}
                                sx={{
                                    bgcolor: '#FF9B44',
                                    color: '#fff',
                                    borderRadius: 3,
                                    px: 3,
                                    py: 1.2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    '&:hover': { bgcolor: '#F08A2E' },
                                    boxShadow: 'none'
                                }}
                            >
                                Add Requests
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* Statistics and Charts Section - Final Production Layout */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
                gap: 2.5,
                width: '100%'
            }}>
                {/* LEFT SIDE: 8 Statistics Cards in 4x2 Grid (Takes 9/12 units) */}
                <Box sx={{
                    gridColumn: { xs: 'span 1', md: 'span 9' },
                    display: 'grid',
                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                    gap: 1.5
                }}>
                    {statsCards.map((card) => (
                        <StatsCardNew key={card.id} {...card} />
                    ))}
                </Box>

                {/* RIGHT SIDE: Employees By Department Chart (Takes 3/12 units) */}
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
                    <EmployeesByDepartmentChart />
                </Box>
            </Box>

            {/* Second Row of Analytics: Employee Status, Attendance, Clock-In/Out */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 2.5,
                mt: 2.5,
                width: '100%'
            }}>
                <EmployeeStatusCard />
                <AttendanceOverviewChart />
                <ClockInOutList />
            </Box>

            {/* Third Row of Management: Jobs Applicants, Employees, Todo */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 2.5,
                mt: 2.5,
                width: '100%'
            }}>
                <JobsApplicantsCard />
                <EmployeesListCard />
                <TodoCard />
            </Box>

            {/* Fourth Row: Projects Table & Tasks Statistics */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
                gap: 2.5,
                mt: 2.5,
                width: '100%'
            }}>
                {/* Projects Table (Takes 9/12 units) */}
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 9' } }}>
                    <ProjectsTableCard />
                </Box>

                {/* Tasks Statistics (Takes 3/12 units) */}
                <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 3' } }}>
                    <TasksStatisticsCard />
                </Box>
            </Box>

            {/* Fifth Row: Schedules, Recent Activities, Birthdays */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                gap: 2.5,
                mt: 2.5,
                width: '100%'
            }}>
                <SchedulesCard />
                <RecentActivitiesCard />
                <BirthdayCard />
            </Box>
        </Box>
    );



};



// HR Dashboard Component

const HRDashboard = ({ user, data }) => {

    const theme = useTheme();

    const navigate = useNavigate();

    const dummy = generateHRData();

    const attendance = data.todayAttendance || dummy.todayAttendance;

    const leaves = data.pendingLeaves || dummy.pendingLeaves;

    const payroll = data.payrollSummary || dummy.payrollStatus;

    const efficiency = data.efficiencyTracking || dummy.efficiencyTrend;



    return (

        <Box sx={{ width: '100%', bgcolor: 'background.default', minHeight: '100%' }}>

            {/* Header / Breadcrumbs */}

            <Box sx={{ mb: 4 }}>

                <Typography variant="h4" sx={{ mb: 0.5, fontWeight: 700, color: 'text.primary' }}>HR Dashboard</Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>Dashboard</Typography>

                    <Typography variant="body2" color="text.secondary">/</Typography>

                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>HR Management</Typography>

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

                            Good Morning, {user?.name?.split(' ')[0] || 'User'}

                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>

                            <Typography variant="body1" color="text.secondary" fontWeight={500}>

                                Recruitment drive is

                            </Typography>

                            <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 800 }}>

                                85% Complete

                            </Typography>

                            <Typography variant="body1" color="text.secondary" fontWeight={500}>

                                for this quarter.

                            </Typography>

                        </Box>

                    </Grid>

                    <Grid item xs={12} md="auto">

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>

                            <Button

                                variant="contained"

                                color="secondary"

                                sx={{

                                    borderRadius: 3,

                                    px: 4,

                                    py: 1.5,

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

                                    borderRadius: 3,

                                    px: 4,

                                    py: 1.5,

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

                    <Card sx={{ height: 480, p: 3, borderRadius: 4, border: '1px solid #E5E7EB' }}>

                        <Typography variant="h6" fontWeight={800} sx={{ mb: 4, letterSpacing: -0.2 }}>Workforce Efficiency Index</Typography>

                        <ResponsiveContainer width="100%" height="85%">

                            <BarChart data={efficiency} layout="vertical">

                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />

                                <XAxis type="number" hide />

                                <YAxis

                                    dataKey="name"

                                    type="category"

                                    axisLine={false}

                                    tickLine={false}

                                    tick={{ fontSize: 13, fontWeight: 700, fill: '#1f1f1f' }}

                                    width={100}

                                />

                                <Tooltip

                                    cursor={{ fill: alpha(theme.palette.secondary.main, 0.05) }}

                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}

                                />

                                <Bar

                                    dataKey="value"

                                    fill={theme.palette.secondary.main}

                                    radius={[0, 10, 10, 0]}

                                    barSize={24}

                                    animationDuration={1500}

                                />

                            </BarChart>

                        </ResponsiveContainer>

                    </Card>

                </Grid>



                {/* Leave List */}

                <Grid item xs={12} lg={4}>

                    <Card sx={{ height: 480, p: 3, borderRadius: 4, border: '1px solid #E5E7EB' }}>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>

                            <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.2 }}>Pending Leaves</Typography>

                            <Button size="small" onClick={() => navigate('/leaves')} sx={{ fontWeight: 700, color: 'text.secondary' }}>View All</Button>

                        </Box>

                        <List disablePadding>

                            {leaves.slice(0, 5).map((leave, index) => (

                                <ListItem key={leave.id} sx={{

                                    px: 0,

                                    py: 2,

                                    borderBottom: index !== Math.min(leaves.length, 5) - 1 ? '1px solid #F3F4F6' : 'none'

                                }}>

                                    <ListItemText

                                        primary={<Typography variant="body2" fontWeight={800}>{leave.name}</Typography>}

                                        secondary={<Typography variant="caption" color="text.secondary" fontWeight={600}>{leave.type} • {leave.duration}</Typography>}

                                    />

                                    <Chip

                                        label="Review"

                                        size="small"

                                        onClick={() => navigate('/leaves')}

                                        sx={{

                                            bgcolor: alpha(theme.palette.primary.main, 0.1),

                                            color: 'primary.main',

                                            fontWeight: 800,

                                            cursor: 'pointer',

                                            borderRadius: 2,

                                            height: 28,

                                            px: 1,

                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }

                                        }}

                                    />

                                </ListItem>

                            ))}

                        </List>

                        {leaves.length === 0 && (

                            <Box sx={{ textAlign: 'center', py: 5 }}>

                                <Typography variant="body2" color="text.secondary" fontWeight={500}>No pending leaves</Typography>

                            </Box>

                        )}

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

        <Box sx={{ width: '100%' }}>

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

