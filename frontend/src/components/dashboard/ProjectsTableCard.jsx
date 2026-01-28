import {
    Box, Card, Typography, Avatar, AvatarGroup, Button,
    LinearProgress, Chip, IconButton
} from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    ChevronLeft as LeftIcon,
    ChevronRight as RightIcon,
    MoreHoriz as MoreIcon
} from '@mui/icons-material';

const ProjectsTableCard = () => {
    const projects = [
        { id: 'PRO-001', name: 'Office Management App', teamCount: 3, hours: '120/250 Hrs', progress: 48, deadline: '12/09/2024', priority: 'High' },
        { id: 'PRO-002', name: 'Clinic Management', teamCount: 5, hours: '240/300 Hrs', progress: 80, deadline: '24/10/2024', priority: 'Low' },
        { id: 'PRO-003', name: 'Educational Platform', teamCount: 3, hours: '80/120 Hrs', progress: 66, deadline: '18/02/2024', priority: 'Medium' },
        { id: 'PRO-004', name: 'Chat & Call Mobile App', teamCount: 5, hours: '40/150 Hrs', progress: 26, deadline: '17/10/2024', priority: 'Low' },
        { id: 'PRO-008', name: 'Chat & Call Mobile App', teamCount: 6, hours: '100/300 Hrs', progress: 33, deadline: '17/10/2024', priority: 'Medium' }
    ];

    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return '#EF4444';
            case 'Medium': return '#E91E63';
            case 'Low': return '#10B981';
            default: return '#6B7280';
        }
    };

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
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1.125rem' }}>
                    Projects
                </Typography>
                <Box sx={{
                    px: 1.5,
                    py: 0.75,
                    border: '1px solid #E5E7EB',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    cursor: 'pointer'
                }}>
                    <CalendarIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280' }}>September</Typography>
                </Box>
            </Box>

            {/* Table Area */}
            <Box sx={{ flex: 1, overflowX: 'auto' }}>
                <Box sx={{ minWidth: 600 }}>
                    {/* Table Header */}
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: '0.8fr 2fr 1.2fr 1.5fr 1fr 1fr',
                        bgcolor: '#F3F4F6',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        mb: 1
                    }}>
                        {['ID', 'Name', 'Team', 'Hours', 'Deadline', 'Priority'].map((h) => (
                            <Typography key={h} variant="caption" sx={{ fontWeight: 700, color: '#4B5563' }}>{h}</Typography>
                        ))}
                    </Box>

                    {/* Table Body */}
                    {projects.map((proj, i) => (
                        <Box key={i} sx={{
                            display: 'grid',
                            gridTemplateColumns: '0.8fr 2fr 1.2fr 1.5fr 1fr 1fr',
                            px: 2,
                            py: 2,
                            borderBottom: '1px solid #F3F4F6',
                            alignItems: 'center'
                        }}>
                            <Typography variant="body2" sx={{ color: '#9CA3AF', fontWeight: 500 }}>{proj.id}</Typography>
                            <Typography variant="body2" sx={{ color: '#1f1f1f', fontWeight: 700 }}>{proj.name}</Typography>

                            {/* Team */}
                            <AvatarGroup max={3} sx={{ justifyContent: 'flex-start', '& .MuiAvatar-root': { width: 28, height: 28, fontSize: 12, border: '2px solid #fff' } }}>
                                <Avatar src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`} />
                                <Avatar src={`https://randomuser.me/api/portraits/women/${i + 20}.jpg`} />
                                {proj.teamCount > 2 && <Avatar src={`https://randomuser.me/api/portraits/men/${i + 30}.jpg`} />}
                                {proj.teamCount > 3 && <Avatar sx={{ bgcolor: '#FF9B44' }}>+{proj.teamCount - 3}</Avatar>}
                            </AvatarGroup>

                            {/* Hours & Progress */}
                            <Box sx={{ pr: 2 }}>
                                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                    {proj.hours}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={proj.progress}
                                    sx={{
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: '#F3F4F6',
                                        '& .MuiLinearProgress-bar': { bgcolor: '#FF9B44', borderRadius: 3 }
                                    }}
                                />
                            </Box>

                            <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 500 }}>{proj.deadline}</Typography>

                            {/* Priority */}
                            <Chip
                                label={proj.priority}
                                size="small"
                                sx={{
                                    height: 24,
                                    bgcolor: getPriorityColor(proj.priority),
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.688rem',
                                    borderRadius: 1,
                                    width: 'fit-content',
                                    '& .MuiChip-label': { px: 1, '&::before': { content: '"●"', mr: 0.5, fontSize: 8 } }
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mt: 3 }}>
                <IconButton size="small" sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <LeftIcon fontSize="small" />
                </IconButton>
                {[1, 2, 3, 4].map((p) => (
                    <Box key={p} sx={{
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: p === 4 ? '#FF9B44' : 'transparent',
                        color: p === 4 ? '#fff' : '#6B7280',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        '&:hover': p !== 4 ? { bgcolor: '#F3F4F6' } : {}
                    }}>
                        {p}
                    </Box>
                ))}
                <Typography variant="body2" sx={{ color: '#D1D5DB' }}>...</Typography>
                <Box sx={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    cursor: 'pointer',
                    color: '#6B7280',
                    fontWeight: 700,
                    fontSize: '0.875rem'
                }}>
                    15
                </Box>
                <IconButton size="small" sx={{ border: '1px solid #E5E7EB', borderRadius: 2 }}>
                    <RightIcon fontSize="small" />
                </IconButton>
            </Box>
        </Card>
    );
};

export default ProjectsTableCard;
