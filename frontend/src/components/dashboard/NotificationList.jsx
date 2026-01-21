import { Box, Typography, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider, alpha, Button, useTheme, Chip } from '@mui/material';
import {
    Notifications as NotificationIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Announcement as InfoIcon,
    BeachAccess as LeaveIcon,
    AccessTime as AttendanceIcon
} from '@mui/icons-material';

const NotificationList = ({ notifications = [] }) => {
    const theme = useTheme();
    const getIcon = (type) => {
        switch (type) {
            case 'leave': return <LeaveIcon sx={{ fontSize: 20 }} />;
            case 'attendance': return <AttendanceIcon sx={{ fontSize: 20 }} />;
            case 'announcement': return <InfoIcon sx={{ fontSize: 20 }} />;
            case 'success': return <SuccessIcon sx={{ fontSize: 20 }} />;
            case 'error': return <ErrorIcon sx={{ fontSize: 20 }} />;
            default: return <NotificationIcon sx={{ fontSize: 20 }} />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'leave': return theme.palette.primary.main;
            case 'attendance': return theme.palette.info.main;
            case 'announcement': return theme.palette.warning.main;
            case 'success': return theme.palette.success.main;
            case 'error': return theme.palette.error.main;
            default: return theme.palette.primary.main;
        }
    };

    const displayList = notifications.length > 0 ? notifications : [
        { id: 1, title: 'Leave Approved', message: 'Your casual leave for 25th Jan has been approved.', type: 'leave', time: '2 hours ago' },
        { id: 2, title: 'Check-in Reminder', message: 'Dont forget to check-in by 9:30 AM.', type: 'attendance', time: '5 hours ago' },
        { id: 3, title: 'System Maintenance', message: 'Payroll system will be down tonight.', type: 'announcement', time: '1 day ago' },
    ];

    return (
        <Card sx={{
            height: '100%',
            borderRadius: 6,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
        }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: -0.5 }}>
                    Updates
                </Typography>
                <Chip
                    label={`${displayList.length} New`}
                    size="small"
                    color="primary"
                    sx={{ fontWeight: 800, height: 24, fontSize: '0.75rem' }}
                />
            </Box>

            <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
                <List sx={{ p: 0 }}>
                    {displayList.map((notif, index) => (
                        <ListItem key={notif.id} disablePadding sx={{ mb: 1 }}>
                            <Box sx={{
                                width: '100%',
                                py: 2,
                                px: 2,
                                borderRadius: 4,
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                border: '1px solid transparent',
                                '&:hover': {
                                    bgcolor: alpha(theme.palette.action.hover, 0.6),
                                    borderColor: alpha(theme.palette.divider, 0.4)
                                }
                            }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 3,
                                        bgcolor: alpha(getColor(notif.type), 0.1),
                                        color: getColor(notif.type),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: '1px solid',
                                        borderColor: alpha(getColor(notif.type), 0.1)
                                    }}>
                                        {getIcon(notif.type)}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="subtitle2" fontWeight={800}>{notif.title}</Typography>
                                            <Typography variant="caption" color="text.disabled" fontWeight={700}>{notif.time}</Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{
                                            lineHeight: 1.4,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                            fontWeight: 500
                                        }}>
                                            {notif.message}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </ListItem>
                    ))}
                </List>
            </Box>
            <Box sx={{ p: 2.5, pt: 0 }}>
                <Button
                    fullWidth
                    variant="text"
                    sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 700,
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05), color: 'primary.main' }
                    }}
                >
                    View History
                </Button>
            </Box>
        </Card>
    );
};

export default NotificationList;
