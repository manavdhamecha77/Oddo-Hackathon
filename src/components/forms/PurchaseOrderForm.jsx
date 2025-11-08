'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Save, Loader2, Building2 } from 'lucide-react'
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

export default function PurchaseOrderForm({ 
  projectId, 
  existingPO = null, 
  isOpen, 
  onClose, 
  onSuccess 
}) {
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState([])
  const [loadingVendors, setLoadingVendors] = useState(true)
  const [showNewVendorForm, setShowNewVendorForm] = useState(false)
  const formRef = React.useRef(null)

  // Form state
  const [formData, setFormData] = useState({
    orderNumber: '',
    vendorId: '',
    orderDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    lines: [{ description: '', quantity: 1, unitPrice: 0 }]
  })

  // New vendor form state
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (isOpen) {
      fetchVendors()
      
      // If editing existing PO, populate form
      if (existingPO) {
        setFormData({
          orderNumber: existingPO.orderNumber,
          vendorId: existingPO.vendorId.toString(),
          orderDate: existingPO.orderDate ? new Date(existingPO.orderDate).toISOString().split('T')[0] : '',
          status: existingPO.status,
          notes: existingPO.notes || '',
          lines: existingPO.lines?.length > 0 
            ? existingPO.lines.map(line => ({
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice
              }))
            : [{ description: '', quantity: 1, unitPrice: 0 }]
        })
      } else {
        // Generate PO number for new orders
        generatePONumber()
      }
    }
  }, [isOpen, existingPO])

  const fetchVendors = async () => {
    try {
      setLoadingVendors(true)
      const res = await fetch('/api/partners?type=vendor')
      if (res.ok) {
        const data = await res.json()
        setVendors(data)
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
      toast.error('Failed to load vendors')
    } finally {
      setLoadingVendors(false)
    }
  }

  const generatePONumber = () => {
    const timestamp = Date.now().toString().slice(-6)
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    setFormData(prev => ({
      ...prev,
      orderNumber: `PO-${timestamp}-${randomNum}`
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

  const handleCreateVendor = async () => {
    if (!newVendor.name) {
      toast.error('Vendor name is required')
      return
    }

    try {
      setLoading(true)
      const res = await fetch('/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newVendor,
          type: 'vendor'
        })
      })

      if (res.ok) {
        const createdVendor = await res.json()
        toast.success('Vendor created successfully')
        setVendors(prev => [...prev, createdVendor])
        setFormData(prev => ({ ...prev, vendorId: createdVendor.id.toString() }))
        setShowNewVendorForm(false)
        setNewVendor({ name: '', email: '', phone: '', address: '' })
      } else {
        const error = await res.json()
        toast.error(error.error || 'Failed to create vendor')
      }
    } catch (error) {
      console.error('Error creating vendor:', error)
      toast.error('Failed to create vendor')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!projectId) {
      toast.error('No project selected')
      console.error('Missing projectId:', projectId)
      return
    }

    if (!formData.orderNumber || !formData.vendorId) {
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
        orderNumber: formData.orderNumber,
        vendorId: parseInt(formData.vendorId),
        orderDate: formData.orderDate,
        status: formData.status,
        totalAmount,
        notes: formData.notes,
        lines: formData.lines.map(line => ({
          description: line.description,
          quantity: parseFloat(line.quantity),
          unitPrice: parseFloat(line.unitPrice)
        }))
      }

      console.log('Submitting payload:', payload)

      const url = existingPO 
        ? `/api/purchase-orders/${existingPO.id}`
        : '/api/purchase-orders'
      
      const method = existingPO ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        toast.success(existingPO ? 'Purchase Order updated!' : 'Purchase Order created!')
        if (onSuccess) onSuccess()
        handleClose()
      } else {
        const error = await res.json()
        console.error('API Error Response:', error)
        toast.error(error.error || 'Failed to save Purchase Order')
      }
    } catch (error) {
      console.error('Error saving purchase order:', error)
      toast.error('Failed to save Purchase Order')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      orderNumber: '',
      vendorId: '',
      orderDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      notes: '',
      lines: [{ description: '', quantity: 1, unitPrice: 0 }]
    })
    setShowNewVendorForm(false)
    setNewVendor({ name: '', email: '', phone: '', address: '' })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            {existingPO ? 'Edit Purchase Order' : 'Create Purchase Order'}
          </DialogTitle>
          <DialogDescription>
            {existingPO 
              ? 'Update the purchase order details below'
              : 'Create a formal document to purchase goods/services from a vendor for this project'
            }
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Header Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">PO Number *</Label>
                <Input
                  id="orderNumber"
                  value={formData.orderNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderNumber: e.target.value }))}
                  placeholder="PO-123456"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderDate: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <div className="flex gap-2">
                  <Select 
                    value={formData.vendorId} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, vendorId: value }))}
                    disabled={loadingVendors}
                  >
                    <SelectTrigger id="vendor">
                      <SelectValue placeholder={loadingVendors ? "Loading vendors..." : "Select vendor"} />
                    </SelectTrigger>
                    <SelectContent>
                      {vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id.toString()}>
                          {vendor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewVendorForm(!showNewVendorForm)}
                    title="Create new vendor"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
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
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* New Vendor Form */}
          {showNewVendorForm && (
            <Card className="border-primary bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Create New Vendor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">Vendor Name *</Label>
                    <Input
                      id="vendorName"
                      value={newVendor.name}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Acme Photography Services"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorEmail">Email</Label>
                    <Input
                      id="vendorEmail"
                      type="email"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="vendor@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorPhone">Phone</Label>
                    <Input
                      id="vendorPhone"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendorAddress">Address</Label>
                    <Input
                      id="vendorAddress"
                      value={newVendor.address}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, City"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleCreateVendor}
                    disabled={loading || !newVendor.name}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Vendor'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowNewVendorForm(false)
                      setNewVendor({ name: '', email: '', phone: '', address: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Line Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Products / Services</CardTitle>
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
              placeholder="Additional notes or special terms..."
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
            type="button" 
            disabled={loading}
            onClick={() => {
              if (formRef.current) {
                formRef.current.requestSubmit()
              }
            }}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {existingPO ? 'Update' : 'Create'} Purchase Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
