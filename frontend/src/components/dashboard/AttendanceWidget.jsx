import { Box, Typography, Card } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AttendanceWidget = ({ data }) => {
    // If no data, show empty state (NO DUMMY DATA)
    if (!data) {
        return (
            <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">No Attendance Data Available</Typography>
            </Card>
        );
    }

    const chartData = [
        { name: 'Present', value: data.present || 0, color: '#2563EB' },
        { name: 'Absent', value: data.absent || 0, color: '#EF4444' }, // Red for absent
        { name: 'On Leave', value: data.onLeave || 0, color: '#CBD5E1' } // Gray for leave
    ];

    const totalEmployees = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomLegend = ({ payload }) => {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {payload.map((entry, index) => (
                    <Box key={`legend-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: entry.color }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            {entry.value}
                        </Typography>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
                Today Attendance
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', height: 200 }}>
                <Box sx={{ flex: 1, height: '100%', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </Box>
                <CustomLegend payload={chartData.map(d => ({ value: d.name, color: d.color }))} />
            </Box>
            <Typography variant="subtitle1" fontWeight={700} align="center" sx={{ mt: -2 }}>
                {totalEmployees} Employees
            </Typography>
        </Card>
    );
};

export default AttendanceWidget;
