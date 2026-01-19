import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Box, Typography } from '@mui/material';

const AttendanceDonut = ({ data, title = "Attendance" }) => {
    // Data expected format: [{ name: 'Present', value: 30 }, { name: 'Absent', value: 5 }, ...]

    // SmartHR Colors
    const COLORS = ['#10B981', '#EF4444', '#F59E0B']; // Success, Error, Warning

    if (!data || data.length === 0) {
        return (
            <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8F9FA', borderRadius: 3 }}>
                <Typography color="text.secondary">No data</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', height: 380, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                {title}
            </Typography>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend
                            verticalAlign="bottom"
                            align="center"
                            iconType="circle"
                            iconSize={8}
                            wrapperStyle={{ paddingTop: '20px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text (Optional) */}
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', textAlign: 'center'
                }}>
                    <Typography variant="h4" fontWeight={800}>
                        {data[0]?.value || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Present
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default AttendanceDonut;
