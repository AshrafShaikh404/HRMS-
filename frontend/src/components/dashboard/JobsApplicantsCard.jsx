import { Box, Card, Typography, Avatar, Button, Chip } from '@mui/material';

const JobsApplicantsCard = () => {
    const applicants = [
        {
            id: 1,
            name: 'Brian Villalobos',
            role: 'UI/UX Designer',
            exp: '5+ Years',
            location: 'USA',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            roleColor: '#2D6A6A'
        },
        {
            id: 2,
            name: 'Anthony Lewis',
            role: 'Python Developer',
            exp: '5+ Years',
            location: 'USA',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            roleColor: '#3B82F6'
        },
        {
            id: 3,
            name: 'Stephan Peralt',
            role: 'Android Developer',
            exp: '5+ Years',
            location: 'USA',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            roleColor: '#E91E63'
        },
        {
            id: 4,
            name: 'Doglas Martini',
            role: 'React Developer',
            exp: '5+ Years',
            location: 'USA',
            avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
            roleColor: '#9C27B0'
        }
    ];

    return (
        <Card sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1rem' }}>
                    Jobs Applicants
                </Typography>
                <Button
                    variant="text"
                    sx={{
                        color: '#6B7280',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        bgcolor: '#F9FAFB',
                        px: 1,
                        '&:hover': { bgcolor: '#F3F4F6' }
                    }}
                >
                    View All
                </Button>
            </Box>

            {/* Tab Switcher */}
            <Box sx={{
                display: 'flex',
                bgcolor: '#F3F4F6',
                borderRadius: 2,
                p: 0.5,
                mb: 3
            }}>
                <Box sx={{
                    flex: 1,
                    py: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    color: '#6B7280',
                    fontWeight: 600,
                    fontSize: '0.813rem'
                }}>
                    Openings
                </Box>
                <Box sx={{
                    flex: 1,
                    py: 1,
                    textAlign: 'center',
                    cursor: 'pointer',
                    borderRadius: 1.5,
                    bgcolor: '#FF9B44',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.813rem',
                    boxShadow: '0 2px 4px rgba(255, 155, 68, 0.2)'
                }}>
                    Applicants
                </Box>
            </Box>

            {/* Applicants List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {applicants.map((applicant) => (
                    <Box key={applicant.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar src={applicant.avatar} sx={{ width: 40, height: 40 }} />
                            <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '0.875rem' }}>
                                    {applicant.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    Exp : {applicant.exp} <Box component="span" sx={{ color: '#FF9B44' }}>•</Box> {applicant.location}
                                </Typography>
                            </Box>
                        </Box>
                        <Chip
                            label={applicant.role}
                            size="small"
                            sx={{
                                height: 24,
                                bgcolor: `${applicant.roleColor}15`, // Soft background
                                color: applicant.roleColor,
                                fontWeight: 700,
                                fontSize: '0.625rem',
                                borderRadius: 1.5,
                                border: `1px solid ${applicant.roleColor}30`
                            }}
                        />
                    </Box>
                ))}
            </Box>
        </Card>
    );
};

export default JobsApplicantsCard;
