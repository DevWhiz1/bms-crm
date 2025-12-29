import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API endpoints
export const authAPI = {
  // User registration
  signup: async (userData) => {
    const response = await api.post('/users/signup', userData)
    return response.data
  },

  // User login
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials)
    return response.data
  },

  // User logout
  logout: async () => {
    const response = await api.post('/users/logout')
    return response.data
  },

  // Get user profile
  getProfile: async () => {
    const response = await api.get('/users/profile')
    return response.data
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData)
    return response.data
  },

  // Verify token
  verifyToken: async () => {
    const response = await api.get('/users/verify-token')
    return response.data
  },
}

// Tenant API endpoints
export const tenantAPI = {
  // Get all tenants with pagination and filters
  getTenants: async (params = {}) => {
    const response = await api.get('/tenants', { params })
    return response.data
  },

  // Get tenant by ID
  getTenantById: async (id) => {
    const response = await api.get(`/tenants/${id}`)
    return response.data
  },

  // Create new tenant
  createTenant: async (formData) => {
    const response = await api.post('/tenants', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Update tenant
  updateTenant: async (id, formData) => {
    const response = await api.put(`/tenants/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Delete tenant
  deleteTenant: async (id) => {
    const response = await api.delete(`/tenants/${id}`)
    return response.data
  },

  // Get tenant statistics
  getTenantStats: async () => {
    const response = await api.get('/tenants/stats')
    return response.data
  },
}

// Owner API endpoints
export const ownerAPI = {
  getOwners: async (params = {}) => {
    const response = await api.get('/owners', { params })
    return response.data
  },

  getOwnerById: async (id) => {
    const response = await api.get(`/owners/${id}`)
    return response.data
  },

  createOwner: async (formData) => {
    const response = await api.post('/owners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  updateOwner: async (id, formData) => {
    const response = await api.put(`/owners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  deleteOwner: async (id) => {
    const response = await api.delete(`/owners/${id}`)
    return response.data
  },

  getOwnerStats: async () => {
    const response = await api.get('/owners/stats')
    return response.data
  },

  getAvailableApartments: async (params = {}) => {
    const response = await api.get('/owners/available-apartments', { params })
    return response.data
  },

  assignApartment: async (ownerId, apartmentId) => {
    const response = await api.post(`/owners/${ownerId}/assign-apartment`, {
      apartment_id: apartmentId,
    })
    return response.data
  },

  unassignApartment: async (ownerId, apartmentId) => {
    const response = await api.post(`/owners/${ownerId}/unassign-apartment`, {
      apartment_id: apartmentId,
    })
    return response.data
  },
}

// Contract API endpoints
export const contractAPI = {
  // Get all contracts with pagination and filters
  getContracts: async (params = {}) => {
    const response = await api.get('/contracts', { params })
    return response.data
  },

  // Get contract by ID
  getContractById: async (id) => {
    const response = await api.get(`/contracts/${id}`)
    return response.data
  },

  // Create new contract
  createContract: async (contractData) => {
    const response = await api.post('/contracts', contractData)
    return response.data
  },

  // Update contract
  updateContract: async (id, contractData) => {
    const response = await api.put(`/contracts/${id}`, contractData)
    return response.data
  },

  // Delete contract
  deleteContract: async (id) => {
    const response = await api.delete(`/contracts/${id}`)
    return response.data
  },

  // Get contract statistics
  getContractStats: async () => {
    const response = await api.get('/contracts/stats')
    return response.data
  },

  // Get all apartments
  getApartments: async (params = {}) => {
    const response = await api.get('/contracts/apartments', { params })
    return response.data
  },

  // Get apartments grouped by floor
  getApartmentsByFloor: async (params = {}) => {
    const response = await api.get('/contracts/apartments/by-floor', { params })
    return response.data
  },
}

// Meter API endpoints
export const meterAPI = {
  // Get all meters with pagination and filters
  getMeters: async (params = {}) => {
    const response = await api.get('/meters', { params })
    return response.data
  },

  // Get meter by ID
  getMeterById: async (id) => {
    const response = await api.get(`/meters/${id}`)
    return response.data
  },

  // Create new meter
  createMeter: async (meterData) => {
    const response = await api.post('/meters', meterData)
    return response.data
  },

  // Update meter
  updateMeter: async (id, meterData) => {
    const response = await api.put(`/meters/${id}`, meterData)
    return response.data
  },

  // Delete meter
  deleteMeter: async (id) => {
    const response = await api.delete(`/meters/${id}`)
    return response.data
  },

  // Get meters by apartment
  getMetersByApartment: async (apartmentId) => {
    const response = await api.get(`/meters/apartment/${apartmentId}`)
    return response.data
  },

  // Get meter statistics
  getMeterStats: async () => {
    const response = await api.get('/meters/stats')
    return response.data
  },
}

// Meter Reading API endpoints
export const meterReadingAPI = {
  // Get all meter readings with pagination and filters
  getReadings: async (params = {}) => {
    const response = await api.get('/meter-readings', { params })
    return response.data
  },

  // Get reading by ID
  getReadingById: async (id) => {
    const response = await api.get(`/meter-readings/${id}`)
    return response.data
  },

  // Create new meter reading
  createReading: async (readingData) => {
    const response = await api.post('/meter-readings', readingData)
    return response.data
  },

  // Update meter reading
  updateReading: async (id, readingData) => {
    const response = await api.put(`/meter-readings/${id}`, readingData)
    return response.data
  },

  // Delete meter reading
  deleteReading: async (id) => {
    const response = await api.delete(`/meter-readings/${id}`)
    return response.data
  },

  // Get readings by meter
  getReadingsByMeter: async (meterId, limit = 12) => {
    const response = await api.get(`/meter-readings/meter/${meterId}`, {
      params: { limit },
    })
    return response.data
  },

  // Get readings by apartment
  getReadingsByApartment: async (apartmentId) => {
    const response = await api.get(`/meter-readings/apartment/${apartmentId}`)
    return response.data
  },

  // Check previous reading
  checkPreviousReading: async (meterId, readingDate) => {
    const response = await api.get('/meter-readings/check-previous', {
      params: { meter_id: meterId, reading_date: readingDate },
    })
    return response.data
  },

  // Get meter reading statistics
  getReadingStats: async () => {
    const response = await api.get('/meter-readings/stats')
    return response.data
  },

  // Get consumption by meter type
  getConsumptionByType: async (startDate = null, endDate = null) => {
    const response = await api.get('/meter-readings/consumption-by-type', {
      params: { start_date: startDate, end_date: endDate },
    })
    return response.data
  },
}

// Monthly Bill API endpoints
export const monthlyBillAPI = {
  // Generate bills for a month
  generateBills: async (billData) => {
    const response = await api.post('/monthly-bills/generate', billData)
    return response.data
  },

  // Get all bills with pagination and filters
  getBills: async (params = {}) => {
    const response = await api.get('/monthly-bills', { params })
    return response.data
  },

  // Get bill by ID
  getBillById: async (id) => {
    const response = await api.get(`/monthly-bills/${id}`)
    return response.data
  },

  // Update bill
  updateBill: async (id, billData) => {
    const response = await api.put(`/monthly-bills/${id}`, billData)
    return response.data
  },

  // Mark bill as paid
  markBillAsPaid: async (id) => {
    const response = await api.patch(`/monthly-bills/${id}/mark-paid`)
    return response.data
  },

  // Record a payment for a bill
  addPayment: async (id, paymentData) => {
    const response = await api.post(`/monthly-bills/${id}/payments`, paymentData)
    return response.data
  },

  // Get payments for a bill
  getPayments: async (id) => {
    const response = await api.get(`/monthly-bills/${id}/payments`)
    return response.data
  },

  // Delete bill
  deleteBill: async (id) => {
    const response = await api.delete(`/monthly-bills/${id}`)
    return response.data
  },

  // Get bill statistics
  getBillStats: async () => {
    const response = await api.get('/monthly-bills/stats')
    return response.data
  },

  // Check if bills exist for a month
  checkBillsExist: async (month) => {
    const response = await api.get('/monthly-bills/check-exists', {
      params: { month },
    })
    return response.data
  },
}

// Owner Payout API endpoints
export const ownerPayoutAPI = {
  // Generate payouts for a month
  generate: async (month) => {
    const response = await api.post('/owner-payouts/generate', {}, { params: { month } })
    return response.data
  },

  // List payouts for a month
  list: async (month) => {
    const response = await api.get('/owner-payouts', { params: { month } })
    return response.data
  },

  // Get payout items
  getItems: async (payoutId) => {
    const response = await api.get(`/owner-payouts/${payoutId}/items`)
    return response.data
  },

  // Mark payout as paid
  markPaid: async (payoutId, payload = {}) => {
    const response = await api.patch(`/owner-payouts/${payoutId}/mark-paid`, payload)
    return response.data
  },
}

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  },
}

// Invoice API endpoints
export const invoiceAPI = {
  // Get detailed invoice data
  getInvoiceDetails: async (billId, signal = null) => {
    const config = {
      timeout: 15000, // 15 second timeout
      ...(signal && { signal })
    }
    const response = await api.get(`/invoices/${billId}`, config)
    return response.data
  },

  // Generate PDF (placeholder)
  generatePDF: async (billId) => {
    const response = await api.get(`/invoices/${billId}/pdf`)
    return response.data
  },
}

export default api
