import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  Person,
  Badge,
  Phone,
  Home,
  FilterList,
} from '@mui/icons-material'
import Layout from '../components/Layout'
import TenantForm from '../components/TenantForm'
import { tenantAPI } from '../services/api'

const Tenants = () => {
  const [tenants, setTenants] = useState([])
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
    is_active: 'true',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  })
  const [formOpen, setFormOpen] = useState(false)
  const [selectedTenant, setSelectedTenant] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRowId, setSelectedRowId] = useState(null)

  // Fetch tenants
  const fetchTenants = async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }

      const response = await tenantAPI.getTenants(params)
      setTenants(response.data.tenants)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tenants')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTenants()
  }, [pagination.page, filters])

  // Handle search
  const handleSearch = (event) => {
    const value = event.target.value
    setFilters(prev => ({ ...prev, search: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle filter change
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  // Handle page change
  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  // Handle menu open
  const handleMenuOpen = (event, tenantId) => {
    setAnchorEl(event.currentTarget)
    setSelectedRowId(tenantId)
  }

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRowId(null)
  }

  // Handle edit
  const handleEdit = (tenant) => {
    setSelectedTenant(tenant)
    setFormOpen(true)
    handleMenuClose()
  }

  // Handle delete
  const handleDelete = (tenant) => {
    setTenantToDelete(tenant)
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await tenantAPI.deleteTenant(tenantToDelete.tenant_id)
      fetchTenants()
      setDeleteDialogOpen(false)
      setTenantToDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tenant')
    }
  }

  // Handle form success
  const handleFormSuccess = () => {
    fetchTenants()
  }

  // Handle form close
  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedTenant(null)
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error'
  }

  const getStatusLabel = (isActive) => {
    return isActive ? 'Active' : 'Inactive'
  }

  return (
    <Layout>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Tenant Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage tenant information and records
          </Typography>
        </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFormOpen(true)}
              sx={{
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                },
              }}
            >
              Add Tenant
            </Button>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* Filters */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search tenants..."
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
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.is_active}
                      label="Status"
                      onChange={(e) => handleFilterChange('is_active', e.target.value)}
                    >
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      label="Sort By"
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <MenuItem value="created_at">Created Date</MenuItem>
                      <MenuItem value="full_name">Name</MenuItem>
                      <MenuItem value="cnic">CNIC</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={filters.sortOrder}
                      label="Order"
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    >
                      <MenuItem value="DESC">Descending</MenuItem>
                      <MenuItem value="ASC">Ascending</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Tenants Table */}
          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Photo</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>CNIC</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : tenants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No tenants found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    tenants.map((tenant) => (
                      <TableRow key={tenant.tenant_id} hover>
                        <TableCell>
                          <Avatar
                            src={tenant.photo_url}
                            sx={{ width: 40, height: 40 }}
                          >
                            <Person />
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="600">
                            {tenant.full_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {tenant.cnic}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Phone sx={{ mr: 1, fontSize: 16, color: 'action.active' }} />
                            <Typography variant="body2">
                              {tenant.mobile_no || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Home sx={{ mr: 1, fontSize: 16, color: 'action.active' }} />
                            <Typography variant="body2">
                              {tenant.phone_no || 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(tenant.is_active)}
                            color={getStatusColor(tenant.is_active)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(tenant.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, tenant.tenant_id)}
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
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(tenants.find(t => t.tenant_id === selectedRowId))}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleDelete(tenants.find(t => t.tenant_id === selectedRowId))}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete tenant "{tenantToDelete?.full_name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tenant Form */}
      <TenantForm
        open={formOpen}
        onClose={handleFormClose}
        tenant={selectedTenant}
        onSuccess={handleFormSuccess}
      />
    </Layout>
  )
}

export default Tenants
