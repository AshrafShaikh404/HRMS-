import { useState, useEffect } from 'react';
import {
    Box,
    Drawer,
    Typography,
    Avatar,
    IconButton,
    Grid,
    TextField,
    Button,
    Divider,
    Chip,
    Stack,
    CircularProgress,
    useTheme,
    alpha
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Person as PersonIcon,
    Work as WorkIcon,
    BeachAccess as LeaveIcon,
    Phone as PhoneIcon,
    CameraAlt as CameraIcon
} from '@mui/icons-material';
import { authAPI, leaveAPI, employeeAPI } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext'; // Assuming this exists based on history

const DRAWER_WIDTH = 500;

function ProfileDrawer({ open, onClose, mode = 'view', onModeChange }) {
    const theme = useTheme();
    const notification = useNotification(); // Or equivalent if context differs
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        email: ''
        // Profile photo upload is complex, sticking to fields for now or just UI
    });

    useEffect(() => {
        if (open) {
            fetchProfile();
            fetchLeaveBalance();
        }
    }, [open]);

    useEffect(() => {
        if (profile?.employee) {
            setFormData({
                phone: profile.employee.phone || '',
                address: profile.employee.address || '',
                email: profile.user?.email || profile.employee.email || '' // Email usually read-only but maybe editable? User asked for Phone, Address.
            });
        }
    }, [profile]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await authAPI.getMe();
            setProfile(response.data.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLeaveBalance = async () => {
        try {
            const response = await leaveAPI.getBalance();
            setLeaveBalance(response.data.data.balances);
        } catch (err) {
            console.error('Error fetching leave balance:', err);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const employeeId = profile?.employee?._id;
            if (!employeeId) return;

            // Prepare update data
            const updateData = {
                phone: formData.phone,
                address: formData.address,
                // Add logic for other fields if needed
            };

            await employeeAPI.update(employeeId, updateData);

            // Show success
            // notification.success('Profile updated successfully');

            // Refund to view mode or close? User says "Close drawer/dialog on save or cancel"
            onClose();
            // Refresh main data if needed, or just rely on next fetch
        } catch (err) {
            console.error('Error updating profile:', err);
            // notification.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const employee = profile?.employee;
    const userData = profile?.user;

    const InfoItem = ({ label, value, icon }) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {icon && <Box component="span" sx={{ fontSize: 16, display: 'flex' }}>{icon}</Box>}
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
                {value || 'N/A'}
            </Typography>
        </Box>
    );

    const content = (
        <Box sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.default'
            }}>
                <Typography variant="h6" fontWeight="bold">
                    {mode === 'edit' ? 'Edit Profile' : 'My Profile'}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ p: 3, overflowY: 'auto', flex: 1 }}>
                    {/* User Summary */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Avatar
                                src={userData?.avatar} // Assuming avatar URL is here
                                sx={{
                                    width: 100,
                                    height: 100,
                                    bgcolor: 'primary.main',
                                    fontSize: '2.5rem',
                                    mb: 2,
                                    boxShadow: 3
                                }}
                            >
                                {(userData?.name || employee?.firstName || 'U').charAt(0).toUpperCase()}
                            </Avatar>
                            {mode === 'edit' && (
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        bottom: 16,
                                        right: -8,
                                        bgcolor: 'background.paper',
                                        boxShadow: 2,
                                        '&:hover': { bgcolor: 'background.paper' }
                                    }}
                                    size="small"
                                >
                                    <CameraIcon fontSize="small" color="primary" />
                                </IconButton>
                            )}
                        </Box>
                        <Typography variant="h5" fontWeight="bold">
                            {userData?.name || `${employee?.firstName} ${employee?.lastName}`}
                        </Typography>
                        <Chip
                            label={userData?.role?.toUpperCase() || employee?.designation || 'EMPLOYEE'}
                            color="primary"
                            size="small"
                            sx={{ mt: 1, borderRadius: '8px' }}
                        />
                    </Box>

                    {mode === 'view' ? (
                        <Grid container spacing={3}>
                            {/* Personal Information */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <PersonIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={600}>Personal Information</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <InfoItem label="Email" value={userData?.email || employee?.email} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InfoItem label="Phone" value={employee?.phone} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <InfoItem label="Address" value={employee?.address} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InfoItem label="Gender" value={employee?.gender} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InfoItem
                                            label="DOB"
                                            value={employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : null}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Divider sx={{ width: '100%', my: 2 }} />

                            {/* Employment Details */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <WorkIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={600}>Employment Details</Typography>
                                </Box>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <InfoItem label="Employee Code" value={employee?.employeeCode} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InfoItem label="Department" value={employee?.department} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InfoItem label="Designation" value={employee?.designation} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <InfoItem
                                            label="Joining Date"
                                            value={employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString() : null}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Divider sx={{ width: '100%', my: 2 }} />

                            {/* Leave Balance */}
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <LeaveIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={600}>Leave Balance</Typography>
                                </Box>
                                {leaveBalance ? (
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box sx={{
                                            flex: 1,
                                            p: 2,
                                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                                            borderRadius: 2,
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="h6" color="primary.main" fontWeight="bold">
                                                {leaveBalance.casualLeave?.available || 0}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Casual</Typography>
                                        </Box>
                                        <Box sx={{
                                            flex: 1,
                                            p: 2,
                                            bgcolor: alpha(theme.palette.error.main, 0.05),
                                            borderRadius: 2,
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="h6" color="error.main" fontWeight="bold">
                                                {leaveBalance.sickLeave?.available || 0}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Sick</Typography>
                                        </Box>
                                        <Box sx={{
                                            flex: 1,
                                            p: 2,
                                            bgcolor: alpha(theme.palette.success.main, 0.05),
                                            borderRadius: 2,
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="h6" color="success.main" fontWeight="bold">
                                                {leaveBalance.earnedLeave?.available || 0}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">Earned</Typography>
                                        </Box>
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Loading balance...</Typography>
                                )}
                            </Grid>

                            <Divider sx={{ width: '100%', my: 2 }} />

                            {/* Emergency Contact */}
                            {employee?.emergencyContact && (
                                <Grid item xs={12}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <PhoneIcon color="error" fontSize="small" />
                                        <Typography variant="subtitle1" fontWeight={600}>Emergency Contact</Typography>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <InfoItem label="Name" value={employee.emergencyContact.name} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <InfoItem label="Relationship" value={employee.emergencyContact.relationship} />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <InfoItem label="Phone" value={employee.emergencyContact.phone} />
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Edit Mode Form */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                    Editable Information
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            variant="outlined"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            label="Address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            variant="outlined"
                                            multiline
                                            rows={3}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                    Read-Only Information
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Employee Code"
                                            value={employee?.employeeCode || ''}
                                            disabled
                                            variant="filled"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Department"
                                            value={employee?.department || ''}
                                            disabled
                                            variant="filled"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Designation"
                                            value={employee?.designation || ''}
                                            disabled
                                            variant="filled"
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            label="Join Date"
                                            value={employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString() : ''}
                                            disabled
                                            variant="filled"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>

                            {/* Action Buttons */}
                            <Grid item xs={12} sx={{ mt: 2 }}>
                                <Stack direction="row" spacing={2} justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSave}
                                        startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                                        disabled={saving}
                                    >
                                        Save Changes
                                    </Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    )}
                </Box>
            )}
        </Box>
    );

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: DRAWER_WIDTH },
                    borderTopLeftRadius: { xs: 0, sm: 20 },
                    borderBottomLeftRadius: { xs: 0, sm: 20 },
                    overflow: 'hidden'
                }
            }}
        >
            {content}
        </Drawer>
    );
}

export default ProfileDrawer;
