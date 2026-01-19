import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { helpdeskAPI, employeeAPI } from '../utils/api';
import {
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Grid,
    Card,
    CardContent,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Skeleton,
    Alert,
    InputAdornment,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    FilterAlt as FilterIcon,
    Close as CloseIcon,
    ConfirmationNumber as TicketIcon,
    Assignment as AssignmentIcon,
    CheckCircle as ResolveIcon,
} from '@mui/icons-material';

function Helpdesk({ user }) {
    const { showSuccess, showError } = useNotification();
    const [tickets, setTickets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedTab, setSelectedTab] = useState(0);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        priority: ''
    });
    const [newTicket, setNewTicket] = useState({
        category: '',
        subcategory: '',
        subject: '',
        description: '',
        priority: 'Medium'
    });

    const isAdminOrHR = user.role === 'admin' || user.role === 'hr';

    useEffect(() => {
        fetchTickets();
        if (isAdminOrHR) {
            fetchEmployees();
        }
    }, [filters]);

    const fetchTickets = async () => {
        try {
            const response = await helpdeskAPI.getTickets(filters);
            setTickets(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tickets:', error);
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const response = await employeeAPI.getAll({});
            setEmployees(response.data.data.employees);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await helpdeskAPI.createTicket(newTicket);
            setShowCreateModal(false);
            setNewTicket({
                category: '',
                subcategory: '',
                subject: '',
                description: '',
                priority: 'Medium'
            });
            fetchTickets();
            showSuccess('Ticket created successfully!');
        } catch (error) {
            showError(error.response?.data?.message || 'Failed to create ticket');
        }
    };

    const handleAssignTicket = async (ticketId, employeeId) => {
        try {
            await helpdeskAPI.assignTicket(ticketId, employeeId);
            fetchTickets();
            showSuccess('Ticket assigned successfully!');
        } catch (error) {
            showError('Failed to assign ticket');
        }
    };

    const handleResolveTicket = async (ticketId) => {
        try {
            await helpdeskAPI.resolveTicket(ticketId);
            fetchTickets();
            showSuccess('Ticket resolved successfully!');
        } catch (error) {
            showError('Failed to resolve ticket');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Open': return 'error';
            case 'In Progress': return 'warning';
            case 'Resolved': return 'success';
            case 'Closed': return 'default';
            default: return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Critical': return 'error';
            case 'High': return 'warning';
            case 'Medium': return 'info';
            case 'Low': return 'default';
            default: return 'default';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'IT': return '💻';
            case 'HR': return '👥';
            case 'Admin': return '📋';
            case 'Facilities': return '🏢';
            default: return '📝';
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        if (selectedTab === 0) return true; // All
        if (selectedTab === 1) return ticket.status === 'Open';
        if (selectedTab === 2) return ticket.status === 'In Progress';
        if (selectedTab === 3) return ticket.status === 'Resolved' || ticket.status === 'Closed';
        return true;
    });

    const stats = {
        total: tickets.length,
        open: tickets.filter(t => t.status === 'Open').length,
        inProgress: tickets.filter(t => t.status === 'In Progress').length,
        resolved: tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Skeleton variant="rounded" height={100} />
                        </Grid>
                    ))}
                </Grid>
                <Skeleton variant="rounded" height={400} />
            </Box>
        );
    }

    return (
        <Box>
            {/* Page Header */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2,
                mb: 3
            }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                        Helpdesk
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Submit and track support tickets
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setShowCreateModal(true)}
                    sx={{ borderRadius: 2 }}
                >
                    Create Ticket
                </Button>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TicketIcon color="primary" />
                                <Typography variant="h6">Total</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold">{stats.total}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <TicketIcon color="error" />
                                <Typography variant="h6">Open</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" color="error.main">{stats.open}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <AssignmentIcon color="warning" />
                                <Typography variant="h6">In Progress</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" color="warning.main">{stats.inProgress}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <ResolveIcon color="success" />
                                <Typography variant="h6">Resolved</Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold" color="success.main">{stats.resolved}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 3,
                flexWrap: 'wrap'
            }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        label="Category"
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        <MenuItem value="IT">IT</MenuItem>
                        <MenuItem value="HR">HR</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Facilities">Facilities</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                        value={filters.priority}
                        onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        label="Priority"
                    >
                        <MenuItem value="">All Priorities</MenuItem>
                        <MenuItem value="Critical">Critical</MenuItem>
                        <MenuItem value="High">High</MenuItem>
                        <MenuItem value="Medium">Medium</MenuItem>
                        <MenuItem value="Low">Low</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchTickets}
                    sx={{ borderRadius: 2 }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={selectedTab} onChange={(e, val) => setSelectedTab(val)}>
                    <Tab label={`All (${stats.total})`} />
                    <Tab label={`Open (${stats.open})`} />
                    <Tab label={`In Progress (${stats.inProgress})`} />
                    <Tab label={`Resolved (${stats.resolved})`} />
                </Tabs>
            </Box>

            {/* Tickets Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticket #</TableCell>
                            {isAdminOrHR && <TableCell>Employee</TableCell>}
                            <TableCell>Category</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Priority</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Created</TableCell>
                            {isAdminOrHR && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTickets.map((ticket) => (
                            <TableRow key={ticket._id} hover sx={{ cursor: 'pointer' }}>
                                <TableCell>
                                    <Typography fontWeight={600}>{ticket.ticketNumber}</Typography>
                                </TableCell>
                                {isAdminOrHR && (
                                    <TableCell>
                                        {ticket.employeeId?.firstName} {ticket.employeeId?.lastName}
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            {ticket.employeeId?.employeeCode}
                                        </Typography>
                                    </TableCell>
                                )}
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <span>{getCategoryIcon(ticket.category)}</span>
                                        {ticket.category}
                                    </Box>
                                </TableCell>
                                <TableCell>{ticket.subject}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                    <Chip
                                        label={ticket.priority}
                                        color={getPriorityColor(ticket.priority)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={ticket.status}
                                        color={getStatusColor(ticket.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>
                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                </TableCell>
                                {isAdminOrHR && (
                                    <TableCell>
                                        {ticket.status !== 'Resolved' && ticket.status !== 'Closed' && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="success"
                                                onClick={() => handleResolveTicket(ticket._id)}
                                            >
                                                Resolve
                                            </Button>
                                        )}
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredTickets.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No tickets found</Typography>
                    </Box>
                )}
            </TableContainer>

            {/* Create Ticket Dialog */}
            <Dialog
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Create Support Ticket
                    <IconButton onClick={() => setShowCreateModal(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <form onSubmit={handleCreateTicket}>
                    <DialogContent dividers>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required>
                                    <InputLabel>Category</InputLabel>
                                    <Select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value, subcategory: '' })}
                                        label="Category"
                                    >
                                        <MenuItem value="IT">IT</MenuItem>
                                        <MenuItem value="HR">HR</MenuItem>
                                        <MenuItem value="Admin">Admin</MenuItem>
                                        <MenuItem value="Facilities">Facilities</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Subcategory"
                                    value={newTicket.subcategory}
                                    onChange={(e) => setNewTicket({ ...newTicket, subcategory: e.target.value })}
                                    placeholder="e.g., Hardware, Software"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Subject"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    label="Description"
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    placeholder="Please provide as much detail as possible..."
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControl fullWidth required>
                                    <InputLabel>Priority</InputLabel>
                                    <Select
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                        label="Priority"
                                    >
                                        <MenuItem value="Low">Low</MenuItem>
                                        <MenuItem value="Medium">Medium</MenuItem>
                                        <MenuItem value="High">High</MenuItem>
                                        <MenuItem value="Critical">Critical</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={() => setShowCreateModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="contained">
                            Create Ticket
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
}

export default Helpdesk;
