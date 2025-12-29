import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Tenants from './pages/Tenants'
import Contracts from './pages/Contracts'
import Meters from './pages/Meters'
import MeterReadings from './pages/MeterReadings'
import MonthlyBills from './pages/MonthlyBills'
import Owners from './pages/Owners'
import OwnerPayouts from './pages/OwnerPayouts'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tenants"
          element={
            <ProtectedRoute>
              <Tenants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contracts"
          element={
            <ProtectedRoute>
              <Contracts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meters"
          element={
            <ProtectedRoute>
              <Meters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meter-readings"
          element={
            <ProtectedRoute>
              <MeterReadings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/monthly-bills"
          element={
            <ProtectedRoute>
              <MonthlyBills />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner-payouts"
          element={
            <ProtectedRoute>
              <OwnerPayouts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owners"
          element={
            <ProtectedRoute>
              <Owners />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App