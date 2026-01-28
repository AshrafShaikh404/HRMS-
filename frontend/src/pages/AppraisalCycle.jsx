import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, Grid,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Chip, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Paper,
    CircularProgress, Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { appraisalAPI, reviewCycleAPI } from '../utils/api';

const AppraisalCycle = () => {
    const navigate = useNavigate();
    const [cycles, setCycles] = useState([]);
    const [reviewCycles, setReviewCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        linkedReviewCycle: '',
        effectiveFrom: '',
        status: 'Draft'
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [appraisalRes, reviewRes] = await Promise.all([
                appraisalAPI.getCycles(),
                reviewCycleAPI.getAll()
            ]);
            setCycles(appraisalRes.data.data);
            setReviewCycles(reviewRes.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await appraisalAPI.createCycle(formData);
            setOpen(false);
            setFormData({ name: '', linkedReviewCycle: '', effectiveFrom: '', status: 'Draft' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create cycle');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await appraisalAPI.updateCycle(id, { status: newStatus });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this cycle? This will only work if no appraisal records exist.')) return;
        try {
            await appraisalAPI.deleteCycle(id);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete cycle');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Draft': return 'warning';
            case 'Closed': return 'error';
            default: return 'default';
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">Appraisal Cycles</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpen(true)}
                    sx={{ bgcolor: '#FF9B44', '&:hover': { bgcolor: '#E88B39' } }}
                >
                    Create Cycle
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Cycle Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Linked Review Cycle</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Effective From</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cycles.map((cycle) => (
                            <TableRow key={cycle._id}>
                                <TableCell>{cycle.name}</TableCell>
                                <TableCell>{cycle.linkedReviewCycle?.name}</TableCell>
                                <TableCell>{new Date(cycle.effectiveFrom).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</TableCell>
                                <TableCell>
                                    <TextField
                                        select
                                        size="small"
                                        value={cycle.status}
                                        onChange={(e) => handleStatusUpdate(cycle._id, e.target.value)}
                                        sx={{ minWidth: 100 }}
                                    >
                                        <MenuItem value="Draft">Draft</MenuItem>
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Closed">Closed</MenuItem>
                                    </TextField>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => navigate(`/appraisals/management?cycleId=${cycle._id}`)}
                                        >
                                            Manage
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDelete(cycle._id)}
                                        >
                                            Delete
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                        {cycles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">No appraisal cycles found.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Cycle Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create Appraisal Cycle</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <TextField
                            label="Cycle Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Annual Appraisal 2025"
                        />
                        <TextField
                            select
                            label="Link Review Cycle"
                            fullWidth
                            value={formData.linkedReviewCycle}
                            onChange={(e) => setFormData({ ...formData, linkedReviewCycle: e.target.value })}
                        >
                            {reviewCycles.map((rc) => (
                                <MenuItem key={rc._id} value={rc._id}>
                                    {rc.name} ({rc.status})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            type="date"
                            label="Effective From"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={formData.effectiveFrom}
                            onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                        />
                        <TextField
                            select
                            label="Initial Status"
                            fullWidth
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <MenuItem value="Draft">Draft</MenuItem>
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Closed">Closed</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={!formData.name || !formData.linkedReviewCycle || !formData.effectiveFrom}
                        sx={{ bgcolor: '#FF9B44', '&:hover': { bgcolor: '#E88B39' } }}
                    >
                        Create
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AppraisalCycle;
