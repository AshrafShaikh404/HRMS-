require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'HRMS API Server',
        version: '1.0.0',
        status: 'running'
    });
});

// Import routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/employees', require('./routes/employee.routes'));
app.use('/api/v1/attendance', require('./routes/attendance.routes'));
app.use('/api/v1/leaves', require('./routes/leave.routes'));
app.use('/api/v1/payroll', require('./routes/payroll.routes'));
app.use('/api/v1/dashboard', require('./routes/dashboard.routes'));
app.use('/api/v1/recruitment', require('./routes/recruitment.routes'));
app.use('/api/v1/helpdesk', require('./routes/helpdesk'));
app.use('/api/v1/calendar', require('./routes/calendarRoutes'));
app.use('/api/v1/roles', require('./routes/role.routes'));
app.use('/api/v1/departments', require('./routes/department.routes'));
app.use('/api/v1/designations', require('./routes/designation.routes'));
app.use('/api/v1/locations', require('./routes/location.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
