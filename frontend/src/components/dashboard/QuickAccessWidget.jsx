import { Card, Typography, List, ListItem, ListItemText, ListItemButton, IconButton } from '@mui/material';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';

const QuickAccessWidget = () => {
    const items = [
        'Reimbursement Payslip',
        'IT Statement',
        'YTD Reports'
    ];

    return (
        <Card elevation={0} sx={{ p: 3, height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
                Quick Access
            </Typography>
            <List disablePadding>
                {items.map((item, index) => (
                    <ListItemButton key={index} sx={{ px: 0, py: 1.5 }}>
                        <ListItemText
                            primary={item}
                            primaryTypographyProps={{ fontWeight: 500, color: 'text.secondary' }}
                        />
                        <ArrowForwardIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                    </ListItemButton>
                ))}
            </List>
        </Card>
    );
};

export default QuickAccessWidget;
