import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  LinearProgress,
} from '@mui/material'
import {
  TrendingUp,
  People,
  Business,
  Receipt,
  Assignment,
  Notifications,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { tenantAPI } from '../services/api'

const Dashboard = () => {
  const { user } = useAuth()
  const [tenantStats, setTenantStats] = useState({
    total_tenants: 0,
    active_tenants: 0,
    inactive_tenants: 0,
    new_this_month: 0
  })

  // Fetch tenant statistics
  useEffect(() => {
    const fetchTenantStats = async () => {
      try {
        const response = await tenantAPI.getTenantStats()
        setTenantStats(response.data.stats)
      } catch (error) {
        console.error('Failed to fetch tenant stats:', error)
      }
    }

    fetchTenantStats()
  }, [])

  // Stats data with real tenant data
  const stats = [
    {
      title: 'Total Tenants',
      value: tenantStats.total_tenants?.toString() || '0',
      changeType: 'positive',
      icon: <People />,
      color: '#1976d2',
    },
    {
      title: 'Active Tenants',
      value: tenantStats.active_tenants?.toString() || '0',
      changeType: 'positive',
      icon: <Business />,
      color: '#2e7d32',
    },
    {
      title: 'New This Month',
      value: tenantStats.new_this_month?.toString() || '0',
      changeType: 'positive',
      icon: <Receipt />,
      color: '#ed6c02',
    },
    {
      title: 'Inactive Tenants',
      value: tenantStats.inactive_tenants?.toString() || '0',
      changeType: 'negative',
      icon: <Assignment />,
      color: '#d32f2f',
    },
  ]


  return (
    <Layout>
      {/* Welcome Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Welcome back, {user?.full_name?.split(' ')[0]}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your business today.
        </Typography>
      </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} mb={4}>
            {stats.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                    border: `1px solid ${stat.color}20`,
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Avatar
                        sx={{
                          bgcolor: stat.color,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                      <Box textAlign="right">
                        <Typography
                          variant="h4"
                          component="div"
                          fontWeight="bold"
                          color={stat.color}
                        >
                          {stat.value}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          {stat.changeType === 'positive' ? (
                            <ArrowUpward sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                          ) : (
                            <ArrowDownward sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
                          )}
                          <Typography
                            variant="body2"
                            color={stat.changeType === 'positive' ? 'success.main' : 'error.main'}
                            fontWeight="600"
                          >
                            {stat.change}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="h6" component="div" fontWeight="600">
                      {stat.title}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
    </Layout>
  )
}

export default Dashboard
