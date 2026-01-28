import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import AccessDenied from './AccessDenied';

const ProtectedRoute = ({ requiredPermissions = [], children }) => {
    const { user, loading, hasAnyPermission } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
        return <AccessDenied />;
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
