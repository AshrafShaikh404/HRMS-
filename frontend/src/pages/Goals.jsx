import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Autocomplete
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CheckCircle as CompletedIcon,
    TrendingUp as ActiveIcon,
    Archive as ArchivedIcon
} from '@mui/icons-material';
import { goalAPI, employeeAPI, departmentAPI } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';

const Goals = () => {
    const { showSuccess, showError } = useNotification();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [editingGoal, setEditingGoal] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Individual', // Individual, Team, Department
        assignedTo: [], // Array of employee IDs
        departmentId: '',
        weightage: 0,
        targetValue: '',
        startDate: '',
        endDate: '',
        status: 'Active'
    });

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const [goalsRes, empRes, deptRes] = await Promise.all([
                goalAPI.getAll(),
                employeeAPI.getAll(),
                departmentAPI.getAll()
            ]);
            const goalsData = goalsRes.data.data || goalsRes.data || [];
            setGoals(Array.isArray(goalsData) ? goalsData : []);

            // Handle { data: { employees: [...] } } structure
            const empResponseData = empRes.data.data || empRes.data || {};
            const empArray = Array.isArray(empResponseData)
                ? empResponseData
                : (empResponseData.employees || []);
            setEmployees(Array.isArray(empArray) ? empArray : []);

            const deptData = deptRes.data.data || deptRes.data || [];
            setDepartments(Array.isArray(deptData) ? deptData : []);
        } catch (error) {
            console.error(error);
            showError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (goal = null) => {
        if (goal) {
            setEditingGoal(goal);
            setFormData({
                title: goal.title,
                description: goal.description,
                type: goal.type,
                assignedTo: goal.assignedTo.map(u => u._id),
                departmentId: goal.departmentId?._id || '',
                weightage: goal.weightage,
                targetValue: goal.targetValue || '',
                startDate: goal.startDate?.split('T')[0],
                endDate: goal.endDate?.split('T')[0],
                status: goal.status
            });
        } else {
            setEditingGoal(null);
            setFormData({
                title: '',
                description: '',
                type: 'Individual',
                assignedTo: [],
                departmentId: '',
                weightage: 0,
                targetValue: '',
                startDate: '',
                endDate: '',
                status: 'Active'
            });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...formData };
            if (!payload.departmentId) delete payload.departmentId; // Remove if empty string or null
            if (payload.assignedTo.length === 0 && payload.type === 'Individual') {
                return showError('Please assign to at least one employee');
            }
            // For team/dept goals, we might assign broadly or just link dept

            if (editingGoal) {
                await goalAPI.update(editingGoal._id, payload);
                showSuccess('Goal updated successfully');
            } else {
                await goalAPI.create(payload);
                showSuccess('Goal created successfully');
            }
            setOpenDialog(false);
            fetchResources(); // Refresh list assignment
        } catch (error) {
            showError(error.response?.data?.message || 'Operation failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this goal?')) return;
        try {
            await goalAPI.delete(id);
            showSuccess('Goal deleted');
            setGoals(prev => prev.filter(g => g._id !== id));
        } catch (error) {
            showError('Failed to delete goal');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'success';
            case 'Active': return 'primary';
            case 'Draft': return 'default';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">Goal Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Create Goal
                </Button>
            </Box>

            <Grid container spacing={3}>
                {goals.map(goal => (
                    <Grid item xs={12} md={6} lg={4} key={goal._id}>
                        <Card sx={{ height: '100%', position: 'relative' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Chip
                                        label={goal.status}
                                        color={getStatusColor(goal.status)}
                                        size="small"
                                    />
                                    <Chip
                                        label={goal.type}
                                        variant="outlined"
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {goal.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
                                    {goal.description}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="caption">Progress</Typography>
                                        <Typography variant="caption" fontWeight="bold">{goal.progress}%</Typography>
                                    </Box>
                                    <LinearProgress variant="determinate" value={goal.progress} />
                                </Box>

                                <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" display="block" color="text.secondary">Weightage</Typography>
                                        <Typography variant="body2">{goal.weightage}%</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" display="block" color="text.secondary">Target</Typography>
                                        <Typography variant="body2">{goal.targetValue || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" display="block" color="text.secondary">Assigned To</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {goal.assignedTo.slice(0, 3).map(u => (
                                                <Chip key={u._id} label={u?.name?.split(' ')[0]} size="small" sx={{ fontSize: '0.7rem' }} />
                                            ))}
                                            {goal.assignedTo.length > 3 && (
                                                <Chip label={`+${goal.assignedTo.length - 3}`} size="small" sx={{ fontSize: '0.7rem' }} />
                                            )}
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                    <IconButton size="small" onClick={() => handleOpenDialog(goal)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDelete(goal._id)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Create/Edit Modal */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Goal Title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        value={formData.type}
                                        label="Type"
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <MenuItem value="Individual">Individual</MenuItem>
                                        <MenuItem value="Team">Team</MenuItem>
                                        <MenuItem value="Department">Department</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={formData.status}
                                        label="Status"
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <MenuItem value="Draft">Draft</MenuItem>
                                        <MenuItem value="Active">Active</MenuItem>
                                        <MenuItem value="Completed">Completed</MenuItem>
                                        <MenuItem value="Archived">Archived</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {formData.type === 'Department' && (
                                <Grid item xs={12}>
                                    <FormControl fullWidth>
                                        <InputLabel>Department</InputLabel>
                                        <Select
                                            value={formData.departmentId}
                                            label="Department"
                                            onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                        >
                                            {departments.map(dept => (
                                                <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}

                            {formData.type === 'Individual' && (
                                <Grid item xs={12}>
                                    <Autocomplete
                                        multiple
                                        options={employees}
                                        getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.employeeCode})`}
                                        value={employees?.filter(emp => {
                                            const uId = emp.userId?._id || emp.userId || emp._id;
                                            return formData.assignedTo.includes(uId);
                                        })} // Simplified matching
                                        // Note: Employee API returns employee profiles, but Goal needs User IDs usually. 
                                        // Assuming Employee model has a user reference or we map correctly.
                                        // Let's assume we store Employee ID or User ID. The server expects User ID in assignedTo.
                                        // We need to check if 'employees' state holds user data or employee profile data. 
                                        // Usually employeeAPI.getAll returns Employee profiles which have .userId (ref to User).
                                        onChange={(e, newValue) => {
                                            setFormData({
                                                ...formData,
                                                assignedTo: newValue.map(item => {
                                                    // Handle userId being an object (populated) or string (ID)
                                                    const userId = item.userId?._id || item.userId || item._id;
                                                    return userId;
                                                })
                                            });
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Assign Employees" placeholder="Select employees" />
                                        )}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Weightage (%)"
                                    type="number"
                                    required
                                    value={formData.weightage}
                                    onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Target Value (Optional)"
                                    type="number"
                                    value={formData.targetValue}
                                    onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="Start Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    label="End Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                        <Button type="submit" variant="contained">Save Goal</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Goals;
