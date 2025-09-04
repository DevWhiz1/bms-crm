import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
  Logout,
  Settings,
  Person,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null)
  }

  const handleLogout = async () => {
    await logout()
    handleProfileMenuClose()
  }

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        width: '100%',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Dashboard
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            size="large"
            aria-label="show notifications"
            color="inherit"
            onClick={handleNotificationMenuOpen}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            size="large"
            edge="end"
            aria-label="account of current user"
            aria-controls="primary-search-account-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.9rem',
              }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase()}
            </Avatar>
          </IconButton>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleProfileMenuClose}
          onClick={handleProfileMenuClose}
          PaperProps={{
            elevation: 3,
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
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <Person fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Typography variant="body2" fontWeight="600">
                {user?.full_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleProfileMenuClose}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationMenuClose}
          PaperProps={{
            elevation: 3,
            sx: {
              width: 320,
              maxHeight: 400,
            },
          }}
        >
          <MenuItem>
            <ListItemText>
              <Typography variant="subtitle2" fontWeight="600">
                Notifications
              </Typography>
            </ListItemText>
          {/* </MenuItem>
          <Divider />
          <MenuItem>
            <ListItemText>
              <Typography variant="body2">
                New customer registered
              </Typography>
              <Typography variant="caption" color="text.secondary">
                2 minutes ago
              </Typography>
            </ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemText>
              <Typography variant="body2">
                Order #1234 completed
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1 hour ago
              </Typography>
            </ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemText>
              <Typography variant="body2">
                Weekly report ready
              </Typography>
              <Typography variant="caption" color="text.secondary">
                3 hours ago
              </Typography>
            </ListItemText> */}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Header
