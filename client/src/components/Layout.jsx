import React, { useState } from 'react'
import { Box } from '@mui/material'
import Sidebar from './Sidebar'
import Header from './Header'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          width: '100%',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <Header onMenuClick={handleMenuClick} />
        
        <Box sx={{ p: 3, mt: 8 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
