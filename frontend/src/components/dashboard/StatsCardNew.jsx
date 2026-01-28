import { Box, Card, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

const StatsCardNew = ({ title, value, icon: Icon, color, trend, trendDirection, linkText }) => {
    const isPositive = trendDirection === 'up';

    return (
        <Card sx={{
            p: 1.5,
            borderRadius: 2.5,
            border: '1px solid #E5E7EB',
            boxShadow: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            bgcolor: '#fff',
            transition: 'all 0.2s ease',
            '&:hover': {
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transform: 'translateY(-1px)'
            }
        }}>
            {/* Icon */}
            <Box sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
            }}>
                <Icon sx={{ fontSize: 18, color: '#fff' }} />
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {/* Title */}
                <Typography variant="body2" sx={{
                    color: '#6B7280',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    mb: 1,
                    lineHeight: 1.2
                }}>
                    {title}
                </Typography>

                {/* Value and Trend on same line */}
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8, mb: 0.5 }}>
                    <Typography variant="h5" sx={{
                        fontWeight: 700,
                        color: '#1f1f1f',
                        fontSize: '1.25rem',
                        lineHeight: 1
                    }}>
                        {value}
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.2,
                        color: isPositive ? '#4CAF50' : '#F44336'
                    }}>
                        {isPositive ? <TrendingUp sx={{ fontSize: 12 }} /> : <TrendingDown sx={{ fontSize: 12 }} />}
                        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.688rem' }}>
                            {trend}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Link */}
            <Typography
                variant="caption"
                sx={{
                    color: '#FF9B44',
                    fontWeight: 600,
                    fontSize: '0.688rem',
                    cursor: 'pointer',
                    '&:hover': {
                        textDecoration: 'underline'
                    }
                }}
            >
                {linkText}
            </Typography>
        </Card>
    );
};

export default StatsCardNew;
