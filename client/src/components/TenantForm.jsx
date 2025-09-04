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
  Avatar,
  Card,
  CardContent,
} from '@mui/material'
import {
  Close,
  PhotoCamera,
  Person,
  Badge,
  Phone,
  Home,
} from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { tenantAPI } from '../services/api'

// Validation schema
const tenantSchema = yup.object({
  full_name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'),
  cnic: yup
    .string()
    .required('CNIC is required')
    .matches(/^\d{5}-\d{7}-\d{1}$/, 'CNIC must be in format XXXXX-XXXXXXX-X'),
  mobile_no: yup
    .string()
    .nullable()
    .test('phone', 'Please enter a valid Pakistani phone number', function(value) {
      if (!value) return true // Optional field
      const phoneRegex = /^(\+92|0)?[0-9]{10}$/
      return phoneRegex.test(value.replace(/[\s-]/g, ''))
    }),
  phone_no: yup
    .string()
    .nullable()
    .test('phone', 'Please enter a valid Pakistani phone number', function(value) {
      if (!value) return true // Optional field
      const phoneRegex = /^(\+92|0)?[0-9]{10}$/
      return phoneRegex.test(value.replace(/[\s-]/g, ''))
    }),
  is_active: yup.boolean(),
})

const TenantForm = ({ open, onClose, tenant, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const [cnicPhotoPreview, setCnicPhotoPreview] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)
  const [cnicPhotoFile, setCnicPhotoFile] = useState(null)

  const isEdit = !!tenant

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(tenantSchema),
    defaultValues: {
      full_name: '',
      cnic: '',
      mobile_no: '',
      phone_no: '',
      is_active: true,
    },
  })

  // Reset form when tenant changes
  useEffect(() => {
    if (tenant) {
      reset({
        full_name: tenant.full_name || '',
        cnic: tenant.cnic || '',
        mobile_no: tenant.mobile_no || '',
        phone_no: tenant.phone_no || '',
        is_active: tenant.is_active !== undefined ? tenant.is_active : true,
      })
      setPhotoPreview(tenant.photo_url || null)
      setCnicPhotoPreview(tenant.cnic_photo_url || null)
    } else {
      reset({
        full_name: '',
        cnic: '',
        mobile_no: '',
        phone_no: '',
        is_active: true,
      })
      setPhotoPreview(null)
      setCnicPhotoPreview(null)
    }
    setError('')
    setPhotoFile(null)
    setCnicPhotoFile(null)
  }, [tenant, reset])

  const handleClose = () => {
    onClose()
    setError('')
    setPhotoPreview(null)
    setCnicPhotoPreview(null)
    setPhotoFile(null)
    setCnicPhotoFile(null)
  }

  const handlePhotoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleCnicPhotoChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setCnicPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setCnicPhotoPreview(e.target.result)
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data) => {
    try {
      setLoading(true)
      setError('')

      const formData = new FormData()
      formData.append('full_name', data.full_name)
      formData.append('cnic', data.cnic)
      formData.append('mobile_no', data.mobile_no || '')
      formData.append('phone_no', data.phone_no || '')
      formData.append('is_active', data.is_active)

      if (photoFile) {
        formData.append('photo', photoFile)
      }
      if (cnicPhotoFile) {
        formData.append('cnic_photo', cnicPhotoFile)
      }

      if (isEdit) {
        await tenantAPI.updateTenant(tenant.tenant_id, formData)
      } else {
        await tenantAPI.createTenant(formData)
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            {isEdit ? 'Edit Tenant' : 'Add New Tenant'}
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
            {/* Photo Upload Section */}
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tenant Photo
                </Typography>
                <Box position="relative" display="inline-block">
                  <Avatar
                    src={photoPreview}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      bgcolor: 'grey.200',
                    }}
                  >
                    <Person sx={{ fontSize: 60 }} />
                  </Avatar>
                  <IconButton
                    color="primary"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'white',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <PhotoCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Click to upload photo
                </Typography>
              </Card>
            </Grid>

            {/* CNIC Photo Upload Section */}
            <Grid item xs={12} md={4}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  CNIC Photo
                </Typography>
                <Box position="relative" display="inline-block">
                  <Avatar
                    src={cnicPhotoPreview}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      bgcolor: 'grey.200',
                    }}
                  >
                    <Badge sx={{ fontSize: 60 }} />
                  </Avatar>
                  <IconButton
                    color="primary"
                    component="label"
                    sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      bgcolor: 'white',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                  >
                    <PhotoCamera />
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleCnicPhotoChange}
                    />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Click to upload CNIC photo
                </Typography>
              </Card>
            </Grid>

            {/* Form Fields */}
            <Grid item xs={12} md={4}>
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
                    label="Active"
                    sx={{ mb: 2 }}
                  />
                )}
              />
            </Grid>

            {/* Full Name */}
            <Grid item xs={12} md={6}>
              <Controller
                name="full_name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Full Name"
                    error={!!errors.full_name}
                    helperText={errors.full_name?.message}
                    InputProps={{
                      startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* CNIC */}
            <Grid item xs={12} md={6}>
              <Controller
                name="cnic"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="CNIC"
                    placeholder="XXXXX-XXXXXXX-X"
                    error={!!errors.cnic}
                    helperText={errors.cnic?.message}
                    InputProps={{
                      startAdornment: <Badge sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Mobile Number */}
            <Grid item xs={12} md={6}>
              <Controller
                name="mobile_no"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Mobile Number"
                    placeholder="+92XXXXXXXXXX"
                    error={!!errors.mobile_no}
                    helperText={errors.mobile_no?.message}
                    InputProps={{
                      startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
                )}
              />
            </Grid>

            {/* Phone Number */}
            <Grid item xs={12} md={6}>
              <Controller
                name="phone_no"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    placeholder="+92XXXXXXXXXX"
                    error={!!errors.phone_no}
                    helperText={errors.phone_no?.message}
                    InputProps={{
                      startAdornment: <Home sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                  />
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
          {loading ? 'Saving...' : isEdit ? 'Update Tenant' : 'Create Tenant'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TenantForm
