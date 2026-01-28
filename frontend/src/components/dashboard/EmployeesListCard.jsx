import { Box, Card, Typography, Avatar, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip } from '@mui/material';

const EmployeesListCard = () => {
    const employees = [
        {
            id: 1,
            name: 'Anthony Lewis',
            role: 'Marketing Head',
            dept: 'Finance',
            avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
            deptColor: '#2D6A6A'
        },
        {
            id: 2,
            name: 'Brian Villalobos',
            role: 'PHP Developer',
            dept: 'Development',
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            deptColor: '#F44336'
        },
        {
            id: 3,
            name: 'Stephan Peralt',
            role: 'Executive',
            dept: 'Marketing',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            deptColor: '#3B82F6'
        },
        {
            id: 4,
            name: 'Doglas Martini',
            role: 'Project Manager',
            dept: 'Manager',
            avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
            deptColor: '#9C27B0'
        },
        {
            id: 5,
            name: 'Connie Waters',
            role: 'UI/UX Designer',
            dept: 'UI/UX Design',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            deptColor: '#E91E63'
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
                    Employees
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

            {/* Table Area */}
            <Box sx={{ flex: 1 }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    bgcolor: '#F3F4F6',
                    px: 2,
                    py: 1,
                    borderRadius: 1.5,
                    mb: 2
                }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1f1f1f' }}>Name</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1f1f1f' }}>Department</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {employees.map((employee) => (
                        <Box key={employee.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Avatar src={employee.avatar} sx={{ width: 36, height: 36 }} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.813rem' }}>
                                        {employee.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#9CA3AF', fontWeight: 500 }}>
                                        {employee.role}
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                label={employee.dept}
                                size="small"
                                sx={{
                                    height: 24,
                                    bgcolor: `${employee.deptColor}10`, // Very soft glow background
                                    color: employee.deptColor,
                                    fontWeight: 700,
                                    fontSize: '0.625rem',
                                    borderRadius: 1.5,
                                    border: `1px solid ${employee.deptColor}20`,
                                    '& .MuiChip-label': { px: 1 }
                                }}
                            />
                        </Box>
                    ))}
                </Box>
            </Box>
        </Card>
    );
};

export default EmployeesListCard;
