import { Card, Box, Typography, List, ListItem, Avatar, ListItemText, Chip, Button } from '@mui/material';
import { AccessTime, MoreHoriz } from '@mui/icons-material';

const ScheduleWidget = ({ title = "My Schedule", activities = [] }) => {
    // Activities format: [{ title: 'Design Meeting', time: '10:00 AM', type: 'meeting', date: 'Today' }]

    return (
        <Card elevation={0} sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>{title}</Typography>
                <Button size="small" sx={{ minWidth: 0, p: 0.5, color: 'text.secondary' }}>
                    <MoreHoriz />
                </Button>
            </Box>

            <List sx={{ p: 0 }}>
                {activities.length > 0 ? activities.map((item, index) => (
                    <ListItem key={index} divider={index < activities.length - 1} sx={{ p: 2.5 }}>
                        <Box sx={{
                            mr: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 50,
                            height: 50,
                            borderRadius: 2,
                            bgcolor: 'primary.lighter',
                            color: 'primary.main'
                        }}>
                            <Typography variant="caption" fontWeight={700}>{item.date?.split(' ')[0] || '16'}</Typography>
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: '10px' }}>{item.date?.split(' ')[1] || 'Jan'}</Typography>
                        </Box>

                        <ListItemText
                            primary={
                                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                                    {item.title}
                                </Typography>
                            }
                            secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <AccessTime sx={{ fontSize: 14 }} />
                                    <Typography variant="caption">{item.time || 'All Day'}</Typography>
                                </Box>
                            }
                        />
                        <Chip
                            label={item.type || 'Event'}
                            size="small"
                            sx={{
                                bgcolor: item.type === 'Meeting' ? 'warning.lighter' : 'success.lighter',
                                color: item.type === 'Meeting' ? 'warning.main' : 'success.main',
                                fontWeight: 600,
                                borderRadius: 1
                            }}
                        />
                    </ListItem>
                )) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No scheduled activities</Typography>
                    </Box>
                )}
            </List>

            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
                <Button fullWidth color="primary" sx={{ borderRadius: 2 }}>
                    View All Schedule
                </Button>
            </Box>
        </Card>
    );
};

export default ScheduleWidget;
