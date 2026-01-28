import { Box, Card, Typography, Avatar, Button } from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

const BirthdayCard = () => {
    const birthdayData = [
        {
            group: 'Today',
            employees: [
                { id: 1, name: 'Andrew Jermia', role: 'Accountant', avatar: 'https://randomuser.me/api/portraits/women/10.jpg' }
            ]
        },
        {
            group: 'Tomorrow',
            employees: [
                { id: 2, name: 'Connie Waters', role: 'Developer', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
                { id: 3, name: 'Stephan Peralt', role: 'Executive Officer', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' }
            ]
        },
        {
            group: '25 Jan 2025',
            employees: [
                { id: 4, name: 'Harvey Smith', role: 'Team Lead', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' }
            ]
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
                    Birthdays
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

            {/* Birthdays List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                {birthdayData.map((group) => (
                    <Box key={group.group}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1f1f1f', mb: 1.5 }}>
                            {group.group}
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {group.employees.map((emp) => (
                                <Box key={emp.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar src={emp.avatar} sx={{ width: 36, height: 36 }} />
                                        <Box>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.813rem' }}>
                                                {emp.name}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                                                {emp.role}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<SendIcon sx={{ fontSize: '12px !important' }} />}
                                        sx={{
                                            bgcolor: '#2D6A6A',
                                            color: '#fff',
                                            boxShadow: 'none',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.688rem',
                                            borderRadius: 1.5,
                                            px: 1.5,
                                            height: 28,
                                            '&:hover': { bgcolor: '#245656', boxShadow: 'none' }
                                        }}
                                    >
                                        Send
                                    </Button>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ))}
            </Box>
        </Card>
    );
};

export default BirthdayCard;
