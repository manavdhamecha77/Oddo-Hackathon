'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Loader2, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CustomerInvoiceForm({ 
  projectId, 
  existingInvoice = null, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [salesOrders, setSalesOrders] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    customerId: '',
    salesOrderId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    notes: '',
    lines: [{ description: '', quantity: 1, unitPrice: 0 }]
  })

  useEffect(() => {
    if (isOpen) {
      fetchCustomers()
      fetchSalesOrders()
      
      // If editing existing invoice, populate form
      if (existingInvoice) {
        setFormData({
          invoiceNumber: existingInvoice.invoiceNumber,
          customerId: existingInvoice.customerId.toString(),
          salesOrderId: existingInvoice.salesOrderId?.toString() || '',
          invoiceDate: existingInvoice.invoiceDate ? new Date(existingInvoice.invoiceDate).toISOString().split('T')[0] : '',
          dueDate: existingInvoice.dueDate ? new Date(existingInvoice.dueDate).toISOString().split('T')[0] : '',
          status: existingInvoice.status,
          notes: existingInvoice.notes || '',
          lines: existingInvoice.lines?.length > 0 
            ? existingInvoice.lines.map(line => ({
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice
              }))
            : [{ description: '', quantity: 1, unitPrice: 0 }]
        })
      } else {
        // Generate invoice number for new invoices
        generateInvoiceNumber()
      }
    }
  }, [isOpen, existingInvoice])

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true)
      const res = await fetch('/api/partners?type=customer')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast.error('Failed to load customers')
    } finally {
      setLoadingCustomers(false)
    }
  }

  const fetchSalesOrders = async () => {
    try {
      const res = await fetch(`/api/sales-orders?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setSalesOrders(data)
      }
    } catch (error) {
      console.error('Error fetching sales orders:', error)
    }
  }

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    setFormData(prev => ({
      ...prev,
      invoiceNumber: `INV-${timestamp}-${randomNum}`
    }))
  }

  const calculateTotal = () => {
    return formData.lines.reduce((sum, line) => {
      return sum + (parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0)
    }, 0)
  }

  const handleAddLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { description: '', quantity: 1, unitPrice: 0 }]
    }))
  }

  const handleRemoveLine = (index) => {
    if (formData.lines.length === 1) {
      toast.error('Must have at least one line item')
      return
    }
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.filter((_, i) => i !== index)
    }))
  }

  const handleLineChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.invoiceNumber || !formData.customerId) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.lines.some(line => !line.description || line.quantity <= 0 || line.unitPrice < 0)) {
      toast.error('Please complete all line items with valid values')
      return
    }

    try {
      setLoading(true)

      const totalAmount = calculateTotal()
      const payload = {
        projectId,
        invoiceNumber: formData.invoiceNumber,
        customerId: parseInt(formData.customerId),
        ...(formData.salesOrderId && formData.salesOrderId !== 'null' && { salesOrderId: parseInt(formData.salesOrderId) }),
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate || null,
        status: formData.status,
        totalAmount,
        notes: formData.notes,
        lines: formData.lines.map(line => ({
          description: line.description,
          quantity: parseFloat(line.quantity),
          unitPrice: parseFloat(line.unitPrice)
        }))
      }

      const url = existingInvoice 
        ? `/api/customer-invoices/${existingInvoice.id}`
        : '/api/customer-invoices'
      
      const method = existingInvoice ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(existingInvoice ? 'Invoice updated!' : 'Invoice created!')
        if (onSuccess) onSuccess()
        handleClose()
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to save invoice')
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      toast.error('Failed to save invoice')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      invoiceNumber: '',
      customerId: '',
      salesOrderId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      status: 'draft',
      notes: '',
      lines: [{ description: '', quantity: 1, unitPrice: 0 }]
    })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Receipt className="w-6 h-6" />
            {existingInvoice ? 'Edit Customer Invoice' : 'Create Customer Invoice'}
          </DialogTitle>
          <DialogDescription>
            {existingInvoice 
              ? 'Update the invoice details below'
              : 'Generate an invoice to bill the customer for work completed or milestones achieved'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Invoice Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="INV-123456"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceDate">Invoice Date *</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customerId: value }))}
                  disabled={loadingCustomers}
                >
                  <SelectTrigger id="customer">
                    <SelectValue placeholder={loadingCustomers ? "Loading customers..." : "Select customer"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salesOrder">Link to Sales Order (Optional)</Label>
                <Select 
                  value={formData.salesOrderId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, salesOrderId: value }))}
                >
                  <SelectTrigger id="salesOrder">
                    <SelectValue placeholder="Select sales order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">No Sales Order</SelectItem>
                    {salesOrders.map((so) => (
                      <SelectItem key={so.id} value={so.id.toString()}>
                        {so.orderNumber} - {so.customer?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Invoice Items</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3">
                {formData.lines.map((line, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-card">
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-2">
                          <Label htmlFor={`description-${index}`} className="text-xs mb-1 block">Description *</Label>
                          <Input
                            id={`description-${index}`}
                            value={line.description}
                            onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                            placeholder="Service or product description"
                            className="h-9 text-xs"
                            required
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor={`quantity-${index}`} className="text-xs mb-1 block">Qty *</Label>
                          <Input
                            id={`quantity-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.quantity}
                            onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                            className="h-9 text-xs"
                            required
                          />
                        </div>
                        <div className="col-span-1">
                          <Label htmlFor={`unitPrice-${index}`} className="text-xs mb-1 block">Price *</Label>
                          <Input
                            id={`unitPrice-${index}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                            className="h-9 text-xs"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t pt-3">
                        <div className="text-right text-xs">
                          <p className="text-muted-foreground">Subtotal</p>
                          <p className="font-semibold text-sm">${((parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0)).toFixed(2)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLine(index)}
                          disabled={formData.lines.length === 1}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-bold">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes, payment terms, or special instructions..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>
        </form>

        {/* Action Buttons - Fixed at bottom */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {existingInvoice ? 'Update' : 'Create'} Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
