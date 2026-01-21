import { Box, Paper, Typography, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCard = ({ title, value, icon, trend, color = 'primary' }) => {
    const isPositive = trend?.startsWith('+');

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 12px 24px -4px rgba(0, 0, 0, 0.08)',
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
                        color: (theme) => theme.palette[color].main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {icon}
                </Box>
                {trend && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: isPositive ? 'success.lighter' : 'error.lighter',
                            color: isPositive ? 'success.main' : 'error.main',
                            py: 0.5,
                            px: 1,
                            borderRadius: 10,
                        }}
                    >
                        {isPositive ? <TrendingUp sx={{ fontSize: 16 }} /> : <TrendingDown sx={{ fontSize: 16 }} />}
                        <Typography variant="caption" fontWeight={700}>
                            {trend}
                        </Typography>
                    </Box>
                )}
            </Box>

            <Box>
                <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                    {value}
                </Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    {title}
                </Typography>
            </Box>
        </Paper>
    );
};

export default StatsCard;
