import React, { useState, useEffect } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Business,
} from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { useAuth } from '../contexts/AuthContext'

// Validation schema
const signupSchema = yup.object({
  full_name: yup
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(255, 'Full name must not exceed 255 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces')
    .required('Full name is required'),
  email: yup
    .string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must not exceed 100 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one lowercase letter, one uppercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
})

const Signup = () => {
  const navigate = useNavigate()
  const { signup, isAuthenticated, error, clearError } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(signupSchema),
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Clear error when component mounts
  useEffect(() => {
    clearError()
  }, [clearError])

  const onSubmit = async (data) => {
    const { confirmPassword, ...signupData } = data
    const result = await signup(signupData)
    if (result.success) {
      navigate('/dashboard')
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box textAlign="center" mb={4}>
            <Business
              sx={{
                fontSize: 60,
                color: 'primary.main',
                mb: 2,
              }}
            />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join BMS CRM and start managing your business
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Signup Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Full Name"
              margin="normal"
              autoComplete="name"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              {...register('full_name')}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              margin="normal"
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              margin="normal"
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={toggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isSubmitting}
              sx={{
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                mb: 3,
                background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                },
              }}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>

            {/* Sign In Link */}
            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default Signup
