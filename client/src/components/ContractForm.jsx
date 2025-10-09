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
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  IconButton,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Autocomplete,
} from '@mui/material'
import {
  Close,
  AttachMoney,
  CalendarToday,
  Home,
  Person,
  Add,
  Remove,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { contractAPI, tenantAPI } from '../services/api'

// Validation schema
const contractSchema = yup.object({
  rent: yup
    .string()
    .required('Rent is required')
    .max(100, 'Rent must not exceed 100 characters'),
  service_charges: yup
    .string()
    .required('Service charges are required')
    .max(100, 'Service charges must not exceed 100 characters'),
  security_fees: yup
    .string()
    .required('Security fees are required')
    .max(100, 'Security fees must not exceed 100 characters'),
  contract_start_date: yup
    .date()
    .required('Contract start date is required')
    .typeError('Please enter a valid date'),
  contract_end_date: yup
    .date()
    .required('Contract end date is required')
    .typeError('Please enter a valid date')
    .min(yup.ref('contract_start_date'), 'End date must be after start date'),
  tenant_id: yup
    .number()
    .required('Tenant is required')
    .positive('Please select a tenant'),
  apartments: yup
    .array()
    .min(1, 'At least one apartment must be selected')
    .required('Apartments are required'),
  is_active: yup.boolean(),
})

const ContractForm = ({ open, onClose, contract, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenants, setTenants] = useState([])
  const [apartments, setApartments] = useState([])
  const [apartmentsByFloor, setApartmentsByFloor] = useState([])
  const [selectedApartments, setSelectedApartments] = useState([])
  const [selectedFloor, setSelectedFloor] = useState(null)
  const [filteredApartments, setFilteredApartments] = useState([])

  const isEdit = !!contract

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: yupResolver(contractSchema),
    defaultValues: {
      rent: '',
      service_charges: '',
      security_fees: '',
      contract_start_date: '',
      contract_end_date: '',
      tenant_id: null,
      apartments: [],
      is_active: true,
    },
  })

  const watchedApartments = watch('apartments')

  // Load tenants and apartments on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tenantsResponse, apartmentsResponse, apartmentsByFloorResponse] = await Promise.all([
          tenantAPI.getTenants({ limit: 100 }),
          contractAPI.getApartments(),
          contractAPI.getApartmentsByFloor()
        ])

        setTenants(tenantsResponse.data.tenants)
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

  // Reset form when contract changes
  useEffect(() => {
    if (contract) {
      // Format dates properly for the date inputs
      const startDate = contract.contract_start_date ? 
        new Date(contract.contract_start_date).toISOString().split('T')[0] : ''
      const endDate = contract.contract_end_date ? 
        new Date(contract.contract_end_date).toISOString().split('T')[0] : ''
      
      reset({
        rent: contract.rent?.toString() || '',
        service_charges: contract.service_charges?.toString() || '',
        security_fees: contract.security_fees?.toString() || '',
        contract_start_date: startDate,
        contract_end_date: endDate,
        tenant_id: contract.tenant_id || null,
        apartments: contract.apartments?.map(apt => apt.apartment_id) || [],
        is_active: contract.is_active !== undefined ? contract.is_active : true,
      })
      setSelectedApartments(contract.apartments || [])
      // Set initial floor based on first apartment if editing
      if (contract.apartments && contract.apartments.length > 0) {
        setSelectedFloor(contract.apartments[0].floor_no)
      }
    } else {
      reset({
        rent: '',
        service_charges: '',
        security_fees: '',
        contract_start_date: '',
        contract_end_date: '',
        tenant_id: null,
        apartments: [],
        is_active: true,
      })
      setSelectedApartments([])
      setSelectedFloor(null)
    }
    setError('')
  }, [contract, reset])

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
    setSelectedApartments([])
    setSelectedFloor(null)
  }

  const handleFloorChange = (floorNo) => {
    setSelectedFloor(floorNo)
    // Clear selected apartments when floor changes
    setValue('apartments', [])
    setSelectedApartments([])
  }

  const handleApartmentChange = (apartmentIds) => {
    setValue('apartments', apartmentIds)
    
    // Update selected apartments display
    const selectedApts = apartments.filter(apt => apartmentIds.includes(apt.apartment_id))
    setSelectedApartments(selectedApts)
  }


  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      if (isEdit) {
        await contractAPI.updateContract(contract.contract_id, data)
      } else {
        await contractAPI.createContract(data)
      }

      onSuccess()
      handleClose()
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? 'Edit Contract' : 'Add New Contract'}
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
            {/* Contract Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Contract Details
              </Typography>
            </Grid>

            {/* Rent */}
            <Grid item xs={12} md={4}>
              <Controller
                name="rent"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Rent"
                    placeholder="e.g., 50000"
                    error={!!errors.rent}
                    helperText={errors.rent?.message}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>PKR</Typography>,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Service Charges */}
            <Grid item xs={12} md={4}>
              <Controller
                name="service_charges"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Service Charges"
                    placeholder="e.g., 5000"
                    error={!!errors.service_charges}
                    helperText={errors.service_charges?.message}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>PKR</Typography>,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Security Fees */}
            <Grid item xs={12} md={4}>
              <Controller
                name="security_fees"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Security Fees"
                    placeholder="e.g., 100000"
                    error={!!errors.security_fees}
                    helperText={errors.security_fees?.message}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>PKR</Typography>,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Contract Start Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="contract_start_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Contract Start Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.contract_start_date}
                    helperText={errors.contract_start_date?.message}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Contract End Date */}
            <Grid item xs={12} md={6}>
              <Controller
                name="contract_end_date"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Contract End Date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.contract_end_date}
                    helperText={errors.contract_end_date?.message}
                    InputProps={{
                      startAdornment: <CalendarToday sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Tenant Selection */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                Tenant Selection
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="tenant_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.tenant_id}>
                    <InputLabel>Select Tenant</InputLabel>
                    <Select
                      {...field}
                      label="Select Tenant"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                      startAdornment={<Person sx={{ mr: 1, color: 'action.active' }} />}
                    >
                      {tenants.map((tenant) => (
                        <MenuItem key={tenant.tenant_id} value={tenant.tenant_id}>
                          {tenant.full_name} - {tenant.cnic}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.tenant_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.tenant_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Active Status */}
            <Grid item xs={12} md={6}>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={field.onChange}
                        color="primary"
                      />
                    }
                    label="Active Contract"
                    sx={{ mt: 2 }}
                  />
                )}
              />
            </Grid>

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
                name="apartments"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.apartments}>
                    <InputLabel>Select Apartments</InputLabel>
                    <Select
                      multiple
                      value={field.value || []}
                      onChange={(e) => handleApartmentChange(e.target.value)}
                      input={<OutlinedInput label="Select Apartments" />}
                      disabled={!selectedFloor}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const apartment = apartments.find(apt => apt.apartment_id === value)
                            return (
                              <Chip
                                key={value}
                                label={`Apt ${apartment?.apartment_no}`}
                                size="small"
                              />
                            )
                          })}
                        </Box>
                      )}
                    >
                      {filteredApartments.map((apartment) => (
                        <MenuItem key={apartment.apartment_id} value={apartment.apartment_id}>
                          <Checkbox
                            checked={field.value?.includes(apartment.apartment_id) || false}
                          />
                          <ListItemText
                            primary={`Apartment ${apartment.apartment_no}`}
                            secondary={`Floor ${apartment.floor_no}`}
                          />
                        </MenuItem>
                      ))}
                    </Select>
                    {!selectedFloor && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                        Please select a floor first
                      </Typography>
                    )}
                    {errors.apartments && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.apartments.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Selected Apartments Display */}
            {selectedApartments.length > 0 && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected Apartments:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedApartments.map((apartment) => (
                        <Chip
                          key={apartment.apartment_id}
                          icon={<Home />}
                          label={`Floor ${apartment.floor_no} - Apt ${apartment.apartment_no}`}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Saving...' : isEdit ? 'Update Contract' : 'Create Contract'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ContractForm
