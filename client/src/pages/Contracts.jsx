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
  Paper,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  Edit,
  Delete,
  Visibility,
  AttachMoney,
  CalendarToday,
  Home,
  Person,
  Refresh,
} from '@mui/icons-material'
import { contractAPI } from '../services/api'
import ContractForm from '../components/ContractForm'
import Layout from '../components/Layout'

const Contracts = () => {
  const [contracts, setContracts] = useState([])
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
  const [selectedContract, setSelectedContract] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contractToDelete, setContractToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedContractId, setSelectedContractId] = useState(null)

  // Load contracts
  const loadContracts = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }

      const response = await contractAPI.getContracts(params)
      setContracts(response.data.contracts)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters.search, filters.is_active, filters.sortBy, filters.sortOrder])

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await contractAPI.getContractStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [])

  // Load data on component mount and when filters change
  useEffect(() => {
    loadContracts()
  }, [loadContracts])

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

  const handleStatusFilterChange = (event) => {
    event.preventDefault()
    const value = event.target.value
    setFilters(prev => ({ ...prev, is_active: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, page }))
  }

  const handleAddContract = () => {
    setSelectedContract(null)
    setFormOpen(true)
  }

  const handleEditContract = (contract) => {
    setSelectedContract(contract)
    setFormOpen(true)
  }

  const handleDeleteContract = (contract) => {
    setContractToDelete(contract)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      await contractAPI.deleteContract(contractToDelete.contract_id)
      setDeleteDialogOpen(false)
      setContractToDelete(null)
      loadContracts()
      loadStats()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete contract')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    setFormOpen(false)
    setSelectedContract(null)
    loadContracts()
    loadStats()
  }

  const handleMenuOpen = (event, contractId) => {
    setMenuAnchor(event.currentTarget)
    setSelectedContractId(contractId)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedContractId(null)
  }

  const formatCurrency = (amount) => {
    return `PKR ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 0,
    }).format(amount)}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'default'
  }

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive'
  }

  return (
    <Layout>
      <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Contracts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddContract}
          sx={{ borderRadius: 2 }}
        >
          Add Contract
        </Button>
      </Box>

      {/* Statistics Cards */}
      {/* {stats && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AttachMoney color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.total_contracts}
                    </Typography>
                    <Typography color="text.secondary">
                      Total Contracts
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
                  <Home color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.active_contracts}
                    </Typography>
                    <Typography color="text.secondary">
                      Active Contracts
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
                  <CalendarToday color="warning" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.inactive_contracts}
                    </Typography>
                    <Typography color="text.secondary">
                      Inactive Contracts
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
                  <Person color="info" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stats.new_this_month}
                    </Typography>
                    <Typography color="text.secondary">
                      New This Month
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )} */}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box component="form" onSubmit={(e) => e.preventDefault()}>
            <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search contracts..."
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
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.is_active}
                  onChange={handleStatusFilterChange}
                  label="Status"
                >
                 
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
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
                  <MenuItem value="contract_start_date">Start Date</MenuItem>
                  <MenuItem value="contract_end_date">End Date</MenuItem>
                  <MenuItem value="rent">Rent</MenuItem>
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
                  loadContracts()
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

      {/* Contracts Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Contract ID</TableCell>
                <TableCell>Tenant</TableCell>
                <TableCell>Rent</TableCell>
                <TableCell>Service Charges</TableCell>
                <TableCell>Security Fees</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Apartments</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">
                      No contracts found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((contract) => (
                  <TableRow key={contract.contract_id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      #{contract.contract_id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {contract.tenant_name || 'N/A'}
                      </Typography>
                      {contract.tenant_cnic && (
                        <Typography variant="caption" color="text.secondary">
                          {contract.tenant_cnic}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(contract.rent)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(contract.service_charges)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(contract.security_fees)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(contract.contract_start_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(contract.contract_end_date)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {contract.apartments?.slice(0, 2).map((apartment) => (
                        <Chip
                          key={apartment.apartment_id}
                          label={`F${apartment.floor_no}-A${apartment.apartment_no}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {contract.apartments?.length > 2 && (
                        <Chip
                          label={`+${contract.apartments.length - 2} more`}
                          size="small"
                          color="default"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(contract.is_active)}
                      color={getStatusColor(contract.is_active)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, contract.contract_id)}
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
            const contract = contracts.find(c => c.contract_id === selectedContractId)
            handleEditContract(contract)
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
            const contract = contracts.find(c => c.contract_id === selectedContractId)
            handleDeleteContract(contract)
            handleMenuClose()
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Contract Form Dialog */}
      <ContractForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        contract={selectedContract}
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
            Are you sure you want to delete contract #{contractToDelete?.contract_id}?
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

export default Contracts
