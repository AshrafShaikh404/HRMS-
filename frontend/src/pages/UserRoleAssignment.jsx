import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    FormControl,
    TextField,
    InputAdornment,
    CircularProgress,
    Chip,
    Avatar,
    Stack,
} from '@mui/material';
import {
    Search as SearchIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useNotification } from '../contexts/NotificationContext';
import { roleAPI } from '../utils/api';
import api from '../utils/api';

function UserRoleAssignment() {
    const { showSuccess, showError } = useNotification();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesRes, usersRes] = await Promise.all([
                roleAPI.getRoles(),
                api.get('/auth/users')
            ]);
            setRoles(rolesRes.data.data);
            setUsers(usersRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            showError('Failed to fetch data');
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, roleId) => {
        try {
            await roleAPI.assignRole(userId, roleId);
            showSuccess('Role updated successfully');
            fetchData();
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to update role');
        }
    };

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">User Roles</Typography>
                <Typography color="text.secondary">Assign and manage system access for users</Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    sx={{ width: 350 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead sx={{ bgcolor: 'grey.50' }}>
                        <TableRow>
                            <TableCell><Typography fontWeight="bold">User</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Email</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Current Role</Typography></TableCell>
                            <TableCell><Typography fontWeight="bold">Assign New Role</Typography></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={4} align="center"><CircularProgress size={24} /></TableCell></TableRow>
                        ) : filteredUsers.map((user) => (
                            <TableRow key={user._id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                                            <PersonIcon fontSize="small" />
                                        </Avatar>
                                        <Typography fontWeight={500}>{user.name}</Typography>
                                    </Stack>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.role?.name || 'No Role'}
                                        variant="outlined"
                                        size="small"
                                        color={user.role?.name === 'Admin' ? 'error' : 'primary'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormControl size="small" sx={{ minWidth: 200 }}>
                                        <Select
                                            value={user.role?._id || ''}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            {roles.map((role) => (
                                                <MenuItem key={role._id} value={role._id}>
                                                    {role.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default UserRoleAssignment;
