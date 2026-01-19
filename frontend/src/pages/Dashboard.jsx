import { useState, useEffect } from 'react';
import { Box, Typography, Grid, InputBase, IconButton } from '@mui/material';
import { Search as SearchIcon, NotificationsNone as NotificationsIcon, SettingsOutlined as SettingsIcon } from '@mui/icons-material';
import { dashboardAPI } from '../utils/api';

import WelcomeBanner from '../components/dashboard/WelcomeBanner';
import DateWidget from '../components/dashboard/DateWidget';
import AttendanceWidget from '../components/dashboard/AttendanceWidget';
import QuickAccessWidget from '../components/dashboard/QuickAccessWidget';
import PayslipWidget from '../components/dashboard/PayslipWidget';
import HolidaysWidget from '../components/dashboard/HolidaysWidget';
import EventsWidget from '../components/dashboard/EventsWidget';

function Dashboard({ user }) {
    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        // Keep fetching data to potentially pass to widgets in future
        const fetchDashboardData = async () => {
            try {
                // Silently fetch/ignore errors for UI demo
                const response = user.role === 'admin' ? await dashboardAPI.getAdminDashboard() :
                    user.role === 'hr' ? await dashboardAPI.getHRDashboard() :
                        await dashboardAPI.getEmployeeDashboard();
                setDashboardData(response.data.data);
            } catch (err) {
                console.error("Dashboard fetch error", err);
            }
        };
        fetchDashboardData();
    }, [user]);

    return (
        <Box>
            {/* Header Section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        Home
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Welcome back to your dashboard
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        width: 250
                    }}>
                        <InputBase placeholder="Search ..." sx={{ flex: 1 }} />
                        <SearchIcon color="action" />
                    </Box>
                    <IconButton sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <NotificationsIcon color="action" />
                    </IconButton>
                    <IconButton sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <SettingsIcon color="action" />
                    </IconButton>
                </Box>
            </Box>

            {/* Banner */}
            <WelcomeBanner user={user} />

            {/* Row 1 Widgets */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <DateWidget />
                </Grid>
                <Grid item xs={12} md={4}>
                    <AttendanceWidget data={dashboardData?.todayAttendance} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <QuickAccessWidget />
                </Grid>
            </Grid>

            {/* Row 2 Widgets */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <PayslipWidget data={dashboardData?.payrollStatus} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <HolidaysWidget holidays={null} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <EventsWidget events={dashboardData?.recentActivities} />
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;
