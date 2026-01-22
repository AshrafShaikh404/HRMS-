import { useState, useEffect } from 'react';
import { leaveAPI } from '../utils/leaveAPI';
import { useNotification } from '../contexts/NotificationContext';
import {
    Box,
    Typography,
    Button,
    TextField,
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
    Grid,
    Card,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Radio,
    RadioGroup,
    CircularProgress
} from '@mui/material';
import {
    Add as AddIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';

function MyLeaves({ user }) {
    const { showSuccess, showError } = useNotification();
    const [balance, setBalance] = useState([]);
    const [history, setHistory] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openApplyDialog, setOpenApplyDialog] = useState(false);
    const [leaveForm, setLeaveForm] = useState({
        leaveType: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
        halfDay: false,
        halfDaySession: 'First Half'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [balanceRes, historyRes, typesRes] = await Promise.all([
                leaveAPI.getLeaveBalance(),
                leaveAPI.getLeaveHistory(),
                leaveAPI.getLeaveTypes()
            ]);
            setBalance(balanceRes.data.data.balances || []);
            setHistory(historyRes.data.data);
            setLeaveTypes(typesRes.data.data);
        } catch (error) {
            showError('Failed to fetch leave data');
        } finally {
            setLoading(false);
        }
    };

    const handleApplyLeave = async () => {
        try {
            await leaveAPI.applyLeave(leaveForm);
            showSuccess('Leave application submitted successfully');
            setOpenApplyDialog(false);
            resetForm();
            fetchData();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to apply for leave');
        }
    };

    const handleCancelLeave = async (id) => {
        if (window.confirm('Are you sure you want to cancel this leave application?')) {
            try {
                await leaveAPI.cancelLeave(id);
                showSuccess('Leave cancelled successfully');
                fetchData();
            } catch (error) {
                showError(error.response?.data?.message || 'Failed to cancel leave');
            }
        }
    };

    const resetForm = () => {
        setLeaveForm({
            leaveType: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            reason: '',
            halfDay: false,
            halfDaySession: 'First Half'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Approved': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'error';
            case 'Cancelled': return 'default';
            default: return 'default';
        }
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
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5, letterSpacing: '-0.5px' }}>
                        My Leaves
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Apply for leaves and track your leave history
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenApplyDialog(true)}
                    sx={{ height: 48, px: 3, borderRadius: 2, fontWeight: 600, boxShadow: 0, textTransform: 'none' }}
                >
                    Apply Leave
                </Button>
            </Box>

            {/* Leave Balance Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {balance.map((item) => (
                    <Grid item xs={12} sm={6} md={3} key={item.leaveType._id}>
                        <Card
                            elevation={0}
                            sx={{
                                p: 2.5,
                                border: '1px solid',
                                borderColor: item.available === 0 ? 'error.light' : 'divider',
                                borderRadius: 3,
                                transition: 'all 0.2s',
                                bgcolor: item.available === 0 ? 'error.lighter' : 'background.paper',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.leaveType?.color || 'grey' }} />
                                <Typography variant="body2" color="text.secondary" fontWeight="500">
                                    {item.leaveType?.name || 'Unknown Type'}
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="700" color={item.available === 0 ? 'error.main' : 'primary.main'} sx={{ mb: 0.5 }}>
                                {item.available}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                of {item.totalAccrued} days available
                            </Typography>
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary">
                                    Used: {item.used} days • Remaining: {item.available} days
                                </Typography>
                            </Box>
                            {item.available === 0 && (
                                <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 1, fontWeight: 600 }}>
                                    ⚠️ No balance available
                                </Typography>
                            )}
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Leave History Table */}
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h6" fontWeight="700">Leave History</Typography>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'background.default' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>Leave Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                        No leave applications found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                history.map((leave) => (
                                    <TableRow key={leave._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: leave.leaveType?.color }} />
                                                {leave.leaveType?.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{leave.totalDays} {leave.halfDay ? '(Half Day)' : ''}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={leave.status}
                                                color={getStatusColor(leave.status)}
                                                size="small"
                                                sx={{ fontWeight: 600, borderRadius: 1.5 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {leave.reason}
                                        </TableCell>
                                        <TableCell align="right">
                                            {leave.status === 'Pending' && (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    startIcon={<CancelIcon />}
                                                    onClick={() => handleCancelLeave(leave._id)}
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Cancel
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Apply Leave Dialog */}
            <Dialog open={openApplyDialog} onClose={() => setOpenApplyDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Leave Type</InputLabel>
                            <Select
                                value={leaveForm.leaveType}
                                onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                                label="Leave Type"
                            >
                                {leaveTypes.map((type) => (
                                    <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl component="fieldset">
                            <RadioGroup
                                row
                                value={leaveForm.halfDay ? 'half' : 'full'}
                                onChange={(e) => {
                                    const isHalf = e.target.value === 'half';
                                    setLeaveForm({
                                        ...leaveForm,
                                        halfDay: isHalf,
                                        endDate: isHalf ? leaveForm.startDate : leaveForm.endDate
                                    });
                                }}
                            >
                                <FormControlLabel value="full" control={<Radio />} label="Full Day" />
                                <FormControlLabel value="half" control={<Radio />} label="Half Day" />
                            </RadioGroup>
                        </FormControl>

                        {leaveForm.halfDay && (
                            <FormControl fullWidth>
                                <InputLabel>Session</InputLabel>
                                <Select
                                    value={leaveForm.halfDaySession}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, halfDaySession: e.target.value })}
                                    label="Session"
                                >
                                    <MenuItem value="First Half">First Half (Morning - AM)</MenuItem>
                                    <MenuItem value="Second Half">Second Half (Afternoon - PM)</MenuItem>
                                </Select>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                    First Half: Morning session | Second Half: Afternoon session
                                </Typography>
                            </FormControl>
                        )}

                        <TextField
                            label="Start Date"
                            type="date"
                            value={leaveForm.startDate}
                            onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value, endDate: leaveForm.halfDay ? e.target.value : leaveForm.endDate })}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        {!leaveForm.halfDay && (
                            <TextField
                                label="End Date"
                                type="date"
                                value={leaveForm.endDate}
                                onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ min: leaveForm.startDate }}
                            />
                        )}

                        <TextField
                            label="Reason"
                            value={leaveForm.reason}
                            onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setOpenApplyDialog(false); resetForm(); }}>Cancel</Button>
                    <Button onClick={handleApplyLeave} variant="contained" disabled={!leaveForm.leaveType || !leaveForm.reason}>
                        Submit Application
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default MyLeaves;
