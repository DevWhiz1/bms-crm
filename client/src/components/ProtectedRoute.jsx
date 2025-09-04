import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Box, CircularProgress } from '@mui/material'

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}
