import { Box, Card, Typography, Avatar, AvatarGroup } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AttendanceOverviewChart = () => {
    const data = [
        { name: 'Present', value: 59, color: '#4CAF50' },
        { name: 'Late', value: 21, color: '#2D6A6A' },
        { name: 'Permission', value: 2, color: '#FFB800' },
        { name: 'Absent', value: 18, color: '#F44336' }
    ];

    const stats = [
        { label: 'Present', value: '59%', color: '#4CAF50' },
        { label: 'Late', value: '21%', color: '#2D6A6A' },
        { label: 'Permission', value: '2%', color: '#FFB800' },
        { label: 'Absent', value: '15', color: '#F44336' }
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
                    Attendance Overview
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
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>Today</Typography>
                </Box>
            </Box>

            {/* Chart Area */}
            <Box sx={{ height: 180, position: 'relative', mb: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center'
                }}>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500, display: 'block' }}>
                        Total Attendance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#1f1f1f' }}>
                        120
                    </Typography>
                </Box>
            </Box>

            {/* Breakdown */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                {stats.map((s, i) => (
                    <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.813rem' }}>
                                {s.label}
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#1f1f1f', fontWeight: 700, fontSize: '0.813rem' }}>
                            {s.value}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Footer */}
            <Box sx={{
                mt: 'auto',
                pt: 2.5,
                borderTop: '1px solid #F3F4F6',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500 }}>
                        Total Absentees
                    </Typography>
                    <AvatarGroup max={4} sx={{
                        '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 10, border: '2px solid #fff' }
                    }}>
                        <Avatar src="https://randomuser.me/api/portraits/men/1.jpg" />
                        <Avatar src="https://randomuser.me/api/portraits/women/2.jpg" />
                        <Avatar src="https://randomuser.me/api/portraits/men/3.jpg" />
                        <Avatar src="https://randomuser.me/api/portraits/women/4.jpg" />
                        <Avatar sx={{ bgcolor: '#4F46E5' }}>+1</Avatar>
                    </AvatarGroup>
                </Box>
                <Typography variant="caption" sx={{ color: '#FF9B44', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                    View Details
                </Typography>
            </Box>
        </Card>
    );
};

export default AttendanceOverviewChart;
