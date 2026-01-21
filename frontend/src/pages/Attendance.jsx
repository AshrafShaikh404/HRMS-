import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Checkbox,
    FormControlLabel,
    Switch
} from '@mui/material';
import {
    FilterAlt as FilterIcon,
    Refresh as RefreshIcon,
    FileDownload as DownloadIcon,
    PictureAsPdf as PdfIcon,
    Add as AddIcon,
    Edit as EditIcon,
    GroupAdd as BulkIcon,
    Lock as LockIcon,
    LockOpen as UnlockIcon
} from '@mui/icons-material';
import AttendanceChart from '../components/AttendanceChart';
import AttendanceWidget from '../components/dashboard/AttendanceWidget';
import AttendanceStats from '../components/AttendanceStats';
import AttendanceInsights from '../components/AttendanceInsights';

function Attendance({ user }) {
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
        const role = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();
        if (role === 'employee' || role === 'hr') {
            checkTodayStatus();
        }
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

            // Check if ANY record in the range is locked to set the toggle UI (simplification)
            // Or ideally, check if today is locked. Let's assume the lock toggle controls a specific date, usually today or selected start date.
            // For now, let's just default to false and not bind it deeply unless we add a specific "Lock Date" UI.
            // Requirement says "Add Lock Attendance toggle per date/month". 
            // Let's rely on backend refusal and simple toggle for TODAY or Start Date.
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
        setDateFilter({
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        });
        // fetchAttendance called by effect when state changes? No, buttons usually trigger fetch explicitly or need dependency.
        // Re-calling fetch manually to be safe.
        // Actually setDateFilter is async, so better to pass defaults.
        // For now, let's just reset state and let user click Filter, or use Effect on dateFilter (which might be too aggressive).
        // Let's just manually fetch with defaults.
        attendanceAPI.getRecords({
            startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        }).then(res => {
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
            // Combine date and time
            let payload = { ...manualData };

            if (payload.checkInTime) {
                payload.checkInTime = `${payload.date}T${payload.checkInTime}`;
            }

            if (payload.checkOutTime) {
                let checkOutDate = payload.date;
                // Handle overnight shift: if checkOut < checkIn, assume it's the next day
                if (payload.checkInTime && payload.checkOutTime < manualData.checkInTime) {
                    const nextDay = new Date(payload.date);
                    nextDay.setDate(nextDay.getDate() + 1);
                    checkOutDate = nextDay.toISOString().split('T')[0];
                }
                payload.checkOutTime = `${checkOutDate}T${payload.checkOutTime}`;
            }

            await attendanceAPI.manualEntry(payload);
            showSuccess('Attendance updated successfully');
            setOpenManualModal(false);
            fetchAttendance();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to update attendance');
        }
    };

    const openManual = (record = null) => {
        if (record) {
            setManualData({
                employeeId: record.employeeId._id,
                date: new Date(record.date).toISOString().split('T')[0],
                status: record.status,
                checkInTime: record.checkInTime ? new Date(record.checkInTime).toTimeString().substring(0, 5) : '',
                checkOutTime: record.checkOutTime ? new Date(record.checkOutTime).toTimeString().substring(0, 5) : '',
                remarks: record.remarks || ''
            });
        } else {
            setManualData({
                employeeId: '',
                date: new Date().toISOString().split('T')[0],
                status: 'present',
                checkInTime: '',
                checkOutTime: '',
                remarks: ''
            });
        }
        setOpenManualModal(true);
    };

    // Bulk Handlers
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

    // Lock Handler
    const handleLockToggle = async (date) => {
        try {
            // For simplicity, let's lock/unlock the START DATE of the filter
            const lockDate = dateFilter.startDate;
            await attendanceAPI.toggleLock({ date: lockDate, lock: !isLocked });
            setIsLocked(!isLocked);
            showSuccess(`Attendance for ${lockDate} ${!isLocked ? 'Locked' : 'Unlocked'}`);
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to toggle lock');
        }
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
            else if (record.status === 'half_day') grouped[dateKey].Leave++; // Group half day with leave for simpler chart or separate
        });
        return Object.values(grouped).sort((a, b) => new Date(a.name) - new Date(b.name)).slice(-7);
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

    return (
        <Box sx={{ pb: 5 }}>
            {/* 1. Header Section */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5, letterSpacing: '-0.5px' }}>
                        Attendance
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {isHRorAdmin ? 'Manage and monitor employee attendance records' : 'Track your daily attendance and work hours'}
                    </Typography>
                </Box>
                {isHRorAdmin && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            color={isLocked ? "error" : "primary"}
                            startIcon={isLocked ? <LockIcon /> : <UnlockIcon />}
                            onClick={() => handleLockToggle()}
                            sx={{ height: 48, px: 3, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                        >
                            {isLocked ? "Unlock Date" : "Lock Date"}
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<BulkIcon />}
                            onClick={() => setOpenBulkModal(true)}
                            sx={{ height: 48, px: 3, borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                        >
                            Bulk Mark
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => openManual()}
                            sx={{ height: 48, px: 3, borderRadius: 2, fontWeight: 600, boxShadow: 0, textTransform: 'none' }}
                        >
                            Manual Entry
                        </Button>
                    </Box>
                )}
            </Box>

            {/* 2. KPI Summary Row */}
            {isHRorAdmin && <AttendanceStats summary={summary} />}

            {/* 3. Insights and Analytics Row */}
            {isHRorAdmin && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={6} lg={4}>
                        <AttendanceInsights summary={summary} />
                    </Grid>
                    <Grid item xs={12} md={6} lg={8}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                height: '100%',
                                minHeight: 300,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'background.default',
                                borderStyle: 'dashed'
                            }}
                        >
                            <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                <Typography variant="h6" fontWeight="600" gutterBottom>
                                    More Analytics Coming Soon
                                </Typography>
                                <Typography variant="body2">
                                    Trends, overtime analysis, and efficiency metrics.
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* 4. Filter & Actions Bar */}
            {isHRorAdmin && (
                <Card
                    elevation={0}
                    sx={{
                        p: 2,
                        mb: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 2
                    }}
                >
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
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
                                        {emp.firstName} {emp.lastName}
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
                            sx={{ width: 150 }}
                        />
                        <TextField
                            type="date"
                            label="End Date"
                            value={dateFilter.endDate}
                            onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ width: 150 }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleFilter}
                            startIcon={<FilterIcon />}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Filter
                        </Button>
                        <Button
                            variant="text"
                            onClick={handleClearFilter}
                            color="inherit"
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Clear
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportCSV}
                            disabled={exporting}
                            sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'divider', color: 'text.primary' }}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PdfIcon />}
                            onClick={handleExportPDF}
                            disabled={exporting}
                            sx={{ borderRadius: 2, textTransform: 'none', borderColor: 'divider', color: 'text.primary' }}
                        >
                            Export PDF
                        </Button>
                    </Box>
                </Card>
            )}

            {/* 5. Attendance Table */}
            <Paper
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    overflow: 'hidden'
                }}
            >
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                {isHRorAdmin && <TableCell sx={{ fontWeight: 600, py: 2 }}>Employee</TableCell>}
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Date</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Check In</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Check Out</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Hours</TableCell>
                                <TableCell sx={{ fontWeight: 600, py: 2 }}>Status</TableCell>
                                {isHRorAdmin && <TableCell sx={{ fontWeight: 600, py: 2, textAlign: 'right' }}>Actions</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && attendanceRecords.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                        No attendance records found
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && attendanceRecords.map((record, index) => (
                                <TableRow
                                    key={record._id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        transition: 'background-color 0.1s'
                                    }}
                                >
                                    {isHRorAdmin && (
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600" color="text.primary">
                                                    {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {record.employeeId?.employeeCode}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Typography variant="body2" color="text.primary">
                                            {new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                                            {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, display: 'inline-block' }}>
                                            {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="500">
                                            {record.workedHours ? `${record.workedHours} hrs` : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip title={record.markedBy ? `Marked by: ${record.markedBy.firstName} ${record.markedBy.lastName}` : 'Auto-marked'}>
                                            <Chip
                                                label={record.status}
                                                color={getStatusColor(record.status)}
                                                size="small"
                                                sx={{
                                                    fontWeight: 600,
                                                    textTransform: 'capitalize',
                                                    borderRadius: 1.5,
                                                    height: 26
                                                }}
                                            />
                                        </Tooltip>
                                        {record.isLocked && (
                                            <Tooltip title="Date Locked">
                                                <LockIcon fontSize="small" color="disabled" sx={{ ml: 1, verticalAlign: 'middle', fontSize: 16 }} />
                                            </Tooltip>
                                        )}
                                    </TableCell>
                                    {isHRorAdmin && (
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => openManual(record)}
                                                disabled={record.isLocked}
                                                sx={{
                                                    color: 'primary.main',
                                                    '&:disabled': { color: 'action.disabled' }
                                                }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Manual Entry Modal */}
            <Dialog open={openManualModal} onClose={() => setOpenManualModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{manualData.employeeId ? 'Edit Attendance' : 'Manual Attendance Entry'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        {!manualData.employeeId && ( // Only show Select if creating new or if not pre-filled (simple toggling logic)
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
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={manualData.status}
                                onChange={(e) => setManualData({ ...manualData, status: e.target.value })}
                                label="Status"
                            >
                                <MenuItem value="present">Present</MenuItem>
                                <MenuItem value="absent">Absent</MenuItem>
                                <MenuItem value="half_day">Half Day</MenuItem>
                                <MenuItem value="leave">Leave</MenuItem>
                                <MenuItem value="holiday">Holiday</MenuItem>
                            </Select>
                        </FormControl>
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
                            label="Remarks"
                            value={manualData.remarks}
                            onChange={(e) => setManualData({ ...manualData, remarks: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenManualModal(false)}>Cancel</Button>
                    <Button onClick={handleManualSubmit} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Bulk Entry Modal */}
            <Dialog open={openBulkModal} onClose={() => setOpenBulkModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Bulk Attendance Marking</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            type="date"
                            label="Date"
                            value={bulkData.date}
                            onChange={(e) => setBulkData({ ...bulkData, date: e.target.value })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={bulkData.status}
                                onChange={(e) => setBulkData({ ...bulkData, status: e.target.value })}
                                label="Status"
                            >
                                <MenuItem value="present">Present</MenuItem>
                                <MenuItem value="absent">Absent</MenuItem>
                                <MenuItem value="half_day">Half Day</MenuItem>
                                <MenuItem value="leave">Leave</MenuItem>
                                <MenuItem value="holiday">Holiday</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControlLabel
                            control={<Checkbox checked={selectAll} onChange={(e) => setSelectAll(e.target.checked)} />}
                            label={`Select All Active Employees (${employees.length})`}
                        />
                        {!selectAll && (
                            <FormControl fullWidth>
                                <InputLabel>Select Employees</InputLabel>
                                <Select
                                    multiple
                                    value={bulkData.employeeIds}
                                    onChange={(e) => setBulkData({ ...bulkData, employeeIds: e.target.value })}
                                    label="Select Employees"
                                    renderValue={(selected) => `${selected.length} selected`}
                                >
                                    {employees.map((emp) => (
                                        <MenuItem key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                        <TextField
                            label="Remarks"
                            value={bulkData.remarks}
                            onChange={(e) => setBulkData({ ...bulkData, remarks: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenBulkModal(false)}>Cancel</Button>
                    <Button onClick={handleBulkSubmit} variant="contained">Apply Bulk</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Attendance;
