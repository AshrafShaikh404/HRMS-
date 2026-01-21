import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Helpdesk from './pages/Helpdesk';

import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Separation of concerns: AppRoutes handles the routing logic using the context
const AppRoutes = () => {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route
                path="/login"
                element={
                    isAuthenticated ?
                        <Navigate to="/dashboard" replace /> :
                        <Login />
                }
            />

            {/* Protected Routes */}
            <Route
                path="/*"
                element={
                    isAuthenticated ? (
                        <DashboardLayout>
                            <Routes>
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_dashboard_admin', 'view_dashboard_hr', 'view_dashboard_employee']}>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/employees"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_employees']}>
                                            <Employees />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/attendance"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_attendance_all', 'view_attendance_own']}>
                                            <Attendance />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/leaves"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_leaves_all', 'view_leaves_own']}>
                                            <Leaves />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/payroll"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_payroll_all', 'view_payroll_own']}>
                                            <Payroll />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/helpdesk"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_tickets_all', 'view_tickets_own']}>
                                            <Helpdesk />
                                        </ProtectedRoute>
                                    }
                                />

                                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </DashboardLayout>
                    ) : (
                        <Navigate to="/login" replace />
                    )
                }
            />
        </Routes>
    );
};

function App() {
    return (
        <NotificationProvider>
            <AuthProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Router>
                        <AppRoutes />
                    </Router>
                </ThemeProvider>
            </AuthProvider>
        </NotificationProvider>
    );
}

export default App;
