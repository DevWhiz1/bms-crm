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
  Home,
} from '@mui/icons-material'
import { meterAPI } from '../services/api'
import MeterForm from '../components/MeterForm'
import Layout from '../components/Layout'

const METER_TYPES = {
  1: { label: 'WAPDA', icon: <ElectricBolt />, color: 'warning' },
  2: { label: 'Generator', icon: <Speed />, color: 'error' },
  3: { label: 'Water', icon: <Water />, color: 'info' },
}

const Meters = () => {
  const [meters, setMeters] = useState([])
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
    meter_type: '1',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  })
  const [formOpen, setFormOpen] = useState(false)
  const [selectedMeter, setSelectedMeter] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [meterToDelete, setMeterToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedMeterId, setSelectedMeterId] = useState(null)

  // Load meters
  const loadMeters = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }

      const response = await meterAPI.getMeters(params)
      setMeters(response.data.meters)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load meters')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters.search, filters.meter_type, filters.sortBy, filters.sortOrder])

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await meterAPI.getMeterStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [])

  // Load data on component mount and when filters change
  useEffect(() => {
    loadMeters()
  }, [loadMeters])

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

  const handleAddMeter = () => {
    setSelectedMeter(null)
    setFormOpen(true)
  }

  const handleEditMeter = (meter) => {
    setSelectedMeter(meter)
    setFormOpen(true)
  }

  const handleDeleteMeter = (meter) => {
    setMeterToDelete(meter)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      await meterAPI.deleteMeter(meterToDelete.meter_id)
      setDeleteDialogOpen(false)
      setMeterToDelete(null)
      loadMeters()
      loadStats()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete meter')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    setFormOpen(false)
    setSelectedMeter(null)
    loadMeters()
    loadStats()
  }

  const handleMenuOpen = (event, meterId) => {
    setMenuAnchor(event.currentTarget)
    setSelectedMeterId(meterId)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedMeterId(null)
  }

  const getMeterTypeInfo = (type) => METER_TYPES[type] || { label: 'Unknown', color: 'default' }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Meters
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddMeter}
            sx={{ borderRadius: 2 }}
          >
            Add Meter
          </Button>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Speed color="primary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total_meters}
                      </Typography>
                      <Typography color="text.secondary">
                        Total Meters
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
                    <ElectricBolt color="warning" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.wapda_meters}
                      </Typography>
                      <Typography color="text.secondary">
                        WAPDA Meters
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
                    <Speed color="error" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.generator_meters}
                      </Typography>
                      <Typography color="text.secondary">
                        Generator Meters
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
                    <Water color="info" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.water_meters}
                      </Typography>
                      <Typography color="text.secondary">
                        Water Meters
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
                      <MenuItem value="created_at">Created Date</MenuItem>
                      <MenuItem value="meter_serial_no">Serial Number</MenuItem>
                      <MenuItem value="meter_type">Meter Type</MenuItem>
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
                      loadMeters()
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

        {/* Meters Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Meter ID</TableCell>
                  <TableCell>Serial Number</TableCell>
                  <TableCell>Meter Type</TableCell>
                  <TableCell>Apartment</TableCell>
                  <TableCell>Floor</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && meters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : meters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No meters found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  meters.map((meter) => (
                    <TableRow key={meter.meter_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        #{meter.meter_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {meter.meter_serial_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getMeterTypeInfo(meter.meter_type).icon}
                        label={getMeterTypeInfo(meter.meter_type).label}
                        color={getMeterTypeInfo(meter.meter_type).color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Home fontSize="small" color="action" />
                        <Typography variant="body2">
                          Apartment {meter.apartment_no}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        Floor {meter.floor_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(meter.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, meter.meter_id)}
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
              const meter = meters.find(m => m.meter_id === selectedMeterId)
              handleEditMeter(meter)
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
              const meter = meters.find(m => m.meter_id === selectedMeterId)
              handleDeleteMeter(meter)
              handleMenuClose()
            }}
          >
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Meter Form Dialog */}
        <MeterForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          meter={selectedMeter}
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
              Are you sure you want to delete meter #{meterToDelete?.meter_id} 
              ({meterToDelete?.meter_serial_no})? This action cannot be undone.
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

export default Meters

