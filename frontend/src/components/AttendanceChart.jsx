import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

const AttendanceChart = ({ data, title = "Attendance Overview" }) => {
    // If no data provided or empty, show placeholder
    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f7fa', borderRadius: 2 }}>
                <Typography color="text.secondary">No attendance data available</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: 350 }}>
            <Typography variant="h6" gutterBottom color="text.primary" fontWeight={600}>
                {title}
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                    barSize={40}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6b7280' }}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="right"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                    <Bar dataKey="Leave" fill="#f59e0b" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default AttendanceChart;
