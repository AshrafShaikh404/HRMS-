import { Card, Box, Typography, Divider, alpha, useTheme } from '@mui/material';
import { TrendingUp, Warning, CheckCircle } from '@mui/icons-material';

const StatsSummaryWidget = ({ stats = [] }) => {
    const theme = useTheme();

    const getIcon = (title) => {
        if (title.toLowerCase().includes('attendance')) return <CheckCircle />;
        if (title.toLowerCase().includes('absen')) return <Warning />;
        return <TrendingUp />;
    };

    const getColor = (color) => {
        switch (color) {
            case 'success': return theme.palette.success.main;
            case 'error': return theme.palette.error.main;
            case 'warning': return theme.palette.warning.main;
            default: return theme.palette.primary.main;
        }
    };

    return (
        <Card sx={{ height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', p: 0 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                <Typography variant="h6" fontWeight={700}>Overview</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {stats.map((stat, index) => (
                    <Box key={index} sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        borderBottom: index !== stats.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        transition: '0.2s',
                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.5) }
                    }}>
                        <Box sx={{
                            p: 1.5,
                            borderRadius: 3,
                            bgcolor: alpha(getColor(stat.color), 0.1),
                            color: getColor(stat.color),
                            display: 'flex'
                        }}>
                            {stat.icon || getIcon(stat.title)}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                {stat.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                <Typography variant="h6" fontWeight={800}>
                                    {stat.value}
                                </Typography>
                                {stat.subtitle && (
                                    <Typography variant="caption" color="text.disabled" fontWeight={500}>
                                        {stat.subtitle.replace(' days present', '').replace('This month', '')}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                ))}
            </Box>
        </Card>
    );
};

export default StatsSummaryWidget;
