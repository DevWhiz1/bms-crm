import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Refresh,
  ElectricBolt,
  Speed,
  Water,
  TrendingUp,
  Assessment,
} from '@mui/icons-material'
import { meterReadingAPI } from '../services/api'
import MeterReadingForm from '../components/MeterReadingForm'
import Layout from '../components/Layout'

const METER_TYPES = {
  1: { label: 'WAPDA', icon: <ElectricBolt />, color: 'warning' },
  2: { label: 'Generator', icon: <Speed />, color: 'error' },
  3: { label: 'Water', icon: <Water />, color: 'info' },
}

const MeterReadings = () => {
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    meter_type: '',
    sortBy: 'reading_date',
    sortOrder: 'DESC',
  })
  const [formOpen, setFormOpen] = useState(false)
  const [selectedReading, setSelectedReading] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [readingToDelete, setReadingToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedReadingId, setSelectedReadingId] = useState(null)

  // Load readings
  const loadReadings = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }

      const response = await meterReadingAPI.getReadings(params)
      setReadings(response.data.readings)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load meter readings')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters.search, filters.meter_type, filters.sortBy, filters.sortOrder])

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await meterReadingAPI.getReadingStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [])

  // Load data on component mount and when filters change
  useEffect(() => {
    loadReadings()
  }, [loadReadings])

  // Load stats only on initial mount
  useEffect(() => {
    loadStats()
  }, [loadStats])

  const handleSearch = (event) => {
    setFilters(prev => ({ ...prev, search: event.target.value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleAddReading = () => {
    setSelectedReading(null)
    setFormOpen(true)
  }

  const handleEditReading = (reading) => {
    setSelectedReading(reading)
    setFormOpen(true)
  }

  const handleDeleteReading = (reading) => {
    setReadingToDelete(reading)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      await meterReadingAPI.deleteReading(readingToDelete.meter_reading_id)
      setDeleteDialogOpen(false)
      setReadingToDelete(null)
      loadReadings()
      loadStats()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete meter reading')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    setFormOpen(false)
    setSelectedReading(null)
    loadReadings()
    loadStats()
  }

  const handleMenuOpen = (event, readingId) => {
    setMenuAnchor(event.currentTarget)
    setSelectedReadingId(readingId)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedReadingId(null)
  }

  const getMeterTypeInfo = (type) => METER_TYPES[type] || { label: 'Unknown', color: 'default' }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatUnits = (units) => {
    return parseFloat(units).toFixed(2)
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Meter Readings
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddReading}
            sx={{ borderRadius: 2 }}
          >
            Add Reading
          </Button>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Assessment color="primary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total_readings}
                      </Typography>
                      <Typography color="text.secondary">
                        Total Readings
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Speed color="success" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.meters_with_readings}
                      </Typography>
                      <Typography color="text.secondary">
                        Meters Recorded
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUp color="warning" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {formatUnits(stats.total_units_consumed)}
                      </Typography>
                      <Typography color="text.secondary">
                        Total Units Consumed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <ElectricBolt color="info" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.months_recorded}
                      </Typography>
                      <Typography color="text.secondary">
                        Months Recorded
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box component="form" onSubmit={(e) => e.preventDefault()}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search by serial number or apartment..."
                    value={filters.search}
                    onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Meter Type</InputLabel>
                    <Select
                      value={filters.meter_type}
                      onChange={(e) => handleFilterChange('meter_type', e.target.value)}
                      label="Meter Type"
                    >
                      <MenuItem value="">All Types</MenuItem>
                      <MenuItem value="1">WAPDA</MenuItem>
                      <MenuItem value="2">Generator</MenuItem>
                      <MenuItem value="3">Water</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="reading_date">Reading Date</MenuItem>
                      <MenuItem value="current_units">Current Units</MenuItem>
                      <MenuItem value="unit_consumed">Units Consumed</MenuItem>
                      <MenuItem value="apartment_no">Apartment</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      label="Order"
                    >
                      <MenuItem value="DESC">Descending</MenuItem>
                      <MenuItem value="ASC">Ascending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={(e) => {
                      e.preventDefault()
                      loadReadings()
                    }}
                    fullWidth
                  >
                    Refresh
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Readings Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reading ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Meter Type</TableCell>
                  <TableCell>Apartment</TableCell>
                  <TableCell>Serial No</TableCell>
                  <TableCell>Current Units</TableCell>
                  <TableCell>Units Consumed</TableCell>
                  <TableCell>Recorded By</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && readings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : readings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No meter readings found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  readings.map((reading) => (
                    <TableRow key={reading.meter_reading_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        #{reading.meter_reading_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(reading.reading_date)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getMeterTypeInfo(reading.meter_type).icon}
                        label={getMeterTypeInfo(reading.meter_type).label}
                        color={getMeterTypeInfo(reading.meter_type).color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Floor {reading.floor_no} - Apt {reading.apartment_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {reading.meter_serial_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {formatUnits(reading.current_units)} units
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <TrendingUp fontSize="small" color="success" />
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatUnits(reading.unit_consumed)} units
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {reading.created_by_name || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, reading.meter_reading_id)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" p={2}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              const reading = readings.find(r => r.meter_reading_id === selectedReadingId)
              handleEditReading(reading)
              handleMenuClose()
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              const reading = readings.find(r => r.meter_reading_id === selectedReadingId)
              handleDeleteReading(reading)
              handleMenuClose()
            }}
          >
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Meter Reading Form Dialog */}
        <MeterReadingForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          reading={selectedReading}
          onSuccess={handleFormSuccess}
        />

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete reading #{readingToDelete?.meter_reading_id}? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              color="error"
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}

export default MeterReadings

