import { Paper, Box, Typography, Avatar, alpha } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

function StatsCard({ title, value, trend, trendValue, icon, color, subtitle, sx = {} }) {
    const isPositive = trend === 'up';

    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(0,0,0,0.4)'
                    : '0 4px 20px rgba(0,0,0,0.02)',
                transition: 'all 0.3s ease',
                '&:hover': {
                    boxShadow: (theme) => theme.palette.mode === 'dark'
                        ? '0 8px 25px rgba(0,0,0,0.6)'
                        : '0 8px 25px rgba(0,0,0,0.05)',
                    transform: 'translateY(-2px)'
                },
                ...sx
            }}
        >
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 1, display: 'block', mb: 0.5 }}>
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 0.5, letterSpacing: -1, color: 'text.primary' }}>
                    {value}
                </Typography>

                {subtitle && (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {subtitle}
                    </Typography>
                )}

                {trendValue && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                color: isPositive ? 'success.main' : 'error.main',
                                bgcolor: (theme) => alpha(isPositive ? theme.palette.success.main : theme.palette.error.main, 0.1),
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                            }}
                        >
                            {isPositive ? <TrendingUp sx={{ fontSize: 14 }} /> : <TrendingDown sx={{ fontSize: 14 }} />}
                            <Typography variant="caption" fontWeight={800} sx={{ ml: 0.5 }}>
                                {trendValue}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>
            <Avatar
                variant="rounded"
                sx={{
                    bgcolor: (theme) => alpha(theme.palette[color].main, 0.1),
                    color: `${color}.main`,
                    width: 52,
                    height: 52,
                    borderRadius: 3.5,
                    border: '1px solid',
                    borderColor: (theme) => alpha(theme.palette[color].main, 0.2),
                    opacity: 0.9
                }}
            >
                {icon}
            </Avatar>
        </Paper>
    );
}

export default StatsCard;
