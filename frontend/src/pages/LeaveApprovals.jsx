import { useState, useEffect } from 'react';
import { leaveAPI } from '../utils/leaveAPI';
import { useNotification } from '../contexts/NotificationContext';
import {
    Box,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    TextField,
    CircularProgress,
    Card,
    Grid
} from '@mui/material';
import {
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon
} from '@mui/icons-material';

function LeaveApprovals() {
    const { showSuccess, showError } = useNotification();
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [actionType, setActionType] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingLeaves();
    }, []);

    const fetchPendingLeaves = async () => {
        setLoading(true);
        try {
            const response = await leaveAPI.getPendingApprovals();
            setPendingLeaves(response.data.data);
        } catch (error) {
            showError('Failed to fetch pending approvals');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        try {
            await leaveAPI.updateLeaveStatus(selectedLeave._id, {
                status: actionType === 'approve' ? 'Approved' : 'Rejected',
                rejectionReason: actionType === 'reject' ? rejectionReason : undefined
            });
            showSuccess(`Leave ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
            setOpenDialog(false);
            setRejectionReason('');
            fetchPendingLeaves();
        } catch (error) {
            showError(error.response?.data?.message || `Failed to ${actionType} leave`);
        }
    };

    const openActionDialog = (leave, action) => {
        setSelectedLeave(leave);
        setActionType(action);
        setOpenDialog(true);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5, letterSpacing: '-0.5px' }}>
                    Leave Approvals
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Review and approve leave requests from your team
                </Typography>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card
                        elevation={0}
                        sx={{
                            p: 2.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3
                        }}
                    >
                        <Typography variant="body2" color="text.secondary" fontWeight="500" sx={{ mb: 1 }}>
                            Pending Approvals
                        </Typography>
                        <Typography variant="h3" fontWeight="700" color="warning.main">
                            {pendingLeaves.length}
                        </Typography>
                    </Card>
                </Grid>
            </Grid>

            {/* Pending Leaves Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingLeaves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                        No pending leave approvals
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pendingLeaves.map((leave) => (
                                    <TableRow key={leave._id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body2" fontWeight="600">
                                                    {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {leave.employeeId?.employeeCode}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: leave.leaveType?.color }} />
                                                {leave.leaveType?.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            {leave.totalDays} {leave.halfDay ? '(Half Day)' : ''}
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {leave.reason}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="success"
                                                    startIcon={<ApproveIcon />}
                                                    onClick={() => openActionDialog(leave, 'approve')}
                                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    color="error"
                                                    startIcon={<RejectIcon />}
                                                    onClick={() => openActionDialog(leave, 'reject')}
                                                    sx={{ textTransform: 'none', borderRadius: 2 }}
                                                >
                                                    Reject
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Action Confirmation Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {actionType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
                </DialogTitle>
                <DialogContent>
                    {selectedLeave && (
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                <strong>Employee:</strong> {selectedLeave.employeeId?.firstName} {selectedLeave.employeeId?.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                <strong>Leave Type:</strong> {selectedLeave.leaveType?.name}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                <strong>Duration:</strong> {new Date(selectedLeave.startDate).toLocaleDateString()} to {new Date(selectedLeave.endDate).toLocaleDateString()} ({selectedLeave.totalDays} days)
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                <strong>Reason:</strong> {selectedLeave.reason}
                            </Typography>

                            {actionType === 'reject' && (
                                <TextField
                                    label="Rejection Reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    required
                                    sx={{ mt: 2 }}
                                />
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenDialog(false); setRejectionReason(''); }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAction}
                        variant="contained"
                        color={actionType === 'approve' ? 'success' : 'error'}
                        disabled={actionType === 'reject' && !rejectionReason}
                    >
                        Confirm {actionType === 'approve' ? 'Approval' : 'Rejection'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default LeaveApprovals;
