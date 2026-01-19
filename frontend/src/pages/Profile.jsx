import { useState, useEffect } from 'react';
import { authAPI, leaveAPI } from '../utils/api';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Avatar,
    Chip,
    Skeleton,
    Divider,
} from '@mui/material';
import {
    Person as PersonIcon,
    Work as WorkIcon,
    BeachAccess as LeaveIcon,
    Phone as PhoneIcon,
} from '@mui/icons-material';

function Profile({ user }) {
    const [profile, setProfile] = useState(null);
    const [leaveBalance, setLeaveBalance] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
        fetchLeaveBalance();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await authAPI.getMe();
            setProfile(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching profile:', err);
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

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Skeleton variant="rounded" height={300} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Skeleton variant="rounded" height={200} />
                    </Grid>
                </Grid>
            </Box>
        );
    }

    const employee = profile?.employee;
    const userData = profile?.user;

    const InfoItem = ({ label, value }) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
                {label}
            </Typography>
            <Typography variant="body1" fontWeight={500}>
                {value || 'N/A'}
            </Typography>
        </Box>
    );

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    My Profile
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    View your personal and employment details
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {/* Personal Information */}
                <Grid item xs={12} lg={8}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                                <Avatar
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        bgcolor: 'primary.main',
                                        fontSize: '2rem',
                                    }}
                                >
                                    {(userData?.name || employee?.firstName || 'U').charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5" fontWeight="bold">
                                        {userData?.name || `${employee?.firstName} ${employee?.lastName}`}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary">
                                        {employee?.designation || 'N/A'}
                                    </Typography>
                                    <Chip
                                        label={userData?.role?.toUpperCase() || 'EMPLOYEE'}
                                        color="primary"
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <PersonIcon color="primary" />
                                <Typography variant="h6" fontWeight={600}>
                                    Personal Information
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoItem label="Email" value={userData?.email || employee?.email} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoItem label="Phone" value={employee?.phone} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoItem
                                        label="Gender"
                                        value={employee?.gender === 'M' ? 'Male' : employee?.gender === 'F' ? 'Female' : employee?.gender}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoItem
                                        label="Date of Birth"
                                        value={employee?.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : null}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoItem label="Address" value={employee?.address} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoItem label="City, State" value={`${employee?.city || 'N/A'}, ${employee?.state || 'N/A'}`} />
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Side Cards */}
                <Grid item xs={12} lg={4}>
                    <Grid container spacing={3}>
                        {/* Employment Details */}
                        <Grid item xs={12} sm={6} lg={12}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <WorkIcon color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Employment Details
                                        </Typography>
                                    </Box>
                                    <InfoItem label="Employee Code" value={employee?.employeeCode} />
                                    <InfoItem label="Department" value={employee?.department} />
                                    <InfoItem label="Designation" value={employee?.designation} />
                                    <InfoItem
                                        label="Join Date"
                                        value={employee?.joinDate ? new Date(employee.joinDate).toLocaleDateString() : null}
                                    />
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            Status
                                        </Typography>
                                        <Chip
                                            label={employee?.status || 'active'}
                                            color={employee?.status === 'active' ? 'success' : 'error'}
                                            size="small"
                                        />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Leave Balance */}
                        <Grid item xs={12} sm={6} lg={12}>
                            <Card sx={{ height: '100%' }}>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <LeaveIcon color="primary" />
                                        <Typography variant="h6" fontWeight={600}>
                                            Leave Balance
                                        </Typography>
                                    </Box>
                                    {leaveBalance ? (
                                        <Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="body2">Casual Leave</Typography>
                                                <Typography variant="body1" fontWeight={600} color="primary.main">
                                                    {leaveBalance.casualLeave?.available || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <Typography variant="body2">Sick Leave</Typography>
                                                <Typography variant="body1" fontWeight={600} color="error.main">
                                                    {leaveBalance.sickLeave?.available || 0}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">Earned Leave</Typography>
                                                <Typography variant="body1" fontWeight={600} color="success.main">
                                                    {leaveBalance.earnedLeave?.available || 0}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Loading leave balance...
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Emergency Contact */}
                        {employee?.emergencyContact && (
                            <Grid item xs={12}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                            <PhoneIcon color="error" />
                                            <Typography variant="h6" fontWeight={600}>
                                                Emergency Contact
                                            </Typography>
                                        </Box>
                                        <InfoItem label="Name" value={employee.emergencyContact.name} />
                                        <InfoItem label="Relationship" value={employee.emergencyContact.relationship} />
                                        <InfoItem label="Phone" value={employee.emergencyContact.phone} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Profile;
