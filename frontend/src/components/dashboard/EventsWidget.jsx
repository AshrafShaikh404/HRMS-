import { Card, Typography, Box, Button, Avatar } from '@mui/material';
import { CalendarToday as CalendarIcon, Add as AddIcon, Work as WorkIcon } from '@mui/icons-material';

const EventsWidget = ({ events }) => {
    // If no events, show empty state (NO DUMMY DATA)
    const hasEvents = events && events.length > 0;

    return (
        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700}>
                    Recent Activities / Events
                </Typography>
                <Button
                    startIcon={<AddIcon />}
                    size="small"
                    variant="contained"
                    sx={{
                        bgcolor: '#DBEAFE',
                        color: '#2563EB',
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': { bgcolor: '#BFDBFE', boxShadow: 'none' }
                    }}
                >
                    Add
                </Button>
            </Box>

            {!hasEvents ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150 }}>
                    <Typography variant="body2" color="text.secondary">No upcoming events or activities.</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {events.map((event, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar variant="rounded" sx={{ bgcolor: '#F3F4F6', color: 'text.secondary', width: 40, height: 40 }}>
                                <WorkIcon fontSize="small" />
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {event.name || event.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {event.department || event.type}
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" display="block" fontWeight={600}>
                                    {event.addedAt ? new Date(event.addedAt).toLocaleDateString() : ''}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
        </Card>
    );
};

export default EventsWidget;
