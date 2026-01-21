import { Box, Paper, Typography, useTheme } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AttendanceChart = ({ data }) => {
    const theme = useTheme();

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
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                    Attendance Overview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Weekly attendance trends
                </Typography>
            </Box>

            <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                            dy={10}
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: theme.palette.background.paper,
                                borderRadius: 12,
                                border: `1px solid ${theme.palette.divider}`,
                                boxShadow: theme.shadows[3],
                            }}
                            cursor={{ stroke: theme.palette.divider, strokeWidth: 1 }}
                        />
                        <Area
                            type="monotone"
                            dataKey="count"
                            name="Present"
                            stroke={theme.palette.primary.main}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorPresent)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
};

export default AttendanceChart;
