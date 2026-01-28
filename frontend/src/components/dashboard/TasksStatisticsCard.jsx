import { Box, Card, Typography, Button } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TasksStatisticsCard = () => {
    const data = [
        { name: 'Ongoing', value: 24, color: '#FFB800' },
        { name: 'On Hold', value: 10, color: '#3B82F6' },
        { name: 'Overdue', value: 16, color: '#EF4444' },
        { name: 'Completed', value: 40, color: '#10B981' }
    ];

    const legend = [
        { label: 'Ongoing', percentage: '24%', color: '#FFB800' },
        { label: 'On Hold', percentage: '10%', color: '#3B82F6' },
        { label: 'Overdue', percentage: '16%', color: '#EF4444' },
        { label: 'Completed', percentage: '40%', color: '#10B981' }
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1rem' }}>
                    Tasks Statistics
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
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={2}
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
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 600, display: 'block' }}>
                        Total Tasks
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f1f1f' }}>
                        124/165
                    </Typography>
                </Box>
            </Box>

            {/* Legend Grid */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 2,
                mb: 3,
                mt: 1
            }}>
                {legend.map((item, i) => (
                    <Box key={i}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
                            <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600 }}>
                                {item.label}
                            </Typography>
                        </Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1f1f1f', ml: 2 }}>
                            {item.percentage}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Summary Footer */}
            <Box sx={{
                mt: 'auto',
                p: 1.5,
                bgcolor: '#111827',
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="body2" sx={{ color: '#10B981', fontWeight: 700 }}>
                        389/689 hrs
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                        Spent on Overall Tasks This Week
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        bgcolor: '#fff',
                        color: '#1f1f1f',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        px: 2,
                        '&:hover': { bgcolor: '#F3F4F6' }
                    }}
                >
                    View All
                </Button>
            </Box>
        </Card>
    );
};

export default TasksStatisticsCard;
