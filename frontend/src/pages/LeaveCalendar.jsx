import React from 'react';
import { Box } from '@mui/material';
import SharedCalendar from '../components/SharedCalendar';
import { useAuth } from '../contexts/AuthContext';

const LeaveCalendar = () => {
    const { user } = useAuth();

    return (
        <Box sx={{ height: 'calc(100vh - 100px)' }}>
            <SharedCalendar user={user} />
        </Box>
    );
};

export default LeaveCalendar;
