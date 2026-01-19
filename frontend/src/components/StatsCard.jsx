import { Paper, Box, Typography, Avatar } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

function StatsCard({ title, value, trend, trendValue, icon, color }) {
    const isPositive = trend === 'up';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                    {value}
                </Typography>
                {trendValue && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: isPositive ? 'success.main' : 'error.main',
                                bgcolor: isPositive ? 'success.lighter' : 'error.lighter',
                                px: 0.5,
                                borderRadius: 0.5,
                            }}
                        >
                            {isPositive ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                            <Typography variant="caption" fontWeight={600} sx={{ ml: 0.5 }}>
                                {trendValue}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            vs last month
                        </Typography>
                    </Box>
                )}
            </Box>
            <Avatar
                variant="rounded"
                sx={{
                    bgcolor: `${color}.lighter`, // Use lighter shade for background
                    color: `${color}.main`,
                    width: 56,
                    height: 56,
                    borderRadius: 3, // Softer square
                }}
            >
                {icon}
            </Avatar>
        </Paper>
    );
}

export default StatsCard;
