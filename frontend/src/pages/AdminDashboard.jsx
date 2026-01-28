import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Chip,
    Avatar,
    Paper,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    useTheme,
    alpha,
    IconButton,
    Menu,
    LinearProgress,
    Stack,
    Divider
} from '@mui/material';
import {
    FileDownload as ExportIcon,
    CalendarToday as CalendarIcon,
    Group as GroupIcon,
    BusinessCenter as ProjectIcon,
    Handshake as ClientIcon,
    Assignment as TaskIcon,
    TrendingUp as EarningsIcon,
    AttachMoney as ProfitIcon,
    PersonAdd as ApplicantsIcon,
    PersonAddAlt as HireIcon,
    MoreVert as MoreIcon,
    ArrowDropDown as DropdownIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    ArrowUpward as UpIcon,
    ArrowDownward as DownIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Business as BusinessIcon,
    Assessment as AssessmentIcon,
    EventNote as EventNoteIcon,
    BarChart as BarChartIcon,
    Description as DescriptionIcon
} from '@mui/icons-material';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Premium dummy data matching SmartHR style
const dummyData = {
    pendingApprovals: 12,
    leaveRequests: 8,
    attendanceOverview: {
        present: 142,
        absent: 8,
        onLeave: 15,
        total: 165,
        percentage: 86
    },
    metrics: {
        totalProjects: 24,
        totalClients: 18,
        totalTasks: 156,
        earningsThisWeek: 45678,
        profitThisWeek: 12345,
        jobApplicants: 47,
        newHiresThisMonth: 12
    },
    departmentData: [
        { name: 'Development', employees: 45, percentage: 27, color: '#FF9B44' },
        { name: 'Design', employees: 12, percentage: 7, color: '#008CBA' },
        { name: 'Marketing', employees: 18, percentage: 11, color: '#55CE63' },
        { name: 'Sales', employees: 22, percentage: 13, color: '#f62d51' },
        { name: 'HR', employees: 8, percentage: 5, color: '#7460ee' },
        { name: 'Finance', employees: 6, percentage: 4, color: '#FFC107' },
        { name: 'Operations', employees: 15, percentage: 9, color: '#00BCD4' },
        { name: 'Support', employees: 9, percentage: 5, color: '#9C27B0' }
    ],
    attendanceTrend: [
        { day: 'Mon', present: 145, absent: 12, leave: 8 },
        { day: 'Tue', present: 148, absent: 10, leave: 7 },
        { day: 'Wed', present: 142, absent: 15, leave: 8 },
        { day: 'Thu', present: 150, absent: 8, leave: 7 },
        { day: 'Fri', present: 138, absent: 18, leave: 9 },
        { day: 'Sat', present: 45, absent: 5, leave: 15 },
        { day: 'Sun', present: 12, absent: 3, leave: 50 }
    ]
};

