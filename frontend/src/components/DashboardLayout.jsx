import { Link, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    useTheme,
    useMediaQuery,
    AppBar,
    Toolbar,
    IconButton,
    alpha,
    Collapse,
} from '@mui/material';
import TopHeader from './TopHeader';
import ProfileDrawer from './ProfileDrawer';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    AccessTime as AttendanceIcon,
    BeachAccess as LeavesIcon,
    Payments as PayrollIcon,
    AccountBalanceWallet as PaymentsIcon, // Added for My Payslips
    Person as ProfileIcon,
    Logout as LogoutIcon,
    Menu as MenuIcon,
    SupportAgent as SupportIcon,
    CalendarToday as CalendarIcon,
    Work as WorkIcon,
    Security as SecurityIcon,
    Badge as BadgeIcon,
    Business as BusinessIcon,
    Category as CategoryIcon,
    ExpandLess,
    ExpandMore,
    Place as LocationIcon,
    TrendingUp as PerformanceIcon, // Added for PMS
    Assessment as AssessmentIcon,
    Settings as SettingsIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const DRAWER_WIDTH = 260;

function DashboardLayout({ children }) {
    const { user, logout, hasAnyPermission, hasPermission } = useAuth();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    // Profile Drawer State
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileMode, setProfileMode] = useState('view');

    const handleViewProfile = () => {
        setProfileMode('view');
        setProfileOpen(true);
    };

    const handleEditProfile = () => {
        setProfileMode('edit');
        setProfileOpen(true);
    };

    const isActive = (path) => location.pathname === path;

    // Helper to check permissions for nav items that might use 'permission' string or 'requiredPermissions' array
    const checkPermission = (item) => {
        // If no permission required, show it
        if (!item.permission && !item.requiredPermissions) return true;

        // If array of permissions (AuthContext style)
        if (item.requiredPermissions) {
            return hasAnyPermission(item.requiredPermissions);
        }

        // If single permission string
        if (item.permission) {
            return hasPermission(item.permission) || hasAnyPermission([item.permission]);
        }

        return false;
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, requiredPermissions: ['view_dashboard_admin', 'view_dashboard_hr', 'view_dashboard_employee'] },
        { path: '/employees', label: 'Employees', icon: <PeopleIcon />, requiredPermissions: ['view_employees'] },
        { path: '/attendance', label: 'Attendance', icon: <AttendanceIcon />, requiredPermissions: ['view_attendance_all', 'view_attendance_own'] },
        {
            label: 'Leave Management',
            icon: <LeavesIcon />,
            // Aggregate permission: Show if user can view any leave related page
            requiredPermissions: ['view_leaves_all', 'view_leaves_own', 'manage_leaves'],
            children: [
                { path: '/my-leaves', label: 'My Leaves', icon: <CalendarIcon />, requiredPermissions: ['view_leaves_own'] },
                { path: '/leaves', label: 'Calendar', icon: <LeavesIcon />, requiredPermissions: ['view_leaves_all', 'view_leaves_own'] }, // Points to old Leaves page for now
                { path: '/leave-approvals', label: 'Approvals', icon: <WorkIcon />, requiredPermissions: ['manage_leaves'] },
                { path: '/leave-settings', label: 'Settings', icon: <CategoryIcon />, requiredPermissions: ['manage_leaves'] },
            ]
        },
        {
            label: 'Performance',
            icon: <PerformanceIcon />,
            requiredPermissions: ['view_own_goals', 'manage_employees'],
            children: [
                { path: '/my-performance', label: 'My Performance', icon: <PerformanceIcon />, requiredPermissions: ['view_own_goals'] },
                { path: '/goals', label: 'Goals', icon: <WorkIcon />, requiredPermissions: ['manage_employees', 'view_own_goals'] },
                { path: '/team-reviews', label: 'Team Reviews', icon: <PeopleIcon />, requiredPermissions: ['manage_employees'] },
                { path: '/all-reviews', label: 'All Reviews', icon: <AssessmentIcon />, requiredPermissions: ['manage_employees'] },
                { path: '/review-cycles', label: 'Review Cycles', icon: <SettingsIcon />, requiredPermissions: ['manage_employees'] },
            ]
        },
        { path: '/payroll', label: 'Payroll Management', icon: <PayrollIcon />, requiredPermissions: ['view_payroll_all', 'manage_payroll'] },
        { path: '/my-payslips', label: 'My Payslips', icon: <PaymentsIcon />, requiredPermissions: ['view_payroll_own'] },
        { path: '/helpdesk', label: 'Help Desk', icon: <SupportIcon />, requiredPermissions: ['view_tickets_all', 'view_tickets_own'] },
        {
            label: 'Access Control',
            icon: <SecurityIcon />,
            requiredPermissions: ['manage_users'],
            children: [
                { path: '/roles', label: 'Roles', icon: <SecurityIcon />, requiredPermissions: ['manage_users'] },
                { path: '/user-roles', label: 'User Roles', icon: <PeopleIcon />, requiredPermissions: ['manage_users'] },
            ]
        },
        {
            label: 'Organization',
            icon: <BusinessIcon />,
            requiredPermissions: ['manage_employees'],
            children: [
                { path: '/departments', label: 'Departments', icon: <CategoryIcon />, requiredPermissions: ['manage_employees'] },
                { path: '/designations', label: 'Designations', icon: <BadgeIcon />, requiredPermissions: ['manage_employees'] },
                { path: '/locations', label: 'Work Locations', icon: <LocationIcon />, requiredPermissions: ['manage_employees'] },
            ]
        },
    ];

    // Filter items based on permissions
    const visibleNavItems = navItems.filter(item => {
        // If it has children, check if at least one child is visible (or if item itself has permission)
        if (item.children) {
            // First check if main item has permission
            if (!checkPermission(item)) return false;

            // Then filter children
            const visibleChildren = item.children.filter(child => checkPermission(child));

            // Note: We are mutating the item here to show only visible children. 
            // In a pure function we'd map, but for this render it's okay or we can map.
            item.visibleChildren = visibleChildren;

            return visibleChildren.length > 0;
        }

        return checkPermission(item);
    });

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const [openSubmenu, setOpenSubmenu] = useState('');

    const handleSubmenuToggle = (label) => {
        setOpenSubmenu(openSubmenu === label ? '' : label);
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <BusinessIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                <Typography variant="h5" color="text.primary" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                    AsVHR
                </Typography>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 2, py: 2 }}>
                {visibleNavItems.map((item) => (
                    <Box key={item.label}>
                        <ListItem disablePadding sx={{ mb: 0.5, px: 1 }}>
                            <ListItemButton
                                component={item.path ? Link : 'div'}
                                to={item.path}
                                onClick={() => {
                                    if (item.children) {
                                        handleSubmenuToggle(item.label);
                                    } else if (isMobile) {
                                        setMobileOpen(false);
                                    }
                                }}
                                sx={{
                                    borderRadius: 2,
                                    py: 1.25,
                                    backgroundColor: item.path && isActive(item.path) ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                    color: item.path && isActive(item.path) ? 'primary.main' : 'text.secondary',
                                    '&:hover': {
                                        backgroundColor: item.path && isActive(item.path)
                                            ? (theme) => alpha(theme.palette.primary.main, 0.12)
                                            : (theme) => alpha(theme.palette.text.primary, 0.04),
                                        color: item.path && isActive(item.path) ? 'primary.main' : 'text.primary',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: item.path && isActive(item.path) ? 'primary.main' : 'inherit',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{
                                    color: 'inherit',
                                    minWidth: 40
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontWeight: item.path && isActive(item.path) ? 600 : 500,
                                        fontSize: '0.875rem'
                                    }}
                                />
                                {item.children && (openSubmenu === item.label ? <ExpandLess /> : <ExpandMore />)}
                            </ListItemButton>
                        </ListItem>

                        {item.children && (
                            <Collapse in={openSubmenu === item.label} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding sx={{ pl: 3 }}>
                                    {(item.visibleChildren || item.children).map((child) => (
                                        <ListItem key={child.path} disablePadding sx={{ mb: 0.5 }}>
                                            <ListItemButton
                                                component={Link}
                                                to={child.path}
                                                onClick={() => isMobile && setMobileOpen(false)}
                                                sx={{
                                                    borderRadius: 2,
                                                    py: 1,
                                                    backgroundColor: isActive(child.path) ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                                    color: isActive(child.path) ? 'primary.main' : 'text.secondary',
                                                    '&:hover': {
                                                        backgroundColor: isActive(child.path)
                                                            ? (theme) => alpha(theme.palette.primary.main, 0.12)
                                                            : (theme) => alpha(theme.palette.text.primary, 0.04),
                                                        color: isActive(child.path) ? 'primary.main' : 'text.primary',
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
                                                    {child.icon}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={child.label}
                                                    primaryTypographyProps={{
                                                        fontSize: '0.825rem',
                                                        fontWeight: isActive(child.path) ? 600 : 400
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </Box>
                ))}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <ListItemButton
                    onClick={logout}
                    sx={{
                        borderRadius: 2,
                        color: 'error.main',
                        '&:hover': { bgcolor: 'error.lighter' }
                    }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontWeight: 600 }} />
                </ListItemButton>
            </Box>

            {/* User Profile removed from sidebar - moved to TopHeader */}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile App Bar used only for toggling drawer in mobile view */}
            {isMobile && (
                <AppBar
                    position="fixed"
                    sx={{
                        backgroundColor: 'background.paper',
                        color: 'text.primary',
                        boxShadow: 1,
                        display: { md: 'none' }
                    }}
                >
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                            AsVHR
                        </Typography>
                    </Toolbar>
                </AppBar>
            )}

            {/* Sidebar Drawer */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Layout (Header + Content) */}
            <Box sx={{
                flexGrow: 1,
                width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                display: 'flex',
                flexDirection: 'column',
                marginTop: { xs: '64px', md: 0 } // Add margin for mobile app bar
            }}>
                <TopHeader
                    onMenuClick={handleDrawerToggle}
                    user={user}
                    isMobile={isMobile}
                    onLogout={logout}
                    onViewProfile={handleViewProfile}
                    onEditProfile={handleEditProfile}
                />

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        backgroundColor: 'background.default',
                        p: { xs: 1.5, sm: 2, md: 3 },
                        overflow: 'auto',
                    }}
                >
                    {children}
                </Box>
            </Box>
            {/* Profile Drawer */}
            <ProfileDrawer
                open={profileOpen}
                onClose={() => setProfileOpen(false)}
                mode={profileMode}
                onModeChange={setProfileMode}
                user={user}
            />
        </Box>
    );
}

export default DashboardLayout;
