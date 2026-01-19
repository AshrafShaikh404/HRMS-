import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Box, Typography } from '@mui/material';

const DepartmentChart = ({ data }) => {
    // Expected data: [{ _id: 'Engineering', count: 10 }, ...]

    const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8F9FA', borderRadius: 3 }}>
                <Typography color="text.secondary">No department data</Typography>
            </Box>
        );
    }

    const chartData = data.map((item, index) => ({
        name: item._id,
        value: item.count
    }));

    return (
        <Box sx={{ width: '100%', height: 380 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Department Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ paddingTop: '20px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default DepartmentChart;
