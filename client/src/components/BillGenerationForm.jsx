import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Divider,
  Chip,
} from '@mui/material'
import {
  Close,
  CalendarToday,
  ElectricBolt,
  Speed,
  Water,
  AttachMoney,
  CheckCircle,
  Warning,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { monthlyBillAPI } from '../services/api'

// Validation schema
const billGenerationSchema = yup.object({
  month: yup
    .string()
    .required('Month is required')
    .matches(/^\d{4}-\d{2}$/, 'Month must be in format YYYY-MM'),
  wapda_per_unit_rate: yup
    .number()
    .required('WAPDA rate is required')
    .positive('WAPDA rate must be positive')
    .typeError('WAPDA rate must be a number'),
  generator_per_unit_rate: yup
    .number()
    .required('Generator rate is required')
    .positive('Generator rate must be positive')
    .typeError('Generator rate must be a number'),
  water_per_unit_rate: yup
    .number()
    .required('Water rate is required')
    .positive('Water rate must be positive')
    .typeError('Water rate must be a number'),
  bill_issue_date: yup
    .date()
    .required('Bill issue date is required')
    .typeError('Please enter a valid date'),
  bill_due_date: yup
    .date()
    .required('Bill due date is required')
    .typeError('Please enter a valid date')
    .min(yup.ref('bill_issue_date'), 'Due date must be after issue date'),
})

const BillGenerationForm = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checkingMonth, setCheckingMonth] = useState(false)
  const [monthExists, setMonthExists] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(billGenerationSchema),
    defaultValues: {
      month: '',
      wapda_per_unit_rate: '',
      generator_per_unit_rate: '',
      water_per_unit_rate: '',
      bill_issue_date: '',
      bill_due_date: '',
    },
  })

  const watchedMonth = watch('month')

  // Check if bills already exist for selected month
  useEffect(() => {
    const checkMonth = async () => {
      if (watchedMonth && watchedMonth.match(/^\d{4}-\d{2}$/)) {
        try {
          setCheckingMonth(true)
          const response = await monthlyBillAPI.checkBillsExist(watchedMonth)
          setMonthExists(response.data.exists)
        } catch (err) {
          console.error('Error checking month:', err)
        } finally {
          setCheckingMonth(false)
        }
      }
    }

    checkMonth()
  }, [watchedMonth])

  const handleClose = () => {
    onClose()
    setError('')
    setSuccess('')
    setMonthExists(false)
    reset()
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await monthlyBillAPI.generateBills(data)

      setSuccess(response.message)
      
      // Wait 2 seconds to show success message, then close
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate bills')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            Generate Monthly Bills
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Month Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Select Billing Period
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="month"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="month"
                    label="Billing Month"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.month}
                    helperText={errors.month?.message || 'Select the month for bill generation'}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
              {checkingMonth && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <CircularProgress size={16} />
                  <Typography variant="caption">Checking month...</Typography>
                </Box>
              )}
              {monthExists && (
                <Alert severity="warning" sx={{ mt: 1 }} icon={<Warning />}>
                  Bills already exist for this month. Please delete existing bills first.
                </Alert>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Rates Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Per Unit Rates
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Enter the rate per unit for each meter type
              </Typography>
            </Grid>

            {/* WAPDA Rate */}
            <Grid item xs={12} md={4}>
              <Controller
                name="wapda_per_unit_rate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="WAPDA Rate (per unit)"
                    placeholder="e.g., 25.50"
                    type="number"
                    error={!!errors.wapda_per_unit_rate}
                    helperText={errors.wapda_per_unit_rate?.message}
                    InputProps={{
                      startAdornment: (
                        <Box display="flex" alignItems="center" gap={0.5} mr={1}>
                          <ElectricBolt sx={{ color: 'warning.main', fontSize: 20 }} />
                          <Typography sx={{ color: 'action.active' }}>PKR</Typography>
                        </Box>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Generator Rate */}
            <Grid item xs={12} md={4}>
              <Controller
                name="generator_per_unit_rate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Generator Rate (per unit)"
                    placeholder="e.g., 30.00"
                    type="number"
                    error={!!errors.generator_per_unit_rate}
                    helperText={errors.generator_per_unit_rate?.message}
                    InputProps={{
                      startAdornment: (
                        <Box display="flex" alignItems="center" gap={0.5} mr={1}>
                          <Speed sx={{ color: 'error.main', fontSize: 20 }} />
                          <Typography sx={{ color: 'action.active' }}>PKR</Typography>
                        </Box>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            {/* Water Rate */}
            <Grid item xs={12} md={4}>
              <Controller
                name="water_per_unit_rate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Water Rate (per unit)"
                    placeholder="e.g., 15.00"
                    type="number"
                    error={!!errors.water_per_unit_rate}
                    helperText={errors.water_per_unit_rate?.message}
                    InputProps={{
                      startAdornment: (
                        <Box display="flex" alignItems="center" gap={0.5} mr={1}>
                          <Water sx={{ color: 'info.main', fontSize: 20 }} />
                          <Typography sx={{ color: 'action.active' }}>PKR</Typography>
                        </Box>
                      ),
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Bill Dates Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Bill Dates
              </Typography>
            </Grid>

            {/* Bill Issue Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="bill_issue_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Bill Issue Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.bill_issue_date}
                    helperText={errors.bill_issue_date?.message}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Bill Due Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="bill_due_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Bill Due Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.bill_due_date}
                    helperText={errors.bill_due_date?.message}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Info Card */}
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ bgcolor: 'info.50', borderColor: 'info.main' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    ℹ️ <strong>Note:</strong> Bills will be auto-generated for all active contracts. The system will:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Fetch latest meter readings for the selected month
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Calculate consumption from all apartments in each contract
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Pull rent and management charges from contracts
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Calculate arrears from previous unpaid bills
                    </Typography>
                    <Typography component="li" variant="body2" color="text.secondary">
                      Generate one bill per contract
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={loading || monthExists}
          startIcon={loading ? <CircularProgress size={20} /> : <AttachMoney />}
        >
          {loading ? 'Generating Bills...' : 'Generate Bills'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default BillGenerationForm

