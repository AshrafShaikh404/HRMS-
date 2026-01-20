import { Box, Typography, Card, CardContent, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider, alpha, Button } from '@mui/material';
import {
    Notifications as NotificationIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Announcement as InfoIcon,
    BeachAccess as LeaveIcon,
    AccessTime as AttendanceIcon
} from '@mui/icons-material';

const NotificationList = ({ notifications = [] }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'leave': return <LeaveIcon />;
            case 'attendance': return <AttendanceIcon />;
            case 'announcement': return <InfoIcon />;
            case 'success': return <SuccessIcon />;
            case 'error': return <ErrorIcon />;
            default: return <NotificationIcon />;
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'leave': return 'primary';
            case 'attendance': return 'info';
            case 'announcement': return 'warning';
            case 'success': return 'success';
            case 'error': return 'error';
            default: return 'primary';
        }
    };

    // Placeholder notifications if none provided
    const displayList = notifications.length > 0 ? notifications : [
        { id: 1, title: 'Leave Approved', message: 'Your casual leave for 25th Jan has been approved.', type: 'leave', time: '2 hours ago' },
        { id: 2, title: 'Check-in Reminder', message: 'Dont forget to check-in by 9:30 AM.', type: 'attendance', time: '5 hours ago' },
        { id: 3, title: 'System Maintenance', message: 'Payroll system will be down for maintenance tonight.', type: 'announcement', time: '1 day ago' },
    ];

    return (
        <Card sx={{ height: '100%', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>
                    Notifications
                </Typography>
                <Button size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>Mark all read</Button>
            </Box>
            <Divider />
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                <List sx={{ p: 0 }}>
                    {displayList.map((notif, index) => (
                        <Box key={notif.id}>
                            <ListItem alignItems="flex-start" sx={{
                                py: 2,
                                px: 3,
                                '&:hover': { bgcolor: alpha('#000', 0.02) },
                                cursor: 'pointer'
                            }}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: `${getColor(notif.type)}.lighter`, color: `${getColor(notif.type)}.main` }}>
                                        {getIcon(notif.type)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="subtitle2" fontWeight={700}>{notif.title}</Typography>
                                            <Typography variant="caption" color="text.secondary">{notif.time}</Typography>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="body2" color="text.secondary" sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {notif.message}
                                        </Typography>
                                    }
                                />
                            </ListItem>
                            {index < displayList.length - 1 && <Divider component="li" sx={{ mx: 3 }} />}
                        </Box>
                    ))}
                </List>
            </Box>
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Button fullWidth variant="text" color="primary" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    View All Notifications
                </Button>
            </Box>
        </Card>
    );
};

export default NotificationList;
