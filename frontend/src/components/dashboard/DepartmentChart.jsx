import { Box, Paper, Typography, useTheme } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const DepartmentChart = ({ data }) => {
    const theme = useTheme();

    // Custom colors for different departments
    const COLORS = [
        theme.palette.primary.main,
        theme.palette.info.main,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.secondary.main,
        theme.palette.error.main,
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                    Department Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Employees by department
                </Typography>
            </Box>

            <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="_id" // The grouping key from mongo aggregation
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 8,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[2],
                            }}
                        />
                        <Legend
                            layout="horizontal"
                            verticalAlign="bottom"
                            align="center"
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span style={{ color: theme.palette.text.secondary, fontSize: '0.85rem', fontWeight: 500 }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default DepartmentChart;
