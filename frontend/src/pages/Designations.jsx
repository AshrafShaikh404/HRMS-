import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Grid,
    CircularProgress,
    Stack,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Badge as BadgeIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { designationAPI, departmentAPI } from '../utils/api';

function Designations({ user }) {
    const { showSuccess, showError } = useNotification();
    const [designations, setDesignations] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editingDesig, setEditingDesig] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        department: '',
        level: 0,
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [desigRes, deptRes] = await Promise.all([
                designationAPI.getAll(),
                departmentAPI.getAll()
            ]);
            setDesignations(desigRes.data.data);
            setDepartments(deptRes.data.data); // Assuming departments API returns active+inactive, user spec says "Cannot create for inactive department". Filter in dropdown.
            setLoading(false);
        } catch (err) {
            showError('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleOpenModal = (desig = null) => {
        if (desig) {
            setEditingDesig(desig);
            setFormData({
                name: desig.name,
                department: desig.department?._id || '',
                level: desig.level,
                description: desig.description || '',
                isActive: desig.isActive
            });
        } else {
            setEditingDesig(null);
            setFormData({
                name: '',
                department: '',
                level: 0,
                description: '',
                isActive: true
            });
        }
        setOpenModal(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.name || !formData.department) {
                showError('Name and Department are required');
                return;
            }

            if (editingDesig) {
                await designationAPI.update(editingDesig._id, formData);
                showSuccess('Designation updated successfully');
            } else {
                await designationAPI.create(formData);
                showSuccess('Designation created successfully');
            }
            setOpenModal(false);
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to save designation');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Designations</Typography>
                    <Typography color="text.secondary">Manage job titles and hierarchy</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{ borderRadius: 2 }}
                >
                    Add Designation
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell><Typography fontWeight="bold">Designation</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Department</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Level</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Employees</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Status</Typography></TableCell>
                            <TableCell align="right"><Typography fontWeight="bold">Actions</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : designations.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No designations found</TableCell></TableRow>
                        ) : (
                            designations.map((desig) => (
                                <TableRow key={desig._id} hover>
                                    <TableCell>
                                        <Typography fontWeight={600}>{desig.name}</Typography>
                                        {desig.description && <Typography variant="caption" color="text.secondary">{desig.description}</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={desig.department?.name || 'Unknown'} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell align="center">{desig.level}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={desig.employeeCount || 0}
                                            size="small"
                                            variant="outlined"
                                            color="default"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={desig.isActive ? 'Active' : 'Inactive'}
                                            color={desig.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Edit">
                                                <IconButton onClick={() => handleOpenModal(desig)} color="primary" size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingDesig ? 'Edit Designation' : 'Add Designation'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <FormControl fullWidth required>
                                <InputLabel>Department</InputLabel>
                                <Select
                                    value={formData.department}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    label="Department"
                                >
                                    {departments.filter(d => d.isActive || (editingDesig && editingDesig.department?._id === d._id)).map(dept => (
                                        <MenuItem key={dept._id} value={dept._id}>
                                            {dept.name} {!dept.isActive && '(Inactive)'}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Designation Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Level / Rank"
                                type="number"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                                helperText="Lower value = Higher seniority (e.g. 1 = CEO, 10 = Intern) or vice versa as per policy."
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                }
                                label="Active Status"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Designations;
