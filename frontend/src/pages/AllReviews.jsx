import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    TextField,
    Rating,
    Alert,
    Chip,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    IconButton
} from '@mui/material';
import {
    CheckCircle as FinalizeIcon,
    RateReview as RateReviewIcon,
    Visibility as ViewIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { performanceReviewAPI, reviewCycleAPI, departmentAPI } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';

const AllReviews = () => {
    const { showSuccess, showError } = useNotification();
    const [reviews, setReviews] = useState([]);
    const [reviewCycles, setReviewCycles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [filters, setFilters] = useState({
        reviewCycleId: '',
        status: '',
        department: ''
    });

    useEffect(() => {
        fetchAllReviews();
        fetchReviewCycles();
        fetchDepartments();
    }, [filters]);

    const fetchAllReviews = async () => {
        try {
            setLoading(true);
            const response = await performanceReviewAPI.getAllReviews(filters);
            // Axios response data is in .data
            if (response.data.success) {
                setReviews(response.data.data);
            } else {
                showError(response.data.message || 'Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            showError('Error fetching reviews');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewCycles = async () => {
        try {
            const response = await reviewCycleAPI.getReviewCycles();
            if (response.data.success) {
                setReviewCycles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching review cycles:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await departmentAPI.getAll();
            if (response.data.success) {
                setDepartments(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleHRRatingChange = (rating) => {
        setSelectedReview(prev => ({ ...prev, hrRating: rating }));
    };

    const handleFinalizeReview = async () => {
        try {
            setSubmitting(true);

            const payload = {
                reviewId: selectedReview._id
            };

            const response = await performanceReviewAPI.finalizeReview(payload);
            if (response.success) {
                showSuccess('Review finalized successfully');
                setOpenDialog(false);
                setSelectedReview(null);
                fetchAllReviews();
            } else {
                showError(response.message || 'Failed to finalize review');
            }
        } catch (error) {
            showError('Error finalizing review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSubmitHRReview = async () => {
        try {
            setSubmitting(true);

            const payload = {
                reviewId: selectedReview._id,
                hrRating: selectedReview.hrRating
            };

            const response = await performanceReviewAPI.submitHRReview(payload);
            if (response.success) {
                showSuccess('HR review submitted successfully');
                setOpenDialog(false);
                setSelectedReview(null);
                fetchAllReviews();
            } else {
                showError(response.message || 'Failed to submit HR review');
            }
        } catch (error) {
            showError('Error submitting HR review');
        } finally {
            setSubmitting(false);
        }
    };

    const openReviewDialog = (review) => {
        setSelectedReview(review);
        setOpenDialog(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Not Started': return 'warning';
            case 'Self Submitted': return 'info';
            case 'Manager Reviewed': return 'primary';
            case 'HR Reviewed': return 'secondary';
            case 'Finalized': return 'success';
            default: return 'default';
        }
    };

    const canSubmitHR = (review) => review?.status === 'Manager Reviewed';
    const canFinalize = (review) => review?.status === 'HR Reviewed';

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading reviews...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                All Performance Reviews
            </Typography>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                {/* ... existing filters ... */}
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Review Cycle</InputLabel>
                            <Select
                                value={filters.reviewCycleId}
                                label="Review Cycle"
                                onChange={(e) => setFilters(prev => ({ ...prev, reviewCycleId: e.target.value }))}
                            >
                                <MenuItem value="">All Cycles</MenuItem>
                                {reviewCycles.map(cycle => (
                                    <MenuItem key={cycle._id} value={cycle._id}>
                                        {cycle.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            >
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="Not Started">Not Started</MenuItem>
                                <MenuItem value="Self Submitted">Self Submitted</MenuItem>
                                <MenuItem value="Manager Reviewed">Manager Reviewed</MenuItem>
                                <MenuItem value="HR Reviewed">HR Reviewed</MenuItem>
                                <MenuItem value="Finalized">Finalized</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={filters.department}
                                label="Department"
                                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                            >
                                <MenuItem value="">All Departments</MenuItem>
                                {departments.map(dept => (
                                    <MenuItem key={dept._id} value={dept._id}>
                                        {dept.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </Paper>

            {/* Reviews Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Self Rating</TableCell>
                            <TableCell>Manager Rating</TableCell>
                            <TableCell>HR Rating</TableCell>
                            <TableCell>Final Rating</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {reviews.map((review) => (
                            <TableRow key={review._id}>
                                <TableCell>
                                    {review.employeeId?.firstName} {review.employeeId?.lastName}
                                </TableCell>
                                <TableCell>
                                    {review.employeeId?.jobInfo?.department?.name || '-'}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={review.status}
                                        color={getStatusColor(review.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {review.selfRating ? (
                                        <Rating value={review.selfRating} readOnly size="small" precision={0.5} />
                                    ) : '-'}
                                </TableCell>
                                <TableCell>
                                    {review.managerRating ? (
                                        <Rating value={review.managerRating} readOnly size="small" precision={0.5} />
                                    ) : '-'}
                                </TableCell>
                                <TableCell>
                                    {review.hrRating ? (
                                        <Rating value={review.hrRating} readOnly size="small" precision={0.5} />
                                    ) : '-'}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight="bold">
                                        {review.finalRating ? review.finalRating.toFixed(2) : '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        color="primary"
                                        onClick={() => openReviewDialog(review)}
                                        size="small"
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    {canFinalize(review) && (
                                        <IconButton
                                            color="success"
                                            onClick={() => openReviewDialog(review)}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        >
                                            <FinalizeIcon />
                                        </IconButton>
                                    )}
                                    {canSubmitHR(review) && (
                                        <IconButton
                                            color="secondary"
                                            onClick={() => openReviewDialog(review)}
                                            size="small"
                                            sx={{ ml: 1 }}
                                        >
                                            <RateReviewIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Review Details Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Performance Review: {selectedReview?.employeeId?.firstName} {selectedReview?.employeeId?.lastName}
                </DialogTitle>
                <DialogContent>
                    {selectedReview && (
                        <Grid container spacing={2}>
                            {/* Review Summary */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 2, mb: 2 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Review Summary
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2" gutterBottom>
                                                Status:
                                            </Typography>
                                            <Chip
                                                label={selectedReview.status}
                                                color={getStatusColor(selectedReview.status)}
                                                size="small"
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2" gutterBottom>
                                                Self Rating:
                                            </Typography>
                                            {selectedReview.selfRating ? (
                                                <Rating value={selectedReview.selfRating} readOnly size="small" precision={0.5} />
                                            ) : '-'}
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2" gutterBottom>
                                                Manager Rating:
                                            </Typography>
                                            {selectedReview.managerRating ? (
                                                <Rating value={selectedReview.managerRating} readOnly size="small" precision={0.5} />
                                            ) : '-'}
                                        </Grid>
                                        <Grid item xs={6} md={3}>
                                            <Typography variant="body2" gutterBottom>
                                                HR Rating:
                                            </Typography>
                                            {selectedReview.hrRating ? (
                                                <Rating value={selectedReview.hrRating} readOnly size="small" precision={0.5} />
                                            ) : '-'}
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="h6">
                                            Final Rating: {selectedReview.finalRating ? selectedReview.finalRating.toFixed(2) : '-'}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Goals Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Goals & Feedback
                                </Typography>

                                {selectedReview.goals?.map((goal) => (
                                    <Card key={goal.goalId._id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography variant="subtitle1" gutterBottom>
                                                {goal.goalId.title}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                {goal.goalId.description}
                                            </Typography>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="body2" gutterBottom>
                                                        Progress: {goal.finalProgress}%
                                                    </Typography>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={goal.finalProgress}
                                                        sx={{ mb: 2 }}
                                                    />
                                                    <Typography variant="body2" gutterBottom>
                                                        Weightage: {goal.goalId.weightage}%
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="body2" gutterBottom>
                                                        Employee Comments:
                                                    </Typography>
                                                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2, maxHeight: 100, overflow: 'auto' }}>
                                                        <Typography variant="body2">
                                                            {goal.selfComment || 'No comments provided'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>

                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="body2" gutterBottom>
                                                        Manager Comments:
                                                    </Typography>
                                                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, maxHeight: 100, overflow: 'auto' }}>
                                                        <Typography variant="body2">
                                                            {goal.managerComment || 'No comments provided'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Grid>

                            {/* HR Rating Section */}
                            {(selectedReview.status === 'Manager Reviewed' || selectedReview.status === 'HR Reviewed') && (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 2 }}>
                                        <Typography variant="h6" gutterBottom>
                                            HR Final Review
                                        </Typography>
                                        <Typography variant="body2" gutterBottom>
                                            {canSubmitHR(selectedReview) ? 'Enter HR rating:' : 'Current HR rating:'}
                                        </Typography>
                                        <Rating
                                            value={selectedReview.hrRating || 0}
                                            onChange={(event, newValue) => handleHRRatingChange(newValue)}
                                            readOnly={!canSubmitHR(selectedReview)}
                                            size="large"
                                            precision={0.5}
                                        />
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Current Rating: {selectedReview.hrRating || 0} / 5
                                        </Typography>
                                    </Paper>
                                </Grid>
                            )}
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Close
                    </Button>
                    {selectedReview && canSubmitHR(selectedReview) && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmitHRReview}
                            disabled={!selectedReview?.hrRating || submitting}
                            startIcon={<RateReviewIcon />}
                        >
                            {submitting ? 'Submitting...' : 'Submit HR Review'}
                        </Button>
                    )}
                    {selectedReview && canFinalize(selectedReview) && (
                        <Button
                            variant="contained"
                            color="success"
                            onClick={handleFinalizeReview}
                            disabled={submitting}
                            startIcon={<FinalizeIcon />}
                        >
                            {submitting ? 'Finalizing...' : 'Finalize Review'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AllReviews;
