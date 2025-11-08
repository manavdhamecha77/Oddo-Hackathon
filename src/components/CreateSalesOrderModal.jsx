'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function CreateSalesOrderModal({ isOpen, onClose, projectId, projectName, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])

  const [formData, setFormData] = useState({
    customerId: '',
    orderDate: new Date().toISOString().split('T')[0],
    status: 'draft',
    notes: '',
    lines: [{ productId: '', description: '', quantity: 1, unitPrice: 0 }]
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
      // Reset form when modal opens
      setFormData({
        customerId: '',
        orderDate: new Date().toISOString().split('T')[0],
        status: 'draft',
        notes: '',
        lines: [{ productId: '', description: '', quantity: 1, unitPrice: 0 }]
      })
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([
        fetch('/api/partners?type=customer'),
        fetch('/api/products')
      ])

      if (customersRes.ok) setCustomers(await customersRes.json())
      if (productsRes.ok) setProducts(await productsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { productId: '', description: '', quantity: 1, unitPrice: 0 }]
    })
  }

  const handleRemoveLine = (index) => {
    const newLines = formData.lines.filter((_, i) => i !== index)
    setFormData({ ...formData, lines: newLines })
  }

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines]
    newLines[index][field] = value

    // Auto-fill price and description when product is selected
    if (field === 'productId' && value) {
      const product = products.find(p => p.id === parseInt(value))
      if (product) {
        newLines[index].unitPrice = Number(product.unitPrice)
        newLines[index].description = product.name
      }
    }

    setFormData({ ...formData, lines: newLines })
  }

  const calculateTotal = () => {
    return formData.lines.reduce((sum, line) => {
      return sum + (Number(line.quantity) * Number(line.unitPrice))
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }

    if (formData.lines.length === 0 || !formData.lines[0].description) {
      toast.error('Please add at least one order line')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/sales-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          projectId: projectId,
          totalAmount: calculateTotal()
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create sales order')
      }

      toast.success('Sales order created successfully!')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error creating sales order:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Sales Order</DialogTitle>
          <DialogDescription>
            Create a new sales order for <span className="font-semibold">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Order Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select value={formData.customerId} onValueChange={(value) => setFormData({ ...formData, customerId: value })}>
                  <SelectTrigger id="customer">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={String(customer.id)}>{customer.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderDate">Order Date *</Label>
                <Input
                  id="orderDate"
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => setFormData({ ...formData, orderDate: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Order Lines</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {formData.lines.map((line, index) => (
                <div key={index} className="border rounded-lg p-4 bg-card">
                  <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor={`product-${index}`} className="text-xs mb-1 block">Product</Label>
                        <Select value={String(line.productId)} onValueChange={(value) => handleLineChange(index, 'productId', value)}>
                          <SelectTrigger id={`product-${index}`} className="text-xs h-9">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={String(product.id)}>{product.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor={`description-${index}`} className="text-xs mb-1 block">Description *</Label>
                        <Input
                          id={`description-${index}`}
                          type="text"
                          value={line.description}
                          onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                          placeholder="Item description"
                          className="text-xs h-9"
                          required
                        />
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor={`quantity-${index}`} className="text-xs mb-1 block">Qty *</Label>
                        <Input
                          id={`quantity-${index}`}
                          type="number"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                          className="text-xs h-9"
                          min="0.01"
                          step="0.01"
                          required
                        />
                      </div>

                      <div className="col-span-1">
                        <Label htmlFor={`unitPrice-${index}`} className="text-xs mb-1 block">Price *</Label>
                        <Input
                          id={`unitPrice-${index}`}
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                          className="text-xs h-9"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t pt-3">
                      <div className="text-right text-xs">
                        <p className="text-muted-foreground">Subtotal</p>
                        <p className="font-semibold text-sm">${(Number(line.quantity) * Number(line.unitPrice)).toFixed(2)}</p>
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
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Sales Order
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
