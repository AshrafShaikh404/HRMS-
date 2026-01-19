import { Box, Typography, Card } from '@mui/material';

const WelcomeBanner = ({ user }) => {
    return (
        <Card
            elevation={0}
            sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                background: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)', // Fallback gradient
                backgroundImage: 'url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2670&auto=format&fit=crop")', // Mountain landscape, consider moving to local asset if possible to avoid external dependency issues
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}
        >
            {/* Overlay for better text readability */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(90deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.1) 100%)',
                    zIndex: 1
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                    Good Morning{user?.name ? `, ${user.name}` : ''}
                </Typography>
                <Typography variant="h6" sx={{ maxWidth: 600, fontWeight: 400, opacity: 0.9, fontStyle: 'italic', mb: 1 }}>
                    "An employee's experience is the sum of all interactions they have with the organization."
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, letterSpacing: 1 }}>
                    - MATT MULLENWEG
                </Typography>
            </Box>
        </Card>
    );
};

export default WelcomeBanner;
