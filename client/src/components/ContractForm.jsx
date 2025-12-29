import React, { useState, useEffect, useRef } from 'react'
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
  rent: yup.string().max(100, 'Rent must not exceed 100 characters').optional(),
  service_charges: yup.string().max(100, 'Service charges must not exceed 100 characters').optional(),
  security_fees: yup.string().max(100, 'Security fees must not exceed 100 characters').optional(),
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
  apartment_charges: yup
    .array()
    .of(
      yup.object({
        apartment_id: yup.number().required(),
        rent: yup.string().required('Rent is required').max(100, 'Rent must not exceed 100 characters'),
        service_charges: yup.string().required('Service charges are required').max(100, 'Service charges must not exceed 100 characters'),
        security_fees: yup.string().required('Security fees are required').max(100, 'Security fees must not exceed 100 characters'),
      })
    )
    .min(1, 'Please enter charges for each apartment'),
  is_active: yup.boolean(),
})

const ContractForm = ({ open, onClose, contract, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenants, setTenants] = useState([])
  const [apartments, setApartments] = useState([])
  const [apartmentsByFloor, setApartmentsByFloor] = useState([])
  const [selectedApartments, setSelectedApartments] = useState([])
  const [selectedFloors, setSelectedFloors] = useState([])
  const [filteredApartments, setFilteredApartments] = useState([])
  const [apartmentCharges, setApartmentCharges] = useState([])
  const [apartmentSelectOpen, setApartmentSelectOpen] = useState(false)
  const apartmentSelectRef = useRef(null)

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
      apartment_charges: [],
      is_active: true,
    },
  })

  const watchedApartments = watch('apartments')

  // Load tenants and apartments on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const apartmentParams = isEdit && contract?.contract_id ? { ignore_contract_id: contract.contract_id } : {}
        const [tenantsResponse, apartmentsResponse, apartmentsByFloorResponse] = await Promise.all([
          tenantAPI.getTenants({ limit: 100 }),
          contractAPI.getApartments(apartmentParams),
          contractAPI.getApartmentsByFloor(apartmentParams)
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
        apartment_charges: contract.apartment_charges || [],
        is_active: contract.is_active !== undefined ? contract.is_active : true,
      })
      setSelectedApartments(contract.apartments || [])
      setApartmentCharges(contract.apartment_charges || [])
      // Preselect all floors used in the contract
      if (contract.apartments && contract.apartments.length > 0) {
        const floors = [...new Set(contract.apartments.map((apt) => apt.floor_no))]
        setSelectedFloors(floors)
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
        apartment_charges: [],
        is_active: true,
      })
      setSelectedApartments([])
      setSelectedFloors([])
      setApartmentCharges([])
    }
    setError('')
  }, [contract, reset])

  // Filter apartments based on selected floor
  useEffect(() => {
    if (selectedFloors.length > 0) {
      const filtered = apartments.filter((apt) => selectedFloors.includes(apt.floor_no))
      setFilteredApartments(filtered)
    } else {
      setFilteredApartments(apartments)
    }
  }, [selectedFloors, apartments])

  const handleClose = () => {
    onClose()
    setError('')
    setSelectedApartments([])
    setSelectedFloors([])
    setApartmentCharges([])
  }

  const handleFloorChange = (floors) => {
    const normalizedFloors = floors || []
    setSelectedFloors(normalizedFloors)

    // Keep only apartments that belong to the selected floors
    const allowedApartmentIds = apartments
      .filter((apt) =>
        normalizedFloors.length === 0 ? true : normalizedFloors.includes(apt.floor_no)
      )
      .map((apt) => apt.apartment_id)

    const currentSelected = watch('apartments') || []
    const nextSelected = currentSelected.filter((id) => allowedApartmentIds.includes(id))

    if (nextSelected.length !== currentSelected.length) {
      handleApartmentChange(nextSelected)
    }

    setApartmentSelectOpen(false)
  }

  const handleApartmentChange = (apartmentIds) => {
    setValue('apartments', apartmentIds)
    
    // Update selected apartments display
    const selectedApts = apartments.filter(apt => apartmentIds.includes(apt.apartment_id))
    setSelectedApartments(selectedApts)

    // Sync per-apartment charges
    const updatedCharges = apartmentIds.map((id) => {
      const existing = apartmentCharges.find((c) => c.apartment_id === id)
      if (existing) return existing
      return {
        apartment_id: id,
        rent: '',
        service_charges: '',
        security_fees: '',
      }
    })
    setApartmentCharges(updatedCharges)
    setValue('apartment_charges', updatedCharges)
    setApartmentSelectOpen(false)
  }

  // Auto aggregate totals for header fields
  useEffect(() => {
    const totals = apartmentCharges.reduce(
      (acc, item) => {
        acc.rent += parseFloat(item.rent || 0)
        acc.service_charges += parseFloat(item.service_charges || 0)
        acc.security_fees += parseFloat(item.security_fees || 0)
        return acc
      },
      { rent: 0, service_charges: 0, security_fees: 0 }
    )

    setValue('rent', totals.rent ? totals.rent.toString() : '')
    setValue('service_charges', totals.service_charges ? totals.service_charges.toString() : '')
    setValue('security_fees', totals.security_fees ? totals.security_fees.toString() : '')
  }, [apartmentCharges, setValue])

  const updateApartmentCharge = (apartmentId, field, value) => {
    const updated = apartmentCharges.map((charge) =>
      charge.apartment_id === apartmentId ? { ...charge, [field]: value } : charge
    )
    setApartmentCharges(updated)
    setValue('apartment_charges', updated)
  }


  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      const payload = {
        ...data,
        apartment_charges: apartmentCharges,
      }

      if (isEdit) {
        await contractAPI.updateContract(contract.contract_id, payload)
      } else {
        await contractAPI.createContract(payload)
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
                <InputLabel>Select Floors</InputLabel>
                <Select
                  multiple
                  value={selectedFloors}
                  onChange={(e) => handleFloorChange(e.target.value)}
                  label="Select Floors"
                  input={<OutlinedInput label="Select Floors" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((floor) => (
                        <Chip key={floor} label={`Floor ${floor}`} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {apartmentsByFloor.map((floor) => (
                    <MenuItem key={floor.floor_no} value={floor.floor_no}>
                      <Checkbox checked={selectedFloors.includes(floor.floor_no)} />
                      <ListItemText primary={`Floor ${floor.floor_no}`} secondary={`${floor.apartments_count} apartments`} />
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
                      open={apartmentSelectOpen}
                      onOpen={() => setApartmentSelectOpen(true)}
                      onClose={() => setApartmentSelectOpen(false)}
                      multiple
                      value={field.value || []}
                      onChange={(e) => handleApartmentChange(e.target.value)}
                      input={<OutlinedInput label="Select Apartments" />}
                      inputRef={apartmentSelectRef}
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
                    {errors.apartments && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.apartments.message}
                      </Typography>
                    )}
                    {!errors.apartments && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.75 }}>
                        Choose apartments across any selected floors. Leave floors empty to see all.
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            {/* Add another apartment button */}
            {apartments.length > 0 && (
              <Grid item xs={12} md={6}>
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => {
                    setApartmentSelectOpen(true)
                    apartmentSelectRef.current?.focus()
                  }}
                  fullWidth
                  sx={{ height: '56px' }}
                >
                  Add another apartment
                </Button>
              </Grid>
            )}

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

            {selectedApartments.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>
                  Charges per Apartment
                </Typography>
              </Grid>
            )}

            {selectedApartments.map((apartment, index) => {
              const charge = apartmentCharges.find((c) => c.apartment_id === apartment.apartment_id) || {}
              return (
                <Grid item xs={12} key={apartment.apartment_id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          Floor {apartment.floor_no} - Apartment {apartment.apartment_no}
                        </Typography>
                        <Chip label={`#${index + 1}`} size="small" />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Rent"
                            value={charge.rent || ''}
                            onChange={(e) => updateApartmentCharge(apartment.apartment_id, 'rent', e.target.value)}
                            InputProps={{
                              startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>PKR</Typography>,
                            }}
                            error={!!errors.apartment_charges?.[index]?.rent}
                            helperText={errors.apartment_charges?.[index]?.rent?.message}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Service Charges"
                            value={charge.service_charges || ''}
                            onChange={(e) => updateApartmentCharge(apartment.apartment_id, 'service_charges', e.target.value)}
                            InputProps={{
                              startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>PKR</Typography>,
                            }}
                            error={!!errors.apartment_charges?.[index]?.service_charges}
                            helperText={errors.apartment_charges?.[index]?.service_charges?.message}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Security Fees"
                            value={charge.security_fees || ''}
                            onChange={(e) => updateApartmentCharge(apartment.apartment_id, 'security_fees', e.target.value)}
                            InputProps={{
                              startAdornment: <Typography sx={{ mr: 1, color: 'action.active' }}>PKR</Typography>,
                            }}
                            error={!!errors.apartment_charges?.[index]?.security_fees}
                            helperText={errors.apartment_charges?.[index]?.security_fees?.message}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
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
