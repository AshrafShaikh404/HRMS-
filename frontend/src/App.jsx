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
<<<<<<< HEAD
            <AuthProvider>
                <ThemeProvider theme={theme}>
                    <CssBaseline />
                    <Router>
                        <AppRoutes />
                    </Router>
                </ThemeProvider>
            </AuthProvider>
=======
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                    <Routes>
                        <Route
                            path="/login"
                            element={
                                isAuthenticated ?
                                    <Navigate to="/dashboard" replace /> :
                                    <Login onLogin={handleLogin} />
                            }
                        />

                        {/* Protected Routes */}
                        <Route
                            path="/*"
                            element={
                                isAuthenticated ? (
                                    <DashboardLayout user={user} onLogout={handleLogout}>
                                        <Routes>
                                            <Route path="/dashboard" element={<Dashboard user={user} />} />
                                            <Route path="/profile" element={<Profile user={user} />} />
                                            <Route path="/employees" element={<Employees user={user} />} />
                                            <Route path="/attendance" element={<Attendance user={user} />} />
                                            <Route path="/leaves" element={<Leaves user={user} />} />
                                            <Route path="/payroll" element={<Payroll user={user} />} />
                                            <Route path="/helpdesk" element={<Helpdesk user={user} />} />
                                            <Route path="/roles" element={<RoleManagement user={user} />} />
                                            <Route path="/user-roles" element={<UserRoleAssignment user={user} />} />
                                            <Route path="/departments" element={<Departments user={user} />} />
                                            <Route path="/designations" element={<Designations user={user} />} />
                                            <Route path="/locations" element={<Locations user={user} />} />
                                            <Route path="/leave-settings" element={<LeaveSettings user={user} />} />
                                            <Route path="/my-leaves" element={<MyLeaves user={user} />} />
                                            <Route path="/leave-approvals" element={<LeaveApprovals user={user} />} />

                                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                        </Routes>
                                    </DashboardLayout>
                                ) : (
                                    <Navigate to="/login" replace />
                                )
                            }
                        />
                    </Routes>
                </Router>
            </ThemeProvider>
>>>>>>> 9fc0e80dc2cb38e7a503881861f4fa2812597cbc
        </NotificationProvider>
    );
}

export default App;
