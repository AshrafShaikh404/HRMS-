import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Box, Card, Typography, Button, Grid, useTheme, Chip, IconButton } from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { calendarAPI } from '../utils/calendarApi';
import EventModal from '../components/Calendar/EventModal';

const Calendar = ({ user }) => {
    const theme = useTheme();
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filters, setFilters] = useState({
        type: 'ALL',
        view: 'dayGridMonth'
    });

    useEffect(() => {
        fetchEvents();
    }, [filters.type]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await calendarAPI.getAll({ type: filters.type === 'ALL' ? null : filters.type });

            // Transform events for FullCalendar
            const formattedEvents = response.data.data.map(event => ({
                id: event._id,
                title: event.title,
                start: event.start,
                end: event.end,
                allDay: event.allDay,
                backgroundColor: getEventColor(event.eventType),
                borderColor: getEventColor(event.eventType),
                extendedProps: { ...event }
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'HOLIDAY': return theme.palette.secondary.main;
            case 'LEAVE': return theme.palette.error.main;
            case 'MEETING': return theme.palette.primary.main;
            case 'INTERVIEW': return theme.palette.info.main;
            case 'TRAINING': return theme.palette.warning.main;
            default: return theme.palette.grey[500];
        }
    };

    const handleDateClick = (arg) => {
        setSelectedEvent({ start: arg.date, end: arg.date });
        setModalOpen(true);
    };

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
        setModalOpen(true);
    };

    const handleViewChange = (view) => {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.changeView(view);
        setFilters(prev => ({ ...prev, view }));
    };

    return (
    return (
        <Box sx={{ height: 'calc(100vh - 100px)' }}>
            {/* Page Header */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        Calendar
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage your schedule, leaves, and company events.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchEvents}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 2 }}
                    >
                        Sync
                    </Button>
                    {['admin', 'hr'].includes(user.role) && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => { setSelectedEvent(null); setModalOpen(true); }}
                            color="secondary" // Using Coral/Orange from theme if available, otherwise secondary
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 2,
                                fontWeight: 700,
                                boxShadow: theme.shadows[4]
                            }}
                        >
                            Create Event
                        </Button>
                    )}
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ height: 'calc(100% - 80px)' }}>
                {/* Sidebar Filters */}
                <Grid item xs={12} md={2.5} lg={2} sx={{ height: '100%' }}>
                    <Card sx={{
                        p: 0,
                        height: '100%',
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        overflow: 'hidden'
                    }}>
                        <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle1" fontWeight={700}>Filters</Typography>
                        </Box>

                        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {['ALL', 'HOLIDAY', 'LEAVE', 'MEETING', 'INTERVIEW'].map(type => (
                                <Box
                                    key={type}
                                    onClick={() => setFilters(prev => ({ ...prev, type }))}
                                    sx={{
                                        px: 2,
                                        py: 1.25,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        bgcolor: filters.type === type ? getEventColor(type) : 'transparent',
                                        color: filters.type === type ? '#fff' : 'text.secondary',
                                        border: filters.type === type ? 'none' : '1px solid',
                                        borderColor: filters.type === type ? 'none' : 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: filters.type === type ? getEventColor(type) : 'action.hover',
                                            borderColor: filters.type === type ? 'none' : 'text.primary'
                                        }
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={filters.type === type ? 600 : 500} sx={{ textTransform: 'capitalize' }}>
                                        {type.toLowerCase()}
                                    </Typography>
                                    {filters.type !== type && (
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getEventColor(type) }} />
                                    )}
                                </Box>
                            ))}
                        </Box>
                    </Card>
                </Grid>

                {/* Main Calendar View */}
                <Grid item xs={12} md={9.5} lg={10} sx={{ height: '100%' }}>
                    <Card sx={{ p: 1, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                            }}
                            buttonText={{
                                today: 'Today',
                                month: 'Month',
                                week: 'Week',
                                day: 'Day',
                                list: 'List'
                            }}
                            editable={user.role === 'admin'}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            events={events}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            height="100%"
                            eventClassNames="custom-fc-event"
                        />
                    </Card>
                </Grid>
            </Grid>

            {/* Event Modal */}
            <EventModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                event={selectedEvent}
                onEventSaved={() => {
                    fetchEvents();
                    setModalOpen(false);
                }}
            />
        </Box>
    );
};

export default Calendar;
