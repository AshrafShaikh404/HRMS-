import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { payrollAPI, employeeAPI } from '../utils/api';
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
    Chip,
    IconButton,
    Skeleton,
    Card,
    CardContent,
    Grid,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Download as DownloadIcon,
    Refresh as RefreshIcon,
    AttachMoney as MoneyIcon,
    AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';

const MyPayslips = () => {
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();

    // Default to current year
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employeeId, setEmployeeId] = useState(null);

    useEffect(() => {
        const fetchEmployeeId = async () => {
            try {
                const response = await employeeAPI.getMyProfile();
                if (response.data.success && response.data.data) {
                    setEmployeeId(response.data.data._id);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error fetching employee profile:', err);
                setLoading(false);
            }
        };
        fetchEmployeeId();
    }, []);

    useEffect(() => {
        if (employeeId) {
            fetchPayslips();
        }
    }, [employeeId, selectedYear]);

    const fetchPayslips = async () => {
        setLoading(true);
        try {
            // We want ALL payslips for the year.
            // The API getPayslip (singular) takes month/year.
            // But we likely want a history list.
            // Let's iterate months or check if there is a 'history' endpoint.
            // Currently: `getPayslip: (employeeId, month, year)`
            // We might need to call it for each month or add a new endpoint.
            // Admin's `getPayslips` gets ALL for a month.
            // For now, let's fetch last 12 months manually or assumes user selects month?
            // BETTER UX: Show list of available payslips.
            // Changing logic: We will assume we can fetch by just Year? 
            // The current backend `getPayslip` requires specific month.
            // WORKAROUND: We will iterate 1 to 12 for the selected year.

            const promises = [];
            for (let m = 1; m <= 12; m++) {
                promises.push(payrollAPI.getPayslip(employeeId, m, selectedYear).catch(() => null));
            }

            const results = await Promise.all(promises);
            const validPayslips = results
                .filter(res => res && res.data && res.data.data)
                .map(res => res.data.data);

            // Sort by month descending
            validPayslips.sort((a, b) => b.month - a.month);

            setPayslips(validPayslips);
        } catch (err) {
            console.error('Error fetching payslips:', err);
            showError('Failed to load payslips');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (payslip) => {
        try {
            const res = await payrollAPI.download(payslip._id);
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Payslip_${selectedYear}_${payslip.month}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            showSuccess('Download started');
        } catch (err) {
            console.error('Download error:', err);
            showError('Failed to download payslip');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'generated': return 'default'; // Employees might not see this usually
            case 'approved': return 'info';
            case 'locked': return 'success';
            case 'paid': return 'success';
            default: return 'default';
        }
    };

    if (loading && !employeeId) {
        return <Skeleton variant="rectangular" height={400} />;
    }

    if (!employeeId) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" color="error">Employee Profile Not Found</Typography>
                <Typography>Please contact HR to set up your employee profile.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">My Payslips</Typography>
                <Typography color="text.secondary">View and download your salary slips</Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <MoneyIcon sx={{ mr: 1 }} />
                                <Typography variant="subtitle1">Latest Net Salary</Typography>
                            </Box>
                            <Typography variant="h4" fontWeight="bold">
                                {payslips.length > 0 ? `₹${payslips[0].netSalary.toLocaleString()}` : '---'}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {payslips.length > 0 ? `${new Date(2024, payslips[0].month - 1).toLocaleString('default', { month: 'long' })} ${payslips[0].year}` : 'No data'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Could add more stats here */}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <FormControl size="small" sx={{ width: 150 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={selectedYear}
                        label="Year"
                        onChange={(e) => setSelectedYear(e.target.value)}
                    >
                        <MenuItem value={2024}>2024</MenuItem>
                        <MenuItem value={2025}>2025</MenuItem>
                        <MenuItem value={2026}>2026</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Month</TableCell>
                            <TableCell>Working Days</TableCell>
                            <TableCell>Payable Days</TableCell>
                            <TableCell>Gross Salary</TableCell>
                            <TableCell>Deductions</TableCell>
                            <TableCell>Net Salary</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={8}><Skeleton animation="wave" /></TableCell>
                                </TableRow>
                            ))
                        ) : payslips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">No payslips found for {selectedYear}</TableCell>
                            </TableRow>
                        ) : (
                            payslips.map(payslip => (
                                <TableRow key={payslip._id} hover>
                                    <TableCell>
                                        <Typography fontWeight="bold">
                                            {new Date(2024, payslip.month - 1).toLocaleString('default', { month: 'long' })}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{payslip.workingDays}</TableCell>
                                    <TableCell>{payslip.payableDays}</TableCell>
                                    <TableCell>₹{payslip.grossSalary.toLocaleString()}</TableCell>
                                    <TableCell color="error.main">₹{payslip.totalDeductions.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Typography color="success.main" fontWeight="bold">
                                            ₹{payslip.netSalary.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={payslip.status}
                                            color={getStatusColor(payslip.status)}
                                            size="small"
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="primary"
                                            onClick={() => handleDownload(payslip)}
                                            title="Download PDF"
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default MyPayslips;
