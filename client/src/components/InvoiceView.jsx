import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
  IconButton,
} from '@mui/material'
import {
  Close,
  Print,
  Download,
  CheckCircle,
  Cancel,
} from '@mui/icons-material'
import { invoiceAPI } from '../services/api'
import jsPDF from 'jspdf'

const InvoiceView = ({ open, onClose, billId }) => {
  const [invoiceData, setInvoiceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortControllerRef = useRef(null)
  const currentBillIdRef = useRef(null)

  const fetchInvoiceData = useCallback(async () => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController()
    currentBillIdRef.current = billId

    setLoading(true)
    setError(null)
    
    try {
      const response = await invoiceAPI.getInvoiceDetails(billId, abortControllerRef.current.signal)
      if (response.success) {
        setInvoiceData(response.data)
      } else {
        setError(response.message || 'Failed to fetch invoice data')
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError' && err.code !== 'ERR_CANCELED') {
      setError('Failed to fetch invoice data')
      console.error('Error fetching invoice:', err)
      }
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [billId])

  useEffect(() => {
    if (open && billId) {
      fetchInvoiceData()
    } else if (!open) {
      // Reset state when dialog closes
      setInvoiceData(null)
      setError(null)
      setLoading(false)
      // Cancel any pending request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      currentBillIdRef.current = null
    }
  }, [open, billId, fetchInvoiceData])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])


  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    const invoiceContent = document.querySelector('.invoice-content')
    
    if (invoiceContent) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Cloud Emporium Monthly Invoice</title>
          <style>
            @page {
              margin: 0.5in;
              size: A4;
            }
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #333;
            }
            .invoice-header {
              text-align: center;
              margin-bottom: 30px;
              padding-bottom: 20px;
              border-bottom: 2px solid #1976d2;
            }
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #1976d2;
              margin-bottom: 10px;
            }
            .invoice-subtitle {
              font-size: 16px;
              color: #666;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1976d2;
              margin: 20px 0 10px 0;
              padding-bottom: 5px;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              display: flex;
              flex-direction: column;
            }
            .info-label {
              font-size: 12px;
              color: #666;
              margin-bottom: 2px;
            }
            .info-value {
              font-size: 14px;
              font-weight: 500;
            }
            .charges-grid {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .total-section {
              background-color: #1976d2;
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin-top: 20px;
            }
            .total-title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .total-amount {
              font-size: 24px;
              font-weight: bold;
            }
            .notes-section {
              margin-top: 30px;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            .notes-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
            .notes-item {
              margin-bottom: 5px;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${invoiceContent.outerHTML}
        </body>
        </html>
      `)
      
      printWindow.document.close()
      printWindow.focus()
      
      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)
    }
  }

  const handleDownloadPDF = () => {
    if (!invoiceData) return

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    let yPos = 20
    
    // Helper function to add new page if needed
    const checkPageBreak = (requiredSpace = 20) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        pdf.addPage()
        yPos = 20
        return true
      }
      return false
    }
    
    // Helper function to draw a line
    const drawLine = (y) => {
      pdf.setDrawColor(200, 200, 200)
      pdf.line(20, y, pageWidth - 20, y)
    }
    
    // Header Section
    pdf.setFontSize(24)
    pdf.setTextColor(25, 118, 210)
    pdf.text('Cloud Emporium Monthly Invoice', pageWidth / 2, yPos, { align: 'center' })
    yPos += 15
    
    pdf.setFontSize(14)
    pdf.setTextColor(100, 100, 100)
    pdf.text(`Bill Period: ${getMonthYear(invoiceData.billIssueDate)}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 20
    
    drawLine(yPos)
    yPos += 15
    
    // Tenant Information Section
    pdf.setFontSize(16)
    pdf.setTextColor(25, 118, 210)
    pdf.text('TENANT INFORMATION', 20, yPos)
    yPos += 15
    
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    
    // Create a table-like layout for tenant info
    const tenantData = [
      { label: 'Tenant Name', value: String(invoiceData.occupant.name || 'N/A') },
      { label: 'Mobile Number', value: String(invoiceData.occupant.mobile || 'N/A') },
      { label: 'Floor', value: String(invoiceData.property.floor || 'N/A') },
      { label: 'Apartment', value: String(invoiceData.property.apartment || 'N/A') },
      { label: 'Contract Start Date', value: formatDate(invoiceData.contract.startDate) },
      { label: 'Bill Issue Date', value: formatDate(invoiceData.billIssueDate) }
    ]
    
    tenantData.forEach((item, index) => {
      if (index % 2 === 0) {
        // Left column
        pdf.text(`${item.label}:`, 20, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 80, yPos)
        pdf.setFont(undefined, 'normal')
      } else {
        // Right column
        pdf.text(`${item.label}:`, 110, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 170, yPos)
        pdf.setFont(undefined, 'normal')
        yPos += 12
      }
    })
    
    if (tenantData.length % 2 !== 0) yPos += 12
    yPos += 15
    
    drawLine(yPos)
    yPos += 15
    
    // Consumption & Charges Section
    pdf.setFontSize(16)
    pdf.setTextColor(25, 118, 210)
    pdf.text('CONSUMPTION & CHARGES', 20, yPos)
    yPos += 20
    
    // WAPDA (Electricity) Details
    pdf.setFontSize(14)
    pdf.setTextColor(25, 118, 210)
    pdf.text('WAPDA (Electricity) Consumption', 20, yPos)
    yPos += 15
    
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    
    const wapdaData = [
      { label: 'Meter Serial Number', value: String(invoiceData.electricity.meterSerial || 'N/A') },
      { label: 'Reading Date', value: formatDate(invoiceData.electricity.readingDate) },
      { label: 'Previous Reading', value: formatNumber(invoiceData.electricity.previousReading) },
      { label: 'Current Reading', value: formatNumber(invoiceData.electricity.currentReading) },
      { label: 'Units Consumed', value: formatNumber(invoiceData.electricity.unitsConsumed) },
      { label: 'Rate per Unit', value: formatCurrency(invoiceData.electricity.ratePerUnit) },
      { label: 'Bill Amount', value: formatCurrency(invoiceData.electricity.billAmount) }
    ]
    
    wapdaData.forEach((item, index) => {
      if (index % 2 === 0) {
        pdf.text(`${item.label}:`, 20, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 80, yPos)
        pdf.setFont(undefined, 'normal')
      } else {
        pdf.text(`${item.label}:`, 110, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 170, yPos)
        pdf.setFont(undefined, 'normal')
        yPos += 10
      }
    })
    
    if (wapdaData.length % 2 !== 0) yPos += 10
    yPos += 15
    
    // Generator Details
    pdf.setFontSize(14)
    pdf.setTextColor(25, 118, 210)
    pdf.text('Generator Consumption', 20, yPos)
    yPos += 15
    
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    
    const generatorData = [
      { label: 'Meter Serial Number', value: String(invoiceData.generator.meterSerial || 'N/A') },
      { label: 'Reading Date', value: formatDate(invoiceData.generator.readingDate) },
      { label: 'Previous Reading', value: formatNumber(invoiceData.generator.previousReading) },
      { label: 'Current Reading', value: formatNumber(invoiceData.generator.currentReading) },
      { label: 'Units Consumed', value: formatNumber(invoiceData.generator.unitsConsumed) },
      { label: 'Rate per Unit', value: formatCurrency(invoiceData.generator.ratePerUnit) },
      { label: 'Bill Amount', value: formatCurrency(invoiceData.generator.billAmount) }
    ]
    
    generatorData.forEach((item, index) => {
      if (index % 2 === 0) {
        pdf.text(`${item.label}:`, 20, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 80, yPos)
        pdf.setFont(undefined, 'normal')
      } else {
        pdf.text(`${item.label}:`, 110, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 170, yPos)
        pdf.setFont(undefined, 'normal')
        yPos += 10
      }
    })
    
    if (generatorData.length % 2 !== 0) yPos += 10
    yPos += 15
    
    // Water Details
    pdf.setFontSize(14)
    pdf.setTextColor(25, 118, 210)
    pdf.text('Water Consumption', 20, yPos)
    yPos += 15
    
    pdf.setFontSize(10)
    pdf.setTextColor(0, 0, 0)
    
    const waterData = [
      { label: 'Meter Serial Number', value: String(invoiceData.water.meterSerial || 'N/A') },
      { label: 'Reading Date', value: formatDate(invoiceData.water.readingDate) },
      { label: 'Previous Reading', value: formatNumber(invoiceData.water.previousReading) },
      { label: 'Current Reading', value: formatNumber(invoiceData.water.currentReading) },
      { label: 'Units Consumed', value: formatNumber(invoiceData.water.unitsConsumed) },
      { label: 'Rate per Unit', value: formatCurrency(invoiceData.water.ratePerUnit) },
      { label: 'Bill Amount', value: formatCurrency(invoiceData.water.billAmount) }
    ]
    
    waterData.forEach((item, index) => {
      if (index % 2 === 0) {
        pdf.text(`${item.label}:`, 20, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 80, yPos)
        pdf.setFont(undefined, 'normal')
      } else {
        pdf.text(`${item.label}:`, 110, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 170, yPos)
        pdf.setFont(undefined, 'normal')
        yPos += 10
      }
    })
    
    if (waterData.length % 2 !== 0) yPos += 10
    yPos += 20
    
    drawLine(yPos)
    yPos += 15
    
    // Other Charges Section
    pdf.setFontSize(16)
    pdf.setTextColor(25, 118, 210)
    pdf.text('OTHER CHARGES', 20, yPos)
    yPos += 20
    
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    
    const chargesData = [
      { label: 'Rent', value: formatCurrency(invoiceData.charges.rent) },
      { label: 'Management Charges', value: formatCurrency(invoiceData.charges.managementCharges) },
      { label: 'Arrears', value: invoiceData.charges.arrears > 0 ? formatCurrency(invoiceData.charges.arrears) : 'No arrears' },
      { label: 'Additional Charges', value: invoiceData.charges.additionalCharges > 0 ? formatCurrency(invoiceData.charges.additionalCharges) : 'No additional charges' }
    ]
    
    chargesData.forEach((item, index) => {
      if (index % 2 === 0) {
        pdf.text(`${item.label}:`, 20, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 80, yPos)
        pdf.setFont(undefined, 'normal')
      } else {
        pdf.text(`${item.label}:`, 110, yPos)
        pdf.setFont(undefined, 'bold')
        pdf.text(item.value, 170, yPos)
        pdf.setFont(undefined, 'normal')
        yPos += 12
      }
    })
    
    if (chargesData.length % 2 !== 0) yPos += 12
    yPos += 20
    
    // Total Amount Section
    pdf.setFillColor(25, 118, 210)
    pdf.rect(20, yPos, pageWidth - 40, 25, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(18)
    pdf.setFont(undefined, 'bold')
    pdf.text('TOTAL AMOUNT', 30, yPos + 15)
    pdf.text(formatCurrency(invoiceData.charges.totalAmount), pageWidth - 30, yPos + 15, { align: 'right' })
    
    yPos += 35
    
    // Due Date
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(12)
    pdf.setFont(undefined, 'normal')
    pdf.text(`Due Date: ${formatDate(invoiceData.billDueDate)}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 20
    
    // Notes Section
    pdf.setFillColor(248, 249, 250)
    pdf.rect(20, yPos, pageWidth - 40, 40, 'F')
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(11)
    pdf.setFont(undefined, 'bold')
    pdf.text('NOTES:', 25, yPos + 10)
    
    pdf.setFont(undefined, 'normal')
    pdf.setFontSize(10)
    pdf.text(`1. Rent is charged in advance for the month of ${getMonthYear(invoiceData.billDueDate)}`, 25, yPos + 20)
    pdf.text(`2. Electricity/Water bill for the month of ${getMonthYear(invoiceData.billIssueDate)}.`, 25, yPos + 30)
    
    // Footer
    yPos += 50
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text('Generated by Cloud Emporium BMS', pageWidth / 2, yPos, { align: 'center' })
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos + 8, { align: 'center' })
    
    // Save the PDF
    pdf.save(`Cloud-Emporium-Invoice-${invoiceData.billId}-${getMonthYear(invoiceData.billIssueDate)}.pdf`)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0'
    return new Intl.NumberFormat('en-PK').format(parseFloat(amount))
  }

  const formatNumber = (number) => {
    if (number === null || number === undefined) return '0'
    return parseFloat(number).toFixed(3)
  }

  const getMonthYear = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear().toString().slice(-2)
    return `${month}-${year}`
  }

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    )
  }

  if (error) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">{error}</Alert>
        </DialogContent>
      </Dialog>
    )
  }

  if (!invoiceData) {
    return null
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          '@media print': {
            margin: 0,
            maxWidth: 'none',
            width: '100%',
            height: '100%',
            boxShadow: 'none',
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        '@media print': { display: 'none' }
      }}>
        <Typography variant="h6">Cloud Emporium Monthly Invoice</Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {/* Invoice Content */}
        <Box 
          className="invoice-content"
          sx={{ 
            '@media print': { 
              padding: 0,
              '& .MuiDialogContent-root': { padding: 0 }
            }
          }}
        >
          {/* Invoice Header */}
          <Box sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '2px solid #1976d2' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
              Cloud Emporium Monthly Invoice
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Bill Period: {getMonthYear(invoiceData.billIssueDate)}
              </Typography>
            </Box>

          {/* Tenant Information Section */}
          <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
            Tenant Information
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Tenant Name:</Typography>
              <Typography variant="body1" fontWeight="medium">{invoiceData.occupant.name}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Mobile Number:</Typography>
              <Typography variant="body1" fontWeight="medium">{invoiceData.occupant.mobile}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Floor:</Typography>
              <Typography variant="body1" fontWeight="medium">{invoiceData.property.floor}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Apartment:</Typography>
              <Typography variant="body1" fontWeight="medium">{invoiceData.property.apartment}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Contract Start Date:</Typography>
              <Typography variant="body1" fontWeight="medium">{formatDate(invoiceData.contract.startDate)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Bill Issue Date:</Typography>
              <Typography variant="body1" fontWeight="medium">{formatDate(invoiceData.billIssueDate)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Consumption & Charges Section */}
          <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
            Consumption & Charges
          </Typography>
          
          {/* WAPDA (Electricity) Details */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>WAPDA (Electricity) Consumption</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Meter Serial Number:</Typography>
              <Typography variant="body1">{invoiceData.electricity.meterSerial}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Reading Date:</Typography>
              <Typography variant="body1">{formatDate(invoiceData.electricity.readingDate)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Units Consumed:</Typography>
              <Typography variant="body1" fontWeight="bold">{formatNumber(invoiceData.electricity.unitsConsumed)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Previous Reading:</Typography>
              <Typography variant="body1">{formatNumber(invoiceData.electricity.previousReading)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Current Reading:</Typography>
              <Typography variant="body1">{formatNumber(invoiceData.electricity.currentReading)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Rate per Unit:</Typography>
              <Typography variant="body1">{formatCurrency(invoiceData.electricity.ratePerUnit)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">WAPDA Bill Amount:</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">{formatCurrency(invoiceData.electricity.billAmount)}</Typography>
            </Grid>
          </Grid>

          {/* Generator Details */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Generator Consumption</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Meter Serial Number:</Typography>
              <Typography variant="body1">{invoiceData.generator.meterSerial}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Reading Date:</Typography>
              <Typography variant="body1">{formatDate(invoiceData.generator.readingDate)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Units Consumed:</Typography>
              <Typography variant="body1" fontWeight="bold">{formatNumber(invoiceData.generator.unitsConsumed)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Previous Reading:</Typography>
              <Typography variant="body1">{formatNumber(invoiceData.generator.previousReading)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Current Reading:</Typography>
              <Typography variant="body1">{formatNumber(invoiceData.generator.currentReading)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Rate per Unit:</Typography>
              <Typography variant="body1">{formatCurrency(invoiceData.generator.ratePerUnit)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Generator Bill Amount:</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">{formatCurrency(invoiceData.generator.billAmount)}</Typography>
            </Grid>
          </Grid>

          {/* Water Details */}
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Water Consumption</Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Meter Serial Number:</Typography>
              <Typography variant="body1">{invoiceData.water.meterSerial}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Reading Date:</Typography>
              <Typography variant="body1">{formatDate(invoiceData.water.readingDate)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Units Consumed:</Typography>
              <Typography variant="body1" fontWeight="bold">{formatNumber(invoiceData.water.unitsConsumed)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Previous Reading:</Typography>
              <Typography variant="body1">{formatNumber(invoiceData.water.previousReading)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Current Reading:</Typography>
              <Typography variant="body1">{formatNumber(invoiceData.water.currentReading)}</Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">Rate per Unit:</Typography>
              <Typography variant="body1">{formatCurrency(invoiceData.water.ratePerUnit)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">Water Bill Amount:</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">{formatCurrency(invoiceData.water.billAmount)}</Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Other Charges Section */}
          <Typography variant="h6" color="primary" sx={{ mb: 2, fontWeight: 'bold' }}>
            Other Charges
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Rent:</Typography>
              <Typography variant="body1" fontWeight="medium">{formatCurrency(invoiceData.charges.rent)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Management Charges:</Typography>
              <Typography variant="body1" fontWeight="medium">{formatCurrency(invoiceData.charges.managementCharges)}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Arrears:</Typography>
              <Typography variant="body1" fontWeight="medium" color={invoiceData.charges.arrears > 0 ? 'error.main' : 'text.secondary'}>
                {invoiceData.charges.arrears > 0 ? formatCurrency(invoiceData.charges.arrears) : 'No arrears'}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Additional Charges:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {invoiceData.charges.additionalCharges > 0 ? formatCurrency(invoiceData.charges.additionalCharges) : 'No additional charges'}
              </Typography>
            </Grid>
          </Grid>

          {/* Total Amount Section */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            p: 2, 
            bgcolor: 'primary.main', 
            color: 'white', 
            borderRadius: 1,
            mt: 2
          }}>
            <Typography variant="h6" fontWeight="bold">
              Total Amount:
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              {formatCurrency(invoiceData.charges.totalAmount)}
            </Typography>
          </Box>

          {/* Due Date */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">Due Date:</Typography>
            <Typography variant="body1" fontWeight="medium">{formatDate(invoiceData.billDueDate)}</Typography>
          </Box>

            {/* Notes Section */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                Notes:
              </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
                1. Rent is charged in advance for the month of {getMonthYear(invoiceData.billDueDate)}
              </Typography>
              <Typography variant="body2">
                2. Electricity/Water bill for the month of {getMonthYear(invoiceData.billIssueDate)}.
              </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ '@media print': { display: 'none' } }}>
        <Button
          startIcon={<Print />}
          onClick={handlePrint}
          variant="contained"
          color="primary"
        >
          Print Invoice
        </Button>
        <Button
          startIcon={<Download />}
          onClick={handleDownloadPDF}
          variant="outlined"
          color="primary"
        >
          Download PDF
        </Button>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InvoiceView
