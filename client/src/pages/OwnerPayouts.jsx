import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material'
import { AttachMoney, Refresh, Visibility, CheckCircle, Close } from '@mui/icons-material'
import Layout from '../components/Layout'
import { ownerPayoutAPI } from '../services/api'

const OwnerPayouts = () => {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7))
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false)
  const [selectedPayout, setSelectedPayout] = useState(null)
  const [items, setItems] = useState([])
  const [markingPaid, setMarkingPaid] = useState(false)

  const loadPayouts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await ownerPayoutAPI.list(month)
      setPayouts(res.data?.payouts || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payouts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayouts()
  }, [month])

  const handleGenerate = async () => {
    try {
      setLoading(true)
      setError('')
      await ownerPayoutAPI.generate(month)
      await loadPayouts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate payouts')
    } finally {
      setLoading(false)
    }
  }

  const openItems = async (payout) => {
    try {
      setSelectedPayout(payout)
      const res = await ownerPayoutAPI.getItems(payout.owner_payout_id)
      setItems(res.data?.items || [])
      setItemsDialogOpen(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payout items')
    }
  }

  const markPaid = async (payout) => {
    try {
      setMarkingPaid(true)
      const payload = { payout_date: new Date().toISOString().slice(0,10) }
      await ownerPayoutAPI.markPaid(payout.owner_payout_id, payload)
      await loadPayouts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark payout as paid')
    } finally {
      setMarkingPaid(false)
    }
  }

  const formatCurrency = (amount) => `PKR ${new Intl.NumberFormat('en-PK', { minimumFractionDigits: 2 }).format(amount || 0)}`

  return (
    <Layout>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">Owner Payouts</Typography>
          <Box display="flex" gap={1}>
            <TextField
              type="month"
              label="Month"
              value={month}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setMonth(e.target.value)}
              size="small"
            />
            <Button variant="contained" startIcon={<AttachMoney />} onClick={handleGenerate}>
              Generate Payouts
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              <Button variant="outlined" startIcon={<Refresh />} onClick={loadPayouts}>
                Refresh
              </Button>
            </Box>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : payouts.length === 0 ? (
              <Typography color="text.secondary">No payouts for this month.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Payout ID</TableCell>
                      <TableCell>Owner</TableCell>
                      <TableCell>Total Rent</TableCell>
                      <TableCell>Payout Amount</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Payout Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payouts.map(p => (
                      <TableRow key={p.owner_payout_id} hover>
                        <TableCell>#{p.owner_payout_id}</TableCell>
                        <TableCell>{p.owner_name}</TableCell>
                        <TableCell>{formatCurrency(p.total_rent_collected)}</TableCell>
                        <TableCell>{formatCurrency(p.payout_amount)}</TableCell>
                        <TableCell>
                          <Chip
                            icon={p.status === 'paid' ? <CheckCircle /> : undefined}
                            label={(p.status || '') === 'pending' ? 'Awaiting Payment' : (p.status || '') === 'cleared' ? 'Ready for Payout' : 'Paid'}
                            color={(p.status || '') === 'paid' ? 'success' : (p.status || '') === 'cleared' ? 'info' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{p.payout_date ? new Date(p.payout_date).toLocaleDateString('en-PK') : '-'}</TableCell>
                        <TableCell>
                          <Grid container spacing={1}>
                            <Grid item>
                              <Button size="small" startIcon={<Visibility />} onClick={() => openItems(p)}>Items</Button>
                            </Grid>
                            {p.status === 'cleared' && (
                              <Grid item>
                                <Button size="small" variant="contained" disabled={markingPaid} onClick={() => markPaid(p)}>
                                  {markingPaid ? 'Saving...' : 'Mark Paid'}
                                </Button>
                              </Grid>
                            )}
                          </Grid>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <Dialog open={itemsDialogOpen} onClose={() => setItemsDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" fontWeight="bold">Payout Items - #{selectedPayout?.owner_payout_id}</Typography>
              <IconButton onClick={() => setItemsDialogOpen(false)} size="small"><Close /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {items.length === 0 ? (
              <Typography color="text.secondary">No items.</Typography>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Bill ID</TableCell>
                      <TableCell>Contract ID</TableCell>
                      <TableCell>Apartment</TableCell>
                      <TableCell>Rent Share</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map(it => (
                      <TableRow key={`${it.owner_payout_id}-${it.apartment_id}-${it.monthly_bill_id}`}>
                        <TableCell>#{it.monthly_bill_id}</TableCell>
                        <TableCell>#{it.contract_id}</TableCell>
                        <TableCell>{it.apartment_no}</TableCell>
                        <TableCell>{formatCurrency(it.rent_share)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setItemsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Layout>
  )
}

export default OwnerPayouts