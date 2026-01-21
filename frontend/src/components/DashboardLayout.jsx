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
} from '@mui/icons-material';
import { useState } from 'react';
<<<<<<< HEAD
import { useAuth } from '../contexts/AuthContext';
import Logo from '../assets/Admin.webp';
=======
// import Logo from '../assets/Admin.webp'; // Removed missing asset
>>>>>>> 9fc0e80dc2cb38e7a503881861f4fa2812597cbc

const DRAWER_WIDTH = 260;

function DashboardLayout({ children }) {
    const { user, logout, hasAnyPermission } = useAuth();
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

    const navItems = [
<<<<<<< HEAD
        {
            path: '/dashboard',
            label: 'Dashboard',
            icon: <DashboardIcon />,
            requiredPermissions: ['view_dashboard_admin', 'view_dashboard_hr', 'view_dashboard_employee']
        },
        {
            path: '/employees',
            label: 'Employees',
            icon: <PeopleIcon />,
            requiredPermissions: ['view_employees']
        },
        {
            path: '/attendance',
            label: 'Attendance',
            icon: <AttendanceIcon />,
            requiredPermissions: ['view_attendance_all', 'view_attendance_own']
        },
        {
            path: '/leaves',
            label: 'Leaves',
            icon: <LeavesIcon />,
            requiredPermissions: ['view_leaves_all', 'view_leaves_own']
        },
        {
            path: '/payroll',
            label: 'Payroll',
            icon: <PayrollIcon />,
            requiredPermissions: ['view_payroll_all', 'view_payroll_own']
        },
        {
            path: '/helpdesk',
            label: 'Helpdesk',
            icon: <SupportIcon />,
            requiredPermissions: ['view_tickets_all', 'view_tickets_own']
        },
    ];

    const visibleNavItems = navItems.filter(item => hasAnyPermission(item.requiredPermissions));
=======
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, permission: 'view_dashboard' },
        { path: '/profile', label: 'My Profile', icon: <ProfileIcon /> }, // Always visible
        { path: '/employees', label: 'Employees', icon: <PeopleIcon />, permission: 'view_employees' },
        { path: '/attendance', label: 'Attendance', icon: <AttendanceIcon />, permission: 'view_attendance' },
        {
            label: 'Leave Management',
            icon: <LeavesIcon />,
            permission: 'view_leave_balance',
            children: [
                { path: '/my-leaves', label: 'My Leaves', icon: <CalendarIcon /> },
                { path: '/leave-approvals', label: 'Approvals', icon: <WorkIcon />, permission: 'approve_leave' },
                { path: '/leave-settings', label: 'Settings', icon: <CategoryIcon />, permission: 'manage_leave_types' },
            ]
        },
        { path: '/payroll', label: 'Payroll', icon: <PayrollIcon />, permission: 'view_payroll' },
        { path: '/helpdesk', label: 'Helpdesk', icon: <SupportIcon />, permission: 'view_helpdesk' },
        {
            label: 'Access Control',
            icon: <SecurityIcon />,
            permission: 'manage_access_control',
            children: [
                { path: '/roles', label: 'Roles', icon: <SecurityIcon /> },
                { path: '/user-roles', label: 'User Roles', icon: <PeopleIcon /> },
            ]
        },
        {
            label: 'Organization',
            icon: <BusinessIcon />, // Need to import BusinessIcon
            permission: 'manage_departments', // Both depts and designations fall under this high level or we use manage_designations check inside.
            // But usually menu item permission controls visibility.
            // Let's assume manage_departments covers visibility of "Organization", and we check inner permissions.
            // Actually, we should probably check if user has EITHER manage_departments OR manage_designations to show "Organization".
            // For now, let's keep it simple: Organization visible if manage_departments (which Admins have).
            children: [
                { path: '/departments', label: 'Departments', icon: <CategoryIcon /> },
                { path: '/designations', label: 'Designations', icon: <BadgeIcon /> },
                { path: '/locations', label: 'Work Locations', icon: <LocationIcon /> },
            ]
        },
    ];

    const hasPermission = (permission) => {
        if (!permission) return true;

        const role = user.role;
        const roleName = typeof role === 'string' ? role : role?.name;

        // Admin bypass
        if (roleName?.toLowerCase() === 'admin') return true;

        // For legacy string roles (hr, employee), mapped to basic permissions
        if (typeof role === 'string') {
            if (role === 'hr') {
                return ['view_dashboard', 'view_employees', 'view_attendance', 'view_leaves', 'view_payroll', 'view_helpdesk'].includes(permission);
            }
            if (role === 'employee') {
                return ['view_dashboard', 'view_attendance', 'view_leaves', 'view_helpdesk'].includes(permission);
            }
            return false;
        }

        // For new object roles
        const permissions = role?.permissions || [];
        return permissions.some(p => p.name === permission);
    };

    const visibleNavItems = navItems.filter(item => hasPermission(item.permission));
>>>>>>> 9fc0e80dc2cb38e7a503881861f4fa2812597cbc

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
                                    {item.children.map((child) => (
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
                        p: { xs: 2, sm: 3 },
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
                user={user} // Pass user if needed for initial optimists
            />
        </Box>
    );
}

export default DashboardLayout;
