import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { attendanceAPI, employeeAPI } from '../utils/api';
import { handleExport, generateFilename } from '../utils/exportHelper';
import {
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Card,
    Grid,
    Skeleton,
    CircularProgress,
} from '@mui/material';
import {
    FilterAlt as FilterIcon,
    Refresh as RefreshIcon,
    FileDownload as DownloadIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import AttendanceChart from '../components/AttendanceChart';
import AttendanceWidget from '../components/dashboard/AttendanceWidget';

const Attendance = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const isHRorAdmin = user.role === 'hr' || user.role === 'admin';

    useEffect(() => {
        if (isHRorAdmin) {
            fetchEmployees();
        }
        fetchAttendance();
        if (user.role === 'employee' || user.role === 'hr') {
            checkTodayStatus();
        }
    }, [user, isHRorAdmin]);

    const fetchEmployees = async () => {
        try {
            const response = await employeeAPI.getAll({});
            setEmployees(response.data.data.employees);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const fetchAttendance = async (employeeId = null) => {
        try {
            const params = {
                startDate: dateFilter.startDate,
                endDate: dateFilter.endDate
            };
            if (employeeId) {
                params.employeeId = employeeId;
            }
            const response = await attendanceAPI.getRecords(params);
            setAttendanceRecords(response.data.data.attendance);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setLoading(false);
        }
    };

    const checkTodayStatus = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await attendanceAPI.getRecords({
                startDate: today,
                endDate: today
            });
            if (response.data.data.attendance.length > 0) {
                setTodayStatus(response.data.data.attendance[0]);
            } else {
                setTodayStatus(null);
            }
        } catch (err) {
            console.error('Error checking today status:', err);
        }
    };

    const handleFilter = () => {
        fetchAttendance(selectedEmployee || null);
    };

    const handleClearFilter = () => {
        setSelectedEmployee('');
        setDateFilter({
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        });
        fetchAttendance();
    };

    const handleExportCSV = async () => {
        setExporting(true);
        const params = {
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate
        };
        if (selectedEmployee) {
            params.employeeId = selectedEmployee;
        }

        const filename = generateFilename('attendance', 'csv', dateFilter);
        const result = await handleExport(attendanceAPI.exportCSV, params, filename);

        if (result.success) {
            showSuccess('Attendance data exported successfully');
        } else {
            showError(result.message || 'Export failed');
        }
        setExporting(false);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        const params = {
            startDate: dateFilter.startDate,
            endDate: dateFilter.endDate
        };
        if (selectedEmployee) {
            params.employeeId = selectedEmployee;
        }

        const filename = generateFilename('attendance', 'pdf', dateFilter);
        const result = await handleExport(attendanceAPI.exportPDF, params, filename);

        if (result.success) {
            showSuccess('Attendance report exported successfully');
        } else {
            showError(result.message || 'Export failed');
        }
        setExporting(false);
    };

    const getChartData = () => {
        if (!attendanceRecords.length) return [];

        // Group by Date
        const grouped = {};
        attendanceRecords.forEach(record => {
            const dateKey = new Date(record.date).toLocaleDateString();
            if (!grouped[dateKey]) {
                grouped[dateKey] = { name: dateKey, Present: 0, Absent: 0, Leave: 0 };
            }
            if (record.status === 'present') grouped[dateKey].Present++;
            else if (record.status === 'absent') grouped[dateKey].Absent++;
            else if (record.status === 'leave') grouped[dateKey].Leave++;
            else if (record.status === 'half-day') grouped[dateKey].Leave++;
        });

        // Convert to array and sort by date
        return Object.values(grouped).sort((a, b) => new Date(a.name) - new Date(b.name)).slice(-7);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'success';
            case 'absent': return 'error';
            case 'half-day': return 'warning';
            case 'leave': return 'info';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                <Skeleton variant="rounded" height={400} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Attendance
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    {isHRorAdmin ? 'Review and manage employee attendance' : 'Track your daily attendance'}
                </Typography>
            </Box>

            {/* Employee/HR Check-in/out Widget */}
            {(user.role === 'employee' || user.role === 'hr') && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <AttendanceWidget
                            user={user}
                            todayStatus={todayStatus || {}}
                            onStatusChange={() => {
                                checkTodayStatus();
                                fetchAttendance();
                            }}
                        />
                    </Grid>
                </Grid>
            )}

            {/* HR/Admin Filters */}
            {isHRorAdmin && (
                <>
                    <Box sx={{ mb: 4 }}>
                        <Card sx={{ p: 2 }}>
                            <AttendanceChart data={getChartData()} title="Attendance Trends (Filtered)" />
                        </Card>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        mb: 3,
                        flexWrap: 'wrap'
                    }}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <InputLabel>Employee</InputLabel>
                            <Select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                label="Employee"
                            >
                                <MenuItem value="">All Employees</MenuItem>
                                {employees.map((emp) => (
                                    <MenuItem key={emp._id} value={emp._id}>
                                        {emp.firstName} {emp.lastName} ({emp.employeeCode})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            type="date"
                            label="Start Date"
                            value={dateFilter.startDate}
                            onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 150 }}
                        />
                        <TextField
                            type="date"
                            label="End Date"
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 150 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<FilterIcon />}
                            onClick={handleFilter}
                            sx={{ borderRadius: 2 }}
                        >
                            Filter
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={handleClearFilter}
                            sx={{ borderRadius: 2 }}
                        >
                            Clear
                        </Button>
                        <Box sx={{ flexGrow: { xs: 0, md: 1 } }} />
                        <Button
                            variant="outlined"
                            startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                            onClick={handleExportCSV}
                            disabled={exporting || attendanceRecords.length === 0}
                            sx={{ borderRadius: 2 }}
                            color="success"
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={exporting ? <CircularProgress size={16} /> : <PdfIcon />}
                            onClick={handleExportPDF}
                            disabled={exporting || attendanceRecords.length === 0}
                            sx={{ borderRadius: 2 }}
                            color="error"
                        >
                            Export PDF
                        </Button>
                    </Box>
                </>
            )}

            {/* Attendance Records Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            {isHRorAdmin && <TableCell>Employee</TableCell>}
                            <TableCell>Date</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Check In</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Check Out</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Hours</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendanceRecords.map((record) => (
                            <TableRow key={record._id} hover>
                                {isHRorAdmin && (
                                    <TableCell>
                                        <Typography fontWeight={600}>
                                            {record.employeeId?.firstName} {record.employeeId?.lastName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {record.employeeId?.employeeCode}
                                        </Typography>
                                    </TableCell>
                                )}
                                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                    {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                    {record.workedHours || 0} hrs
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={record.status}
                                        color={getStatusColor(record.status)}
                                        size="small"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {attendanceRecords.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No attendance records found</Typography>
                    </Box>
                )}
            </TableContainer>
        </Box>
    );
}

export default Attendance;
