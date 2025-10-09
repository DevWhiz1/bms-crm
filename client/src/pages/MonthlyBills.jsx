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
  Divider,
} from '@mui/material'
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  Refresh,
  AttachMoney,
  CheckCircle,
  Cancel,
  Visibility,
  Receipt,
  Close,
} from '@mui/icons-material'
import { monthlyBillAPI } from '../services/api'
import BillGenerationForm from '../components/BillGenerationForm'
import Layout from '../components/Layout'

const MonthlyBills = () => {
  const [bills, setBills] = useState([])
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
    is_paid: '',
    month: '',
    sortBy: 'bill_issue_date',
    sortOrder: 'DESC',
  })
  const [formOpen, setFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [billToDelete, setBillToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [stats, setStats] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedBillId, setSelectedBillId] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)

  // Load bills
  const loadBills = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }

      const response = await monthlyBillAPI.getBills(params)
      setBills(response.data.bills)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load bills')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, filters.search, filters.is_paid, filters.month, filters.sortBy, filters.sortOrder])

  // Load statistics
  const loadStats = useCallback(async () => {
    try {
      const response = await monthlyBillAPI.getBillStats()
      setStats(response.data.stats)
    } catch (err) {
      console.error('Failed to load stats:', err)
    }
  }, [])

  // Load data on component mount and when filters change
  useEffect(() => {
    loadBills()
  }, [loadBills])

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

  const handleGenerateBills = () => {
    setFormOpen(true)
  }

  const handleViewBill = (bill) => {
    setSelectedBill(bill)
    setViewDialogOpen(true)
  }

  const handleDeleteBill = (bill) => {
    setBillToDelete(bill)
    setDeleteDialogOpen(true)
  }

  const handleMarkAsPaid = async (billId) => {
    try {
      await monthlyBillAPI.markBillAsPaid(billId)
      loadBills()
      loadStats()
      handleMenuClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark bill as paid')
    }
  }

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      await monthlyBillAPI.deleteBill(billToDelete.monthly_bill_id)
      setDeleteDialogOpen(false)
      setBillToDelete(null)
      loadBills()
      loadStats()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete bill')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormSuccess = () => {
    setFormOpen(false)
    loadBills()
    loadStats()
  }

  const handleMenuOpen = (event, billId) => {
    setMenuAnchor(event.currentTarget)
    setSelectedBillId(billId)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedBillId(null)
  }

  const formatCurrency = (amount) => {
    return `PKR ${new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
    }).format(amount)}`
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getPaymentStatusColor = (isPaid) => {
    return isPaid ? 'success' : 'error'
  }

  const getPaymentStatusText = (isPaid) => {
    return isPaid ? 'Paid' : 'Unpaid'
  }

  return (
    <Layout>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Monthly Bills
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleGenerateBills}
            sx={{ borderRadius: 2 }}
          >
            Generate Bills
          </Button>
        </Box>

        {/* Statistics Cards */}
        {stats && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Receipt color="primary" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.total_bills}
                      </Typography>
                      <Typography color="text.secondary">
                        Total Bills
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
                    <CheckCircle color="success" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.paid_bills}
                      </Typography>
                      <Typography color="text.secondary">
                        Paid Bills
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
                    <Cancel color="error" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.unpaid_bills}
                      </Typography>
                      <Typography color="text.secondary">
                        Unpaid Bills
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
                    <AttachMoney color="warning" sx={{ mr: 2, fontSize: 40 }} />
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {formatCurrency(stats.pending_amount || 0)}
                      </Typography>
                      <Typography color="text.secondary">
                        Pending Amount
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
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search by tenant, CNIC, or contract..."
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
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                      value={filters.is_paid}
                      onChange={(e) => handleFilterChange('is_paid', e.target.value)}
                      label="Payment Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="1">Paid</MenuItem>
                      <MenuItem value="0">Unpaid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <TextField
                    fullWidth
                    type="month"
                    label="Filter by Month"
                    InputLabelProps={{ shrink: true }}
                    value={filters.month}
                    onChange={(e) => handleFilterChange('month', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="bill_issue_date">Issue Date</MenuItem>
                      <MenuItem value="bill_due_date">Due Date</MenuItem>
                      <MenuItem value="total_amount">Amount</MenuItem>
                      <MenuItem value="tenant_name">Tenant</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={1}>
                  <FormControl fullWidth>
                    <InputLabel>Order</InputLabel>
                    <Select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                      label="Order"
                    >
                      <MenuItem value="DESC">DESC</MenuItem>
                      <MenuItem value="ASC">ASC</MenuItem>
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
                      loadBills()
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

        {/* Bills Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill ID</TableCell>
                  <TableCell>Contract ID</TableCell>
                  <TableCell>Tenant</TableCell>
                  <TableCell>Issue Date</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Total Amount</TableCell>
                  <TableCell>Arrears</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && bills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : bills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">
                        No bills found. Click "Generate Bills" to create bills for a month.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  bills.map((bill) => (
                    <TableRow key={bill.monthly_bill_id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          #{bill.monthly_bill_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          #{bill.contract_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {bill.tenant_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {bill.tenant_cnic}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(bill.bill_issue_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(bill.bill_due_date)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {formatCurrency(bill.total_amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color={parseFloat(bill.arrears) > 0 ? 'error.main' : 'text.secondary'}>
                          {formatCurrency(bill.arrears)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={bill.is_bill_paid ? <CheckCircle /> : <Cancel />}
                          label={getPaymentStatusText(bill.is_bill_paid)}
                          color={getPaymentStatusColor(bill.is_bill_paid)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, bill.monthly_bill_id)}
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
              const bill = bills.find(b => b.monthly_bill_id === selectedBillId)
              handleViewBill(bill)
              handleMenuClose()
            }}
          >
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMarkAsPaid(selectedBillId)
            }}
            disabled={!!bills.find(b => b.monthly_bill_id === selectedBillId)?.is_bill_paid}
          >
            <ListItemIcon>
              <CheckCircle fontSize="small" />
            </ListItemIcon>
            <ListItemText>Mark as Paid</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              const bill = bills.find(b => b.monthly_bill_id === selectedBillId)
              handleDeleteBill(bill)
              handleMenuClose()
            }}
          >
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Bill Generation Form Dialog */}
        <BillGenerationForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSuccess={handleFormSuccess}
        />

        {/* View Bill Details Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">
                Bill Details - #{selectedBill?.monthly_bill_id}
              </Typography>
              <IconButton onClick={() => setViewDialogOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {selectedBill && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Tenant Information
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Tenant Name:</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedBill.tenant_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">CNIC:</Typography>
                  <Typography variant="body1" fontWeight="medium">{selectedBill.tenant_cnic}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Contract ID:</Typography>
                  <Typography variant="body1" fontWeight="medium">#{selectedBill.contract_id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                  <Chip
                    icon={selectedBill.is_bill_paid ? <CheckCircle /> : <Cancel />}
                    label={getPaymentStatusText(selectedBill.is_bill_paid)}
                    color={getPaymentStatusColor(selectedBill.is_bill_paid)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Consumption & Charges
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">WAPDA Units:</Typography>
                  <Typography variant="body1">{selectedBill.wapda_unit_consumed} units</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Rate:</Typography>
                  <Typography variant="body1">{formatCurrency(selectedBill.wapda_per_unit_rate)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Bill:</Typography>
                  <Typography variant="body1" fontWeight="bold">{formatCurrency(selectedBill.wapda_bill)}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Generator Units:</Typography>
                  <Typography variant="body1">{selectedBill.generator_unit_consumed} units</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Rate:</Typography>
                  <Typography variant="body1">{formatCurrency(selectedBill.generator_per_unit_rate)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Bill:</Typography>
                  <Typography variant="body1" fontWeight="bold">{formatCurrency(selectedBill.generator_bill)}</Typography>
                </Grid>

                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Water Units:</Typography>
                  <Typography variant="body1">{selectedBill.water_unit_consumed} units</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Rate:</Typography>
                  <Typography variant="body1">{formatCurrency(selectedBill.water_per_unit_rate)}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Bill:</Typography>
                  <Typography variant="body1" fontWeight="bold">{formatCurrency(selectedBill.water_bill)}</Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Other Charges
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Rent:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatCurrency(selectedBill.rent)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Management Charges:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatCurrency(selectedBill.management_charges)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Arrears:</Typography>
                  <Typography variant="body1" fontWeight="medium" color="error.main">{formatCurrency(selectedBill.arrears)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Additional Charges:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatCurrency(selectedBill.additional_charges || 0)}</Typography>
                </Grid>

                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" p={2} sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Total Amount:
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(selectedBill.total_amount)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

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
              Are you sure you want to delete bill #{billToDelete?.monthly_bill_id}? 
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

export default MonthlyBills

