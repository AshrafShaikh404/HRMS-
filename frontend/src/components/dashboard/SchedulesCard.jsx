import { Box, Card, Typography, Avatar, AvatarGroup, Button, Chip } from '@mui/material';
import { CalendarToday as CalendarIcon, AccessTime as TimeIcon } from '@mui/icons-material';

const SchedulesCard = () => {
    const schedules = [
        {
            id: 1,
            title: 'Interview Candidates - UI/UX Designer',
            role: 'UI/UX Designer',
            date: 'Thu, 15 Feb 2025',
            time: '09:00 AM - 10:00 AM',
            participants: 5,
            roleColor: '#2D6A6A'
        },
        {
            id: 2,
            title: 'Interview Candidates - IOS Developer',
            role: 'IOS Developer',
            date: 'Thu, 15 Feb 2025',
            time: '10:00 AM - 11:00 AM',
            participants: 4,
            roleColor: '#1f1f1f'
        }
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
                    Schedules
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

            {/* Schedules List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, flex: 1 }}>
                {schedules.map((item) => (
                    <Box key={item.id} sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: '#F9FAFB',
                        border: '1px solid #F3F4F6'
                    }}>
                        <Chip
                            label={item.role}
                            size="small"
                            sx={{
                                height: 20,
                                bgcolor: item.roleColor,
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.625rem',
                                borderRadius: 1,
                                mb: 1.5,
                                '& .MuiChip-label': { px: 1 }
                            }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f1f1f', mb: 1.5 }}>
                            {item.title}
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    {item.date}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TimeIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    {item.time}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12, border: '2px solid #fff' } }}>
                                <Avatar src={`https://randomuser.me/api/portraits/men/${item.id + 10}.jpg`} />
                                <Avatar src={`https://randomuser.me/api/portraits/women/${item.id + 20}.jpg`} />
                                <Avatar src={`https://randomuser.me/api/portraits/men/${item.id + 30}.jpg`} />
                                {item.participants > 3 && <Avatar sx={{ bgcolor: '#FF9B44' }}>+{item.participants - 3}</Avatar>}
                            </AvatarGroup>
                            <Button
                                variant="contained"
                                size="small"
                                sx={{
                                    bgcolor: '#FF9B44',
                                    color: '#fff',
                                    boxShadow: 'none',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                    borderRadius: 1.5,
                                    px: 2,
                                    '&:hover': { bgcolor: '#E88B39', boxShadow: 'none' }
                                }}
                            >
                                Join Meeting
                            </Button>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Card>
    );
};

export default SchedulesCard;
