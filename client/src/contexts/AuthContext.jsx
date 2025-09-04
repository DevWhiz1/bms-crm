import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: action.payload,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')

      if (token && user) {
        try {
          // Verify token with server
          const response = await authAPI.verifyToken()
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              token: token,
            },
          })
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          dispatch({ type: AUTH_ACTIONS.LOGOUT })
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      }
    }

    initializeAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      const response = await authAPI.login(credentials)
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data,
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }

  // Signup function
  const signup = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOGIN_START })
      const response = await authAPI.signup(userData)
      
      // Store token and user in localStorage
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data,
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed'
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      })
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData)
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user))
      
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user,
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed'
      return { success: false, error: errorMessage }
    }
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const value = {
    ...state,
    login,
    signup,
    logout,
    updateProfile,
    clearError,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
