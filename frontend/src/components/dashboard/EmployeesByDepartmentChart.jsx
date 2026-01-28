import { Box, Card, Typography } from '@mui/material';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';

const EmployeesByDepartmentChart = () => {
    const departments = [
        { name: 'UI/UX', percentage: 45, count: 54 },
        { name: 'Development', percentage: 95, count: 114 },
        { name: 'Management', percentage: 60, count: 72 },
        { name: 'HR', percentage: 25, count: 30 },
        { name: 'Testing', percentage: 55, count: 66 },
        { name: 'Marketing', percentage: 85, count: 102 }
    ];

    return (
        <Card sx={{
            p: 3,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            height: '100%'
        }}>
            {/* Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1.125rem' }}>
                    Employees By Department
                </Typography>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.75,
                    border: '1px solid #E5E7EB',
                    borderRadius: 2,
                    bgcolor: '#F9FAFB',
                    cursor: 'pointer'
                }}>
                    <CalendarIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280', fontSize: '0.813rem' }}>
                        This Week
                    </Typography>
                </Box>
            </Box>

            {/* Progress Bars */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {departments.map((dept) => (
                    <Box key={dept.name}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f1f1f' }}>
                                {dept.name}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#6B7280' }}>
                                {dept.count}
                            </Typography>
                        </Box>
                        <Box sx={{
                            height: 8,
                            bgcolor: '#F3F4F6',
                            borderRadius: 4,
                            overflow: 'hidden'
                        }}>
                            <Box sx={{
                                width: `${dept.percentage}%`,
                                height: '100%',
                                bgcolor: '#FF9B44',
                                borderRadius: 4,
                                transition: 'width 0.6s ease'
                            }} />
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Footer */}
            <Box sx={{
                mt: 3,
                pt: 2.5,
                borderTop: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                gap: 1
            }}>
                <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: '#4CAF50'
                }} />
                <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 500, fontSize: '0.813rem' }}>
                    No of Employees increased by{' '}
                    <Box component="span" sx={{ color: '#4CAF50', fontWeight: 700 }}>
                        +20%
                    </Box>
                    {' '}from last Week
                </Typography>
            </Box>
        </Card>
    );
};

export default EmployeesByDepartmentChart;
