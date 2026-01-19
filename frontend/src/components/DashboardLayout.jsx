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
} from '@mui/material';
import TopHeader from './TopHeader';
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
} from '@mui/icons-material';
import { useState } from 'react';
import Logo from '../assets/Admin.webp';

const DRAWER_WIDTH = 260;

function DashboardLayout({ user, onLogout, children }) {
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, roles: ['admin', 'hr', 'employee'] },
        { path: '/profile', label: 'My Profile', icon: <ProfileIcon />, roles: ['employee'] },
        { path: '/employees', label: 'Employees', icon: <PeopleIcon />, roles: ['admin', 'hr'] },
        { path: '/calendar', label: 'Calendar', icon: <CalendarIcon />, roles: ['admin', 'hr', 'employee'] },
        { path: '/attendance', label: 'Attendance', icon: <AttendanceIcon />, roles: ['admin', 'hr', 'employee'] },
        { path: '/leaves', label: 'Leaves', icon: <LeavesIcon />, roles: ['admin', 'hr', 'employee'] },
        { path: '/payroll', label: 'Payroll', icon: <PayrollIcon />, roles: ['admin', 'hr', 'employee'] },

        { path: '/helpdesk', label: 'Helpdesk', icon: <SupportIcon />, roles: ['admin', 'hr', 'employee'] },
    ];

    const visibleNavItems = navItems.filter(item => item.roles.includes(user.role));

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const drawerContent = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                <Box
                    component="img"
                    src={Logo} // Use imported Logo
                    alt="Logo"
                    sx={{ height: 32, objectFit: 'contain' }}
                />
                <Typography variant="h5" color="text.primary" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                    AsVHR
                </Typography>
            </Box>

            {/* Navigation */}
            <List sx={{ flex: 1, px: 2, py: 2 }}>
                {visibleNavItems.map((item) => (
                    <ListItem key={item.path} disablePadding sx={{ mb: 1, px: 2 }}>
                        <ListItemButton
                            component={Link}
                            to={item.path}
                            onClick={() => isMobile && setMobileOpen(false)}
                            sx={{
                                borderRadius: 2,
                                py: 1.5,
                                backgroundColor: isActive(item.path) ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'transparent',
                                color: isActive(item.path) ? 'primary.main' : 'text.secondary',
                                '&:hover': {
                                    backgroundColor: isActive(item.path)
                                        ? (theme) => alpha(theme.palette.primary.main, 0.12)
                                        : (theme) => alpha(theme.palette.text.primary, 0.04),
                                    color: isActive(item.path) ? 'primary.main' : 'text.primary',
                                },
                                '& .MuiListItemIcon-root': {
                                    color: isActive(item.path) ? 'primary.main' : 'inherit',
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
                                    fontWeight: isActive(item.path) ? 600 : 500,
                                    fontSize: '0.9rem'
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <ListItemButton
                    onClick={onLogout}
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
                    onLogout={onLogout}
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
        </Box>
    );
}

export default DashboardLayout;
