import React from 'react';
import { Card, CardContent, Typography, Grid, Button, alpha, useTheme } from '@mui/material';
import {
    EventNote as LeaveIcon,
    Update as RegularizeIcon,
    Person as ProfileIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const QuickActionsCard = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const actions = [
        { label: 'Apply Leave', icon: <LeaveIcon />, path: '/leaves', color: 'primary' },
        { label: 'Regularize', icon: <RegularizeIcon />, path: '/attendance', color: 'secondary' },
        { label: 'My Profile', icon: <ProfileIcon />, path: '/profile', color: 'info' },
    ];

    return (
        <Card sx={{ borderRadius: 4, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    Quick Actions
                </Typography>
                <Grid container spacing={2}>
                    {actions.map((action, index) => (
                        <Grid item xs={12} key={index}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={action.icon}
                                endIcon={<ArrowIcon sx={{ opacity: 0, transition: '0.2s', transform: 'translateX(-10px)' }} className="arrow-icon" />}
                                onClick={() => navigate(action.path)}
                                sx={{
                                    justifyContent: 'flex-start',
                                    borderRadius: 3,
                                    py: 1.5,
                                    px: 2,
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette[action.color].main, 0.2),
                                    color: theme.palette.text.primary,
                                    bgcolor: alpha(theme.palette[action.color].main, 0.04),
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette[action.color].main, 0.1),
                                        borderColor: action.color + '.main',
                                        '& .arrow-icon': {
                                            opacity: 1,
                                            transform: 'translateX(0)'
                                        }
                                    }
                                }}
                            >
                                {action.label}
                            </Button>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>
        </Card>
    );
};

export default QuickActionsCard;
