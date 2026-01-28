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
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Checkbox,
    FormControlLabel,
    useTheme,
    Divider,
    alpha
} from '@mui/material';
import {
    FilterAlt as FilterIcon,
    Download as DownloadIcon,
    PictureAsPdf as PdfIcon,
    Add as AddIcon,
    Edit as EditIcon,
    GroupAdd as BulkIcon,
    Lock as LockIcon,
    LockOpen as UnlockIcon,
    EventAvailable as PresentIcon,
    EventBusy as AbsentIcon,
    Sick as LeaveIcon,
    HourglassBottom as HalfDayIcon
} from '@mui/icons-material';
import AttendancePanel from '../components/AttendancePanel';
import AttendanceStats from '../components/AttendanceStats';
import AttendanceInsights from '../components/AttendanceInsights';

const Attendance = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const { showSuccess, showError } = useNotification();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [summary, setSummary] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [isLocked, setIsLocked] = useState(false);

    // Modal States
    const [openManualModal, setOpenManualModal] = useState(false);
    const [openBulkModal, setOpenBulkModal] = useState(false);
    const [manualData, setManualData] = useState({
        employeeId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        checkInTime: '',
        checkOutTime: '',
        remarks: ''
    });
    const [bulkData, setBulkData] = useState({
        employeeIds: [],
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        remarks: ''
    });
    const [selectAll, setSelectAll] = useState(false);


    const roleName = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();
    const isHRorAdmin = roleName === 'hr' || roleName === 'admin';

    useEffect(() => {
        if (isHRorAdmin) {
            fetchEmployees();
        }
        fetchAttendance();
        // Always check today status for widget
        checkTodayStatus();
    }, [user, isHRorAdmin]);

    const fetchEmployees = async () => {
        try {
            const response = await employeeAPI.getAll({ status: 'active' });
            setEmployees(response.data.data.employees);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const fetchAttendance = async (employeeId = null) => {
        setLoading(true);
        try {
            const params = {
                startDate: dateFilter.startDate,
                endDate: dateFilter.endDate
            };
            if (employeeId || selectedEmployee) {
                params.employeeId = employeeId || selectedEmployee;
            }
            const response = await attendanceAPI.getRecords(params);
            setAttendanceRecords(response.data.data.attendance);
            setSummary(response.data.data.summary);
        } catch (err) {
            console.error('Error fetching attendance:', err);
        } finally {
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
        fetchAttendance();
    };

    const handleClearFilter = () => {
        setSelectedEmployee('');
        const defaultStart = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];
        const defaultEnd = new Date().toISOString().split('T')[0];
        setDateFilter({ startDate: defaultStart, endDate: defaultEnd });

        // Use timeout to allow state update or verify strict flow
        attendanceAPI.getRecords({ startDate: defaultStart, endDate: defaultEnd })
            .then(res => {
                setAttendanceRecords(res.data.data.attendance);
                setSummary(res.data.data.summary);
            });
    };

    const handleExportCSV = async () => {
        setExporting(true);
        const params = { startDate: dateFilter.startDate, endDate: dateFilter.endDate };
        if (selectedEmployee) params.employeeId = selectedEmployee;

        const filename = generateFilename('attendance', 'csv', dateFilter);
        const result = await handleExport(attendanceAPI.exportCSV, params, filename);

        if (result.success) showSuccess('Attendance data exported successfully');
        else showError(result.message || 'Export failed');
        setExporting(false);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        const params = { startDate: dateFilter.startDate, endDate: dateFilter.endDate };
        if (selectedEmployee) params.employeeId = selectedEmployee;

        const filename = generateFilename('attendance', 'pdf', dateFilter);
        const result = await handleExport(attendanceAPI.exportPDF, params, filename);

        if (result.success) showSuccess('Attendance report exported successfully');
        else showError(result.message || 'Export failed');
        setExporting(false);
    };

    // Manual Entry Handlers
    const handleManualSubmit = async () => {
        try {
            let payload = { ...manualData };
            if (payload.checkInTime) payload.checkInTime = `${payload.date}T${payload.checkInTime}`;
            if (payload.checkOutTime) {
                let checkOutDate = payload.date;
                if (payload.checkInTime && payload.checkOutTime < manualData.checkInTime) {
                    const nextDay = new Date(payload.date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkOutDate = nextDay.toISOString().split('T')[0];
                }
                payload.checkOutTime = `${checkOutDate}T${payload.checkOutTime}`;
            }

            await attendanceAPI.manualEntry(payload);
            showSuccess('Request submitted successfully');
            setOpenManualModal(false);
            fetchAttendance();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update attendance');
        }
    };

    const openManual = (record = null) => {
        if (record) {
            setManualData({
                employeeId: record.employeeId?._id || user._id, // Fallback to current user if request
                date: new Date(record.date).toISOString().split('T')[0],
                status: record.status,
                checkInTime: record.checkInTime ? new Date(record.checkInTime).toTimeString().substring(0, 5) : '',
                checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toTimeString().substring(0, 5) : '',
                remarks: record.remarks || ''
            });
        } else {
            setManualData({
                employeeId: user._id, // Default to self for regular employees
                date: new Date().toISOString().split('T')[0],
                status: 'present',
                checkInTime: '',
                checkOutTime: '',
                remarks: ''
            });
        }
        setOpenManualModal(true);
    };

    const handleBulkSubmit = async () => {
        try {
            await attendanceAPI.bulkEntry({
                ...bulkData,
                employeeIds: selectAll ? employees.map(e => e._id) : bulkData.employeeIds
            });
            showSuccess('Bulk attendance updated successfully');
            setOpenBulkModal(false);
            fetchAttendance();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update bulk attendance');
        }
    };

    const handleLockToggle = async (date) => {
        try {
            const lockDate = dateFilter.startDate;
            await attendanceAPI.toggleLock({ date: lockDate, lock: !isLocked });
            setIsLocked(!isLocked);
            showSuccess(`Attendance for ${lockDate} ${!isLocked ? 'Locked' : 'Unlocked'}`);
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to toggle lock');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'success';
            case 'absent': return 'error';
            case 'half_day': return 'warning';
            case 'leave': return 'info';
            case 'holiday': return 'secondary';
            default: return 'default';
        }
    };

    const SummaryCard = ({ title, value, icon, color }) => (
        <Card sx={{ p: 2, height: '100%', display: 'flex', alignItems: 'center', gap: 2, border: '1px solid', borderColor: alpha(theme.palette[color].main, 0.2) }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette[color].main, 0.1), color: `${color}.main` }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="h6" fontWeight={800}>{value || 0}</Typography>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{title}</Typography>
            </Box>
        </Card>
    );

    return (
        <Box sx={{ pb: 5, maxWidth: 1600, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: -0.5 }}>Attendance</Typography>
                <Typography variant="body2" color="text.secondary">Track and manage your attendance records</Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Left Section: Summary + Filters + List */}
                <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>

                        {/* Summary Cards - 2x2 Grid */}
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <SummaryCard title="Present" value={summary?.present} icon={<PresentIcon />} color="success" />
                            </Grid>
                            <Grid item xs={6}>
                                <SummaryCard title="Absent" value={summary?.absent} icon={<AbsentIcon />} color="error" />
                            </Grid>
                            <Grid item xs={6}>
                                <SummaryCard title="Half Days" value={summary?.half_day} icon={<HalfDayIcon />} color="warning" />
                            </Grid>
                            <Grid item xs={6}>
                                <SummaryCard title="Leaves" value={summary?.leave} icon={<LeaveIcon />} color="info" />
                            </Grid>
                        </Grid>

                        {/* Filters */}
                        <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', width: { xs: '100%', sm: 'auto' } }}>
                                    <FilterIcon fontSize="small" />
                                    <Typography variant="subtitle2" fontWeight={700}>Filters</Typography>
                                </Box>

                                {isHRorAdmin && (
                                    <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
                                        <InputLabel>Employee</InputLabel>
                                        <Select
                                            value={selectedEmployee}
                                            onChange={(e) => setSelectedEmployee(e.target.value)}
                                            label="Employee"
                                        >
                                            <MenuItem value="">All Employees</MenuItem>
                                            {employees.map((emp) => (
                                                <MenuItem key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                <TextField
                                    type="date"
                                    label="Start"
                                    value={dateFilter.startDate}
                                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                                    size="small"
                                    sx={{ width: 130 }}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <TextField
                                    type="date"
                                    label="End"
                                    value={dateFilter.endDate}
                                    onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                                    size="small"
                                    sx={{ width: 130 }}
                                    InputLabelProps={{ shrink: true }}
                                />
                                <Button variant="contained" onClick={handleFilter} size="small" sx={{ borderRadius: 2, ml: 'auto' }}>Apply</Button>
                            </Box>
                        </Paper>

                        {/* Table */}
                        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', boxShadow: 'none', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <TableContainer sx={{ flex: 1, overflowY: 'auto', minHeight: 300 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>Status</TableCell>
                                            <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>Work Hrs</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell>
                                            </TableRow>
                                        ) : attendanceRecords.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} align="center" sx={{ py: 5, color: 'text.secondary' }}>No records found</TableCell>
                                            </TableRow>
                                        ) : (
                                            attendanceRecords.map((record) => (
                                                <TableRow key={record._id} hover>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {new Date(record.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short' })}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={record.status}
                                                            color={getStatusColor(record.status)}
                                                            size="small"
                                                            sx={{ borderRadius: 1, fontWeight: 700, textTransform: 'capitalize', height: 24, fontSize: '0.75rem' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" fontFamily="monospace">
                                                            {record.workedHours ? `${record.workedHours}h` : '-'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => openManual(record)}
                                                            sx={{ color: 'primary.main' }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Box>
                </Grid>

                {/* Right Section: Today's Attendance Panel */}
                <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }} sx={{ height: { md: 'calc(100vh - 140px)' }, minHeight: 600 }}>
                    <AttendancePanel
                        user={user}
                        todayStatus={todayStatus}
                        onStatusChange={() => { checkTodayStatus(); fetchAttendance(); }}
                    />
                </Grid>
            </Grid>

            {/* Manual/Regularization Modal */}
            <Dialog open={openManualModal} onClose={() => setOpenManualModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {manualData.employeeId && manualData.employeeId !== user._id ? 'Edit Attendance' : 'Request Regularization'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
                        {(isHRorAdmin && !manualData.employeeId) && (
                            <FormControl fullWidth>
                                <InputLabel>Employee</InputLabel>
                                <Select
                                    value={manualData.employeeId}
                                    onChange={(e) => setManualData({ ...manualData, employeeId: e.target.value })}
                                    label="Employee"
                                >
                                    {employees.map((emp) => (
                                        <MenuItem key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <TextField
                            type="date"
                            label="Date"
                            value={manualData.date}
                            onChange={(e) => setManualData({ ...manualData, date: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            disabled={!isHRorAdmin} // Employees usually regularize specific past dates, but generic date picker ok for now
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                type="time"
                                label="Check In"
                                value={manualData.checkInTime}
                                onChange={(e) => setManualData({ ...manualData, checkInTime: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="time"
                                label="Check Out"
                                value={manualData.checkOutTime}
                                onChange={(e) => setManualData({ ...manualData, checkOutTime: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <TextField
                            label="Reason / Remarks"
                            value={manualData.remarks}
                            onChange={(e) => setManualData({ ...manualData, remarks: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Reason for regularization..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={() => setOpenManualModal(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
                    <Button
                        onClick={handleManualSubmit}
                        variant="contained"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default Attendance;
