import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Switch,
    FormControlLabel,
    Grid,
    CircularProgress,
    Stack,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Place as LocationIcon
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { locationAPI } from '../utils/api';

const TIMEZONES = [
    'Asia/Kolkata',
    'UTC',
    'America/New_York',
    'Europe/London',
    'Asia/Singapore',
    'Australia/Sydney'
];

const WORK_TYPES = ['Onsite', 'Remote', 'Hybrid'];

function Locations({ user }) {
    const { showSuccess, showError } = useNotification();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [editingLoc, setEditingLoc] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        country: '',
        timezone: 'Asia/Kolkata',
        workType: 'Onsite',
        description: '',
        isActive: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await locationAPI.getAll();
            setLocations(res.data.data);
            setLoading(false);
        } catch (err) {
            showError('Failed to fetch locations');
            setLoading(false);
        }
    };

    const handleOpenModal = (loc = null) => {
        if (loc) {
            setEditingLoc(loc);
            setFormData({
                name: loc.name,
                city: loc.city,
                country: loc.country,
                timezone: loc.timezone,
                workType: loc.workType,
                description: loc.description || '',
                isActive: loc.isActive
            });
        } else {
            setEditingLoc(null);
            setFormData({
                name: '',
                city: '',
                country: '',
                timezone: 'Asia/Kolkata',
                workType: 'Onsite',
                description: '',
                isActive: true
            });
        }
        setOpenModal(true);
    };

    const handleSave = async () => {
        try {
            if (!formData.name || !formData.city || !formData.country || !formData.timezone) {
                showError('Please fill all required fields');
                return;
            }

            if (editingLoc) {
                await locationAPI.update(editingLoc._id, formData);
                showSuccess('Location updated successfully');
            } else {
                await locationAPI.create(formData);
                showSuccess('Location created successfully');
            }
            setOpenModal(false);
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to save location');
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold">Work Locations</Typography>
                    <Typography color="text.secondary">Manage office locations and remote hubs</Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenModal()}
                    sx={{ borderRadius: 2 }}
                >
                    Add Location
                </Button>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell><Typography fontWeight="bold">Location Name</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">City / Country</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Timezone</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Work Type</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Employees</Typography></TableCell>
                            <TableCell align="center"><Typography fontWeight="bold">Status</Typography></TableCell>
                            <TableCell align="right"><Typography fontWeight="bold">Actions</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={7} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : locations.length === 0 ? (
                            <TableRow><TableCell colSpan={7} align="center">No locations found</TableCell></TableRow>
                        ) : (
                            locations.map((loc) => (
                                <TableRow key={loc._id} hover>
                                    <TableCell>
                                        <Typography fontWeight={600}>{loc.name}</Typography>
                                        {loc.description && <Typography variant="caption" color="text.secondary">{loc.description}</Typography>}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">{loc.city}, {loc.country}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{loc.timezone}</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={loc.workType}
                                            size="small"
                                            color={loc.workType === 'Onsite' ? 'primary' : loc.workType === 'Remote' ? 'secondary' : 'warning'}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={loc.employeeCount || 0}
                                            size="small"
                                            variant="outlined"
                                            color="default"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            label={loc.isActive ? 'Active' : 'Inactive'}
                                            color={loc.isActive ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Tooltip title="Edit">
                                                <IconButton onClick={() => handleOpenModal(loc)} color="primary" size="small">
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingLoc ? 'Edit Location' : 'Add Location'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Location Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Ahmedabad Office"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="City"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Country"
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Timezone</InputLabel>
                                <Select
                                    value={formData.timezone}
                                    onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                    label="Timezone"
                                >
                                    {TIMEZONES.map(tz => (
                                        <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Work Type</InputLabel>
                                <Select
                                    value={formData.workType}
                                    onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                                    label="Work Type"
                                >
                                    {WORK_TYPES.map(type => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={2}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    />
                                }
                                label="Active Status"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Locations;
