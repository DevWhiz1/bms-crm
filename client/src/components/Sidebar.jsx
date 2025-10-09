import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Avatar,
  Chip,
} from '@mui/material'
import {
  Dashboard,
  People,
  Settings,
  Description,
  Speed,
  Assessment,
} from '@mui/icons-material'
import { useAuth } from '../contexts/AuthContext'

const drawerWidth = 280

const menuItems = [
  {
    text: 'Dashboard',
    icon: <Dashboard />,
    path: '/dashboard',
  },
  {
    text: 'Tenants',
    icon: <People />,
    path: '/tenants',
  },
  {
    text: 'Contracts',
    icon: <Description />,
    path: '/contracts',
  },
  {
    text: 'Meters',
    icon: <Speed />,
    path: '/meters',
  },
  {
    text: 'Meter Readings',
    icon: <Assessment />,
    path: '/meter-readings',
  },
]

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path) => {
    navigate(path)
  }

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      {/* <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              mr: 2,
              width: 40,
              height: 40,
            }}
          >
    
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              BMS CRM
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Business Management System
            </Typography>
          </Box>
        </Box>
      </Box> */}

      {/* User Info */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Box display="flex" alignItems="center" mb={1}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              mr: 2,
              width: 36,
              height: 36,
              fontSize: '0.9rem',
            }}
          >
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight="600">
              {user?.full_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
            <Chip
          label={`Level ${user?.account_level || "nan"}`}
          size="small"
          color="primary"
          variant="outlined"
        />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'primary.light',
                    color: isActive ? 'white' : 'primary.contrastText',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>

      <Divider />

      {/* Settings */}
      <List>
        <ListItem disablePadding>
          <ListItemButton
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 1,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  )

  return (
    <Drawer
      variant={open ? 'permanent' : 'temporary'}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.3s ease',
          top: 64, 
          height: 'calc(100% - 64px)', 
        },
      }}
    >
      {drawerContent}
    </Drawer>
  )
}

export default Sidebar
