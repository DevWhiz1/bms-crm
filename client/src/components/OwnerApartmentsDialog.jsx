import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Chip,
} from '@mui/material'
import { Delete, HomeWork, Refresh } from '@mui/icons-material'
import { ownerAPI } from '../services/api'

const OwnerApartmentsDialog = ({ open, onClose, owner, onChanged }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apartments, setApartments] = useState([])

  const fetchOwner = async () => {
    if (!owner) return
    try {
      setLoading(true)
      setError('')
      const response = await ownerAPI.getOwnerById(owner.owner_id)
      setApartments(response.data.owner?.apartments || response.data.owner?.apartments || response.data.owner?.apartments || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load apartments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchOwner()
    } else {
      setApartments([])
      setError('')
    }
  }, [open])

  const handleRemove = async (apartmentId) => {
    try {
      setLoading(true)
      setError('')
      await ownerAPI.unassignApartment(owner.owner_id, apartmentId)
      await fetchOwner()
      if (onChanged) onChanged()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unassign apartment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Apartments for {owner?.full_name}</Typography>
          <IconButton onClick={fetchOwner} size="small" disabled={loading}>
            <Refresh />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : apartments.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No apartments assigned to this owner.
          </Typography>
        ) : (
          <List>
            {apartments.map((apt, idx) => (
              <React.Fragment key={apt.apartment_id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <HomeWork fontSize="small" />
                        <Typography variant="subtitle1">Apartment {apt.apartment_no}</Typography>
                        <Chip label={`Floor ${apt.floor_no}`} size="small" />
                      </Box>
                    }
                    secondary={`ID: ${apt.apartment_id}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleRemove(apt.apartment_id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {idx < apartments.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default OwnerApartmentsDialog


