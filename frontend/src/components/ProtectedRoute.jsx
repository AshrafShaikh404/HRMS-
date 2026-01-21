import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Button } from '@mui/material';

const ProtectedRoute = ({ requiredPermissions = [], children }) => {
    const { user, loading, hasAnyPermission } = useAuth();

    if (loading) {
        return null; // Or a loading spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom>
                    Access Denied
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    You do not have permission to view this page.
                </Typography>
                <Button variant="contained" href="/dashboard" sx={{ mt: 2 }}>
                    Go to Dashboard
                </Button>
            </Box>
        );
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
