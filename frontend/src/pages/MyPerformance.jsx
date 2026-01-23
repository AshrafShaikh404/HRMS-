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
    Divider
} from '@mui/material';
import {
    Send as SubmitIcon,
    CheckCircle as CompletedIcon
} from '@mui/icons-material';
import { performanceReviewAPI } from '../utils/api';
import { useNotification } from '../contexts/NotificationContext';

const MyPerformance = () => {
    const { showSuccess, showError } = useNotification();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMyReview();
    }, []);

    const fetchMyReview = async () => {
        try {
            setLoading(true);
            const response = await performanceReviewAPI.getMyReview();
            if (response.success) {
                setReview(response.data);
            } else {
                showError(response.message || 'Failed to fetch performance review');
            }
        } catch (error) {
            showError('Error fetching performance review');
        } finally {
            setLoading(false);
        }
    };

    const handleGoalProgressChange = (goalId, progress) => {
        setReview(prev => ({
            ...prev,
            goals: prev.goals.map(goal =>
                goal.goalId._id === goalId
                    ? { ...goal, finalProgress: progress }
                    : goal
            )
        }));
    };

    const handleSelfCommentChange = (goalId, comment) => {
        setReview(prev => ({
            ...prev,
            goals: prev.goals.map(goal =>
                goal.goalId._id === goalId
                    ? { ...goal, selfComment: comment }
                    : goal
            )
        }));
    };

    const handleSelfRatingChange = (rating) => {
        setReview(prev => ({ ...prev, selfRating: rating }));
    };

    const handleSubmitSelfReview = async () => {
        try {
            setSubmitting(true);
            
            const payload = {
                reviewId: review._id,
                goals: review.goals.map(goal => ({
                    goalId: goal.goalId._id,
                    finalProgress: goal.finalProgress,
                    selfComment: goal.selfComment
                })),
                selfRating: review.selfRating
            };

            const response = await performanceReviewAPI.submitSelfReview(payload);
            if (response.success) {
                showSuccess('Self review submitted successfully');
                setReview(response.data);
            } else {
                showError(response.message || 'Failed to submit self review');
            }
        } catch (error) {
            showError('Error submitting self review');
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = review?.status === 'Not Started' && 
        review.goals?.every(goal => goal.finalProgress >= 0 && goal.finalProgress <= 100) &&
        review.selfRating > 0;

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Loading performance review...</Typography>
            </Box>
        );
    }

    if (!review) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="info">
                    No active performance review found. Please check back during the next review cycle.
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                My Performance Review
            </Typography>
            
            <Box sx={{ mb: 3 }}>
                <Chip 
                    label={`Status: ${review.status}`}
                    color={review.status === 'Not Started' ? 'warning' : 'success'}
                    sx={{ mr: 2 }}
                />
                <Chip 
                    label={`Cycle: ${review.reviewCycleId?.name || 'Active Cycle'}`}
                    variant="outlined"
                />
            </Box>

            {review.status !== 'Not Started' && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    Your self review has been submitted. You cannot make changes at this stage.
                </Alert>
            )}

            <Grid container spacing={3}>
                {/* Goals Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Assigned Goals
                        </Typography>
                        
                        {review.goals?.map((goal, index) => (
                            <Card key={goal.goalId._id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                        {goal.goalId.title}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {goal.goalId.description}
                                    </Typography>

                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="body2" gutterBottom>
                                                Progress: {goal.finalProgress}%
                                            </Typography>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={goal.finalProgress} 
                                                sx={{ mb: 2 }}
                                            />
                                            
                                            {review.status === 'Not Started' && (
                                                <TextField
                                                    fullWidth
                                                    type="number"
                                                    label="Final Progress (%)"
                                                    value={goal.finalProgress}
                                                    onChange={(e) => handleGoalProgressChange(goal.goalId._id, parseInt(e.target.value) || 0)}
                                                    inputProps={{ min: 0, max: 100 }}
                                                    size="small"
                                                />
                                            )}
                                        </Grid>
                                        
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="body2" gutterBottom>
                                                Weightage: {goal.goalId.weightage}%
                                            </Typography>
                                            
                                            {review.status === 'Not Started' && (
                                                <TextField
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                    label="Self Comments"
                                                    value={goal.selfComment}
                                                    onChange={(e) => handleSelfCommentChange(goal.goalId._id, e.target.value)}
                                                    placeholder="Describe your achievements and challenges for this goal..."
                                                    size="small"
                                                />
                                            )}
                                            
                                            {review.status !== 'Not Started' && goal.selfComment && (
                                                <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                    <Typography variant="body2">
                                                        <strong>Your Comments:</strong> {goal.selfComment}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Grid>

                {/* Self Rating Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Self Rating
                        </Typography>
                        
                        {review.status === 'Not Started' ? (
                            <Box>
                                <Typography variant="body2" gutterBottom>
                                    Rate your overall performance
                                </Typography>
                                <Rating
                                    value={review.selfRating || 0}
                                    onChange={(event, newValue) => handleSelfRatingChange(newValue)}
                                    size="large"
                                    precision={0.5}
                                />
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Current Rating: {review.selfRating || 0} / 5
                                </Typography>
                            </Box>
                        ) : (
                            <Box>
                                <Typography variant="body2" gutterBottom>
                                    Your self rating:
                                </Typography>
                                <Rating
                                    value={review.selfRating || 0}
                                    readOnly
                                    size="large"
                                    precision={0.5}
                                />
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {review.selfRating || 0} / 5
                                </Typography>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Submit Section */}
                {review.status === 'Not Started' && (
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<SubmitIcon />}
                                onClick={handleSubmitSelfReview}
                                disabled={!canSubmit || submitting}
                                sx={{ minWidth: 200 }}
                            >
                                {submitting ? 'Submitting...' : 'Submit Self Review'}
                            </Button>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default MyPerformance;
