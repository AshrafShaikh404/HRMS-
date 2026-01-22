import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Avatar, Button, Divider, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Person as PersonIcon, Email as EmailIcon, Badge as BadgeIcon } from '@mui/icons-material';

const Profile = () => {
    const { user } = useAuth();

    if (!user) {
        return <Alert severity="error">User details not found.</Alert>;
    }

    const roleName = typeof user.role === 'string' ? user.role : user.role?.name || 'Employee';

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                My Profile
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 4, height: '100%' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                            <Avatar
                                sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem', mb: 2 }}
                            >
                                {user.name ? user.name.charAt(0).toUpperCase() : <PersonIcon />}
                            </Avatar>
                            <Typography variant="h5" fontWeight={700}>
                                {user.name}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                {user.email}
                            </Typography>
                            <Button variant="outlined" sx={{ mt: 2, borderRadius: 2 }}>
                                Edit Profile
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 4, height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Personal Information
                            </Typography>
                            <Divider sx={{ mb: 3 }} />

                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <BadgeIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Role
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                        {roleName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <EmailIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Email
                                        </Typography>
                                    </Box>
                                    <Typography variant="body1" fontWeight={600}>
                                        {user.email}
                                    </Typography>
                                </Grid>
                                {/* Add more fields as needed based on user model */}
                            </Grid>

                            <Box sx={{ mt: 4 }}>
                                <Alert severity="info">
                                    To update your personal details or change your password, please contact the HR department.
                                </Alert>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
