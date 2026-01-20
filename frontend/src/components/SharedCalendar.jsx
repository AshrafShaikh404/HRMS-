import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Box, Card, Typography, Button, useTheme, IconButton, Drawer, useMediaQuery } from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { calendarAPI } from '../utils/calendarApi';
import EventModal from './Calendar/EventModal';

const SharedCalendar = ({ user, height = 'calc(100vh - 100px)', embedded = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const calendarRef = useRef(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
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
            case 'PRESENT': return theme.palette.success.main;
            default: return theme.palette.grey[500];
        }
    };

    const handleDateClick = (arg) => {
        if (!['admin', 'hr'].includes(user.role)) return;
        setSelectedEvent({ start: arg.date, end: arg.date });
        setModalOpen(true);
    };

    const handleEventClick = (info) => {
        setSelectedEvent(info.event.extendedProps);
        setModalOpen(true);
    };

    const renderFilters = () => (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={800} gutterBottom>Filters</Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Box
                    onClick={() => setFilters(prev => ({ ...prev, type: 'ALL' }))}
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: filters.type === 'ALL' ? '#F3F4F6' : 'transparent',
                        transition: 'all 0.2s',
                        border: '1px solid',
                        borderColor: filters.type === 'ALL' ? 'transparent' : '#E5E7EB'
                    }}
                >
                    <Typography variant="body2" fontWeight={600} color="text.primary">All</Typography>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#9CA3AF' }} />
                </Box>

                {['HOLIDAY', 'LEAVE', 'MEETING', 'INTERVIEW'].map(type => (
                    <Box
                        key={type}
                        onClick={() => setFilters(prev => ({ ...prev, type }))}
                        sx={{
                            p: 1.5,
                            borderRadius: 8, // Pill shape
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            bgcolor: filters.type === type ? getEventColor(type) : 'transparent',
                            color: filters.type === type ? '#fff' : 'text.secondary',
                            border: filters.type === type ? 'none' : '1px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: filters.type === type ? getEventColor(type) : 'action.hover',
                            }
                        }}
                    >
                        <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {type.toLowerCase()}
                        </Typography>
                        {filters.type !== type && (
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getEventColor(type) }} />
                        )}
                    </Box>
                ))}
            </Box>
        </Box>
    );

    return (
        <Box sx={{ height: isMobile ? 'auto' : height, display: 'flex', flexDirection: 'column' }}>
            {/* Header - Only showing if not embedded or configured to show */}
            <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant={embedded ? "h6" : "h5"} fontWeight={700} gutterBottom>
                        {embedded ? "Calendar Overview" : "Calendar"}
                    </Typography>
                    {!embedded && (
                        <Typography variant="body2" color="text.secondary">
                            Manage your schedule, leaves, and company events.
                        </Typography>
                    )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', sm: 'auto' } }}>
                    {/* Mobile Filter Button */}
                    <Button
                        variant="outlined"
                        startIcon={<FilterIcon />}
                        onClick={() => setMobileFiltersOpen(true)}
                        sx={{ borderRadius: 2, textTransform: 'none', display: { xs: 'flex', md: 'none' }, flex: { xs: 1, sm: 'none' } }}
                    >
                        Filters
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchEvents}
                        sx={{ borderRadius: 2, textTransform: 'none', px: 2, flex: { xs: 1, sm: 'none' } }}
                    >
                        Sync
                    </Button>

                    {['admin', 'hr'].includes(user.role) && (
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => { setSelectedEvent(null); setModalOpen(true); }}
                            color="secondary"
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                px: 2,
                                fontWeight: 700,
                                boxShadow: theme.shadows[4],
                                flex: { xs: 1, sm: 'none' }
                            }}
                        >
                            Event
                        </Button>
                    )}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flex: 1, minHeight: 0 }}>
                {/* Desktop Sidebar Filters */}
                <Box sx={{
                    width: 250,
                    flexShrink: 0,
                    height: '100%',
                    display: { xs: 'none', md: embedded ? 'none' : 'flex' },
                    flexDirection: 'column'
                }}>
                    <Card sx={{
                        p: 0,
                        height: '100%',
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        border: 'none',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)'
                    }}>
                        {renderFilters()}
                    </Card>
                </Box>

                {/* Main Calendar View */}
                <Box sx={{ flex: 1, height: '100%', minWidth: 0 }}>
                    <Card sx={{
                        p: 2,
                        height: '100%',
                        minHeight: isMobile ? 500 : 0, // Explicit min-height only for mobile
                        borderRadius: 4,
                        border: 'none',
                        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                        '& .fc': {
                            height: '100%',
                            fontFamily: 'inherit'
                        },
                        '& .fc-toolbar.fc-header-toolbar': {
                            marginBottom: '16px',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: { xs: 2, sm: 0 },
                            '& .fc-toolbar-title': {
                                fontSize: '1.1rem'
                            }
                        },
                        '& .fc-view-harness': {
                            backgroundColor: '#fff'
                        }
                    }}>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            buttonText={{
                                today: 'Today',
                                month: 'Month',
                                week: 'Week',
                                day: 'Day',
                            }}
                            editable={['admin', 'hr'].includes(user.role)}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            events={events}
                            dateClick={handleDateClick}
                            eventClick={handleEventClick}
                            height="100%"
                            eventClassNames="custom-fc-event"
                            dayCellClassNames={(arg) => {
                                const day = arg.date.getUTCDay();
                                if (day === 0 || day === 6) { // Sunday or Saturday
                                    return 'fc-day-weekend';
                                }
                                return '';
                            }}
                        />
                    </Card>
                </Box>
            </Box>

            {/* Mobile Filters Drawer */}
            <Drawer
                anchor="left"
                open={mobileFiltersOpen}
                onClose={() => setMobileFiltersOpen(false)}
            >
                <Box sx={{ width: 280, p: 2 }}>
                    {renderFilters()}
                </Box>
            </Drawer>

            {/* Event Modal */}
            <EventModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                event={selectedEvent}
                onEventSaved={() => {
                    fetchEvents();
                    setModalOpen(false);
                }}
                readOnly={!['admin', 'hr'].includes(user.role)}
            />
        </Box>
    );
};

export default SharedCalendar;
