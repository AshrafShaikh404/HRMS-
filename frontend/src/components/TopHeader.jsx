import { AppBar, Toolbar, IconButton, Box, Typography, InputBase, Badge, Avatar, Menu, MenuItem, ListItemIcon, Divider } from '@mui/material';
import { Search, NotificationsOutlined, ChatBubbleOutline, Menu as MenuIcon, Logout, Person, Settings } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

import { useState } from 'react';

function TopHeader({ onMenuClick, user, isMobile, onLogout }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        if (onLogout) onLogout();
    };
    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: 'background.paper',
                borderBottom: '1px solid',
                borderColor: 'divider',
                backdropFilter: 'blur(8px)',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: 70 }}>
                {/* Left Section: Mobile Menu & Search */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isMobile && (
                        <IconButton onClick={onMenuClick} edge="start" sx={{ color: 'text.primary' }}>
                            <MenuIcon />
                        </IconButton>
                    )}

                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            backgroundColor: 'background.default',
                            borderRadius: 2,
                            px: 2,
                            py: 1,
                            width: 300,
                        }}
                    >
                        <Search sx={{ color: 'text.secondary', mr: 1 }} />
                        <InputBase
                            placeholder="Search here..."
                            sx={{ width: '100%', fontSize: '0.95rem' }}
                        />
                    </Box>
                </Box>

                {/* Right Section: Actions & Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton size="medium" sx={{ color: 'text.secondary', bgcolor: 'background.default' }}>
                        <ChatBubbleOutline fontSize="small" />
                    </IconButton>

                    <IconButton size="medium" sx={{ color: 'text.secondary', bgcolor: 'background.default' }}>
                        <Badge badgeContent={3} color="primary">
                            <NotificationsOutlined fontSize="small" />
                        </Badge>
                    </IconButton>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        ml: 1.5,
                        pl: 1.5,
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer'
                    }}
                        onClick={handleProfileClick}
                    >
                        <Avatar
                            src={user?.avatar}
                            alt={user?.name}
                            sx={{ width: 40, height: 40, border: '2px solid white', boxShadow: 1 }}
                        >
                            {user?.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
                                {user?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {typeof user?.role === 'string' ? user?.role : user?.role?.name || 'User'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* User Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        onClick={handleClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                '& .MuiAvatar-root': {
                                    width: 32,
                                    height: 32,
                                    ml: -0.5,
                                    mr: 1,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <Person fontSize="small" />
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                            <ListItemIcon>
                                <Settings fontSize="small" />
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default TopHeader;
