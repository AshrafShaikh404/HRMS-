import { Box, Card, Typography, Checkbox, IconButton, Button } from '@mui/material';
import {
    CalendarToday as CalendarIcon,
    Add as AddIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';

const TodoCard = () => {
    const todos = [
        { id: 1, text: 'Add Holidays', completed: false },
        { id: 2, text: 'Add Meeting to Client', completed: true },
        { id: 3, text: 'Chat with Adrian', completed: false },
        { id: 4, text: 'Management Call', completed: false },
        { id: 5, text: 'Add Payroll', completed: false },
        { id: 6, text: 'Add Policy for Increment', completed: false }
    ];

    return (
        <Card sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            boxShadow: 'none',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f1f1f', fontSize: '1rem' }}>
                    Todo
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        px: 1,
                        py: 0.5,
                        border: '1px solid #E5E7EB',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        cursor: 'pointer',
                        bgcolor: '#fff'
                    }}>
                        <CalendarIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#6B7280' }}>Today</Typography>
                    </Box>
                    <Box sx={{
                        width: 24,
                        height: 24,
                        bgcolor: '#FF9B44',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(255, 155, 68, 0.3)'
                    }}>
                        <AddIcon sx={{ color: '#fff', fontSize: 18 }} />
                    </Box>
                </Box>
            </Box>

            {/* Todo List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
                {todos.map((todo) => (
                    <Box
                        key={todo.id}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 0.5,
                            pl: 1,
                            borderRadius: 2,
                            border: '1px solid #F3F4F6',
                            bgcolor: todo.completed ? '#FFF7F0' : '#fff',
                            transition: 'all 0.2s ease',
                            '&:hover': { bgcolor: todo.completed ? '#FFF0E5' : '#F9FAFB' }
                        }}
                    >
                        <DragIcon sx={{ fontSize: 18, color: '#D1D5DB' }} />
                        <Checkbox
                            checked={todo.completed}
                            size="small"
                            sx={{
                                color: '#D1D5DB',
                                '&.Mui-checked': { color: '#FF9B44' },
                                p: 0.5
                            }}
                        />
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: 600,
                                color: todo.completed ? '#374151' : '#4B5563',
                                fontSize: '0.813rem',
                                textDecoration: todo.completed ? 'line-through' : 'none',
                                flex: 1
                            }}
                        >
                            {todo.text}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Card>
    );
};

export default TodoCard;
