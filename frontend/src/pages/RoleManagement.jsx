import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
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
    Checkbox,
    Tooltip,
    Stack,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Security as SecurityIcon,
    People as PeopleIcon,
    Close as CloseIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { roleAPI } from '../utils/api';

function RoleManagement({ user }) {
    const { showSuccess, showError } = useNotification();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true
    });

    // Permission Matrix State
    const [permissionsByModule, setPermissionsByModule] = useState({});
    const [activeRoleForPermissions, setActiveRoleForPermissions] = useState(null);
    const [permissionsModal, setPermissionsModal] = useState(false);
    const [updatingPermission, setUpdatingPermission] = useState(null); // Track specific permission being updated

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const response = await roleAPI.getRoles();
            setRoles(response.data.data);
            setLoading(false);
        } catch (err) {
            showError('Failed to fetch roles');
            setLoading(false);
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await roleAPI.getPermissions();
            setPermissionsByModule(response.data.grouped);
        } catch (err) {
            console.error('Failed to fetch permissions', err);
        }
    };

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                description: role.description || '',
                isActive: role.isActive
            });
        } else {
            setEditingRole(null);
            setFormData({
                name: '',
                description: '',
                isActive: true
            });
        }
        setOpenModal(true);
    };

    const handleSaveRole = async () => {
        try {
            if (editingRole) {
                await roleAPI.updateRole(editingRole._id, formData);
                showSuccess('Role updated successfully');
            } else {
                await roleAPI.createRole(formData);
                showSuccess('Role created successfully');
            }
            setOpenModal(false);
            fetchRoles();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to save role');
        }
    };

    const handleOpenPermissions = (role) => {
        setActiveRoleForPermissions(role);
        setPermissionsModal(true);
    };

    // Immediate Update Logic
    const handleTogglePermission = async (permissionId) => {
        if (!activeRoleForPermissions) return;

        // Optimistic UI Update
        const currentPermissions = activeRoleForPermissions.permissions.map(p => p._id);
        const hasPermission = currentPermissions.includes(permissionId);

        let newPermissions;
        if (hasPermission) {
            // Remove
            newPermissions = currentPermissions.filter(id => id !== permissionId);
        } else {
            // Add
            newPermissions = [...currentPermissions, permissionId];
        }

        setUpdatingPermission(permissionId);

        try {
            await roleAPI.updateRole(activeRoleForPermissions._id, {
                permissions: newPermissions
            });

            // Update local state to reflect change
            const updatedRole = {
                ...activeRoleForPermissions,
                permissions: newPermissions.map(id => ({ _id: id })) // Mock populated object
            };
            setActiveRoleForPermissions(updatedRole);

            // Also update main roles list
            setRoles(prev => prev.map(r => r._id === updatedRole._id ? updatedRole : r));

        } catch (err) {
            showError('Failed to update permission');
            // Revert on error would go here
        } finally {
            setUpdatingPermission(null);
        }
    };

    // Matrix Helper: Check if specific permission exists for module and action
    // Action types: 'view', 'create', 'update', 'delete', 'other'
    const getPermissionForCell = (moduleName, actionType) => {
        const modulePermissions = permissionsByModule[moduleName] || [];

        if (actionType === 'other') {
            // Find permissions that don't start with view, create, update, delete, approve, apply, process
            const standardActions = ['view', 'create', 'update', 'delete', 'approve', 'apply', 'process', 'manage'];
            return modulePermissions.filter(p => !standardActions.some(prefix => p.name.startsWith(prefix + '_')));
        }

        // Special handling for Approve/Apply/Process as they map to specific columns or 'update'
        // For this Matrix, we'll map:
        // View -> view_
        // Create -> create_, apply_
        // Update -> update_, approve_, process_, manage_
        // Delete -> delete_

        let prefixes = [actionType + '_'];
        if (actionType === 'create') prefixes.push('apply_');
        if (actionType === 'update') prefixes.push('approve_', 'process_', 'manage_');

        return modulePermissions.find(p => prefixes.some(prefix => p.name.startsWith(prefix)));
    };

    const renderPermissionCell = (permission) => {
        if (!permission) return <TableCell align="center">-</TableCell>;

        const isSystemRole = activeRoleForPermissions?.isSystem;
        const isChecked = activeRoleForPermissions?.permissions.some(p => p._id === permission._id);
        const isUpdating = updatingPermission === permission._id;

        return (
            <TableCell align="center">
                {isUpdating ? (
                    <CircularProgress size={20} />
                ) : (
                    <Checkbox
                        checked={isChecked}
                        onChange={() => handleTogglePermission(permission._id)}
                        disabled={isSystemRole} // Prevent editing system roles if required, or allow if requirement says "System roles permissions cannot be fully removed" but implied editable
                        color="primary"
                    />
                )}
            </TableCell>
        );
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Role Management</Typography>
                    <Typography color="text.secondary">Define roles and control access permissions</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{ borderRadius: 2 }}
                >
                    Create Role
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell><Typography fontWeight="bold">Role Name</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Description</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Users</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Status</Typography></TableCell>
                            <TableCell align="right"><Typography fontWeight="bold">Actions</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : roles.map((role) => (
                            <TableRow key={role._id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography fontWeight={600}>{role.name}</Typography>
                                        {role.isSystem && <Chip label="System" size="small" variant="outlined" color="primary" />}
                                    </Stack>
                                </TableCell>
                                <TableCell>{role.description || '-'}</TableCell>
                                <TableCell align="center">
                                    <Chip
                                        icon={<PeopleIcon sx={{ fontSize: '16px !important' }} />}
                                        label={role.userCount || 0}
                                        size="small"
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        label={role.isActive ? 'Active' : 'Inactive'}
                                        color={role.isActive ? 'success' : 'error'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Edit Role">
                                        <IconButton onClick={() => handleOpenModal(role)} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Manage Permissions">
                                        <IconButton onClick={() => handleOpenPermissions(role)} color="secondary">
                                            <SecurityIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Role Edit/Create Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Role Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={editingRole?.isSystem}
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
                                        disabled={editingRole?.isSystem}
                                    />
                                }
                                label="Active Status"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveRole}>Save Role</Button>
                </DialogActions>
            </Dialog>

            {/* Permission Matrix Modal */}
            <Dialog open={permissionsModal} onClose={() => setPermissionsModal(false)} maxWidth="lg" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        Permissions Matrix - {activeRoleForPermissions?.name}
                        {activeRoleForPermissions?.isSystem &&
                            <Typography variant="caption" display="block" color="text.secondary">
                                System roles have protected core permissions.
                            </Typography>
                        }
                    </Box>
                    <IconButton onClick={() => setPermissionsModal(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Module</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>View</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Create / Apply</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Update / Approve</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Delete</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {Object.keys(permissionsByModule).map((moduleName) => (
                                    <TableRow key={moduleName}>
                                        <TableCell sx={{ fontWeight: 500 }}>{moduleName}</TableCell>
                                        {renderPermissionCell(getPermissionForCell(moduleName, 'view'))}
                                        {renderPermissionCell(getPermissionForCell(moduleName, 'create'))}
                                        {renderPermissionCell(getPermissionForCell(moduleName, 'update'))}
                                        {renderPermissionCell(getPermissionForCell(moduleName, 'delete'))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPermissionsModal(false)} variant="contained">Done</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default RoleManagement;
