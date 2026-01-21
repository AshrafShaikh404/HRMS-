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
    IconButton,
    Chip,
    Grid,
    Card,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

function LeaveSettings() {
    const { showSuccess, showError } = useNotification();
    const [activeTab, setActiveTab] = useState(0);

    // Leave Types State
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [openTypeDialog, setOpenTypeDialog] = useState(false);
    const [currentType, setCurrentType] = useState({
        name: '',
        code: '',
        description: '',
        isPaid: true,
        maxDaysPerYear: 12,
        carryForwardLimit: 0,
        requiresApproval: true,
        color: '#3b82f6',
        affectsAttendance: true
    });

    // Leave Policies State
    const [policies, setPolicies] = useState([]);
    const [openPolicyDialog, setOpenPolicyDialog] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState({
        name: '',
        description: '',
        leaveTypes: []
    });

    useEffect(() => {
        fetchLeaveTypes();
        fetchPolicies();
    }, []);

    const fetchLeaveTypes = async () => {
        try {
            const response = await leaveAPI.getLeaveTypes();
            setLeaveTypes(response.data.data);
        } catch (error) {
            showError('Failed to fetch leave types');
        }
    };

    const fetchPolicies = async () => {
        try {
            const response = await leaveAPI.getLeavePolicies();
            setPolicies(response.data.data);
        } catch (error) {
            showError('Failed to fetch policies');
        }
    };

    const handleSaveType = async () => {
        try {
            if (currentType._id) {
                await leaveAPI.updateLeaveType(currentType._id, currentType);
                showSuccess('Leave type updated successfully');
            } else {
                await leaveAPI.createLeaveType(currentType);
                showSuccess('Leave type created successfully');
            }
            setOpenTypeDialog(false);
            fetchLeaveTypes();
            resetTypeForm();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save leave type');
        }
    };

    const handleDeleteType = async (id) => {
        if (window.confirm('Are you sure you want to delete this leave type?')) {
            try {
                await leaveAPI.deleteLeaveType(id);
                showSuccess('Leave type deleted successfully');
                fetchLeaveTypes();
            } catch (error) {
                showError('Failed to delete leave type');
            }
        }
    };

    const handleSavePolicy = async () => {
        try {
            if (currentPolicy._id) {
                await leaveAPI.updateLeavePolicy(currentPolicy._id, currentPolicy);
                showSuccess('Policy updated successfully');
            } else {
                await leaveAPI.createLeavePolicy(currentPolicy);
                showSuccess('Policy created successfully');
            }
            setOpenPolicyDialog(false);
            fetchPolicies();
            resetPolicyForm();
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to save policy');
        }
    };

    const resetTypeForm = () => {
        setCurrentType({
            name: '',
            code: '',
            description: '',
            isPaid: true,
            maxDaysPerYear: 12,
            carryForwardLimit: 0,
            requiresApproval: true,
            color: '#3b82f6',
            affectsAttendance: true
        });
    };

    const resetPolicyForm = () => {
        setCurrentPolicy({
            name: '',
            description: '',
            leaveTypes: []
        });
    };

    const addLeaveTypeToPolicy = () => {
        setCurrentPolicy({
            ...currentPolicy,
            leaveTypes: [...currentPolicy.leaveTypes, { leaveType: '', quota: 0 }]
        });
    };

    const updatePolicyLeaveType = (index, field, value) => {
        const updated = [...currentPolicy.leaveTypes];
        updated[index][field] = value;
        setCurrentPolicy({ ...currentPolicy, leaveTypes: updated });
    };

    const removePolicyLeaveType = (index) => {
        const updated = currentPolicy.leaveTypes.filter((_, i) => i !== index);
        setCurrentPolicy({ ...currentPolicy, leaveTypes: updated });
    };

    return (
        <Box sx={{ pb: 5 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="800" sx={{ mb: 0.5, letterSpacing: '-0.5px' }}>
                    Leave Settings
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Configure leave types and policies for your organization
                </Typography>
            </Box>

            {/* Tabs */}
            <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab label="Leave Types" />
                    <Tab label="Leave Policies" />
                </Tabs>
            </Paper>

            {/* Leave Types Tab */}
            {activeTab === 0 && (
                <Box>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                resetTypeForm();
                                setOpenTypeDialog(true);
                            }}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Add Leave Type
                        </Button>
                    </Box>

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'background.default' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Max Days/Year</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Carry Forward</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {leaveTypes.map((type) => (
                                    <TableRow key={type._id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: type.color }} />
                                                {type.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>{type.code}</TableCell>
                                        <TableCell>{type.maxDaysPerYear}</TableCell>
                                        <TableCell>{type.carryForwardLimit}</TableCell>
                                        <TableCell>
                                            <Chip label={type.isPaid ? 'Paid' : 'Unpaid'} size="small" color={type.isPaid ? 'success' : 'default'} />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" onClick={() => { setCurrentType(type); setOpenTypeDialog(true); }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDeleteType(type._id)} color="error">
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* Leave Policies Tab */}
            {activeTab === 1 && (
                <Box>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => {
                                resetPolicyForm();
                                setOpenPolicyDialog(true);
                            }}
                            sx={{ borderRadius: 2, textTransform: 'none' }}
                        >
                            Add Policy
                        </Button>
                    </Box>

                    <Grid container spacing={3}>
                        {policies.map((policy) => (
                            <Grid item xs={12} md={6} key={policy._id}>
                                <Card elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="700">{policy.name}</Typography>
                                        <IconButton size="small" onClick={() => { setCurrentPolicy(policy); setOpenPolicyDialog(true); }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {policy.description}
                                    </Typography>
                                    {policy.leaveTypes.map((lt, idx) => (
                                        <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderTop: idx > 0 ? '1px solid' : 'none', borderColor: 'divider' }}>
                                            <Typography variant="body2">{lt.leaveType?.name}</Typography>
                                            <Chip label={`${lt.quota} days`} size="small" />
                                        </Box>
                                    ))}
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* Leave Type Dialog */}
            <Dialog open={openTypeDialog} onClose={() => setOpenTypeDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{currentType._id ? 'Edit Leave Type' : 'Add Leave Type'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label="Name"
                            value={currentType.name}
                            onChange={(e) => setCurrentType({ ...currentType, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Code"
                            value={currentType.code}
                            onChange={(e) => setCurrentType({ ...currentType, code: e.target.value.toUpperCase() })}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={currentType.description}
                            onChange={(e) => setCurrentType({ ...currentType, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />
                        <TextField
                            label="Max Days Per Year"
                            type="number"
                            value={currentType.maxDaysPerYear}
                            onChange={(e) => setCurrentType({ ...currentType, maxDaysPerYear: parseInt(e.target.value) })}
                            fullWidth
                        />
                        <TextField
                            label="Carry Forward Limit"
                            type="number"
                            value={currentType.carryForwardLimit}
                            onChange={(e) => setCurrentType({ ...currentType, carryForwardLimit: parseInt(e.target.value) })}
                            fullWidth
                        />
                        <TextField
                            label="Color"
                            type="color"
                            value={currentType.color}
                            onChange={(e) => setCurrentType({ ...currentType, color: e.target.value })}
                            fullWidth
                        />
                        <FormControlLabel
                            control={<Switch checked={currentType.isPaid} onChange={(e) => setCurrentType({ ...currentType, isPaid: e.target.checked })} />}
                            label="Paid Leave"
                        />
                        <FormControlLabel
                            control={<Switch checked={currentType.requiresApproval} onChange={(e) => setCurrentType({ ...currentType, requiresApproval: e.target.checked })} />}
                            label="Requires Approval"
                        />
                        <FormControlLabel
                            control={<Switch checked={currentType.affectsAttendance} onChange={(e) => setCurrentType({ ...currentType, affectsAttendance: e.target.checked })} />}
                            label="Affects Attendance"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTypeDialog(false)}>Cancel</Button>
                    <Button onClick={handleSaveType} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>

            {/* Leave Policy Dialog */}
            <Dialog open={openPolicyDialog} onClose={() => setOpenPolicyDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{currentPolicy._id ? 'Edit Policy' : 'Add Policy'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <TextField
                            label="Policy Name"
                            value={currentPolicy.name}
                            onChange={(e) => setCurrentPolicy({ ...currentPolicy, name: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={currentPolicy.description}
                            onChange={(e) => setCurrentPolicy({ ...currentPolicy, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                        />

                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight="600">Leave Type Quotas</Typography>
                                <Button size="small" startIcon={<AddIcon />} onClick={addLeaveTypeToPolicy}>
                                    Add Leave Type
                                </Button>
                            </Box>

                            {currentPolicy.leaveTypes.map((lt, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Leave Type</InputLabel>
                                        <Select
                                            value={lt.leaveType?._id || lt.leaveType || ''}
                                            onChange={(e) => updatePolicyLeaveType(index, 'leaveType', e.target.value)}
                                            label="Leave Type"
                                        >
                                            {leaveTypes.map((type) => (
                                                <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <TextField
                                        label="Quota (Days)"
                                        type="number"
                                        value={lt.quota}
                                        onChange={(e) => updatePolicyLeaveType(index, 'quota', parseInt(e.target.value))}
                                        sx={{ width: 150 }}
                                    />
                                    <IconButton onClick={() => removePolicyLeaveType(index)} color="error">
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPolicyDialog(false)}>Cancel</Button>
                    <Button onClick={handleSavePolicy} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default LeaveSettings;
