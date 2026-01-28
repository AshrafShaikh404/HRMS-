import React from 'react';
import { Card, CardContent, Typography, Box, Avatar, Chip, Grid, Divider, useTheme, alpha } from '@mui/material';
import {
    LocationOn as LocationIcon,
    Business as BuildingIcon,
    Badge as BadgeIcon,
    Email as EmailIcon
} from '@mui/icons-material';

const EmployeeOverviewCard = ({ user, profile }) => {
    const theme = useTheme();

    // Use profile data if available, fallback to user context
    const name = profile?.name || user?.name || 'Employee';
    const designation = profile?.designation || 'Designation';
    const department = profile?.jobInfo?.department?.name || 'Department';
    const location = profile?.jobInfo?.location?.name || 'Location';
    const employeeCode = profile?.employeeCode || 'EMP-000';
    const email = user?.email || '';

    return (
        <Card sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{
                height: 48, // Reduced from 60
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            }} />
            <CardContent sx={{ pt: 0, px: 2.5, pb: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-end', mt: -3.5, mb: 1.5 }}>
                    <Avatar
                        src={user?.profileImage}
                        alt={name}
                        sx={{
                            width: 72, // Reduced from 80
                            height: 72,
                            border: '4px solid #fff',
                            boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                            fontSize: '1.75rem',
                            bgcolor: theme.palette.primary.light
                        }}
                    >
                        {name.charAt(0)}
                    </Avatar>
                    <Box sx={{ ml: 2, mb: 0.5 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                            {name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            {designation}
                        </Typography>
                    </Box>
                </Box>

                <Grid container spacing={1.5} sx={{ mt: 'auto' }}>
                    <Grid item xs={6} sm={6} md={3}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'background.default', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                <BadgeIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.8 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary">ID</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} noWrap>{employeeCode}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'background.default', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                <BuildingIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.8 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary">Dept</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} noWrap>{department}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'background.default', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                <LocationIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.8 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary">Location</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight={600} noWrap>{location}</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={6} md={3}>
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'background.default', height: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                                <EmailIcon sx={{ fontSize: 16, color: 'primary.main', opacity: 0.8 }} />
                                <Typography variant="caption" fontWeight={700} color="text.secondary">Email</Typography>
                            </Box>
                            <Typography variant="body2" noWrap fontWeight={600} title={email} sx={{ fontSize: '0.75rem' }}>{email}</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default EmployeeOverviewCard;
