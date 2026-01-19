import { Box, Typography, Card, Divider } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const PayslipWidget = ({ data }) => {
    // logic to display payroll or leave balance depending on available data
    // If no data, show empty state (NO DUMMY DATA)

    if (!data) {
        return (
            <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ alignSelf: 'flex-start' }}>
                    Payslip
                </Typography>
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No Payslip Data Available</Typography>
                </Box>
            </Card>
        );
    }

    // For now, if we don't have granular payslip data, we might display top level stats
    // Or if we specifically passed null, we show No Data.
    // Assuming data could be { totalDisbursement } for admin

    // Admin View with total disbursement
    if (data.totalDisbursement !== undefined) {
        return (
            <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                    Payroll Summary
                </Typography>
                <Box sx={{ my: 4 }}>
                    <Typography variant="body2" color="text.secondary">Total Disbursement</Typography>
                    <Typography variant="h4" fontWeight={700} color="primary">₹ {data.totalDisbursement.toLocaleString()}</Typography>
                </Box>
            </Card>
        );
    }

    // Default Fallback
    return (
        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
                Payslip
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 150 }}>
                <Typography variant="body2" color="text.secondary">No Payslip Generated</Typography>
            </Box>
        </Card>
    );
};

export default PayslipWidget;
