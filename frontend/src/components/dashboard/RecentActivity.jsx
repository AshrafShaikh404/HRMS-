import { Box, Paper, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, alpha } from '@mui/material';
import { PersonAdd, Article } from '@mui/icons-material';

const RecentActivity = ({ activities }) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                    Recent Activity
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Latest employee onboardings
                </Typography>
            </Box>

            <List disablePadding>
                {activities.map((activity, index) => (
                    <ListItem
                        key={index}
                        disablePadding
                        sx={{
                            mb: 2,
                            '&:last-child': { mb: 0 }
                        }}
                    >
                        <ListItemAvatar>
                            <Avatar
                                sx={{
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    borderRadius: 3
                                }}
                            >
                                <PersonAdd fontSize="small" />
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography variant="subtitle2" fontWeight={600}>
                                    {activity.name}
                                </Typography>
                            }
                            secondary={
                                <Box component="span" sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Joined as {activity.department}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                        {new Date(activity.addedAt).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            }
                        />
                    </ListItem>
                ))}

                {activities.length === 0 && (
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                        No recent activity found.
                    </Typography>
                )}
            </List>
        </Paper>
    );
};

export default RecentActivity;
