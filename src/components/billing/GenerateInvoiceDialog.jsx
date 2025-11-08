'use client'
import React, { useState, useEffect } from 'react'
import { X, Loader2, CheckCircle2, Clock, Receipt, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function GenerateInvoiceDialog({ projectId, isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1) // 1: select items, 2: preview, 3: generating
  const [isLoading, setIsLoading] = useState(true)
  const [unbilledTimesheets, setUnbilledTimesheets] = useState([])
  const [unbilledExpenses, setUnbilledExpenses] = useState([])
  const [selectedTimesheets, setSelectedTimesheets] = useState(new Set())
  const [selectedExpenses, setSelectedExpenses] = useState(new Set())
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [project, setProject] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchUnbilledItems()
      fetchProject()
      generateInvoiceNumber()
    }
  }, [isOpen, projectId])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

  const fetchUnbilledItems = async () => {
    try {
      setIsLoading(true)
      
      // Fetch unbilled timesheets
      const timesheetsResponse = await fetch(`/api/timesheets?projectId=${projectId}&billed=false`)
      const timesheetsData = await timesheetsResponse.json()
      
      // Fetch unbilled expenses
      const expensesResponse = await fetch(`/api/expenses?projectId=${projectId}&billed=false`)
      const expensesData = await expensesResponse.json()
      
      setUnbilledTimesheets(Array.isArray(timesheetsData) ? timesheetsData : [])
      setUnbilledExpenses(Array.isArray(expensesData) ? expensesData : [])
    } catch (error) {
      console.error('Error fetching unbilled items:', error)
      toast.error('Failed to load unbilled items')
    } finally {
      setIsLoading(false)
    }
  }

  const generateInvoiceNumber = () => {
    const date = new Date()
    const prefix = 'INV'
    const timestamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    setInvoiceNumber(`${prefix}-${timestamp}-${random}`)
  }

  const toggleTimesheet = (id) => {
    const newSelected = new Set(selectedTimesheets)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTimesheets(newSelected)
  }

  const toggleExpense = (id) => {
    const newSelected = new Set(selectedExpenses)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedExpenses(newSelected)
  }

  const calculateTotal = () => {
    let total = 0
    
    // Calculate timesheet totals
    unbilledTimesheets.forEach(ts => {
      if (selectedTimesheets.has(ts.id)) {
        total += (ts.hours || 0) * (ts.hourlyRate || 0)
      }
    })
    
    // Calculate expense totals
    unbilledExpenses.forEach(exp => {
      if (selectedExpenses.has(exp.id)) {
        total += parseFloat(exp.amount || 0)
      }
    })
    
    return total.toFixed(2)
  }

  const handleGenerate = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name')
      return
    }

    if (selectedTimesheets.size === 0 && selectedExpenses.size === 0) {
      toast.error('Please select at least one item to bill')
      return
    }

    try {
      setStep(3) // Show generating state
      
      const response = await fetch(`/api/projects/${projectId}/generate-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          invoiceNumber,
          timesheetIds: Array.from(selectedTimesheets),
          expenseIds: Array.from(selectedExpenses)
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate invoice')
      }

      const result = await response.json()
      
      // Success!
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
      
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast.error(error.message || 'Failed to generate invoice')
      setStep(2) // Go back to preview
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background border rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Generate Invoice</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {step === 1 && 'Select unbilled timesheets and expenses'}
              {step === 2 && 'Review and confirm invoice details'}
              {step === 3 && 'Generating your invoice...'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={step === 3}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 px-6 py-4 bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-medium">Select Items</span>
          </div>
          <div className={`h-px w-12 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              {step > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
          <div className={`h-px w-12 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              3
            </div>
            <span className="text-sm font-medium">Generate</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Customer Name Input */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Customer Name *</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      placeholder="Enter customer name"
                    />
                  </div>

                  {/* Invoice Number */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg bg-background"
                      placeholder="Auto-generated"
                    />
                  </div>

                  {/* Unbilled Timesheets */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-blue-500" />
                      <h3 className="font-semibold">Unbilled Timesheets ({unbilledTimesheets.length})</h3>
                    </div>
                    
                    {unbilledTimesheets.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No unbilled timesheets found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unbilledTimesheets.map(ts => (
                          <div
                            key={ts.id}
                            onClick={() => toggleTimesheet(ts.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedTimesheets.has(ts.id)
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedTimesheets.has(ts.id)}
                                  onChange={() => toggleTimesheet(ts.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <p className="font-medium text-sm">{ts.description || 'Timesheet entry'}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDate(ts.workDate)} • {ts.hours}h @ {formatCurrency(ts.hourlyRate)}/h
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold text-sm">
                                {formatCurrency(ts.hours * ts.hourlyRate)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Unbilled Expenses */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Receipt className="w-5 h-5 text-green-500" />
                      <h3 className="font-semibold">Unbilled Expenses ({unbilledExpenses.length})</h3>
                    </div>
                    
                    {unbilledExpenses.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No unbilled expenses found</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {unbilledExpenses.map(exp => (
                          <div
                            key={exp.id}
                            onClick={() => toggleExpense(exp.id)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedExpenses.has(exp.id)
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedExpenses.has(exp.id)}
                                  onChange={() => toggleExpense(exp.id)}
                                  className="mt-1"
                                />
                                <div>
                                  <p className="font-medium text-sm">{exp.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {formatDate(exp.expenseDate)} • {exp.category}
                                  </p>
                                </div>
                              </div>
                              <p className="font-semibold text-sm">
                                {formatCurrency(exp.amount)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Invoice Preview */}
              <div className="bg-muted/30 border rounded-lg p-6">
                <h3 className="font-semibold mb-4">Invoice Preview</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Invoice Number:</span>
                    <span className="font-medium">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-medium">{customerName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Project:</span>
                    <span className="font-medium">{project?.name || 'Loading...'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{formatDate(new Date())}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Line Items</h4>
                  
                  {/* Selected Timesheets */}
                  {Array.from(selectedTimesheets).length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-muted-foreground mb-2">Timesheets</p>
                      {unbilledTimesheets
                        .filter(ts => selectedTimesheets.has(ts.id))
                        .map(ts => (
                          <div key={ts.id} className="flex justify-between text-sm py-2">
                            <span>{ts.description || 'Timesheet entry'} ({ts.hours}h)</span>
                            <span>{formatCurrency(ts.hours * ts.hourlyRate)}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Selected Expenses */}
                  {Array.from(selectedExpenses).length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Expenses</p>
                      {unbilledExpenses
                        .filter(exp => selectedExpenses.has(exp.id))
                        .map(exp => (
                          <div key={exp.id} className="flex justify-between text-sm py-2">
                            <span>{exp.description}</span>
                            <span>{formatCurrency(exp.amount)}</span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-lg">{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="flex gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 dark:text-yellow-100">Important</p>
                  <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                    Once generated, the selected timesheets and expenses will be marked as billed and cannot be invoiced again.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Generating Invoice...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we create your invoice and update billing records.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-muted/30">
          <div className="text-sm">
            {step === 1 && (
              <p className="text-muted-foreground">
                Selected: {selectedTimesheets.size} timesheets, {selectedExpenses.size} expenses
              </p>
            )}
            {step === 2 && (
              <p className="font-medium">
                Total: {formatCurrency(calculateTotal())}
              </p>
            )}
          </div>
          
          <div className="flex gap-3">
            {step === 1 && (
              <>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={selectedTimesheets.size === 0 && selectedExpenses.size === 0}
                >
                  Continue to Review
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleGenerate}>
                  Generate Invoice
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
