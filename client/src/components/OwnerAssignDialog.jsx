import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material'
import { ownerAPI } from '../services/api'

const OwnerAssignDialog = ({ open, onClose, owner, onAssigned }) => {
  const [apartments, setApartments] = useState([])
  const [selectedApartment, setSelectedApartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const fetchApartments = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await ownerAPI.getAvailableApartments({ search })
      setApartments(response.data.apartments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load apartments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setSelectedApartment('')
      fetchApartments()
    }
  }, [open, search])

  const handleAssign = async () => {
    if (!selectedApartment) {
      setError('Please select an apartment')
      return
    }

    try {
      setLoading(true)
      setError('')
      await ownerAPI.assignApartment(owner.owner_id, Number(selectedApartment))
      onAssigned()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign apartment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign Apartment to {owner?.full_name}</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <TextField
            label="Search apartment"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Enter apartment no"
            fullWidth
          />

          <TextField
            select
            label="Select available apartment"
            value={selectedApartment}
            onChange={(e) => setSelectedApartment(e.target.value)}
            fullWidth
            helperText="Only apartments without an owner are shown"
            disabled={loading}
          >
            {apartments.length === 0 ? (
              <MenuItem value="" disabled>
                {loading ? 'Loading apartments...' : 'No available apartments'}
              </MenuItem>
            ) : (
              apartments.map((apt) => (
                <MenuItem key={apt.apartment_id} value={apt.apartment_id}>
                  <Box display="flex" justifyContent="space-between" width="100%">
                    <Typography>Apartment {apt.apartment_no}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Floor {apt.floor_no}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : null}
        >
          Assign Apartment
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OwnerAssignDialog


