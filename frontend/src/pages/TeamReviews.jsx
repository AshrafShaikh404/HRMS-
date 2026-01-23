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
    Select
} from '@mui/material';
import {
    RateReviewIcon,
    Send as SubmitIcon,
    Visibility as ViewIcon
} from '@mui/icons-material';
import { performanceReviewAPI, reviewCycleAPI } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';

const TeamReviews = () => {
    const { showSuccess, showError } = useNotification();
    const [reviews, setReviews] = useState([]);
    const [reviewCycles, setReviewCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [filters, setFilters] = useState({
        reviewCycleId: '',
        status: ''
    });

    useEffect(() => {
        fetchTeamReviews();
        fetchReviewCycles();
    }, [filters]);

    const fetchTeamReviews = async () => {
        try {
            setLoading(true);
            const response = await performanceReviewAPI.getTeamReviews(filters);
            if (response.success) {
                setReviews(response.data);
            } else {
                showError(response.message || 'Failed to fetch team reviews');
            }
        } catch (error) {
            showError('Error fetching team reviews');
        } finally {
            setLoading(false);
        }
    };

    const fetchReviewCycles = async () => {
        try {
            const response = await reviewCycleAPI.getReviewCycles();
            if (response.success) {
                setReviewCycles(response.data);
            }
        } catch (error) {
            console.error('Error fetching review cycles:', error);
        }
    };

    const handleManagerCommentChange = (goalId, comment) => {
        setSelectedReview(prev => ({
            ...prev,
            goals: prev.goals.map(goal =>
                goal.goalId._id === goalId
                    ? { ...goal, managerComment: comment }
                    : goal
            )
        }));
    };

    const handleManagerRatingChange = (rating) => {
        setSelectedReview(prev => ({ ...prev, managerRating: rating }));
    };

    const handleSubmitManagerReview = async () => {
        try {
            setSubmitting(true);
            
            const payload = {
                reviewId: selectedReview._id,
                goals: selectedReview.goals.map(goal => ({
                    goalId: goal.goalId._id,
                    managerComment: goal.managerComment
                })),
                managerRating: selectedReview.managerRating
            };

            const response = await performanceReviewAPI.submitManagerReview(payload);
            if (response.success) {
                showSuccess('Manager review submitted successfully');
                setOpenDialog(false);
                setSelectedReview(null);
                fetchTeamReviews();
            } else {
                showError(response.message || 'Failed to submit manager review');
            }
        } catch (error) {
            showError('Error submitting manager review');
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

    const canReview = (review) => review.status === 'Self Submitted';

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading team reviews...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Team Performance Reviews
            </Typography>

            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
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
                    <Grid item xs={12} md={4}>
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
                </Grid>
            </Paper>

            {/* Reviews Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Employee</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Self Rating</TableCell>
                            <TableCell>Manager Rating</TableCell>
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
                                    {review.finalRating ? review.finalRating.toFixed(2) : '-'}
                                </TableCell>
                                <TableCell>
                                    {canReview(review) && (
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<RateReviewIcon />}
                                            onClick={() => openReviewDialog(review)}
                                        >
                                            Review
                                        </Button>
                                    )}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<ViewIcon />}
                                        onClick={() => openReviewDialog(review)}
                                        sx={{ ml: 1 }}
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Review Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    Review: {selectedReview?.employeeId?.firstName} {selectedReview?.employeeId?.lastName}
                </DialogTitle>
                <DialogContent>
                    {selectedReview && (
                        <Grid container spacing={2}>
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
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="body2" gutterBottom>
                                                        Employee Progress: {goal.finalProgress}%
                                                    </Typography>
                                                    <LinearProgress 
                                                        variant="determinate" 
                                                        value={goal.finalProgress} 
                                                        sx={{ mb: 2 }}
                                                    />
                                                    
                                                    <Typography variant="body2" gutterBottom>
                                                        Employee Comments:
                                                    </Typography>
                                                    <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, mb: 2 }}>
                                                        <Typography variant="body2">
                                                            {goal.selfComment || 'No comments provided'}
                                                        </Typography>
                                                    </Box>
                                                </Grid>
                                                
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="body2" gutterBottom>
                                                        Weightage: {goal.goalId.weightage}%
                                                    </Typography>
                                                    
                                                    {canReview(selectedReview) && (
                                                        <TextField
                                                            fullWidth
                                                            multiline
                                                            rows={3}
                                                            label="Manager Comments"
                                                            value={goal.managerComment}
                                                            onChange={(e) => handleManagerCommentChange(goal.goalId._id, e.target.value)}
                                                            placeholder="Provide feedback on this goal..."
                                                            size="small"
                                                        />
                                                    )}
                                                    
                                                    {!canReview(selectedReview) && goal.managerComment && (
                                                        <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                            <Typography variant="body2">
                                                                <strong>Manager Comments:</strong> {goal.managerComment}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Grid>

                            {/* Manager Rating Section */}
                            <Grid item xs={12}>
                                <Typography variant="h6" gutterBottom>
                                    Manager Rating
                                </Typography>
                                
                                {canReview(selectedReview) ? (
                                    <Box>
                                        <Typography variant="body2" gutterBottom>
                                            Rate the employee's overall performance
                                        </Typography>
                                        <Rating
                                            value={selectedReview.managerRating || 0}
                                            onChange={(event, newValue) => handleManagerRatingChange(newValue)}
                                            size="large"
                                            precision={0.5}
                                        />
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            Current Rating: {selectedReview.managerRating || 0} / 5
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography variant="body2" gutterBottom>
                                            Manager rating:
                                        </Typography>
                                        <Rating
                                            value={selectedReview.managerRating || 0}
                                            readOnly
                                            size="large"
                                            precision={0.5}
                                        />
                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                            {selectedReview.managerRating || 0} / 5
                                        </Typography>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>
                        Cancel
                    </Button>
                    {canReview(selectedReview) && (
                        <Button
                            variant="contained"
                            onClick={handleSubmitManagerReview}
                            disabled={!selectedReview?.managerRating || submitting}
                            startIcon={<SubmitIcon />}
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TeamReviews;