const AdminDashboard = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
    const [yearMenuAnchor, setYearMenuAnchor] = useState(null);
    const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
    const [selectedYear, setSelectedYear] = useState('2024-2025');
    const [data, setData] = useState(dummyData);

    // Fetch data from API when available
    useEffect(() => {
        // TODO: Replace with actual API calls
        // fetchDashboardData();
    }, []);

    const handleExportMenuOpen = (event) => {
        setExportMenuAnchor(event.currentTarget);
    };

    const handleExportMenuClose = () => {
        setExportMenuAnchor(null);
    };

    const handleYearMenuOpen = (event) => {
        setYearMenuAnchor(event.currentTarget);
    };

    const handleYearMenuClose = () => {
        setYearMenuAnchor(null);
    };

    const handleProfileMenuOpen = (event) => {
        setProfileMenuAnchor(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileMenuAnchor(null);
    };

    // Premium KPI Card Component
    const KPICard = ({ title, value, icon, color, trend, subtitle, onClick }) => {
        const isPositive = trend?.startsWith('+');
        
        return (
            <Card
                sx={{
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
                    border: 'none',
                    borderRadius: 3.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: onClick ? 'pointer' : 'default',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)',
                        '& .kpi-icon': {
                            transform: 'scale(1.1)',
                        }
                    },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background: `linear-gradient(90deg, ${color} 0%, ${alpha(color, 0.6)} 100%)`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                        opacity: 1,
                    }
                }}
                onClick={onClick}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                        <Box
                            className="kpi-icon"
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: '16px',
                                background: `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
                                color: color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'transform 0.3s ease',
                            }}
                        >
                            {icon}
                        </Box>
                        
                        {trend && (
                            <Chip
                                label={trend}
                                size="small"
                                sx={{
                                    bgcolor: alpha(isPositive ? '#55CE63' : '#f62d51', 0.1),
                                    color: isPositive ? '#55CE63' : '#f62d51',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    height: 28,
                                    borderRadius: '8px',
                                    '& .MuiChip-label': {
                                        px: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }
                                }}
                                icon={isPositive ? <UpIcon sx={{ fontSize: 14 }} /> : <DownIcon sx={{ fontSize: 14 }} />}
                            />
                        )}
                    </Box>
                    
                    <Box>
                        <Typography
                            variant="h3"
                            fontWeight={800}
                            color="text.primary"
                            sx={{
                                fontSize: { xs: '1.75rem', md: '2rem' },
                                lineHeight: 1.2,
                                letterSpacing: '-0.02em',
                                mb: 0.5
                            }}
                        >
                            {typeof value === 'number' && value > 999 ? 
                                (value / 1000).toFixed(1) + 'k' : 
                                (typeof value === 'number' ? value.toLocaleString() : value)
                            }
                        </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{
                                fontSize: '0.875rem',
                                lineHeight: 1.4,
                                letterSpacing: '0.01em'
                            }}
                        >
                            {title}
                        </Typography>
                        {subtitle && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    fontSize: '0.75rem',
                                    mt: 1,
                                    display: 'block',
                                    opacity: 0.7
                                }}
                            >
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </Card>
        );
    };

    return (
        <Box sx={{ 
            width: '100%', 
            bgcolor: '#F7F8FA', 
            minHeight: '100vh',
            position: 'relative'
        }}>
            {/* Top Header */}
            <Paper
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    bgcolor: '#ffffff',
                    border: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                    borderRadius: 0
                }}
            >
                <Box sx={{ 
                    px: { xs: 3, md: 4 }, 
                    py: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Typography 
                            variant="h4" 
                            fontWeight={800}
                            sx={{ 
                                color: '#1a1a1a',
                                fontSize: { xs: '1.5rem', md: '1.875rem' },
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Search Bar */}
                        <Paper
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                px: 3,
                                py: 1.5,
                                bgcolor: alpha('#000', 0.04),
                                border: 'none',
                                borderRadius: 2.5,
                                width: { xs: 200, md: 320 }
                            }}
                        >
                            <SearchIcon sx={{ color: '#6b7280', fontSize: 20, mr: 2 }} />
                            <input
                                type="text"
                                placeholder="Search..."
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    background: 'transparent',
                                    flex: 1,
                                    fontSize: '0.875rem',
                                    color: '#374151'
                                }}
                            />
                        </Paper>

                        {/* Notifications */}
                        <IconButton
                            sx={{
                                width: 44,
                                height: 44,
                                bgcolor: alpha('#000', 0.04),
                                '&:hover': { bgcolor: alpha('#000', 0.08) }
                            }}
                        >
                            <NotificationsIcon sx={{ color: '#6b7280', fontSize: 20 }} />
                        </IconButton>

                        {/* Profile */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }} onClick={handleProfileMenuOpen}>
                            <Avatar
                                src={user?.profileImage}
                                sx={{ 
                                    width: 40, 
                                    height: 40,
                                    border: '2px solid #ffffff',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {user?.firstName?.[0] || 'A'}
                            </Avatar>
                            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                <Typography variant="body2" fontWeight={600} color="#1a1a1a">
                                    {user?.firstName || 'Admin'} {user?.lastName || ''}
                                </Typography>
                                <Typography variant="caption" color="#6b7280">
                                    Administrator
                                </Typography>
                            </Box>
                            <DropdownIcon sx={{ color: '#6b7280', fontSize: 18 }} />
                        </Box>

                        {/* Profile Menu */}
                        <Menu
                            anchorEl={profileMenuAnchor}
                            open={Boolean(profileMenuAnchor)}
                            onClose={handleProfileMenuClose}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    borderRadius: 2.5,
                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                                    border: '1px solid rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            <MenuItem onClick={handleProfileMenuClose}>
                                <SettingsIcon sx={{ mr: 2, fontSize: 18 }} /> Settings
                            </MenuItem>
                            <MenuItem onClick={handleProfileMenuClose}>
                                <LogoutIcon sx={{ mr: 2, fontSize: 18 }} /> Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Paper>

            {/* Main Content */}
            <Box sx={{ px: { xs: 3, md: 4 }, py: 4 }}>
                {/* Welcome Section */}
                <Card
                    sx={{
                        mb: 4,
                        background: 'linear-gradient(135deg, #FF9B44 0%, #FFB373 50%, #008CBA 100%)',
                        border: 'none',
                        borderRadius: 3.5,
                        boxShadow: '0 8px 32px rgba(255, 155, 68, 0.15)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, bgcolor: alpha('#ffffff', 0.1), borderRadius: '50%' }} />
                    <Box sx={{ position: 'absolute', bottom: -30, right: 100, width: 150, height: 150, bgcolor: alpha('#ffffff', 0.08), borderRadius: '50%' }} />
                    
                    <CardContent sx={{ p: { xs: 3, md: 4 }, position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                            <Box sx={{ color: 'white', flex: 1 }}>
                                <Typography 
                                    variant="h3" 
                                    fontWeight={800} 
                                    sx={{ 
                                        mb: 1,
                                        fontSize: { xs: '1.75rem', md: '2.25rem' },
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    Welcome back, {user?.firstName || 'Admin'}! 👋
                                </Typography>
                                <Typography 
                                    variant="h6" 
                                    sx={{ 
                                        opacity: 0.9,
                                        fontWeight: 400,
                                        fontSize: { xs: '1rem', md: '1.125rem' }
                                    }}
                                >
                                    Here's what's happening with your company today
                                </Typography>
                                
                                <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                                    <Chip
                                        label={`${data.pendingApprovals} Pending Approvals`}
                                        sx={{ 
                                            bgcolor: alpha('#ffffff', 0.2), 
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            height: 36,
                                            borderRadius: '10px',
                                            '& .MuiChip-label': { px: 2 }
                                        }}
                                    />
                                    <Chip
                                        label={`${data.leaveRequests} Leave Requests`}
                                        sx={{ 
                                            bgcolor: alpha('#ffffff', 0.2), 
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            height: 36,
                                            borderRadius: '10px',
                                            '& .MuiChip-label': { px: 2 }
                                        }}
                                    />
                                </Box>
                            </Box>
                            
                            <Avatar
                                src={user?.profileImage}
                                sx={{ 
                                    width: { xs: 80, md: 100 },
                                    height: { xs: 80, md: 100 },
                                    border: '4px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
                                }}
                            >
                                {user?.firstName?.[0] || 'A'}
                            </Avatar>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 2, mt: 4, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                sx={{ 
                                    bgcolor: alpha('#ffffff', 0.2), 
                                    color: 'white',
                                    borderRadius: 2.5,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    '&:hover': { 
                                        bgcolor: alpha('#ffffff', 0.3),
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Add Schedule
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ 
                                    bgcolor: 'white', 
                                    color: '#FF9B44',
                                    borderRadius: 2.5,
                                    px: 3,
                                    py: 1.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    '&:hover': { 
                                        bgcolor: alpha('#ffffff', 0.9),
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                    },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Add Requests
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* KPI Cards Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Attendance Overview */}
                    <Grid item xs={12} lg={6}>
                        <Card sx={{ 
                            height: '100%', 
                            border: 'none',
                            borderRadius: 3.5,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                            }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography 
                                    variant="h6" 
                                    fontWeight={700} 
                                    sx={{ 
                                        mb: 3,
                                        fontSize: '1.125rem',
                                        color: '#1a1a1a',
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    Attendance Overview
                                </Typography>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography 
                                            variant="h3" 
                                            fontWeight={800} 
                                            color="#55CE63"
                                            sx={{ fontSize: '1.875rem', lineHeight: 1.2 }}
                                        >
                                            {data.attendanceOverview.present}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            fontWeight={600}
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            Present
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography 
                                            variant="h3" 
                                            fontWeight={800} 
                                            color="#f62d51"
                                            sx={{ fontSize: '1.875rem', lineHeight: 1.2 }}
                                        >
                                            {data.attendanceOverview.absent}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            fontWeight={600}
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            Absent
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography 
                                            variant="h3" 
                                            fontWeight={800} 
                                            color="#FFC107"
                                            sx={{ fontSize: '1.875rem', lineHeight: 1.2 }}
                                        >
                                            {data.attendanceOverview.onLeave}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            fontWeight={600}
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            On Leave
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography 
                                            variant="h3" 
                                            fontWeight={800} 
                                            color="text.primary"
                                            sx={{ fontSize: '1.875rem', lineHeight: 1.2 }}
                                        >
                                            {data.attendanceOverview.total}
                                        </Typography>
                                        <Typography 
                                            variant="body2" 
                                            color="text.secondary" 
                                            fontWeight={600}
                                            sx={{ fontSize: '0.875rem' }}
                                        >
                                            Total
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                            Overall Attendance
                                        </Typography>
                                        <Typography variant="body2" color="#55CE63" fontWeight={700}>
                                            {data.attendanceOverview.percentage}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={data.attendanceOverview.percentage}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            bgcolor: alpha('#55CE63', 0.1),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 5,
                                                background: 'linear-gradient(90deg, #55CE63 0%, #4CAF50 100%)'
                                            }
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* KPI Cards */}
                    <Grid item xs={12} md={6}>
                        <KPICard
                            title="Total Projects"
                            value={data.metrics.totalProjects}
                            icon={<ProjectIcon sx={{ fontSize: 28 }} />}
                            color="#008CBA"
                            trend="+12%"
                            onClick={() => navigate('/projects')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <KPICard
                            title="Total Clients"
                            value={data.metrics.totalClients}
                            icon={<ClientIcon sx={{ fontSize: 28 }} />}
                            color="#55CE63"
                            trend="+8%"
                            onClick={() => navigate('/clients')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <KPICard
                            title="Total Tasks"
                            value={data.metrics.totalTasks}
                            icon={<TaskIcon sx={{ fontSize: 28 }} />}
                            color="#f62d51"
                            trend="+23%"
                            onClick={() => navigate('/tasks')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <KPICard
                            title="Earnings This Week"
                            value={`$${(data.metrics.earningsThisWeek / 1000).toFixed(1)}k`}
                            icon={<EarningsIcon sx={{ fontSize: 28 }} />}
                            color="#FF9B44"
                            trend="+18%"
                            onClick={() => navigate('/earnings')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <KPICard
                            title="Profit This Week"
                            value={`$${(data.metrics.profitThisWeek / 1000).toFixed(1)}k`}
                            icon={<ProfitIcon sx={{ fontSize: 28 }} />}
                            color="#7460ee"
                            trend="+15%"
                            onClick={() => navigate('/profit')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <KPICard
                            title="Job Applicants"
                            value={data.metrics.jobApplicants}
                            icon={<ApplicantsIcon sx={{ fontSize: 28 }} />}
                            color="#FFC107"
                            trend="+32%"
                            onClick={() => navigate('/recruitment')}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <KPICard
                            title="New Hires This Month"
                            value={data.metrics.newHiresThisMonth}
                            icon={<HireIcon sx={{ fontSize: 28 }} />}
                            color="#00BCD4"
                            subtitle="Onboarding in progress"
                            onClick={() => navigate('/employees')}
                        />
                    </Grid>
                </Grid>

                {/* Analytics Section */}
                <Grid container spacing={3}>
                    {/* Attendance Trend Chart */}
                    <Grid item xs={12} lg={8}>
                        <Card sx={{ 
                            border: 'none',
                            borderRadius: 3.5,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                            height: 400
                        }}>
                            <CardContent sx={{ p: 3, height: '100%' }}>
                                <Typography 
                                    variant="h6" 
                                    fontWeight={700} 
                                    sx={{ 
                                        mb: 3,
                                        fontSize: '1.125rem',
                                        color: '#1a1a1a',
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    Attendance Trend
                                </Typography>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={data.attendanceTrend}>
                                        <defs>
                                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#55CE63" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#55CE63" stopOpacity={0.1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={alpha('#000', 0.05)} />
                                        <XAxis 
                                            dataKey="day" 
                                            stroke="#6b7280"
                                            fontSize={12}
                                            fontWeight={500}
                                        />
                                        <YAxis 
                                            stroke="#6b7280"
                                            fontSize={12}
                                            fontWeight={500}
                                        />
                                        <Tooltip 
                                            contentStyle={{ 
                                                backgroundColor: 'white', 
                                                border: '1px solid rgba(0,0,0,0.05)',
                                                borderRadius: 12,
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                            }} 
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="present"
                                            stroke="#55CE63"
                                            strokeWidth={3}
                                            fill="url(#colorPresent)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Department Distribution */}
                    <Grid item xs={12} lg={4}>
                        <Card sx={{ 
                            border: 'none',
                            borderRadius: 3.5,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)',
                            height: 400
                        }}>
                            <CardContent sx={{ p: 3, height: '100%' }}>
                                <Typography 
                                    variant="h6" 
                                    fontWeight={700} 
                                    sx={{ 
                                        mb: 3,
                                        fontSize: '1.125rem',
                                        color: '#1a1a1a',
                                        letterSpacing: '-0.01em'
                                    }}
                                >
                                    Employees By Department
                                </Typography>
                                
                                <Box sx={{ height: 280, overflowY: 'auto' }}>
                                    <Stack spacing={2.5}>
                                        {data.departmentData.map((dept, index) => (
                                            <Box key={dept.name}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight={700} 
                                                        color="#1a1a1a"
                                                        sx={{ fontSize: '0.875rem' }}
                                                    >
                                                        {dept.name}
                                                    </Typography>
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight={700} 
                                                        color={dept.color}
                                                        sx={{ fontSize: '0.875rem' }}
                                                    >
                                                        {dept.employees} ({dept.percentage}%)
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={dept.percentage}
                                                    sx={{
                                                        height: 8,
                                                        borderRadius: 4,
                                                        bgcolor: alpha(dept.color, 0.1),
                                                        '& .MuiLinearProgress-bar': {
                                                            borderRadius: 4,
                                                            background: dept.color
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default AdminDashboard;
