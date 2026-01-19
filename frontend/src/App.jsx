import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Profile from './pages/Profile';
import Helpdesk from './pages/Helpdesk';

import { NotificationProvider } from './contexts/NotificationContext';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setIsAuthenticated(true);
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogin = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
    };

    return (
        <NotificationProvider>
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
        </NotificationProvider>
    );
}

export default App;
