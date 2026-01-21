import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { leaveAPI } from '../utils/api';
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
    CardContent,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Skeleton,
    CircularProgress,
} from '@mui/material';
import {
    Add as AddIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    BeachAccess as CasualIcon,
    LocalHospital as SickIcon,
    Event as EarnedIcon,
    FileDownload as DownloadIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import SharedCalendar from '../components/SharedCalendar';

const Leaves = () => {
    const { user, hasPermission } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [leaves, setLeaves] = useState([]);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [newLeave, setNewLeave] = useState({
        leaveType: 'casual',
        fromDate: '',
        toDate: '',
        reason: '',
    });

    useEffect(() => {
        fetchLeaves();
        fetchLeaveBalance();
<<<<<<< HEAD
        fetchLeaves();
        fetchLeaveBalance();
        if (hasPermission('manage_leaves')) {
=======
        const role = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();
        if (role === 'admin' || role === 'hr') {
>>>>>>> 9fc0e80dc2cb38e7a503881861f4fa2812597cbc
            fetchPendingLeaves();
        }
    }, [user]);

    const fetchLeaves = async () => {
        try {
            const response = await leaveAPI.getHistory({});
            setLeaves(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching leaves:', err);
            setLoading(false);
        }
    };

    const fetchLeaveBalance = async () => {
        try {
            const response = await leaveAPI.getBalance();
            setLeaveBalance(response.data.data.balances);
        } catch (err) {
            console.error('Error fetching leave balance:', err);
        }
    };

    const fetchPendingLeaves = async () => {
        try {
            const response = await leaveAPI.getPendingApprovals();
            setPendingLeaves(response.data.data.pendingLeaves);
        } catch (err) {
            console.error('Error fetching pending leaves:', err);
        }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        try {
            await leaveAPI.apply(newLeave);
            setShowApplyModal(false);
            setNewLeave({ leaveType: 'casual', fromDate: '', toDate: '', reason: '' });
            fetchLeaves();
            fetchLeaveBalance();
            showSuccess('Leave application submitted successfully!');
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to submit leave application');
        }
    };

    const handleApprove = async (id) => {
        try {
            await leaveAPI.approve(id);
            fetchPendingLeaves();
            showSuccess('Leave approved successfully!');
        } catch (err) {
            showError('Failed to approve leave');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await leaveAPI.reject(id, reason);
            fetchPendingLeaves();
            showSuccess('Leave rejected successfully');
        } catch (err) {
            showError('Failed to reject leave');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'success';
            case 'pending': return 'warning';
            case 'rejected': return 'error';
            default: return 'default';
        }
    };

    const getLeaveTypeColor = (type) => {
        switch (type) {
            case 'casual': return 'primary';
            case 'sick': return 'error';
            case 'earned': return 'success';
            case 'unpaid': return 'default';
            default: return 'default';
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        const filename = generateFilename('leave-records', 'csv');
        const result = await handleExport(leaveAPI.exportCSV, {}, filename);

        if (result.success) {
            showSuccess('Leave records exported successfully');
        } else {
            showError(result.message || 'Export failed');
        }
        setExporting(false);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        const filename = generateFilename('leave-records', 'pdf');
        const result = await handleExport(leaveAPI.exportPDF, {}, filename);

        if (result.success) {
            showSuccess('Leave report exported successfully');
        } else {
            showError(result.message || 'Export failed');
        }
        setExporting(false);
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {[1, 2, 3].map((i) => (
                        <Grid key={i} item xs={12} sm={4}>
                            <Skeleton variant="rounded" height={120} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="rounded" height={300} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 3
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Leave Management
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your leave applications
                    </Typography>
                </Box>
                {hasPermission('apply_leave') && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setShowApplyModal(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Apply for Leave
                    </Button>
                )}
            </Box>

            {/* Leave Balance */}
            {leaveBalance && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <CasualIcon color="primary" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Casual Leave
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" color="primary.main">
                                            {leaveBalance.casualLeave.available}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Available</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h5" color="text.secondary">
                                            {leaveBalance.casualLeave.used}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Used</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <SickIcon color="error" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Sick Leave
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" color="error.main">
                                            {leaveBalance.sickLeave.available}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Available</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h5" color="text.secondary">
                                            {leaveBalance.sickLeave.used}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Used</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <EarnedIcon color="success" />
                                    <Typography variant="h6" fontWeight={600}>
                                        Earned Leave
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="h3" fontWeight="bold" color="success.main">
                                            {leaveBalance.earnedLeave.available}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Available</Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="h5" color="text.secondary">
                                            {leaveBalance.earnedLeave.used}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">Used</Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Pending Approvals (Admin/HR only) */}
            {hasPermission('manage_leaves') && pendingLeaves.length > 0 && (
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                        Pending Approvals
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>From</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>To</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Days</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Reason</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pendingLeaves.map((leave) => (
                                    <TableRow key={leave._id} hover>
                                        <TableCell>{leave.employeeId?.firstName} {leave.employeeId?.lastName}</TableCell>
                                        <TableCell>
                                            <Chip label={leave.leaveType} color={getLeaveTypeColor(leave.leaveType)} size="small" />
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                            {new Date(leave.fromDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                            {new Date(leave.toDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{leave.numberOfDays}</TableCell>
                                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{leave.reason}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    size="small"
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<CheckIcon />}
                                                    onClick={() => handleApprove(leave._id)}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<CloseIcon />}
                                                    onClick={() => handleReject(leave._id)}
                                                >
                                                    Reject
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Leave History Table */}
            <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h5" fontWeight={600}>
                        My Leave History
                    </Typography>
<<<<<<< HEAD
                    {hasPermission('manage_leaves') && (
=======
                    {['admin', 'hr'].includes(typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase()) && (
>>>>>>> 9fc0e80dc2cb38e7a503881861f4fa2812597cbc
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                                onClick={handleExportCSV}
                                disabled={exporting || leaves.length === 0}
                                color="success"
                            >
                                Export CSV
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={exporting ? <CircularProgress size={16} /> : <PdfIcon />}
                                onClick={handleExportPDF}
                                disabled={exporting || leaves.length === 0}
                                color="error"
                            >
                                Export PDF
                            </Button>
                        </Box>
                    )}
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Type</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>From</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>To</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Days</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Reason</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Applied On</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaves.map((leave) => (
                                <TableRow key={leave._id} hover>
                                    <TableCell>
                                        <Chip label={leave.leaveType} color={getLeaveTypeColor(leave.leaveType)} size="small" />
                                    </TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                        {new Date(leave.fromDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                        {new Date(leave.toDate).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{leave.numberOfDays}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{leave.reason}</TableCell>
                                    <TableCell>
                                        <Chip label={leave.status} color={getStatusColor(leave.status)} size="small" />
                                    </TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                        {new Date(leave.appliedAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {leaves.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                            <Typography color="text.secondary">No leave records found</Typography>
                        </Box>
                    )}
                </TableContainer>
            </Box>

            {/* Apply Leave Dialog */}
            <Dialog
                open={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Apply for Leave
                    <IconButton onClick={() => setShowApplyModal(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleApplyLeave}>
                    <DialogContent dividers>
                        <Grid container spacing={3}>
                            {/* Form Section (Left Side) */}
                            <Grid item xs={12} md={5} sx={{ order: { xs: 1, md: 1 } }}>
                                <Typography variant="h6" gutterBottom>Application Details</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Leave Type</InputLabel>
                                            <Select
                                                value={newLeave.leaveType}
                                                onChange={(e) => setNewLeave({ ...newLeave, leaveType: e.target.value })}
                                                label="Leave Type"
                                            >
                                                <MenuItem value="casual">Casual Leave</MenuItem>
                                                <MenuItem value="sick">Sick Leave</MenuItem>
                                                <MenuItem value="earned">Earned Leave</MenuItem>
                                                <MenuItem value="unpaid">Unpaid Leave</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="From Date"
                                            type="date"
                                            required
                                            value={newLeave.fromDate}
                                            onChange={(e) => setNewLeave({ ...newLeave, fromDate: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="To Date"
                                            type="date"
                                            required
                                            value={newLeave.toDate}
                                            onChange={(e) => setNewLeave({ ...newLeave, toDate: e.target.value })}
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Reason"
                                            multiline
                                            rows={3}
                                            required
                                            value={newLeave.reason}
                                            onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Calendar Section (Right Side for visibility) */}
                            <Grid item xs={12} md={7} sx={{ order: { xs: 2, md: 2 } }}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Check availability and holidays
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
                                    <SharedCalendar user={user} height="400px" embedded={true} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={() => setShowApplyModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            Submit Application
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}

export default Leaves;
