import { Box, Card, Typography, Button, Avatar } from '@mui/material';
import { MoreVert as MoreIcon } from '@mui/icons-material';

const EmployeeStatusCard = () => {
    const stats = [
        { label: 'Fulltime', percentage: 48, count: 112, color: '#FF9B44' },
        { label: 'Contract', percentage: 20, count: 21, color: '#2D6A6A' },
        { label: 'Probation', percentage: 12, count: 12, color: '#F44336' },
        { label: 'WFH', percentage: 20, count: 4, color: '#E91E63' }
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
                    Employee Status
                </Typography>
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
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>This Week</Typography>
                </Box>
            </Box>

            {/* Total Count */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 500 }}>Total Employee</Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f1f1f' }}>154</Typography>
            </Box>

            {/* Segmented Bar */}
            <Box sx={{
                height: 24,
                display: 'flex',
                borderRadius: 1.5,
                overflow: 'hidden',
                mb: 3
            }}>
                {stats.map((s, i) => (
                    <Box key={i} sx={{ width: `${s.percentage}%`, bgcolor: s.color, height: '100%' }} />
                ))}
            </Box>

            {/* Stats Legend */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
                mb: 3,
                pb: 3,
                borderBottom: '1px solid #F3F4F6'
            }}>
                {stats.map((s, i) => (
                    <Box key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                {s.label} ({s.percentage}%)
                            </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1.25rem' }}>
                            {s.count < 10 ? `0${s.count}` : s.count}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Top Performer */}
            <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1f1f1f' }}>
                    Top Performer
                </Typography>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid #FFE5D0',
                    bgcolor: '#FFF7F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                            src="https://randomuser.me/api/portraits/women/44.jpg"
                            sx={{ width: 36, height: 36, border: '2px solid #fff' }}
                        />
                        <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151' }}>
                                Daniel Esbella
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                                IOS Developer
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', fontWeight: 500 }}>
                            Performance
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#FF9B44' }}>
                            99%
                        </Typography>
                    </Box>
                </Box>
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
                View All Employees
            </Button>
        </Card>
    );
};

export default EmployeeStatusCard;
