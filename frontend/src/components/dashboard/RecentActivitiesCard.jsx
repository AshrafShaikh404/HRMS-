import { Box, Card, Typography, Avatar } from '@mui/material';

const RecentActivitiesCard = () => {
    const activities = [
        { id: 1, user: 'Doglas Martini', action: 'Added New Project', target: 'HRMS Dashboard', time: '05:30 PM', avatar: 'https://randomuser.me/api/portraits/men/12.jpg' },
        { id: 2, user: 'Brian Villalobos', action: 'Commented on', target: 'Uploaded Document', time: '05:30 PM', avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
        { id: 3, user: 'Harvey Smith', action: 'Approved', target: 'Task Projects', time: '05:30 PM', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 4, user: 'Eliot Murray', action: 'Requesting Access to', target: 'Module Tickets', time: '05:30 PM', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
        { id: 5, user: 'Connie Waters', action: 'Downloaded', target: 'App Reports', time: '05:30 PM', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: 6, user: 'Stephan Peralt', action: 'Completed New Project', target: 'HMS', time: '05:30 PM', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' }
    ];

    return (
        <Card sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1rem' }}>
                    Recent Activities
                </Typography>
                <Button
                    variant="text"
                    sx={{
                        color: '#6B7280',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        bgcolor: '#F9FAFB',
                        px: 1,
                        '&:hover': { bgcolor: '#F3F4F6' }
                    }}
                >
                    View All
                </Button>
            </Box>

            {/* Activities List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {activities.map((activity, i) => (
                    <Box key={activity.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, position: 'relative' }}>
                        {/* Connecting Line */}
                        {i !== activities.length - 1 && (
                            <Box sx={{
                                position: 'absolute',
                                left: 16,
                                top: 40,
                                bottom: -12,
                                width: 2,
                                bgcolor: '#F3F4F6'
                            }} />
                        )}
                        <Avatar src={activity.avatar} sx={{ width: 34, height: 34, zIndex: 1 }} />
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.875rem' }}>
                                    {activity.user}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600 }}>
                                    {activity.time}
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.813rem', mt: 0.2 }}>
                                {activity.action}{' '}
                                <Box component="span" sx={{ color: '#FF9B44', fontWeight: 600 }}>
                                    {activity.target}
                                </Box>
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Card>
    );
};

// Import missing Button
import { Button } from '@mui/material';

export default RecentActivitiesCard;
