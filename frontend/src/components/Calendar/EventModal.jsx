import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, FormControl, InputLabel, Select, MenuItem,
    FormControlLabel, Checkbox, Grid, Box
} from '@mui/material';
import { calendarAPI } from '../../utils/calendarApi';

const EventModal = ({ open, onClose, event, onEventSaved, readOnly = false }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        eventType: 'MEETING',
        start: '',
        end: '',
        allDay: false,
        visibility: 'PERSONAL'
    });

    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || '',
                description: event.extendedProps?.description || '',
                eventType: event.extendedProps?.eventType || 'MEETING',
                start: formatDate(event.start),
                end: formatDate(event.end) || formatDate(event.start),
                allDay: event.allDay || false,
                visibility: event.extendedProps?.visibility || 'PERSONAL'
            });
        } else {
            // Default new event
            setFormData({
                title: '',
                description: '',
                eventType: 'MEETING',
                start: '',
                end: '',
                allDay: false,
                visibility: 'PERSONAL'
            });
        }
    }, [event]);

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16); // Format for datetime-local
    };

    const handleChange = (e) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'allDay' ? checked : value
        }));
    };

    const handleSubmit = async () => {
        try {
            if (event?.id) {
                await calendarAPI.update(event.id, formData);
            } else {
                await calendarAPI.create(formData);
            }
            onEventSaved();
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await calendarAPI.delete(event.id);
                onEventSaved();
                onClose();
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {readOnly ? 'Event Details' : (event?.title ? 'Edit Event' : 'New Event')}
            </DialogTitle>
            <DialogContent>
                <Box component="form" sx={{ mt: 1 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                name="title"
                                label="Event Title"
                                fullWidth
                                required
                                value={formData.title}
                                onChange={handleChange}
                                disabled={readOnly}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                name="description"
                                label="Description"
                                fullWidth
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                disabled={readOnly}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Type</InputLabel>
                                <Select
                                    name="eventType"
                                    value={formData.eventType}
                                    label="Type"
                                    onChange={handleChange}
                                    disabled={readOnly}
                                >
                                    <MenuItem value="MEETING">Meeting</MenuItem>
                                    <MenuItem value="INTERVIEW">Interview</MenuItem>
                                    <MenuItem value="TRAINING">Training</MenuItem>
                                    <MenuItem value="HOLIDAY">Holiday</MenuItem>
                                    <MenuItem value="LEAVE">Leave</MenuItem>
                                    <MenuItem value="CUSTOM_EVENT">Custom</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth>
                                <InputLabel>Visibility</InputLabel>
                                <Select
                                    name="visibility"
                                    value={formData.visibility}
                                    label="Visibility"
                                    onChange={handleChange}
                                    disabled={readOnly}
                                >
                                    <MenuItem value="PERSONAL">Personal</MenuItem>
                                    <MenuItem value="TEAM">Team</MenuItem>
                                    <MenuItem value="COMPANY">Company</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="allDay"
                                        checked={formData.allDay}
                                        onChange={handleChange}
                                        disabled={readOnly}
                                    />
                                }
                                label="All Day Event"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="start"
                                label="Start Time"
                                type="datetime-local"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.start}
                                onChange={handleChange}
                                disabled={readOnly}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                name="end"
                                label="End Time"
                                type="datetime-local"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={formData.end}
                                onChange={handleChange}
                                disabled={readOnly}
                            />
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                {!readOnly && event?.id && (
                    <Button onClick={handleDelete} color="error" sx={{ mr: 'auto' }}>
                        Delete
                    </Button>
                )}
                <Button onClick={onClose}>
                    {readOnly ? 'Close' : 'Cancel'}
                </Button>
                {!readOnly && (
                    <Button onClick={handleSubmit} variant="contained">
                        Save
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default EventModal;
