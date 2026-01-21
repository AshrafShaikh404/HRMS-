import { Card, CardContent, Typography, Box, Button, alpha, useTheme, Divider } from '@mui/material';
import { BeachAccess as LeaveIcon, LocalHospital as SickIcon, Event as EarnedIcon, Add as AddIcon } from '@mui/icons-material';

const LeaveBalanceCard = ({ type, total, used, remaining, onApply }) => {
    const theme = useTheme();

    const getIcon = () => {
        switch (type.toLowerCase()) {
            case 'casual': return <LeaveIcon sx={{ fontSize: 24 }} />;
            case 'sick': return <SickIcon sx={{ fontSize: 24 }} />;
            case 'earned': return <EarnedIcon sx={{ fontSize: 24 }} />;
            default: return <LeaveIcon sx={{ fontSize: 24 }} />;
        }
    };

    const getColor = () => {
        switch (type.toLowerCase()) {
            case 'casual': return theme.palette.primary;
            case 'sick': return theme.palette.error;
            case 'earned': return theme.palette.success;
            default: return theme.palette.primary;
        }
    };

    const colorScheme = getColor();

    return (
        <Card sx={{
            height: '100%',
            borderRadius: 6,
            boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 30px rgba(0,0,0,0.03)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: (theme) => `0 15px 35px ${alpha(colorScheme.main, theme.palette.mode === 'dark' ? 0.2 : 0.1)}`,
                borderColor: alpha(colorScheme.main, 0.3)
            }
        }}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: 3,
                        background: `linear-gradient(135deg, ${alpha(colorScheme.main, 0.12)} 0%, ${alpha(colorScheme.main, 0.05)} 100%)`,
                        color: colorScheme.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid',
                        borderColor: alpha(colorScheme.main, 0.1)
                    }}>
                        {getIcon()}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                            Remaining
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color={colorScheme.main} sx={{ letterSpacing: -0.5 }}>
                            {remaining}
                        </Typography>
                    </Box>
                </Box>

                <Typography variant="subtitle1" fontWeight={800} sx={{ textTransform: 'capitalize', mb: 2, letterSpacing: -0.2, color: 'text.primary' }}>
                    {type} Leave
                </Typography>

                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: (theme) => alpha(theme.palette.text.primary, 0.03),
                    mb: 2.5,
                    border: '1px solid',
                    borderColor: 'divider'
                }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.25, fontSize: '0.65rem' }}>TOTAL</Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="text.primary">{total}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ opacity: 0.6 }} />
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" sx={{ mb: 0.25, fontSize: '0.65rem' }}>USED</Typography>
                        <Typography variant="subtitle2" fontWeight={800} color="text.primary">{used}</Typography>
                    </Box>
                </Box>

                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    color={type.toLowerCase() === 'sick' ? 'error' : (type.toLowerCase() === 'earned' ? 'success' : 'primary')}
                    startIcon={<AddIcon />}
                    onClick={onApply}
                    sx={{
                        borderRadius: 2.5,
                        py: 0.8,
                        textTransform: 'none',
                        fontWeight: 700,
                        borderWidth: 1.5,
                        fontSize: '0.85rem',
                        '&:hover': {
                            borderWidth: 1.5,
                            bgcolor: alpha(colorScheme.main, 0.1)
                        }
                    }}
                >
                    Apply Now
                </Button>
            </CardContent>
        </Card>
    );
};

export default LeaveBalanceCard;
