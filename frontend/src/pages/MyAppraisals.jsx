import { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Grid,
    Chip, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Alert,
    Stack, Divider
} from '@mui/material';
import {
    Verified as VerifiedIcon,
    DateRange as DateIcon,
    ArrowUpward as IncrementIcon
} from '@mui/icons-material';
import { appraisalAPI } from '../utils/api';

const MyAppraisals = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await appraisalAPI.getMyHistory();
            setHistory(res.data.data);
        } catch (err) {
            setError('Failed to load appraisal history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>My Appraisals</Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {history.length === 0 ? (
                <Card sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                    <Typography color="textSecondary">No appraisal records found.</Typography>
                </Card>
            ) : (
                <Grid container spacing={3}>
                    {history.map((record) => (
                        <Grid item xs={12} key={record._id}>
                            <Card sx={{ borderRadius: 3, boxShadow: 'none', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                <Box sx={{ bgcolor: '#F9FAFB', p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <DateIcon sx={{ color: '#6B7280', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight="700">
                                            {record.appraisalCycleId?.name}
                                        </Typography>
                                    </Stack>
                                    <Chip
                                        label="Approved"
                                        size="small"
                                        color="success"
                                        icon={<VerifiedIcon style={{ fontSize: 14 }} />}
                                    />
                                </Box>
                                <CardContent>
                                    <Grid container spacing={4} alignItems="center">
                                        <Grid item xs={12} md={4}>
                                            <Box>
                                                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Rating</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                    <Typography variant="h4" fontWeight="bold" color="primary">{record.finalRating}</Typography>
                                                    <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>/ 5</Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                <Box>
                                                    <Typography variant="caption" color="textSecondary">Increment Details</Typography>
                                                    <Typography variant="body1" fontWeight="700" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <IncrementIcon sx={{ color: '#10B981', fontSize: 18 }} />
                                                        {record.incrementType === 'Percentage' ? `${record.incrementValue}%` : `₹${record.incrementValue.toLocaleString()}`}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" color="textSecondary">Effective From</Typography>
                                                    <Typography variant="body1" fontWeight="600">
                                                        {new Date(record.effectiveFrom).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ p: 2, bgcolor: '#F3F4F6', borderRadius: 2 }}>
                                                <Typography variant="caption" color="textSecondary">Salary Impact</Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="body2" color="textSecondary" sx={{ textDecoration: 'line-through' }}>
                                                        ₹{record.oldCTC?.toLocaleString()}
                                                    </Typography>
                                                    <Typography variant="h6" fontWeight="bold" color="#111827">
                                                        ₹{record.newCTC?.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>

                                        {record.newDesignation && record.newDesignation._id !== record.previousDesignation?._id && (
                                            <Grid item xs={12}>
                                                <Divider sx={{ mb: 2 }} />
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Typography variant="body2" fontWeight="bold">Promotion:</Typography>
                                                    <Typography variant="body2">{record.previousDesignation?.name} → <b>{record.newDesignation?.name}</b></Typography>
                                                </Box>
                                            </Grid>
                                        )}

                                        {record.remarks && (
                                            <Grid item xs={12}>
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography variant="caption" color="textSecondary">HR Remarks</Typography>
                                                    <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>"{record.remarks}"</Typography>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Box>
    );
};

export default MyAppraisals;
