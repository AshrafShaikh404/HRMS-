import { useState, useEffect, useRef } from 'react';
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
import { employeeAPI, departmentAPI, designationAPI, locationAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const steps = ['Personal Details', 'Job Information', 'Statutory Details', 'Documents'];

const EmployeeForm = ({ employeeId, onSuccess, onClose }) => {
    const { hasPermission } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const submittingRef = useRef(false);

    // Departments & Designations State
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [locations, setLocations] = useState([]);
    const [filteredDesignations, setFilteredDesignations] = useState([]);
    const [loadingDepts, setLoadingDepts] = useState(true);
    const [loadingDesigs, setLoadingDesigs] = useState(false);

    // Form Data
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        dateOfBirth: '', gender: '',
        address: '', city: '', state: '', pinCode: '',
        emergencyContact: { name: '', relationship: '', phone: '' },

        // Nested Structures
        jobInfo: {
            department: '', designation: '', location: '', reportingManager: ''
        },
        employmentDetails: {
            employmentType: 'Full-time',
            employmentStatus: 'Active',
            joiningDate: new Date().toISOString().split('T')[0],
            probationPeriod: 0,
            confirmationDate: ''
        },

        // Statutory
        salary: '', bankAccount: '', panCard: '', aadharCard: '',
        uan: '', pfNumber: '', esiNumber: '', taxDeduction: 0,
        isPfEligible: true, isEsiEligible: true
    });

    // Document State
    const [documents, setDocuments] = useState([]);
    const [uploadQueue, setUploadQueue] = useState([]); // { type, file, status }
    const [credentials, setCredentials] = useState(null); // { email, password }

    // Reporting Managers Options
    const [managers, setManagers] = useState([]);

    // Validation Errors
    const [errors, setErrors] = useState({});

    // Load initial data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoadingDepts(true);
                const [deptRes, desigRes, locRes, mgrRes] = await Promise.all([
                    departmentAPI.getAll(),
                    designationAPI.getAll(),
                    locationAPI.getAll(),
                    employeeAPI.getAll({ limit: 1000, status: 'Active' })
                ]);
                setDepartments(deptRes.data.data);
                setDesignations(desigRes.data.data);
                setLocations(locRes.data.data);
                setManagers(mgrRes.data.data.employees);
            } catch (err) {
                console.error('Failed to fetch initial data', err);
                showError('Failed to load form dependencies');
            } finally {
                setLoadingDepts(false);
            }
        };
        fetchData();

        if (employeeId) {
            setIsEditMode(true);
            loadEmployeeData();
        }
    }, [employeeId]);

    // Filter Designations when Department changes
    useEffect(() => {
        if (formData.jobInfo.department && designations.length > 0) {
            const filtered = designations.filter(d =>
                (typeof d.department === 'object' ? d.department._id === formData.jobInfo.department : d.department === formData.jobInfo.department)
            );
            setFilteredDesignations(filtered);
        } else {
            setFilteredDesignations([]);
        }
    }, [formData.jobInfo.department, designations]);

    const loadEmployeeData = async () => {
        try {
            setLoading(true);
            const res = await employeeAPI.getById(employeeId);
            const emp = res.data.data.employee;

            const formatDate = (d) => d ? new Date(d).toISOString().split('T')[0] : '';

            setFormData({
                firstName: emp.firstName || '',
                lastName: emp.lastName || '',
                email: emp.email || '',
                phone: emp.phone || '',
                dateOfBirth: formatDate(emp.dateOfBirth),
                gender: emp.gender || '',
                address: emp.address || '',
                city: emp.city || '',
                state: emp.state || '',
                pinCode: emp.pinCode || '',
                emergencyContact: emp.emergencyContact || { name: '', relationship: '', phone: '' },
                jobInfo: {
                    department: emp.jobInfo?.department?._id || emp.jobInfo?.department || '',
                    designation: emp.jobInfo?.designation?._id || emp.jobInfo?.designation || '',
                    location: emp.jobInfo?.location?._id || emp.jobInfo?.location || '',
                    reportingManager: emp.jobInfo?.reportingManager?._id || emp.jobInfo?.reportingManager || ''
                },
                employmentDetails: {
                    employmentType: emp.employmentDetails?.employmentType || 'Full-time',
                    employmentStatus: emp.employmentDetails?.employmentStatus || 'Active',
                    joiningDate: formatDate(emp.employmentDetails?.joiningDate),
                    probationPeriod: emp.employmentDetails?.probationPeriod || 0,
                    confirmationDate: formatDate(emp.employmentDetails?.confirmationDate)
                },
                salary: emp.salary || '',
                bankAccount: emp.bankAccount || '',
                panCard: emp.panCard || '',
                aadharCard: emp.aadharCard || '',
                uan: emp.uan || '',
                pfNumber: emp.pfNumber || '',
                esiNumber: emp.esiNumber || '',
                taxDeduction: emp.taxDeduction || 0,
                isPfEligible: emp.isPfEligible ?? true,
                isEsiEligible: emp.isEsiEligible ?? true
            });
            setDocuments(emp.documents || []);
        } catch (err) {
            showError('Failed to load employee data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('jobInfo.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                jobInfo: { ...prev.jobInfo, [field]: value }
            }));
        } else if (name.startsWith('employmentDetails.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                employmentDetails: { ...prev.employmentDetails, [field]: value }
            }));
        } else if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => {
                const newData = { ...prev, [name]: value };
                if (name === 'salary') {
                    const salary = Number(value);
                    newData.isPfEligible = salary <= 15000;
                    newData.isEsiEligible = salary <= 21000;
                }
                return newData;
            });
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const validateStep = (step) => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        if (step === 0) {
            if (!formData.firstName.trim()) newErrors.firstName = 'Required';
            if (!formData.lastName.trim()) newErrors.lastName = 'Required';
            if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = 'Valid Email Required';
            if (!formData.phone || !phoneRegex.test(formData.phone)) newErrors.phone = '10-digit Phone Required';
        }

        if (step === 1) {
            if (!formData.jobInfo.department) newErrors['jobInfo.department'] = 'Required';
            if (!formData.jobInfo.designation) newErrors['jobInfo.designation'] = 'Required';
            if (!formData.jobInfo.location) newErrors['jobInfo.location'] = 'Required';
            if (!formData.salary || Number(formData.salary) <= 0) newErrors.salary = 'Valid Salary Required';
        }

        if (step === 2) {
            if (formData.isPfEligible && !formData.uan) newErrors.uan = 'Required for PF Eligible';
            if (formData.isEsiEligible && !formData.esiNumber) newErrors.esiNumber = 'Required for ESI Eligible';
        }

        if (step === 3) {
            const hasAadhaar = uploadQueue.some(item => item.type === 'Aadhaar Card') || documents.some(doc => doc.name === 'Aadhaar Card');
            const hasPan = uploadQueue.some(item => item.type === 'PAN Card') || documents.some(doc => doc.name === 'PAN Card');
            if (!hasAadhaar) newErrors.aadhaar = 'Aadhaar Card is mandatory';
            if (!hasPan) newErrors.pan = 'PAN Card is mandatory';
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

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showError('File size exceeds 5MB limit');
            return;
        }
        setUploadQueue(prev => [...prev, { type, file, status: 'pending' }]);
    };

    const removeFileFromQueue = (index) => {
        setUploadQueue(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (submittingRef.current || loading) return;
        if (!validateStep(activeStep)) return;

        submittingRef.current = true;
        setLoading(true);

        try {
            let empId = employeeId;
            if (isEditMode) {
                await employeeAPI.update(employeeId, formData);
                showSuccess('Employee Details Updated');
                onSuccess();
            } else {
                const res = await employeeAPI.create(formData);
                empId = res.data.data.employee._id;
                if (res.data.data.generatedPassword) {
                    setCredentials({
                        email: formData.email,
                        password: res.data.data.generatedPassword
                    });
                    showSuccess('Employee Created');
                } else {
                    showSuccess('Employee Created');
                    onSuccess();
                }
            }

            if (uploadQueue.length > 0) {
                const uploadPromises = uploadQueue.map(item => {
                    const data = new FormData();
                    data.append('file', item.file);
                    data.append('documentType', item.type);
                    return employeeAPI.uploadDocument(empId, data);
                });
                await Promise.all(uploadPromises);
            }
        } catch (err) {
            console.error(err);
            if (err.response?.data?.errors) {
                const servErrors = {};
                err.response.data.errors.forEach(e => {
                    const field = e.field || e.param;
                    servErrors[field] = e.message || e.msg;
                });
                setErrors(servErrors);
                showError('Validation Failed');
            } else {
                showError(err.response?.data?.message || 'Operation Failed');
            }
            submittingRef.current = false;
            setLoading(false);
        }
    };

    const handleCloseCredentials = () => {
        setCredentials(null);
        onSuccess();
    };

    const handleVerifyDoc = async (docId, status) => {
        try {
            await employeeAPI.verifyDocument(employeeId, docId, { status });
            showSuccess(`Document ${status}`);
            loadEmployeeData();
        } catch (err) {
            showError('Verification Failed');
        }
    };

    const calculateCompletionProgress = () => {
        // Simple logic for illustration
        let score = 0;
        if (formData.firstName && formData.lastName) score += 20;
        if (formData.jobInfo.department && formData.jobInfo.designation) score += 20;
        if (formData.salary) score += 20;
        if (documents.length > 0 || uploadQueue.length > 0) score += 20;
        if (formData.phone && formData.email) score += 20;
        return score;
    };

    return (
        <Box sx={{ maxWidth: 900, mx: 'auto', p: 2 }}>
            <Dialog open={!!credentials} onClose={handleCloseCredentials} maxWidth="xs" fullWidth>
                <DialogTitle>Employee Created Successfully!</DialogTitle>
                <DialogContent>
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h6">Login Credentials</Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            Share these with the employee. This password is shown only once.
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: '#f9f9f9' }}>
                            <Typography align="left"><strong>Email:</strong> {credentials?.email}</Typography>
                            <Typography align="left"><strong>Password:</strong> {credentials?.password}</Typography>
                        </Paper>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCredentials} variant="contained" fullWidth>Done</Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="textSecondary">Profile Completion:</Typography>
                    <Chip label={`${calculateCompletionProgress()}%`} color="primary" size="small" />
                </Box>
            </Box>

            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map(label => (
                    <Step key={label}><StepLabel>{label}</StepLabel></Step>
                ))}
            </Stepper>

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
                            <FormControl fullWidth required error={!!errors['jobInfo.department']}>
                                <InputLabel>Department</InputLabel>
                                <Select name="jobInfo.department" value={formData.jobInfo.department} onChange={handleChange} label="Department">
                                    {departments.map(dept => (
                                        <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required error={!!errors['jobInfo.designation']}>
                                <InputLabel>Designation</InputLabel>
                                <Select name="jobInfo.designation" value={formData.jobInfo.designation} onChange={handleChange} label="Designation" disabled={!formData.jobInfo.department}>
                                    {filteredDesignations.map(desig => (
                                        <MenuItem key={desig._id} value={desig._id}>{desig.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Location</InputLabel>
                                <Select name="jobInfo.location" value={formData.jobInfo.location} onChange={handleChange} label="Location">
                                    {locations.map(loc => (
                                        <MenuItem key={loc._id} value={loc._id}>{loc.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Reporting Manager</InputLabel>
                                <Select name="jobInfo.reportingManager" value={formData.jobInfo.reportingManager} onChange={handleChange} label="Reporting Manager">
                                    <MenuItem value="">None</MenuItem>
                                    {managers.filter(m => m._id !== employeeId).map(mgr => (
                                        <MenuItem key={mgr._id} value={mgr._id}>{mgr.firstName} {mgr.lastName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Salary" type="number" name="salary" value={formData.salary} onChange={handleChange} error={!!errors.salary} helperText={errors.salary} required />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="PAN Card" name="panCard" value={formData.panCard} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Aadhaar Card" name="aadharCard" value={formData.aadharCard} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Joining Date" type="date" name="employmentDetails.joiningDate" value={formData.employmentDetails.joiningDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 2 && (
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                PF/ESI Eligibility is auto-calculated based on salary.
                            </Alert>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="UAN" name="uan" value={formData.uan} onChange={handleChange} error={!!errors.uan} helperText={errors.uan} disabled={!formData.isPfEligible} required={formData.isPfEligible} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="ESI Number" name="esiNumber" value={formData.esiNumber} onChange={handleChange} error={!!errors.esiNumber} helperText={errors.esiNumber} disabled={!formData.isEsiEligible} required={formData.isEsiEligible} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="PF Number" name="pfNumber" value={formData.pfNumber} onChange={handleChange} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField fullWidth label="Bank Account" name="bankAccount" value={formData.bankAccount} onChange={handleChange} />
                        </Grid>
                    </Grid>
                )}

                {activeStep === 3 && (
                    <Box>
                        <Typography variant="h6" gutterBottom>Documents</Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {['Aadhaar Card', 'PAN Card', 'Resume', 'Photo'].map(type => (
                                <Grid item xs={12} sm={6} md={3} key={type}>
                                    <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} fullWidth>
                                        {type}
                                        <input type="file" hidden onChange={e => handleFileSelect(e, type)} />
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>

                        {uploadQueue.length > 0 && (
                            <Box sx={{ mb: 3 }}>
                                <Typography variant="subtitle2">Pending Uploads:</Typography>
                                {uploadQueue.map((item, idx) => (
                                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#f5f5f5', mt: 1 }}>
                                        <Typography variant="body2">{item.type}: {item.file.name}</Typography>
                                        <IconButton size="small" onClick={() => removeFileFromQueue(idx)}><DeleteIcon /></IconButton>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {(errors.aadhaar || errors.pan) && (
                            <Box sx={{ mb: 2 }}>
                                {errors.aadhaar && <Alert severity="error" sx={{ mb: 1 }}>{errors.aadhaar}</Alert>}
                                {errors.pan && <Alert severity="error">{errors.pan}</Alert>}
                            </Box>
                        )}

                        {isEditMode && documents.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>Uploaded Documents:</Typography>
                                <Grid container spacing={2}>
                                    {documents.map(doc => (
                                        <Grid item xs={12} key={doc._id}>
                                            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box>
                                                    <Typography variant="subtitle2">{doc.name}</Typography>
                                                    <Chip label={doc.status} size="small" color={doc.status === 'Verified' ? 'success' : 'warning'} />
                                                </Box>
                                                <Box>
                                                    <IconButton size="small" onClick={() => window.open(`/${doc.filePath}`, '_blank')}><VisibilityIcon /></IconButton>
                                                    {hasPermission('manage_employees') && doc.status === 'Pending' && (
                                                        <Button size="small" color="primary" onClick={() => handleVerifyDoc(doc._id, 'Verified')}>Verify</Button>
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                {activeStep > 0 && <Button onClick={handleBack} disabled={loading}>Back</Button>}
                {activeStep < steps.length - 1 ? (
                    <Button variant="contained" onClick={handleNext}>Next</Button>
                ) : (
                    <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update' : 'Create')}
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default EmployeeForm;
