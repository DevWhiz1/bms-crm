import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
} from '@mui/material'
import {
  Add,
  Search,
  MoreVert,
  Edit,
  Delete,
  HomeWork,
  Phone,
  FilterList,
  Link as LinkIcon,
} from '@mui/icons-material'
import Layout from '../components/Layout'
import OwnerForm from '../components/OwnerForm'
import OwnerAssignDialog from '../components/OwnerAssignDialog'
import OwnerApartmentsDialog from '../components/OwnerApartmentsDialog'
import { ownerAPI } from '../services/api'

const Owners = () => {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })
  const [filters, setFilters] = useState({
    search: '',
    is_active: 'true',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  })
  const [formOpen, setFormOpen] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ownerToDelete, setOwnerToDelete] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRowId, setSelectedRowId] = useState(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const fetchOwners = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters,
      }
      const response = await ownerAPI.getOwners(params)
      setOwners(response.data.owners)
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch owners')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwners()
  }, [pagination.page, filters])

  const handleSearch = (event) => {
    const value = event.target.value
    setFilters((prev) => ({ ...prev, search: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }))
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, page }))
  }

  const handleMenuOpen = (event, ownerId) => {
    setAnchorEl(event.currentTarget)
    setSelectedRowId(ownerId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedRowId(null)
  }

  const handleEdit = (owner) => {
    setSelectedOwner(owner)
    setFormOpen(true)
    handleMenuClose()
  }

  const handleDelete = (owner) => {
    setOwnerToDelete(owner)
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  const confirmDelete = async () => {
    try {
      await ownerAPI.deleteOwner(ownerToDelete.owner_id)
      fetchOwners()
      setDeleteDialogOpen(false)
      setOwnerToDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete owner')
    }
  }

  const handleFormSuccess = () => {
    fetchOwners()
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setSelectedOwner(null)
  }

  const handleAssign = (owner) => {
    setSelectedOwner(owner)
    setAssignDialogOpen(true)
    handleMenuClose()
  }

  const handleView = (owner) => {
    setSelectedOwner(owner)
    setViewDialogOpen(true)
    handleMenuClose()
  }

  const getStatusColor = (isActive) => (isActive ? 'success' : 'error')
  const getStatusLabel = (isActive) => (isActive ? 'Active' : 'Inactive')

  return (
    <Layout>
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Owner Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage owners and connect them to apartments
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
            sx={{
              background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
              '&:hover': { background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)' },
            }}
          >
            Add Owner
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search owners..."
                  value={filters.search}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.is_active}
                    label="Status"
                    onChange={(e) => handleFilterChange('is_active', e.target.value)}
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <MenuItem value="created_at">Created Date</MenuItem>
                    <MenuItem value="full_name">Name</MenuItem>
                    <MenuItem value="cnic">CNIC</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Order</InputLabel>
                  <Select
                    value={filters.sortOrder}
                    label="Order"
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  >
                    <MenuItem value="DESC">Descending</MenuItem>
                    <MenuItem value="ASC">Ascending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Photo</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>CNIC</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Units Owned</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : owners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No owners found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  owners.map((owner) => (
                    <TableRow key={owner.owner_id} hover>
                      <TableCell>
                        <Avatar src={owner.photo_url} sx={{ width: 40, height: 40 }}>
                          <HomeWork />
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="600">
                          {owner.full_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{owner.cnic}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Phone sx={{ mr: 1, fontSize: 16, color: 'action.active' }} />
                          <Typography variant="body2">{owner.phone_no || 'N/A'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${owner.apartments_count || 0} apartment(s)`}
                          size="small"
                          color="info"
                          icon={<FilterList sx={{ fontSize: 16 }} />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(owner.is_active)}
                          color={getStatusColor(owner.is_active)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(owner.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, owner.owner_id)} size="small">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalPages > 1 && (
            <Box display="flex" justifyContent="center" p={2}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Card>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleEdit(owners.find((o) => o.owner_id === selectedRowId))}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => handleView(owners.find((o) => o.owner_id === selectedRowId))}>
            <HomeWork sx={{ mr: 1 }} />
            View Apartments
          </MenuItem>
          <MenuItem onClick={() => handleAssign(owners.find((o) => o.owner_id === selectedRowId))}>
            <LinkIcon sx={{ mr: 1 }} />
            Assign Apartment
          </MenuItem>
          <MenuItem
            onClick={() => handleDelete(owners.find((o) => o.owner_id === selectedRowId))}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>

        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Delete Owner</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete{' '}
              <strong>{ownerToDelete?.full_name || 'this owner'}</strong>? This will mark the owner
              as inactive.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <OwnerForm
          open={formOpen}
          onClose={handleFormClose}
          owner={selectedOwner}
          onSuccess={handleFormSuccess}
        />

        <OwnerAssignDialog
          open={assignDialogOpen}
          onClose={() => setAssignDialogOpen(false)}
          owner={selectedOwner}
          onAssigned={fetchOwners}
        />

        <OwnerApartmentsDialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          owner={selectedOwner}
          onChanged={fetchOwners}
        />
      </Container>
    </Layout>
  )
}

export default Owners

