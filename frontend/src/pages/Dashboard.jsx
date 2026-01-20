import { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { dashboardAPI } from '../utils/api';
import EmployeeDashboard from '../components/dashboard/EmployeeDashboard';

// Placeholder for Admin/HR dashboards if we decide to extract them too
const AdminDashboard = ({ user, data }) => (
    <Box>
        <Alert severity="info" sx={{ mt: 2 }}>Admin Dashboard (Current View - No changes requested yet)</Alert>
        {/* We can move the original admin dashboard code here later if needed */}
    </Box>
);

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

    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            {user.role === 'employee' ? (
                <EmployeeDashboard
                    user={user}
                    data={dashboardData}
                    onRefresh={() => fetchDashboardData(false)}
                />
            ) : user.role === 'admin' ? (
                <AdminDashboard user={user} data={dashboardData} />
            ) : (
                <HRDashboard user={user} data={dashboardData} />
            )}
        </Box>
    );
}

export default Dashboard;
