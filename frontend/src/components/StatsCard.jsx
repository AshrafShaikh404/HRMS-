import { Box, Typography, alpha, Paper } from '@mui/material';
import { NorthEast, SouthWest } from '@mui/icons-material';

const StatsCard = ({ title, value, icon, trend, color = 'primary', onViewAll, linkText = 'View All', subtitle }) => {
    const isPositive = trend?.startsWith('+') || trend === 'up';

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2.5, md: 3 },
                height: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: '#E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                bgcolor: '#fff',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                    boxShadow: '0 12px 24px rgba(0,0,0,0.06)',
                    transform: 'translateY(-4px)',
                    borderColor: (theme) => alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.2),
                }
            }}
        >
            <Box sx={{ mb: 2.5 }}>
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: (theme) => alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
                        color: (theme) => theme.palette[color]?.main || theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s ease',
                        '.MuiPaper-root:hover &': {
                            transform: 'scale(1.1)',
                        }
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                fontWeight={600}
                sx={{
                    mb: 1,
                    fontSize: '0.94rem',
                    letterSpacing: '0.01em'
                }}
            >
                {title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: subtitle ? 1 : 2 }}>
                <Typography
                    variant="h4"
                    fontWeight={800}
                    color="text.primary"
                    sx={{
                        letterSpacing: '-0.02em',
                        fontSize: { xs: '1.5rem', md: '1.75rem' }
                    }}
                >
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </Typography>

                {trend && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: isPositive ? '#55CE63' : '#f62d51',
                            bgcolor: alpha(isPositive ? '#55CE63' : '#f62d51', 0.1),
                            py: 0.5,
                            px: 1.25,
                            borderRadius: '6px',
                        }}
                    >
                        {isPositive ? <NorthEast sx={{ fontSize: '0.85rem' }} /> : <SouthWest sx={{ fontSize: '0.85rem' }} />}
                        <Typography variant="caption" fontWeight={800} sx={{ fontSize: '0.75rem' }}>
                            {trend.replace('+', '').replace('-', '')}
                        </Typography>
                    </Box>
                )}
            </Box>

            {subtitle && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2.5, display: 'block', fontWeight: 500, opacity: 0.8 }}>
                    {subtitle}
                </Typography>
            )}

            <Box sx={{ mt: 'auto', pt: 1.5 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            color: (theme) => theme.palette.primary.main,
                            textDecoration: 'underline'
                        }
                    }}
                    onClick={onViewAll}
                >
                    {linkText}
                </Typography>
            </Box>
        </Paper>
    );
};

export default StatsCard;
