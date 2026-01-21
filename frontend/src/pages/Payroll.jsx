import { useState, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { payrollAPI, employeeAPI } from '../utils/api';
import { handleExport, generateFilename } from '../utils/exportHelper';
import {
    Box,
    Typography,
    Button,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Skeleton,
    CircularProgress,
} from '@mui/material';
import {
    Settings as SettingsIcon,
    Refresh as RefreshIcon,
    Close as CloseIcon,
    FileDownload as DownloadIcon,
    PictureAsPdf as PdfIcon,
} from '@mui/icons-material';

function Payroll({ user }) {
    const { showSuccess, showError } = useNotification();
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    // Employee selection for independent generation
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeForGeneration, setSelectedEmployeeForGeneration] = useState('');
    const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);
    const [generateYear, setGenerateYear] = useState(new Date().getFullYear());

    useEffect(() => {
        fetchPayslips();
        const role = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();
        if (role === 'admin' || role === 'hr') {
            fetchEmployees();
        }
    }, [selectedMonth, selectedYear]);

    const fetchEmployees = async () => {
        try {
            const response = await employeeAPI.getAll({});
            setEmployees(response.data.data.employees);
        } catch (err) {
            console.error('Error fetching employees:', err);
        }
    };

    const fetchPayslips = async () => {
        try {
            const role = typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase();
            if (role === 'admin' || role === 'hr') {
                const response = await payrollAPI.getPayslips(selectedMonth, selectedYear);
                setPayslips(response.data.data);
            } else {
                // For employees, fetch their own payslip
                const empResponse = await employeeAPI.getAll({});
                const employee = empResponse.data.data.employees.find(e => e.userId === user._id);
                if (employee) {
                    const response = await payrollAPI.getPayslip(employee._id, selectedMonth, selectedYear);
                    setPayslips([response.data.data]);
                }
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching payslips:', err);
            setLoading(false);
        }
    };

    const handleGeneratePayroll = async () => {
        try {
            const response = await payrollAPI.generate(generateMonth, generateYear, null, selectedEmployeeForGeneration || null);
            showSuccess(`Payroll generated for ${response.data.data.summary.successfullyGenerated} employees!`);
            setShowGenerateModal(false);
            // If the generated payroll matches the current view, refresh the list
            if (generateMonth === selectedMonth && generateYear === selectedYear) {
                fetchPayslips();
            }
        } catch (err) {
            showError(err.response?.data?.message || 'Failed to generate payroll');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'generated': return 'info';
            case 'paid': return 'success';
            case 'pending': return 'warning';
            default: return 'default';
        }
    };

    const handleExportCSV = async () => {
        setExporting(true);
        const params = { month: selectedMonth, year: selectedYear };
        const filename = generateFilename('payroll', 'csv', { month: selectedMonth, year: selectedYear });
        const result = await handleExport(payrollAPI.exportCSV, params, filename);

        if (result.success) {
            showSuccess('Payroll data exported successfully');
        } else {
            showError(result.message || 'Export failed');
        }
        setExporting(false);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        const params = { month: selectedMonth, year: selectedYear };
        const filename = generateFilename('payroll', 'pdf', { month: selectedMonth, year: selectedYear });
        const result = await handleExport(payrollAPI.exportPDF, params, filename);

        if (result.success) {
            showSuccess('Payroll report exported successfully');
        } else {
            showError(result.message || 'Export failed');
        }
        setExporting(false);
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
                        Payroll
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Manage employee salary and payslips
                    </Typography>
                </Box>
                {['admin', 'hr'].includes(typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase()) && (
                    <Button
                        variant="contained"
                        startIcon={<SettingsIcon />}
                        onClick={() => setShowGenerateModal(true)}
                        sx={{ borderRadius: 2 }}
                    >
                        Generate Payroll
                    </Button>
                )}
            </Box>

            {/* Month/Year Filter */}
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                mb: 3
            }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Month</InputLabel>
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        label="Month"
                    >
                        {[...Array(12)].map((_, i) => (
                            <MenuItem key={i + 1} value={i + 1}>
                                {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Year</InputLabel>
                    <Select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        label="Year"
                    >
                        <MenuItem value={2024}>2024</MenuItem>
                        <MenuItem value={2025}>2025</MenuItem>
                        <MenuItem value={2026}>2026</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchPayslips}
                    sx={{ borderRadius: 2 }}
                >
                    Refresh
                </Button>
                {['admin', 'hr'].includes(typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase()) && (
                    <>
                        <Button
                            variant="outlined"
                            startIcon={exporting ? <CircularProgress size={16} /> : <DownloadIcon />}
                            onClick={handleExportCSV}
                            disabled={exporting || payslips.length === 0}
                            sx={{ borderRadius: 2 }}
                            color="success"
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={exporting ? <CircularProgress size={16} /> : <PdfIcon />}
                            onClick={handleExportPDF}
                            disabled={exporting || payslips.length === 0}
                            sx={{ borderRadius: 2 }}
                            color="error"
                        >
                            Export PDF
                        </Button>
                    </>
                )}
            </Box>

            {/* Payslips Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                        <TableRow>
                            {['admin', 'hr'].includes(typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase()) && <TableCell>Employee</TableCell>}
                            <TableCell>Month/Year</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Working Days</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Present Days</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Payable Days</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Basic Salary</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Gross Salary</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Deductions</TableCell>
                            <TableCell>Net Salary</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {payslips.map((payslip) => (
                            <TableRow key={payslip._id} hover>
                                {['admin', 'hr'].includes(typeof user.role === 'string' ? user.role : user.role?.name?.toLowerCase()) && (
                                    <TableCell>
                                        <Typography fontWeight={600}>
                                            {payslip.employeeId?.firstName} {payslip.employeeId?.lastName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {payslip.employeeId?.employeeCode}
                                        </Typography>
                                    </TableCell>
                                )}
                                <TableCell>{payslip.month}/{payslip.year}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{payslip.workingDays}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{payslip.presentDays}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{payslip.payableDays}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>₹{payslip.basicSalary?.toLocaleString()}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>₹{payslip.grossSalary?.toLocaleString()}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>₹{payslip.deductions?.toLocaleString()}</TableCell>
                                <TableCell>
                                    <Typography fontWeight={600}>₹{payslip.netSalary?.toLocaleString()}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={payslip.status}
                                        color={getStatusColor(payslip.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        color="primary"
                                        size="small"
                                        title="Download Payslip"
                                        onClick={() => {
                                            // Trigger PDF generation for this specific payslip
                                            showSuccess('Downloading payslip...');
                                        }}
                                    >
                                        <DownloadIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {payslips.length === 0 && (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No payslips found for {selectedMonth}/{selectedYear}</Typography>
                    </Box>
                )}
            </TableContainer>

            {/* Generate Payroll Dialog */}
            <Dialog
                open={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Generate Payroll
                    <IconButton onClick={() => setShowGenerateModal(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        Generate payroll for:
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, my: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Month</InputLabel>
                            <Select
                                value={generateMonth}
                                onChange={(e) => setGenerateMonth(Number(e.target.value))}
                                label="Month"
                            >
                                {[...Array(12)].map((_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                        {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                            <InputLabel>Year</InputLabel>
                            <Select
                                value={generateYear}
                                onChange={(e) => setGenerateYear(Number(e.target.value))}
                                label="Year"
                            >
                                <MenuItem value={2024}>2024</MenuItem>
                                <MenuItem value={2025}>2025</MenuItem>
                                <MenuItem value={2026}>2026</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Typography variant="body2" color="text.secondary">
                        This will create payslips for selected active employees based on their attendance.
                    </Typography>

                    <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                        <InputLabel>Select Employee (Optional)</InputLabel>
                        <Select
                            value={selectedEmployeeForGeneration}
                            onChange={(e) => setSelectedEmployeeForGeneration(e.target.value)}
                            label="Select Employee (Optional)"
                        >
                            <MenuItem value="">All Employees</MenuItem>
                            {employees.map((emp) => (
                                <MenuItem key={emp._id} value={emp._id}>
                                    {emp.firstName} {emp.lastName} ({emp.employeeCode})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setShowGenerateModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="contained" onClick={handleGeneratePayroll}>
                        Generate
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Payroll;
