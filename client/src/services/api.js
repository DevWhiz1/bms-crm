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

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health')
    return response.data
  },
}

export default api
