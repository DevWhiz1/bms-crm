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
import InvoiceView from '../components/InvoiceView'
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
  const [invoiceOpen, setInvoiceOpen] = useState(false)
  const [stats, setStats] = useState(null)
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [selectedBillId, setSelectedBillId] = useState(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedBill, setSelectedBill] = useState(null)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount_received: '', received_date: '', payment_method: '', reference_no: '', notes: '' })
  const [savingPayment, setSavingPayment] = useState(false)
  const [payments, setPayments] = useState([])
  const [paymentsLoading, setPaymentsLoading] = useState(false)

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
    // Don't reset selectedBillId here as it might be needed for invoice view
  }

  const handleViewInvoice = (billId) => {
    setMenuAnchor(null) // Close menu
    setSelectedBillId(billId)
    setInvoiceOpen(true)
  }

  const handleCloseInvoice = () => {
    setInvoiceOpen(false)
    setSelectedBillId(null)
  }

  const openPaymentDialog = () => {
    const bill = bills.find(b => b.monthly_bill_id === selectedBillId)
    setSelectedBill(bill)
    setPaymentForm({ amount_received: '', received_date: new Date().toISOString().slice(0,10), payment_method: '', reference_no: '', notes: '' })
    setPaymentDialogOpen(true)
    setMenuAnchor(null)
    loadPayments(bill?.monthly_bill_id)
  }

  const loadPayments = async (billId) => {
    if (!billId) return
    try {
      setPaymentsLoading(true)
      const res = await monthlyBillAPI.getPayments(billId)
      setPayments(res.data?.data?.payments || res.data?.payments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments')
    } finally {
      setPaymentsLoading(false)
    }
  }

  const savePayment = async () => {
    try {
      setSavingPayment(true)
      await monthlyBillAPI.addPayment(selectedBillId, paymentForm)
      setPaymentDialogOpen(false)
      await loadBills()
      await loadStats()
      setPayments([])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record payment')
    } finally {
      setSavingPayment(false)
    }
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
          <Typography variant="h5" fontWeight="bold">
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
                    {/* <Receipt color="primary" sx={{ mr: 1, fontSize: 30 }} /> */}
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
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
                    {/* <CheckCircle color="success" sx={{ mr: 1, fontSize: 30 }} /> */}
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
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
                    {/* <Cancel color="error" sx={{ mr: 3, fontSize: 30 }} /> */}
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
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
                    {/* <AttachMoney color="warning" sx={{ mr: 1, fontSize: 30 }} /> */}
                    <Box>
                      <Typography variant="h5" fontWeight="bold">
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
              setMenuAnchor(null)
            }}
          >
            <ListItemIcon>
              <Visibility fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={openPaymentDialog}
          >
            <ListItemIcon>
              <AttachMoney fontSize="small" />
            </ListItemIcon>
            <ListItemText>Record Payment</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleViewInvoice(selectedBillId)
            }}
          >
            <ListItemIcon>
              <Receipt fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Invoice</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMarkAsPaid(selectedBillId)
              setMenuAnchor(null)
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
              setMenuAnchor(null)
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
                    <Typography variant="h6" fontWeight="bold">
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

        {/* Payment Dialog */}
        <Dialog
          open={paymentDialogOpen}
          onClose={() => setPaymentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">
                Record Payment - #{selectedBill?.monthly_bill_id}
              </Typography>
              <IconButton onClick={() => setPaymentDialogOpen(false)} size="small">
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount: {selectedBill ? formatCurrency(selectedBill.total_amount) : '—'}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Received so far: {formatCurrency(payments.reduce((sum, p) => sum + parseFloat(p.amount_received || 0), 0))}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Remaining: {selectedBill ? formatCurrency(parseFloat(selectedBill.total_amount || 0) - payments.reduce((sum, p) => sum + parseFloat(p.amount_received || 0), 0)) : '—'}
                </Typography>
              </Grid>
              {paymentsLoading ? (
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1}><CircularProgress size={18} /> <Typography variant="body2">Loading payments...</Typography></Box>
                </Grid>
              ) : payments.length > 0 ? (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Previous Payments</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Reference</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {payments.map((p) => (
                        <TableRow key={p.bill_payment_id || `${p.received_date}-${p.amount_received}`}>
                          <TableCell>{formatDate(p.received_date)}</TableCell>
                          <TableCell>{p.payment_method || '-'}</TableCell>
                          <TableCell>{p.reference_no || '-'}</TableCell>
                          <TableCell align="right">{formatCurrency(p.amount_received)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              ) : null}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount Received"
                  type="number"
                  value={paymentForm.amount_received}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, amount_received: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="date"
                  label="Received Date"
                  InputLabelProps={{ shrink: true }}
                  value={paymentForm.received_date}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, received_date: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Payment Method"
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  placeholder="Cash/Bank/Online"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reference No"
                  value={paymentForm.reference_no}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, reference_no: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  minRows={2}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={savePayment}
              variant="contained"
              disabled={savingPayment || !paymentForm.amount_received || !paymentForm.received_date}
              startIcon={savingPayment ? <CircularProgress size={20} /> : <AttachMoney />}
            >
              {savingPayment ? 'Saving...' : 'Save Payment'}
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

        {/* Invoice View Dialog */}
        <InvoiceView
          open={invoiceOpen}
          onClose={handleCloseInvoice}
          billId={selectedBillId}
        />
      </Box>
    </Layout>
  )
}

export default MonthlyBills

