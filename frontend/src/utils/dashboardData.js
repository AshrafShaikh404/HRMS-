export const generateAdminData = () => ({
    employeeStats: {
        total: 1254,
        active: 1180,
        inactive: 74,
        growth: '+12%'
    },
    todayAttendance: {
        present: 1102,
        absent: 45,
        onLeave: 33,
        attendancePercentage: 92
    },
    pendingLeaves: 28,
    departmentBreakdown: [
        { _id: 'Engineering', count: 450 },
        { _id: 'Marketing', count: 180 },
        { _id: 'Sales', count: 220 },
        { _id: 'HR', count: 45 },
        { _id: 'Finance', count: 65 },
        { _id: 'Operations', count: 150 },
        { _id: 'Design', count: 144 }
    ],
    attendanceTrend: [
        { date: 'Mon', count: 1050, absences: 20 },
        { date: 'Tue', count: 1120, absences: 15 },
        { date: 'Wed', count: 1100, absences: 25 },
        { date: 'Thu', count: 1080, absences: 18 },
        { date: 'Fri', count: 1102, absences: 12 },
        { date: 'Sat', count: 450, absences: 5 },
        { date: 'Sun', count: 420, absences: 8 }
    ],
    recentActivities: [
        { id: 1, type: 'hiring', user: 'Sarah Wilson', action: 'joined as Senior Designer', time: '2 hours ago', status: 'success' },
        { id: 2, type: 'leave', user: 'James Miller', action: 'applied for Sick Leave', time: '4 hours ago', status: 'warning' },
        { id: 3, type: 'payroll', user: 'System', action: 'Payroll generated for Jan 2024', time: '5 hours ago', status: 'info' },
        { id: 4, type: 'announcement', user: 'Admin', action: 'New Holiday Policy published', time: 'Yesterday', status: 'primary' }
    ]
});

export const generateHRData = () => ({
    departmentStats: {
        total: 7,
        avgEfficiency: '88%'
    },
    todayAttendance: {
        present: 1102,
        onLeave: 33,
        absent: 45
    },
    attendanceTrend: [
        { date: 'Mon', count: 1050 },
        { date: 'Tue', count: 1120 },
        { date: 'Wed', count: 1100 },
        { date: 'Thu', count: 1080 },
        { date: 'Fri', count: 1102 }
    ],
    pendingLeaves: [
        { id: 1, name: 'Alice Smith', type: 'Annual Leave', duration: '3 days', status: 'pending' },
        { id: 2, name: 'Bob Johnson', type: 'Sick Leave', duration: '1 day', status: 'pending' },
        { id: 3, name: 'Charlie Brown', type: 'Casual Leave', duration: '2 days', status: 'pending' },
        { id: 4, name: 'Diana Prince', type: 'WFH', duration: '1 day', status: 'pending' }
    ],
    payrollStatus: {
        totalDisbursement: 12500000,
        generated: 1254,
        pending: 0
    },
    leaveBalanceWarnings: [
        { name: 'John Doe', casualLeave: 1, sickLeave: 0 },
        { name: 'Jane Smith', casualLeave: 0, sickLeave: 2 },
        { name: 'Mike Ross', casualLeave: 2, sickLeave: 1 }
    ],
    efficiencyTrend: [
        { name: 'Engineering', value: 94 },
        { name: 'Marketing', value: 82 },
        { name: 'Sales', value: 88 },
        { name: 'HR', value: 91 },
        { name: 'Operations', value: 85 }
    ]
});

export const generateEmployeeData = (user) => ({
    profile: {
        name: user?.name || 'Employee',
        designation: user?.designation || 'Software Engineer',
        employeeCode: user?.employeeId || 'EMP-2024-001',
        department: 'Engineering'
    },
    leaveBalance: {
        casual: { total: 12, used: 4, label: 'Casual' },
        sick: { total: 10, used: 2, label: 'Sick' },
        earned: { total: 18, used: 5, label: 'Earned' }
    },
    thisMonthAttendance: {
        present: 18,
        absent: 1,
        total: 22,
        halfDay: 0
    },
    todayStatus: {
        checkedIn: true,
        checkInTime: '09:00 AM',
        checkOutTime: null,
        duration: '6h 30m'
    },
    lastPayslip: {
        netSalary: 85000,
        month: 1,
        year: 2024
    },
    pendingLeavesCount: 1,
    upcomingHolidays: [
        { name: 'Republic Day', date: 'Jan 26, 2024' },
        { name: 'Holi', date: 'Mar 25, 2024' }
    ]
});
