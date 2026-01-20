import { Card, CardContent, Typography, Box, Button, alpha, useTheme } from '@mui/material';
import { BeachAccess as LeaveIcon, LocalHospital as SickIcon, Event as EarnedIcon, Add as AddIcon } from '@mui/icons-material';

const LeaveBalanceCard = ({ type, total, used, remaining, onApply }) => {
    const theme = useTheme();

    const getIcon = () => {
        switch (type.toLowerCase()) {
            case 'casual': return <LeaveIcon sx={{ fontSize: 32 }} />;
            case 'sick': return <SickIcon sx={{ fontSize: 32 }} />;
            case 'earned': return <EarnedIcon sx={{ fontSize: 32 }} />;
            default: return <LeaveIcon sx={{ fontSize: 32 }} />;
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
            borderRadius: 4,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-4px)'
            }
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: alpha(colorScheme.main, 0.1),
                        color: colorScheme.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {getIcon()}
                    </Box>
                    <Button
                        size="small"
                        variant="outlined"
                        color={type.toLowerCase() === 'sick' ? 'error' : (type.toLowerCase() === 'earned' ? 'success' : 'primary')}
                        startIcon={<AddIcon />}
                        onClick={onApply}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Apply
                    </Button>
                </Box>

                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ textTransform: 'capitalize' }}>
                    {type} Leave
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, mb: 2 }}>
                    <Typography variant="h4" fontWeight={800} color={colorScheme.main}>
                        {remaining}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Days Left
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Total</Typography>
                        <Typography variant="body2" fontWeight={600}>{total}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">Used</Typography>
                        <Typography variant="body2" fontWeight={600}>{used}</Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default LeaveBalanceCard;
