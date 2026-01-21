import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Paper, Typography, Box } from '@mui/material';

const AttendanceInsights = ({ summary }) => {
    if (!summary) return null;

    const data = [
        { name: 'Present', value: summary.presentDays || 0, color: '#2e7d32' },
        { name: 'Absent', value: summary.absentDays || 0, color: '#d32f2f' },
        { name: 'Leave', value: summary.leaveDays || 0, color: '#0288d1' },
        { name: 'Half Day', value: summary.halfDays || 0, color: '#ed6c02' },
    ].filter(item => item.value > 0);

    // If no data, show a placeholder gracefully or empty
    // But for layout consistency, better to show empty state or just return null if really no data?
    // Let's return null if absolutely no data to avoid empty box
    if (data.length === 0) {
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 3,
                    height: '100%',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Typography color="text.secondary">No attendance data available for distribution</Typography>
            </Paper>
        )
    }

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ mb: 3 }}>
                Attendance Distribution
            </Typography>
            <Box sx={{ flex: 1, minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                padding: '12px'
                            }}
                            itemStyle={{ fontWeight: 600, fontSize: '0.875rem' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value) => <span style={{ color: '#666', fontWeight: 500, marginLeft: 6 }}>{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default AttendanceInsights;
