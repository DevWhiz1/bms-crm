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
} from '@mui/material'
import {
  Close,
  ElectricBolt,
  Water,
  Home,
  Speed,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { meterAPI, contractAPI } from '../services/api'

// Validation schema
const meterSchema = yup.object({
  apartment_id: yup
    .number()
    .required('Apartment is required')
    .positive('Please select an apartment'),
  meter_serial_no: yup
    .string()
    .required('Meter serial number is required')
    .min(1, 'Meter serial number must be at least 1 character')
    .max(50, 'Meter serial number must not exceed 50 characters')
    .trim(),
  meter_type: yup
    .number()
    .required('Meter type is required')
    .oneOf([1, 2, 3], 'Please select a valid meter type'),
})

// Meter type options
const METER_TYPES = {
  1: { label: 'WAPDA', icon: <ElectricBolt />, color: 'warning' },
  2: { label: 'Generator', icon: <Speed />, color: 'error' },
  3: { label: 'Water', icon: <Water />, color: 'info' },
}

const MeterForm = ({ open, onClose, meter, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apartments, setApartments] = useState([])
  const [apartmentsByFloor, setApartmentsByFloor] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [filteredApartments, setFilteredApartments] = useState([])

  const isEdit = !!meter

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(meterSchema),
    defaultValues: {
      apartment_id: null,
      meter_serial_no: '',
      meter_type: null,
    },
  })

  const watchedMeterType = watch('meter_type')

  // Load apartments on component mount
  useEffect(() => {
    const loadApartments = async () => {
      try {
        const [apartmentsResponse, apartmentsByFloorResponse] = await Promise.all([
          contractAPI.getApartments(),
          contractAPI.getApartmentsByFloor(),
        ])

        setApartments(apartmentsResponse.data.apartments)
        setApartmentsByFloor(apartmentsByFloorResponse.data.apartments_by_floor)
      } catch (err) {
        console.error('Error loading apartments:', err)
      }
    }

    if (open) {
      loadApartments()
    }
  }, [open])

  // Reset form when meter changes
  useEffect(() => {
    if (meter) {
      reset({
        apartment_id: meter.apartment_id || null,
        meter_serial_no: meter.meter_serial_no || '',
        meter_type: meter.meter_type || null,
      })
      // Set initial floor based on apartment if editing
      if (meter.apartment_id && meter.floor_no) {
        setSelectedFloor(meter.floor_no)
      }
    } else {
      reset({
        apartment_id: null,
        meter_serial_no: '',
        meter_type: null,
      })
      setSelectedFloor(null)
    }
    setError('')
  }, [meter, reset])

  // Filter apartments based on selected floor
  useEffect(() => {
    if (selectedFloor) {
      const filtered = apartments.filter(apt => apt.floor_no === selectedFloor)
      setFilteredApartments(filtered)
    } else {
      setFilteredApartments(apartments)
    }
  }, [selectedFloor, apartments])

  const handleClose = () => {
    onClose()
    setError('')
    setSelectedFloor(null)
  }

  const handleFloorChange = (floorNo) => {
    setSelectedFloor(floorNo)
    // Clear selected apartment when floor changes
    setValue('apartment_id', null)
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      if (isEdit) {
        await meterAPI.updateMeter(meter.meter_id, data)
      } else {
        await meterAPI.createMeter(data)
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? 'Edit Meter' : 'Add New Meter'}
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
            {/* Meter Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Meter Details
              </Typography>
            </Grid>

            {/* Meter Serial Number */}
            <Grid item xs={12} md={6}>
              <Controller
                name="meter_serial_no"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Meter Serial Number"
                    placeholder="e.g., MTR-001-2024"
                    error={!!errors.meter_serial_no}
                    helperText={errors.meter_serial_no?.message}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>🔢</Typography>,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Meter Type */}
            <Grid item xs={12} md={6}>
              <Controller
                name="meter_type"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.meter_type}>
                    <InputLabel>Meter Type</InputLabel>
                    <Select
                      {...field}
                      label="Meter Type"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    >
                      {Object.entries(METER_TYPES).map(([value, info]) => (
                        <MenuItem key={value} value={parseInt(value)}>
                          <Box display="flex" alignItems="center" gap={1}>
                            {info.icon}
                            <Typography>{info.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.meter_type && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.meter_type.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Selected Meter Type Display */}
            {watchedMeterType && (
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ bgcolor: 'grey.50' }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        Selected Meter Type:
                      </Typography>
                      <Chip
                        icon={getMeterTypeInfo(watchedMeterType).icon}
                        label={getMeterTypeInfo(watchedMeterType).label}
                        color={getMeterTypeInfo(watchedMeterType).color}
                        size="small"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Apartment Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                Apartment Selection
              </Typography>
            </Grid>

            {/* Floor Selection */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select Floor</InputLabel>
                <Select
                  value={selectedFloor || ''}
                  onChange={(e) => handleFloorChange(e.target.value)}
                  label="Select Floor"
                  startAdornment={<Home sx={{ mr: 1, color: 'action.active' }} />}
                >
                  <MenuItem value="">
                    <em>All Floors</em>
                  </MenuItem>
                  {apartmentsByFloor.map((floor) => (
                    <MenuItem key={floor.floor_no} value={floor.floor_no}>
                      Floor {floor.floor_no} ({floor.apartments_count} apartments)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Apartment Selection */}
            <Grid item xs={12} md={6}>
              <Controller
                name="apartment_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.apartment_id}>
                    <InputLabel>Select Apartment</InputLabel>
                    <Select
                      {...field}
                      label="Select Apartment"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      disabled={!selectedFloor}
                    >
                      {filteredApartments.map((apartment) => (
                        <MenuItem key={apartment.apartment_id} value={apartment.apartment_id}>
                          Apartment {apartment.apartment_no} - Floor {apartment.floor_no}
                        </MenuItem>
                      ))}
                    </Select>
                    {!selectedFloor && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                        Please select a floor first
                      </Typography>
                    )}
                    {errors.apartment_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.apartment_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Meter' : 'Create Meter'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MeterForm

