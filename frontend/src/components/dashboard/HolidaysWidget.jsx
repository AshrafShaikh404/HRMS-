import { Card, Typography, Box } from '@mui/material';

const HolidaysWidget = ({ holidays }) => {
    // If no holidays, show empty state (NO DUMMY DATA)
    const hasHolidays = holidays && holidays.length > 0;

    return (
        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Upcoming Holidays
            </Typography>

            {!hasHolidays ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150 }}>
                    <Typography variant="body2" color="text.secondary">No upcoming holidays.</Typography>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {holidays.map((holiday, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                                <Typography variant="subtitle2" fontWeight={700}>
                                    {holiday.date}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {holiday.day}
                                </Typography>
                            </Box>
                            <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                                {holiday.name}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Card>
    );
};

export default HolidaysWidget;
