import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, Grid,
    TextField, MenuItem, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert, Avatar, Stack, Dialog, DialogTitle,
    DialogContent, DialogActions
} from '@mui/material';
import {
    TrendingUp as TrendingUpIcon,
    CheckCircle as ApproveIcon,
    Cancel as RejectIcon,
    Visibility as ViewIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { appraisalAPI, designationAPI } from '../utils/api';

const AppraisalManagement = () => {
    const location = useLocation();
    const cycleId = new URLSearchParams(location.search).get('cycleId');

    const [loading, setLoading] = useState(true);
    const [eligibleEmployees, setEligibleEmployees] = useState([]);
    const [appraisals, setAppraisals] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [error, setError] = useState(null);

    // Propose Modal State
    const [proposeOpen, setProposeOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [proposalData, setProposalData] = useState({
        incrementType: 'Percentage',
        incrementValue: 0,
        newDesignation: '',
        remarks: ''
    });

    useEffect(() => {
        if (cycleId) {
            fetchData();
        }
    }, [cycleId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [eligibleRes, allAppraisalsRes, designationRes] = await Promise.all([
                appraisalAPI.getEligibleEmployees(cycleId),
                appraisalAPI.getAllAppraisals({ cycleId }),
                designationAPI.getAll()
            ]);
            setEligibleEmployees(eligibleRes.data.data);
            setAppraisals(allAppraisalsRes.data.data);
            setDesignations(designationRes.data.data);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleProposeClick = (empReview) => {
        setSelectedEmployee(empReview);
        setProposalData({
            incrementType: 'Percentage',
            incrementValue: 0,
            newDesignation: empReview.employeeId.jobInfo?.designation || '',
            remarks: ''
        });
        setProposeOpen(true);
    };

    const submitProposal = async () => {
        try {
            await appraisalAPI.proposeIncrement({
                employeeId: selectedEmployee.employeeId._id,
                appraisalCycleId: cycleId,
                ...proposalData
            });
            setProposeOpen(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit proposal');
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Are you sure you want to approve this appraisal? This will update the salary and designation immediately.')) return;
        try {
            await appraisalAPI.approveAppraisal(id);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve');
        }
    };

    const calculateNewSalary = () => {
        if (!selectedEmployee) return 0;
        const oldCTC = selectedEmployee.employeeId.salary || 0;
        if (proposalData.incrementType === 'Percentage') {
            return oldCTC + (oldCTC * (proposalData.incrementValue / 100));
        }
        return oldCTC + Number(proposalData.incrementValue);
    };

    if (!cycleId) return <Alert severity="warning">Please select an appraisal cycle first.</Alert>;
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Appraisal Management</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

            <Grid container spacing={3}>
                {/* Eligible Employees Section */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Eligible for Increment ({eligibleEmployees.length})</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Employee</TableCell>
                                            <TableCell>Final Rating</TableCell>
                                            <TableCell>Current Salary</TableCell>
                                            <TableCell>Action</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {eligibleEmployees.map((review) => (
                                            <TableRow key={review._id}>
                                                <TableCell>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar sx={{ width: 32, height: 32 }} />
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {review.employeeId.firstName} {review.employeeId.lastName}
                                                            </Typography>
                                                            <Typography variant="caption" color="textSecondary">
                                                                {review.employeeId.employeeCode}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={review.finalRating}
                                                        size="small"
                                                        color={review.finalRating >= 4 ? 'success' : review.finalRating >= 3 ? 'primary' : 'warning'}
                                                    />
                                                </TableCell>
                                                <TableCell>₹{review.employeeId.salary?.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        startIcon={<TrendingUpIcon />}
                                                        variant="contained"
                                                        onClick={() => handleProposeClick(review)}
                                                        sx={{ bgcolor: '#FF9B44', '&:hover': { bgcolor: '#E88B39' } }}
                                                    >
                                                        Propose
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {eligibleEmployees.length === 0 && (
                                            <TableRow><TableCell colSpan={4} align="center">No pending eligible employees.</TableCell></TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Proposed & Approved Appraisals Section */}
                <Grid item xs={12}>
                    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid #E5E7EB' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Appraisal Records</Typography>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Employee</TableCell>
                                            <TableCell>Increment</TableCell>
                                            <TableCell>New CTC</TableCell>
                                            <TableCell>Promotion</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {appraisals.map((record) => (
                                            <TableRow key={record._id}>
                                                <TableCell>
                                                    {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                </TableCell>
                                                <TableCell>
                                                    {record.incrementType === 'Percentage' ? `${record.incrementValue}%` : `₹${record.incrementValue}`}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 'bold' }}>₹{record.newCTC?.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    {record.newDesignation?.name || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={record.status}
                                                        size="small"
                                                        color={record.status === 'Approved' ? 'success' : record.status === 'Proposed' ? 'warning' : 'error'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {record.status === 'Proposed' && (
                                                        <Stack direction="row" spacing={1}>
                                                            <Button
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                                onClick={() => handleApprove(record._id)}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button size="small" color="error" variant="outlined">Reject</Button>
                                                        </Stack>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Propose Modal */}
            <Dialog open={proposeOpen} onClose={() => setProposeOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Propose Appraisal</DialogTitle>
                <DialogContent>
                    {selectedEmployee && (
                        <Box sx={{ mt: 1 }}>
                            <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderRadius: 2, mb: 3 }}>
                                <Typography variant="subtitle2" color="textSecondary">Summary</Typography>
                                <Typography variant="body1" fontWeight="700">
                                    {selectedEmployee.employeeId.firstName} {selectedEmployee.employeeId.lastName}
                                </Typography>
                                <Typography variant="body2">Current CTC: ₹{selectedEmployee.employeeId.salary?.toLocaleString()}</Typography>
                                <Typography variant="body2">Rating: {selectedEmployee.finalRating} / 5</Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <TextField
                                        select
                                        label="Increment Type"
                                        fullWidth
                                        value={proposalData.incrementType}
                                        onChange={(e) => setProposalData({ ...proposalData, incrementType: e.target.value })}
                                    >
                                        <MenuItem value="Percentage">Percentage (%)</MenuItem>
                                        <MenuItem value="Fixed">Fixed Amount (₹)</MenuItem>
                                    </TextField>
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        type="number"
                                        label="Value"
                                        fullWidth
                                        value={proposalData.incrementValue}
                                        onChange={(e) => setProposalData({ ...proposalData, incrementValue: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        select
                                        label="Promotion (Designation)"
                                        fullWidth
                                        value={proposalData.newDesignation}
                                        onChange={(e) => setProposalData({ ...proposalData, newDesignation: e.target.value })}
                                    >
                                        {designations.map((d) => (
                                            <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Remarks"
                                        multiline
                                        rows={2}
                                        fullWidth
                                        value={proposalData.remarks}
                                        onChange={(e) => setProposalData({ ...proposalData, remarks: e.target.value })}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, p: 2, bgcolor: '#ECFDF5', borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="caption" color="success.main">Projected New CTC</Typography>
                                    <Typography variant="h6" color="success.dark" fontWeight="bold">
                                        ₹{calculateNewSalary()?.toLocaleString()}
                                    </Typography>
                                </Box>
                                <Chip label={`+${((calculateNewSalary() - selectedEmployee.employeeId.salary) / selectedEmployee.employeeId.salary * 100).toFixed(1)}%`} color="success" />
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setProposeOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={submitProposal}
                        sx={{ bgcolor: '#FF9B44', '&:hover': { bgcolor: '#E88B39' } }}
                    >
                        Submit Proposal
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppraisalManagement;
