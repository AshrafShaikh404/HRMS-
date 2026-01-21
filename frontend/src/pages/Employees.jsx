import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { employeeAPI } from '../utils/api';
import {
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    InputAdornment,
    Skeleton,
    Alert,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import EmployeeForm from '../components/EmployeeForm';

function Employees({ user }) {
    const { showSuccess, showError } = useNotification();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

    // Initial fetch
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await employeeAPI.getAll({
                search: searchTerm,
                status: statusFilter !== 'all' ? statusFilter : undefined
            });
            setEmployees(response.data.data.employees);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setSelectedEmployeeId(null);
        setShowFormModal(true);
    };

    const handleOpenEdit = (id) => {
        setSelectedEmployeeId(id);
        setShowFormModal(true);
    };

    const handleFormSuccess = () => {
        setShowFormModal(false);
        fetchEmployees();
    };

    const handleDeleteEmployee = async (id) => {
        if (window.confirm('Are you sure you want to PERMANENTLY delete this employee? This action cannot be undone.')) {
            try {
                await employeeAPI.delete(id);
                fetchEmployees();
                showSuccess('Employee deleted successfully');
            } catch (err) {
                showError('Failed to deactivate employee');
            }
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = searchTerm === '' ||
            emp.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'success';
            case 'inactive': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box>
                <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
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
                        Employees
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage your organization's employees
                    </Typography>
                </Box>
                {['admin', 'hr'].includes(typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase()) && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAdd}
                        sx={{ borderRadius: 2 }}
                    >
                        Add Employee
                    </Button>
                )}
            </Box>

            {/* Filters */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 3
            }}>
                <TextField
                    placeholder="Search by name, email, or employee code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ flex: 1, minWidth: { xs: '100%', sm: 300 } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label="Status"
                    >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchEmployees}
                    sx={{ borderRadius: 2 }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Employee Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee Code</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Email</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Department</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Designation</TableCell>
                            <TableCell>Status</TableCell>
                            {['admin', 'hr'].includes(typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase()) && <TableCell>Actions</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredEmployees.map((emp) => (
                            <TableRow key={emp._id} hover>
                                <TableCell>
                                    <Typography fontWeight={600}>{emp.employeeCode}</Typography>
                                </TableCell>
                                <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{emp.email}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{emp.department}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{emp.designation}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={emp.status}
                                        color={getStatusColor(emp.status)}
                                        size="small"
                                    />
                                </TableCell>
                                {['admin', 'hr'].includes(typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase()) && (
                                    <TableCell>
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => handleOpenEdit(emp._id)}
                                            sx={{ mr: 1 }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => handleDeleteEmployee(emp._id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredEmployees.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No employees found</Typography>
                    </Box>
                )}
            </TableContainer>

            {/* Employee Form Dialog */}
            <Dialog
                open={showFormModal}
                onClose={() => setShowFormModal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 0 }}>
                    <Box sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1 }}>
                        <IconButton onClick={() => setShowFormModal(false)}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    <EmployeeForm
                        employeeId={selectedEmployeeId}
                        onSuccess={handleFormSuccess}
                        onClose={() => setShowFormModal(false)}
                        userRole={user.role}
                    />
                </DialogContent>
            </Dialog>
        </Box >
    );
}

export default Employees;
