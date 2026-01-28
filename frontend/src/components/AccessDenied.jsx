import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Security as SecurityIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
    const navigate = useNavigate();

    return (
        <Container maxWidth="sm" sx={{
            height: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Paper elevation={0} sx={{
                p: 5,
                textAlign: 'center',
                borderRadius: 4,
                bgcolor: 'background.default',
                border: '1px dashed',
                borderColor: 'divider'
            }}>
                <Box sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'action.hover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3
                }}>
                    <SecurityIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                </Box>

                <Typography variant="h5" fontWeight={800} gutterBottom>
                    Access Restricted
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '400px', mx: 'auto' }}>
                    This section isn't available for your role. If you believe this is a mistake, please contact your administrator.
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => navigate('/dashboard')}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
                    >
                        Back to Dashboard
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AccessDenied;
