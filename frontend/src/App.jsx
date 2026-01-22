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
import RoleManagement from './pages/RoleManagement';
import UserRoleAssignment from './pages/UserRoleAssignment';
import Departments from './pages/Departments';
import Designations from './pages/Designations';
import Locations from './pages/Locations';
import LeaveSettings from './pages/LeaveSettings';
import MyLeaves from './pages/MyLeaves';
import LeaveApprovals from './pages/LeaveApprovals';
import LeaveCalendar from './pages/LeaveCalendar';
import MyPayslips from './pages/MyPayslips';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import ReviewCycleSettings from './pages/ReviewCycleSettings';

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
                                    path="/profile"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_profile']}>
                                            <Profile />
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
                                        <ProtectedRoute requiredPermissions={['view_payroll_all']}>
                                            <Payroll />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/my-payslips"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_payroll_own']}>
                                            <MyPayslips />
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
                                {/* Admin/HR Routes */}
                                <Route
                                    path="/roles"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_users']}>
                                            <RoleManagement />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/user-roles"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_users']}>
                                            <UserRoleAssignment />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/departments"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_employees']}>
                                            <Departments />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/designations"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_employees']}>
                                            <Designations />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/locations"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_employees']}>
                                            <Locations />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/leave-settings"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_leaves']}>
                                            <LeaveSettings />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/my-leaves"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_leaves_own']}>
                                            <MyLeaves />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/leave-approvals"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_leaves']}>
                                            <LeaveApprovals />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/leave-calendar"
                                    element={
                                        <ProtectedRoute requiredPermissions={['view_leaves_all', 'view_leaves_own']}>
                                            <LeaveCalendar />
                                        </ProtectedRoute>
                                    }
                                />


                                <Route
                                    path="/goals"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_employees']}>
                                            <Goals />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/review-cycles"
                                    element={
                                        <ProtectedRoute requiredPermissions={['manage_employees']}>
                                            <ReviewCycleSettings />
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
