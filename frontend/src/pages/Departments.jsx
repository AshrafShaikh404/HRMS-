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
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { departmentAPI } from '../utils/api';

function Departments({ user }) {
    const { showSuccess, showError } = useNotification();
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await departmentAPI.getAll();
            setDepartments(response.data.data);
            setLoading(false);
        } catch (err) {
            showError('Failed to fetch departments');
            setLoading(false);
        }
    };

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setEditingDept(dept);
            setFormData({
                name: dept.name,
                code: dept.code,
                description: dept.description || '',
                isActive: dept.isActive
            });
        } else {
            setEditingDept(null);
            setFormData({
                name: '',
                code: '',
                description: '',
                isActive: true
            });
        }
        setOpenModal(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.name || !formData.code) {
                showError('Name and Code are required');
                return;
            }

            if (editingDept) {
                await departmentAPI.update(editingDept._id, formData);
                showSuccess('Department updated successfully');
            } else {
                await departmentAPI.create(formData);
                showSuccess('Department created successfully');
            }
            setOpenModal(false);
            fetchDepartments();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to save department');
        }
    };

    const handleToggleStatus = async (dept) => {
        try {
            await departmentAPI.update(dept._id, { isActive: !dept.isActive });
            showSuccess('Department status updated');
            fetchDepartments();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Departments</Typography>
                    <Typography color="text.secondary">Manage organizational departments</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{ borderRadius: 2 }}
                >
                    Add Department
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell><Typography fontWeight="bold">Code</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Name</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Description</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Employees</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Status</Typography></TableCell>
                            <TableCell align="right"><Typography fontWeight="bold">Actions</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : departments.length === 0 ? (
                            <TableRow><TableCell colSpan={6} align="center">No departments found</TableCell></TableRow>
                        ) : (
                            departments.map((dept) => (
                                <TableRow key={dept._id} hover>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                            {dept.code}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={600}>{dept.name}</Typography>
                                    </TableCell>
                                    <TableCell>{dept.description || '-'}</TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={dept.employeeCount || 0}
                                            size="small"
                                            variant="outlined"
                                            color="default"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={dept.isActive ? 'Active' : 'Inactive'}
                                            color={dept.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Edit">
                                                <IconButton onClick={() => handleOpenModal(dept)} color="primary" size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            {/* We use specific update for status toggle to be explicit, but can also use edit modal */}
                                            {/* <IconButton onClick={() => handleToggleStatus(dept)} color={dept.isActive ? 'error' : 'success'} size="small">
                                                <PowerSettingsNewIcon />
                                            </IconButton> */}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Department Code"
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="e.g. IT, HR, ENG"
                                disabled={!!editingDept} // Code usually unique info that shouldn't change easily? Or allowed? User said "Edit name / description", didn't explicitly forbid code, but usually code is fixed. I'll disable it for safety or allow? "Unique" constraint in DB. Let's allow edit if not used? User said "Cannot delete if employees exist", maybe code edit is fine. I'll enable it for now but maybe warn. Actually user spec: "Edit Department -> Edit name / description". It didn't mention code. I will disable Code editing to be safe.
                                helperText={editingDept ? "Code cannot be changed" : "Unique identifier"}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Department Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
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

export default Departments;
