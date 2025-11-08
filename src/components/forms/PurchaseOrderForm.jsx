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
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden flex flex-col">
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

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
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
            <CardContent className="space-y-4">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border rounded-md">
                <table className="w-full">
                  <thead className="sticky top-0 bg-background border-b">
                    <tr>
                      <th className="text-left p-2 min-w-[250px]">Description</th>
                      <th className="text-right p-2 w-20">Qty</th>
                      <th className="text-right p-2 w-28">Price ($)</th>
                      <th className="text-right p-2 w-28">Subtotal ($)</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.lines.map((line, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="p-1.5">
                          <Input
                            value={line.description}
                            onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                            placeholder="Service or product description"
                            className="h-8 text-sm"
                            required
                          />
                        </td>
                        <td className="p-1.5">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.quantity}
                            onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                            className="text-right h-8 text-sm"
                            required
                          />
                        </td>
                        <td className="p-1.5">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unitPrice}
                            onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                            className="text-right h-8 text-sm"
                            required
                          />
                        </td>
                        <td className="p-1.5 text-right font-medium text-sm">
                          ${((parseFloat(line.quantity) || 0) * (parseFloat(line.unitPrice) || 0)).toFixed(2)}
                        </td>
                        <td className="p-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleRemoveLine(index)}
                            disabled={formData.lines.length === 1}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="sticky bottom-0 bg-background border-t">
                    <tr className="font-bold">
                      <td colSpan="3" className="text-right p-2 text-sm">Total:</td>
                      <td className="text-right p-2 text-lg text-primary">${calculateTotal().toFixed(2)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
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
            type="submit" 
            disabled={loading}
            onClick={(e) => {
              e.preventDefault()
              const form = e.target.closest('dialog').querySelector('form')
              if (form) {
                form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
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
