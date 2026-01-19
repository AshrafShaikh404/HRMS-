import { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Grid,
    Typography,
    Stepper,
    Step,
    StepLabel,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Paper,
    CircularProgress,
    IconButton,
    LinearProgress,
    Alert,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    Visibility as VisibilityIcon
} from '@mui/icons-material';
import { employeeAPI } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';

const steps = ['Personal Details', 'Job Information', 'Statutory Details', 'Documents'];

const EmployeeForm = ({ employeeId, onSuccess, onClose, userRole }) => {
    const { showSuccess, showError } = useNotification();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        dateOfBirth: '', gender: '',
        address: '', city: '', state: '', pinCode: '',
        emergencyContact: { name: '', relationship: '', phone: '' },

        department: '', designation: '', employmentType: '',
        joinDate: new Date().toISOString().split('T')[0],
        salary: '', bankAccount: '', panCard: '', aadharCard: '',

        uan: '', pfNumber: '', esiNumber: '', taxDeduction: 0,
        isPfEligible: true, isEsiEligible: true
    });

    // Document State
    const [documents, setDocuments] = useState([]);
    const [uploadQueue, setUploadQueue] = useState([]); // { type, file, status }
    const [verifyingDoc, setVerifyingDoc] = useState(null);

    // Validation Errors
    const [errors, setErrors] = useState({});

    // Load existing employee data if edit mode
    useEffect(() => {
        if (employeeId) {
            setIsEditMode(true);
            loadEmployeeData();
        }
    }, [employeeId]);

    const loadEmployeeData = async () => {
        try {
            setLoading(true);
            const res = await employeeAPI.getOne(employeeId);
            const emp = res.data.data.employee;

            // Format dates
            const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

            setFormData({
                ...emp,
                dateOfBirth: formatDate(emp.dateOfBirth),
                joinDate: formatDate(emp.joinDate),
                emergencyContact: emp.emergencyContact || { name: '', relationship: '', phone: '' }
            });
            setDocuments(emp.documents || []);
        } catch (err) {
            showError('Failed to load employee data');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Completion
    const calculateCompletion = () => {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'phone', 'department', 'designation',
            'employmentType', 'salary', 'joinDate', 'address'
        ];
        let filled = 0;
        requiredFields.forEach(f => {
            if (formData[f]) filled++;
        });
        return Math.round((filled / requiredFields.length) * 100);
    };

    // Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => {
                const newData = { ...prev, [name]: value };

                // Auto-calculate Statutory Eligibility
                if (name === 'salary') {
                    const salary = Number(value);
                    newData.isPfEligible = salary <= 15000;
                    newData.isEsiEligible = salary <= 21000;
                }
                return newData;
            });
        }
        // Clear error
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Validations
    const validateStep = (step) => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;
        const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        const aadhaarRegex = /^\d{12}$/;

        if (step === 0) { // Personal
            if (!formData.firstName.trim()) newErrors.firstName = 'Required';
            if (!formData.lastName.trim()) newErrors.lastName = 'Required';
            if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = 'Valid Email Required';
            if (!formData.phone || !phoneRegex.test(formData.phone)) newErrors.phone = '10-digit Phone Required';
        }

        if (step === 1) { // Job
            if (!formData.department) newErrors.department = 'Required';
            if (!formData.designation) newErrors.designation = 'Required';
            if (!formData.employmentType) newErrors.employmentType = 'Required';
            if (!formData.salary || Number(formData.salary) <= 0) newErrors.salary = 'Valid Salary Required';
            if (formData.panCard && !panRegex.test(formData.panCard)) newErrors.panCard = 'Invalid PAN Format (ABCDE1234F)';
            if (formData.aadharCard && !aadhaarRegex.test(formData.aadharCard)) newErrors.aadharCard = 'Invalid Aadhaar (12 digits)';
        }

        if (step === 2) { // Statutory
            if (formData.isPfEligible && !formData.uan) newErrors.uan = 'Required for PF Eligible (Salary <= 15000)';
            if (formData.isEsiEligible && !formData.esiNumber) newErrors.esiNumber = 'Required for ESI Eligible (Salary <= 21000)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep(prev => prev + 1);
        } else {
            showError('Please fix errors before proceeding');
        }
    };

    const handleBack = () => setActiveStep(prev => prev - 1);

    // Document Upload Handler
    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        // Size check (2MB - 5MB range as requested, enforcing 5MB max here)
        if (file.size > 5 * 1024 * 1024) {
            showError('File size exceeds 5MB limit');
            return;
        }

        setUploadQueue(prev => [...prev, { type, file, status: 'pending' }]);
    };

    const removeFileFromQueue = (index) => {
        setUploadQueue(prev => prev.filter((_, i) => i !== index));
    };

    // Submit Form
    const handleSubmit = async () => {
        if (!validateStep(activeStep)) return;

        setLoading(true);
        try {
            let empId = employeeId;

            // 1. Create/Update Employee Data
            if (isEditMode) {
                await employeeAPI.update(employeeId, formData);
                showSuccess('Employee Details Updated');
            } else {
                const res = await employeeAPI.create(formData);
                empId = res.data.data.employee._id;
                showSuccess('Employee Created Successfully');
            }

            // 2. Process File Uploads
            if (uploadQueue.length > 0) {
                const uploadPromises = uploadQueue.map(item => {
                    const data = new FormData();
                    data.append('file', item.file);
                    data.append('documentType', item.type);
                    return employeeAPI.uploadDocument(empId, data);
                });

                await Promise.all(uploadPromises);
                showSuccess(`${uploadQueue.length} Documents Uploaded`);
            }

            onSuccess();
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || 'Operation Failed';
            showError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Verify Document Handler
    const handleVerifyDoc = async (docId, status) => {
        try {
            await employeeAPI.verifyDocument(employeeId, docId, {
                status,
                rejectionReason: status === 'Rejected' ? 'Admin Rejected' : undefined
            });
            showSuccess(`Document ${status}`);
            loadEmployeeData(); // Reload to see update
        } catch (err) {
            showError('Verification Failed');
        }
    };

    return (
        <Paper sx={{ p: 4, maxWidth: 900, mx: 'auto', mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold">
                    {isEditMode ? 'Update Employee' : 'Add New Employee'}
                </Typography>
                <Chip
                    label={`Profile Completion: ${calculateCompletion()}%`}
                    color={calculateCompletion() === 100 ? 'success' : 'warning'}
                />
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
            </Stepper>

            {/* Step Content */}
            <Box sx={{ minHeight: 400 }}>
                {activeStep === 0 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={!!errors.firstName} helperText={errors.firstName} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={!!errors.lastName} helperText={errors.lastName} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Email" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} required disabled={isEditMode} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={!!errors.phone} helperText={errors.phone} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Date of Birth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Gender</InputLabel>
                                <Select name="gender" value={formData.gender} onChange={handleChange} label="Gender">
                                    <MenuItem value="M">Male</MenuItem>
                                    <MenuItem value="F">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Address" name="address" value={formData.address} onChange={handleChange} multiline rows={2} />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 1 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!!errors.department}>
                                <InputLabel>Department</InputLabel>
                                <Select name="department" value={formData.department} onChange={handleChange} label="Department">
                                    {['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing', 'Admin', 'Other'].map(opt => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Designation" name="designation" value={formData.designation} onChange={handleChange} error={!!errors.designation} helperText={errors.designation} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!!errors.employmentType}>
                                <InputLabel>Employment Type</InputLabel>
                                <Select name="employmentType" value={formData.employmentType} onChange={handleChange} label="Employment Type">
                                    <MenuItem value="Full-time">Full-time</MenuItem>
                                    <MenuItem value="Part-time">Part-time</MenuItem>
                                    <MenuItem value="Intern">Intern</MenuItem>
                                    <MenuItem value="Contract">Contract</MenuItem>
                                    <MenuItem value="Consultant">Consultant</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Salary" type="number" name="salary" value={formData.salary} onChange={handleChange} error={!!errors.salary} helperText={errors.salary} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Join Date" type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="PAN Card" name="panCard" value={formData.panCard} onChange={handleChange} error={!!errors.panCard} helperText={errors.panCard} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Aadhaar Card" name="aadharCard" value={formData.aadharCard} onChange={handleChange} error={!!errors.aadharCard} helperText={errors.aadharCard} />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 2 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Statutory eligibility is auto-calculated based on Salary logic (PF &le; 15k, ESI &le; 21k).
                            </Alert>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="UAN" name="uan" value={formData.uan} onChange={handleChange} error={!!errors.uan} helperText={errors.uan} required={formData.isPfEligible} disabled={!formData.isPfEligible} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="ESI Number" name="esiNumber" value={formData.esiNumber} onChange={handleChange} error={!!errors.esiNumber} helperText={errors.esiNumber} required={formData.isEsiEligible} disabled={!formData.isEsiEligible} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Income Tax (TDS)" type="number" name="taxDeduction" value={formData.taxDeduction} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>PF Eligible?</InputLabel>
                                <Select name="isPfEligible" value={formData.isPfEligible} onChange={handleChange} label="PF Eligible?" disabled>
                                    <MenuItem value={true}>Yes</MenuItem>
                                    <MenuItem value={false}>No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>ESI Eligible?</InputLabel>
                                <Select name="isEsiEligible" value={formData.isEsiEligible} onChange={handleChange} label="ESI Eligible?" disabled>
                                    <MenuItem value={true}>Yes</MenuItem>
                                    <MenuItem value={false}>No</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                )}

                {activeStep === 3 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Upload Documents</Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                            Max Size: 5MB. Formats: PDF, JPG, PNG.
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {['Aadhaar Card', 'PAN Card', 'Resume', 'Photo', 'Offer Letter', 'Other'].map(type => (
                                <Grid item xs={12} sm={6} md={4} key={type}>
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<CloudUploadIcon />}
                                        fullWidth
                                        sx={{ height: 60 }}
                                    >
                                        {type}
                                        <input type="file" hidden onChange={(e) => handleFileSelect(e, type)} />
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Upload Queue */}
                        {uploadQueue.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography fontWeight="bold">To Upload:</Typography>
                                {uploadQueue.map((item, index) => (
                                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, border: '1px solid #eee', mt: 1 }}>
                                        <Typography>{item.type} - {item.file.name}</Typography>
                                        <IconButton size="small" onClick={() => removeFileFromQueue(index)}><DeleteIcon /></IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Existing Documents */}
                        {isEditMode && documents.length > 0 && (
                            <Box>
                                <Typography fontWeight="bold" gutterBottom>Uploaded Documents:</Typography>
                                <Grid container spacing={2}>
                                    {documents.map(doc => (
                                        <Grid item xs={12} key={doc._id}>
                                            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography fontWeight={600}>{doc.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                                                    </Typography>
                                                    <br />
                                                    <Chip
                                                        label={doc.status}
                                                        color={doc.status === 'Verified' ? 'success' : doc.status === 'Rejected' ? 'error' : 'warning'}
                                                        size="small"
                                                        sx={{ mt: 1 }}
                                                    />
                                                </Box>
                                                <Box>
                                                    <IconButton href={`http://localhost:5001/${doc.filePath}`} target="_blank">
                                                        <VisibilityIcon />
                                                    </IconButton>

                                                    {/* Verification Controls (Admin/HR only) */}
                                                    {(userRole === 'admin' || userRole === 'hr') && doc.status === 'Pending' && (
                                                        <>
                                                            <Button size="small" color="success" onClick={() => handleVerifyDoc(doc._id, 'Verified')}>Verify</Button>
                                                            <Button size="small" color="error" onClick={() => handleVerifyDoc(doc._id, 'Rejected')}>Reject</Button>
                                                        </>
                                                    )}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4, pt: 2, borderTop: '1px solid #eee' }}>
                <Button disabled={activeStep === 0 || loading} onClick={handleBack}>
                    Back
                </Button>

                {activeStep === steps.length - 1 ? (
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update Employee' : 'Submit & Create')}
                    </Button>
                ) : (
                    <Button variant="contained" onClick={handleNext}>
                        Next
                    </Button>
                )}
            </Box>
        </Paper>
    );
};

export default EmployeeForm;
