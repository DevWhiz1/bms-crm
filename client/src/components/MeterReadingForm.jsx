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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material'
import {
  Close,
  ElectricBolt,
  Water,
  Speed,
  Home,
  CalendarToday,
  TrendingUp,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { meterReadingAPI, contractAPI, meterAPI } from '../services/api'

// Validation schema
const readingSchema = yup.object({
  meter_id: yup
    .number()
    .required('Meter is required')
    .positive('Please select a meter'),
  reading_date: yup
    .date()
    .required('Reading date is required')
    .typeError('Please enter a valid date'),
  current_units: yup
    .number()
    .required('Current reading is required')
    .positive('Current reading must be positive')
    .typeError('Current reading must be a number'),
  previous_month_reading: yup
    .number()
    .nullable()
    .positive('Previous reading must be positive')
    .typeError('Previous reading must be a number'),
})

// Meter type options
const METER_TYPES = {
  1: { label: 'WAPDA', icon: <ElectricBolt />, color: 'warning' },
  2: { label: 'Generator', icon: <Speed />, color: 'error' },
  3: { label: 'Water', icon: <Water />, color: 'info' },
}

const MeterReadingForm = ({ open, onClose, reading, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apartments, setApartments] = useState([])
  const [apartmentsByFloor, setApartmentsByFloor] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [selectedApartment, setSelectedApartment] = useState(null)
  const [filteredApartments, setFilteredApartments] = useState([])
  const [meters, setMeters] = useState([])
  const [selectedMeterDetails, setSelectedMeterDetails] = useState(null)
  const [previousReading, setPreviousReading] = useState(null)
  const [hasPrevious, setHasPrevious] = useState(false)
  const [checkingPrevious, setCheckingPrevious] = useState(false)
  const [calculatedConsumption, setCalculatedConsumption] = useState(null)

  const isEdit = !!reading

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(readingSchema),
    defaultValues: {
      meter_id: null,
      reading_date: '',
      current_units: '',
      previous_month_reading: null,
    },
  })

  const watchedMeterId = watch('meter_id')
  const watchedReadingDate = watch('reading_date')
  const watchedCurrentUnits = watch('current_units')
  const watchedPreviousReading = watch('previous_month_reading')

  // Load apartments and floors on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [apartmentsResponse, apartmentsByFloorResponse] = await Promise.all([
          contractAPI.getApartments(),
          contractAPI.getApartmentsByFloor(),
        ])

        setApartments(apartmentsResponse.data.apartments)
        setApartmentsByFloor(apartmentsByFloorResponse.data.apartments_by_floor)
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }

    if (open) {
      loadData()
    }
  }, [open])

  // Filter apartments based on selected floor
  useEffect(() => {
    if (selectedFloor) {
      const filtered = apartments.filter(apt => apt.floor_no === selectedFloor)
      setFilteredApartments(filtered)
    } else {
      setFilteredApartments([])
    }
  }, [selectedFloor, apartments])

  // Load meters when apartment is selected
  useEffect(() => {
    const loadMeters = async () => {
      if (selectedApartment) {
        try {
          const response = await meterAPI.getMetersByApartment(selectedApartment)
          setMeters(response.data.meters || [])
        } catch (err) {
          console.error('Error loading meters:', err)
          setMeters([])
        }
      }
    }

    loadMeters()
  }, [selectedApartment])

  // Check for previous reading when meter and date are selected
  useEffect(() => {
    const checkPrevious = async () => {
      if (watchedMeterId && watchedReadingDate && !isEdit) {
        try {
          setCheckingPrevious(true)
          const response = await meterReadingAPI.checkPreviousReading(
            watchedMeterId,
            watchedReadingDate
          )
          setHasPrevious(response.data.has_previous)
          setPreviousReading(response.data.previous_reading)
          
          // If no previous reading, clear the manual previous reading field
          if (!response.data.has_previous) {
            setValue('previous_month_reading', null)
          }
        } catch (err) {
          console.error('Error checking previous reading:', err)
        } finally {
          setCheckingPrevious(false)
        }
      }
    }

    checkPrevious()
  }, [watchedMeterId, watchedReadingDate, isEdit, setValue])

  // Calculate consumption automatically
  useEffect(() => {
    if (watchedCurrentUnits) {
      const currentUnits = parseFloat(watchedCurrentUnits)
      
      if (hasPrevious && previousReading) {
        // Use previous reading from database
        const consumed = currentUnits - parseFloat(previousReading.current_units)
        setCalculatedConsumption(consumed >= 0 ? consumed : 0)
      } else if (watchedPreviousReading) {
        // Use manual previous reading
        const consumed = currentUnits - parseFloat(watchedPreviousReading)
        setCalculatedConsumption(consumed >= 0 ? consumed : 0)
      } else {
        // First time entry without previous reading
        setCalculatedConsumption(currentUnits)
      }
    } else {
      setCalculatedConsumption(null)
    }
  }, [watchedCurrentUnits, watchedPreviousReading, hasPrevious, previousReading])

  // Update meter details when meter is selected
  useEffect(() => {
    if (watchedMeterId) {
      const meter = meters.find(m => m.meter_id === watchedMeterId)
      setSelectedMeterDetails(meter)
    } else {
      setSelectedMeterDetails(null)
    }
  }, [watchedMeterId, meters])

  // Reset form when reading changes
  useEffect(() => {
    if (reading) {
      reset({
        meter_id: reading.meter_id || null,
        reading_date: reading.reading_date || '',
        current_units: reading.current_units || '',
        previous_month_reading: null,
      })
      setSelectedFloor(reading.floor_no)
      setSelectedApartment(reading.apartment_id)
    } else {
      reset({
        meter_id: null,
        reading_date: '',
        current_units: '',
        previous_month_reading: null,
      })
      setSelectedFloor(null)
      setSelectedApartment(null)
      setMeters([])
      setPreviousReading(null)
      setHasPrevious(false)
    }
    setError('')
    setCalculatedConsumption(null)
  }, [reading, reset])

  const handleClose = () => {
    onClose()
    setError('')
    setSelectedFloor(null)
    setSelectedApartment(null)
    setMeters([])
    setPreviousReading(null)
    setHasPrevious(false)
    setCalculatedConsumption(null)
  }

  const handleFloorChange = (floorNo) => {
    setSelectedFloor(floorNo)
    setSelectedApartment(null)
    setValue('meter_id', null)
    setMeters([])
  }

  const handleApartmentChange = (apartmentId) => {
    setSelectedApartment(apartmentId)
    setValue('meter_id', null)
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      const submitData = {
        meter_id: data.meter_id,
        reading_date: data.reading_date,
        current_units: data.current_units,
        previous_month_reading: !hasPrevious ? data.previous_month_reading : null,
      }

      if (isEdit) {
        await meterReadingAPI.updateReading(reading.meter_reading_id, submitData)
      } else {
        await meterReadingAPI.createReading(submitData)
      }

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getMeterTypeInfo = (type) => METER_TYPES[type] || {}

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? 'Edit Meter Reading' : 'Add New Meter Reading'}
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

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            {/* Step 1: Select Floor */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Step 1: Select Location
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Floor</InputLabel>
                <Select
                  value={selectedFloor || ''}
                  onChange={(e) => handleFloorChange(e.target.value)}
                  label="Select Floor"
                >
                  {apartmentsByFloor.map((floor) => (
                    <MenuItem key={floor.floor_no} value={floor.floor_no}>
                      Floor {floor.floor_no} ({floor.apartments_count} apartments)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Step 2: Select Apartment */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth disabled={!selectedFloor}>
                <InputLabel>Select Apartment</InputLabel>
                <Select
                  value={selectedApartment || ''}
                  onChange={(e) => handleApartmentChange(e.target.value)}
                  label="Select Apartment"
                >
                  {filteredApartments.map((apartment) => (
                    <MenuItem key={apartment.apartment_id} value={apartment.apartment_id}>
                      Apartment {apartment.apartment_no}
                    </MenuItem>
                  ))}
                </Select>
                {!selectedFloor && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                    Please select a floor first
                  </Typography>
                )}
              </FormControl>
            </Grid>

            {/* Step 3: Select Meter */}
            <Grid item xs={12} md={4}>
              <Controller
                name="meter_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.meter_id} disabled={!selectedApartment}>
                    <InputLabel>Select Meter</InputLabel>
                    <Select
                      {...field}
                      label="Select Meter"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    >
                      {meters.map((meter) => (
                        <MenuItem key={meter.meter_id} value={meter.meter_id}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {getMeterTypeInfo(meter.meter_type).icon}
                            <Typography>{getMeterTypeInfo(meter.meter_type).label}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({meter.meter_serial_no})
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {!selectedApartment && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                        Please select an apartment first
                      </Typography>
                    )}
                    {errors.meter_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.meter_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Selected Meter Display */}
            {selectedMeterDetails && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Chip
                        icon={getMeterTypeInfo(selectedMeterDetails.meter_type).icon}
                        label={getMeterTypeInfo(selectedMeterDetails.meter_type).label}
                        color={getMeterTypeInfo(selectedMeterDetails.meter_type).color}
                      />
                      <Typography variant="body2">
                        Serial: {selectedMeterDetails.meter_serial_no}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Step 4: Enter Reading Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Step 2: Enter Reading Details
              </Typography>
            </Grid>

            {/* Reading Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="reading_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Reading Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.reading_date}
                    helperText={errors.reading_date?.message}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Current Units */}
            <Grid item xs={12} md={6}>
              <Controller
                name="current_units"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Current Reading"
                    placeholder="e.g., 1250"
                    type="number"
                    error={!!errors.current_units}
                    helperText={errors.current_units?.message}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>📊</Typography>,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Previous Reading Info or Manual Entry */}
            {checkingPrevious ? (
              <Grid item xs={12}>
                <Box display="flex" justifyContent="center" py={2}>
                  <CircularProgress size={24} />
                  <Typography sx={{ ml: 2 }}>Checking previous reading...</Typography>
                </Box>
              </Grid>
            ) : previousReading ? (
              <Grid item xs={12}>
                <Alert severity="info" icon={<TrendingUp />}>
                  <Typography variant="body2" fontWeight="medium">
                    Previous Reading (from {new Date(previousReading.reading_date).toLocaleDateString()}):
                    {' '}<strong>{previousReading.current_units} units</strong>
                  </Typography>
                </Alert>
              </Grid>
            ) : watchedMeterId && watchedReadingDate && !hasPrevious && (
              <Grid item xs={12} md={6}>
                <Controller
                  name="previous_month_reading"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Previous Month Reading (Manual)"
                      placeholder="e.g., 1000"
                      type="number"
                      error={!!errors.previous_month_reading}
                      helperText={
                        errors.previous_month_reading?.message ||
                        'No previous record found. Enter the previous reading manually.'
                      }
                      InputProps={{
                        startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>📝</Typography>,
                      }}
                    />
                  )}
                />
              </Grid>
            )}

            {/* Calculated Consumption Display */}
            {calculatedConsumption !== null && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ bgcolor: 'success.50', borderColor: 'success.main' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      <TrendingUp color="success" fontSize="large" />
                      <Box>
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                          {calculatedConsumption.toFixed(2)} units
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Units Consumed (Auto-calculated)
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}
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
          disabled={loading || !selectedMeterDetails}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Reading' : 'Create Reading'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MeterReadingForm

