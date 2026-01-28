import { Box, Card, Typography, Avatar, Button, Chip } from '@mui/material';
import { AccessTime as TimeIcon, MoreVert as MoreIcon, KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';

const ClockInOutList = () => {
    const logs = [
        { id: 1, name: 'Daniel Esbella', role: 'UI/UX Designer', time: '09:15', status: 'present', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
        { id: 2, name: 'Doglas Martini', role: 'Project Manager', time: '09:35', status: 'present', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
        { id: 3, name: 'Brian Villalobos', role: 'PHP Developer', time: '09:21', status: 'present', avatar: 'https://randomuser.me/api/portraits/men/45.jpg', expanded: true },
        { id: 4, name: 'Anthony Lewis', role: 'Marketing Head', time: '08:35', status: 'late', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', delay: '30 Min' }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1rem' }}>
                    Clock-In/Out
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Box sx={{
                        px: 1,
                        py: 0.5,
                        border: '1px solid #E5E7EB',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>All Departments</Typography>
                        <ArrowDownIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                    </Box>
                    <Box sx={{
                        px: 1,
                        py: 0.5,
                        border: '1px solid #E5E7EB',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        bgcolor: '#F9FAFB'
                    }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>Today</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Logs List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                {logs.map((log) => (
                    <Box key={log.id}>
                        {log.id === 4 && (
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 1.5, color: '#1f1f1f' }}>
                                Late
                            </Typography>
                        )}
                        <Box sx={{
                            p: 1.5,
                            borderRadius: log.expanded ? '12px 12px 0 0' : 3,
                            border: '1px solid #F3F4F6',
                            bgcolor: log.expanded ? '#fff' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            boxShadow: log.expanded ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                            zIndex: log.expanded ? 1 : 0,
                            position: 'relative'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar src={log.avatar} sx={{ width: 36, height: 36 }} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.813rem' }}>
                                        {log.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                                        {log.role}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                {log.delay && (
                                    <Chip
                                        label={log.delay}
                                        size="small"
                                        sx={{
                                            height: 20,
                                            bgcolor: '#FEE2E2',
                                            color: '#EF4444',
                                            fontWeight: 700,
                                            fontSize: '0.625rem',
                                            borderRadius: 1
                                        }}
                                    />
                                )}
                                <TimeIcon sx={{ fontSize: 16, color: '#9CA3AF' }} />
                                <Chip
                                    label={log.time}
                                    size="small"
                                    sx={{
                                        height: 20,
                                        bgcolor: log.status === 'late' ? '#FEE2E2' : '#E8F5E9',
                                        color: log.status === 'late' ? '#EF4444' : '#4CAF50',
                                        fontWeight: 700,
                                        fontSize: '0.688rem',
                                        borderRadius: 1
                                    }}
                                />
                            </Box>
                        </Box>

                        {/* Expanded Detail View */}
                        {log.expanded && (
                            <Box sx={{
                                p: 1.5,
                                pt: 2,
                                mt: -1,
                                borderRadius: '0 0 12px 12px',
                                border: '1px solid #F3F4F6',
                                borderTop: 'none',
                                bgcolor: '#F9FAFB',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: 1,
                                textAlign: 'center'
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                        • Clock in
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>
                                        10:30 AM
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                        • Clock Out
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>
                                        09:45 AM
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                        • Production
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.75rem' }}>
                                        09:21 Hrs
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>

            {/* Footer Button */}
            <Button
                fullWidth
                sx={{
                    mt: 3,
                    py: 1.2,
                    bgcolor: '#F9FAFB',
                    color: '#6B7280',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    border: '1px solid #E5E7EB',
                    '&:hover': { bgcolor: '#F3F4F6' }
                }}
            >
                View All Attendance
            </Button>
        </Card>
    );
};

export default ClockInOutList;
