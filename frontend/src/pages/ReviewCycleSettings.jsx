import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Chip,
    FormControlLabel,
    Switch,
    Grid
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { reviewCycleAPI } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';

const ReviewCycleSettings = () => {
    const { showSuccess, showError } = useNotification();
    const [cycles, setCycles] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingCycle, setEditingCycle] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        status: 'Upcoming',
        selfReviewOpen: false,
        managerReviewOpen: false,
        hrReviewOpen: false
    });

    useEffect(() => {
        fetchCycles();
    }, []);

    const fetchCycles = async () => {
        try {
            const res = await reviewCycleAPI.getAll();
            setCycles(res.data.data);
        } catch (error) {
            showError('Failed to fetch review cycles');
        }
    };

    const handleOpenDialog = (cycle = null) => {
        if (cycle) {
            setEditingCycle(cycle);
            setFormData({
                name: cycle.name,
                startDate: cycle.startDate.split('T')[0],
                endDate: cycle.endDate.split('T')[0],
                status: cycle.status,
                selfReviewOpen: cycle.selfReviewOpen,
                managerReviewOpen: cycle.managerReviewOpen,
                hrReviewOpen: cycle.hrReviewOpen
            });
        } else {
            setEditingCycle(null);
            setFormData({
                name: '',
                startDate: '',
                endDate: '',
                status: 'Upcoming',
                selfReviewOpen: false,
                managerReviewOpen: false,
                hrReviewOpen: false
            });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCycle) {
                await reviewCycleAPI.update(editingCycle._id, formData);
                showSuccess('Review cycle updated');
            } else {
                await reviewCycleAPI.create(formData);
                showSuccess('Review cycle created');
            }
            setOpenDialog(false);
            fetchCycles();
        } catch (error) {
            showError(error.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Review Cycles</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    New Cycle
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Cycle Name</TableCell>
                            <TableCell>Timeline</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Stages Open</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cycles.map(cycle => (
                            <TableRow key={cycle._id}>
                                <TableCell fontWeight="bold">{cycle.name}</TableCell>
                                <TableCell>
                                    {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={cycle.status}
                                        color={cycle.status === 'Active' ? 'success' : cycle.status === 'Closed' ? 'default' : 'primary'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Chip label="Self" size="small" variant={cycle.selfReviewOpen ? "filled" : "outlined"} color={cycle.selfReviewOpen ? "success" : "default"} />
                                        <Chip label="Manager" size="small" variant={cycle.managerReviewOpen ? "filled" : "outlined"} color={cycle.managerReviewOpen ? "success" : "default"} />
                                        <Chip label="HR" size="small" variant={cycle.hrReviewOpen ? "filled" : "outlined"} color={cycle.hrReviewOpen ? "success" : "default"} />
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <Button size="small" onClick={() => handleOpenDialog(cycle)} startIcon={<EditIcon />}>
                                        Manage
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCycle ? 'Manage Review Cycle' : 'Create Review Cycle'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Cycle Name (e.g., Annual 2026)"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Start Date"
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="End Date"
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <MenuItem value="Upcoming">Upcoming</MenuItem>
                                    <MenuItem value="Active">Active</MenuItem>
                                    <MenuItem value="Closed">Closed</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" sx={{ mb: 1 }}>Review Stages (Open/Close)</Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <FormControlLabel
                                        control={<Switch checked={formData.selfReviewOpen} onChange={(e) => setFormData({ ...formData, selfReviewOpen: e.target.checked })} />}
                                        label="Self Review"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={formData.managerReviewOpen} onChange={(e) => setFormData({ ...formData, managerReviewOpen: e.target.checked })} />}
                                        label="Manager Review"
                                    />
                                    <FormControlLabel
                                        control={<Switch checked={formData.hrReviewOpen} onChange={(e) => setFormData({ ...formData, hrReviewOpen: e.target.checked })} />}
                                        label="HR Review"
                                    />
                                </Box>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default ReviewCycleSettings;
