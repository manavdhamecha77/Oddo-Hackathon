'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Loader2, Save, Upload, Scan } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function CreateVendorBillModal({ isOpen, onClose, projectId, projectName, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    vendorId: '',
    billDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    status: 'draft',
    notes: '',
    lines: [{ productId: '', description: '', quantity: 1, unitPrice: 0 }]
  })

  useEffect(() => {
    if (isOpen) {
      fetchData()
      // Reset form when modal opens
      setFormData({
        vendorId: '',
        billDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        status: 'draft',
        notes: '',
        lines: [{ productId: '', description: '', quantity: 1, unitPrice: 0 }]
      })
    }
  }, [isOpen])

  const fetchData = async () => {
    try {
      const [vendorsRes, productsRes] = await Promise.all([
        fetch('/api/partners?type=vendor'),
        fetch('/api/products')
      ])

      if (vendorsRes.ok) setVendors(await vendorsRes.json())
      if (productsRes.ok) setProducts(await productsRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleOcrScan = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setOcrLoading(true)
    toast.info('Scanning bill... This may take a few seconds')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ocr/process-bill', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error || 'Failed to process bill')
      }

      const ocrData = await response.json()

      // Update form with OCR data
      setFormData(prev => ({
        ...prev,
        billDate: ocrData.billDate || prev.billDate,
        lines: ocrData.lines.length > 0 ? ocrData.lines : prev.lines,
      }))

      toast.success('Bill scanned successfully! Review and adjust the extracted data.')
    } catch (error) {
      console.error('Error processing OCR:', error)
      toast.error(error.message || 'Failed to scan bill')
    } finally {
      setOcrLoading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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
        newLines[index].unitPrice = Number(product.costPrice || product.unitPrice)
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
    
    if (!formData.vendorId) {
      toast.error('Please select a vendor')
      return
    }

    if (formData.lines.length === 0 || !formData.lines[0].description) {
      toast.error('Please add at least one bill line')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/vendor-bills', {
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
        throw new Error(error.error || 'Failed to create vendor bill')
      }

      toast.success('Vendor bill created successfully!')
      onSuccess?.()
      onClose()
    } catch (error) {
      console.error('Error creating vendor bill:', error)
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Vendor Bill</DialogTitle>
          <DialogDescription>
            Create a new vendor bill for <span className="font-semibold">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OCR Scan Button */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Scan Bill with OCR
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Upload an image of your bill to automatically extract line items and amounts
                </p>
              </div>
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleOcrScan}
                  className="hidden"
                  id="ocr-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={ocrLoading}
                  className="gap-2"
                >
                  {ocrLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className="w-4 h-4" />
                      Scan Bill
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Bill Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Vendor *</label>
                <select
                  value={formData.vendorId}
                  onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  required
                >
                  <option value="">Select vendor</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bill Date *</label>
                <input
                  type="date"
                  value={formData.billDate}
                  onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="posted">Posted</option>
                  <option value="paid">Paid</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg bg-background text-sm"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Bill Lines</h3>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine}>
                <Plus className="w-4 h-4 mr-2" />
                Add Line
              </Button>
            </div>

            <div className="space-y-3">
              {formData.lines.map((line, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-3">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                      <label className="block text-xs font-medium mb-1">Product</label>
                      <select
                        value={line.productId}
                        onChange={(e) => handleLineChange(index, 'productId', e.target.value)}
                        className="w-full px-2 py-1.5 border rounded bg-background text-xs"
                      >
                        <option value="">Select product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4">
                      <label className="block text-xs font-medium mb-1">Description *</label>
                      <input
                        type="text"
                        value={line.description}
                        onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                        className="w-full px-2 py-1.5 border rounded bg-background text-xs"
                        placeholder="Item description"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1">Quantity *</label>
                      <input
                        type="number"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 border rounded bg-background text-xs"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-medium mb-1">Unit Price *</label>
                      <input
                        type="number"
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 border rounded bg-background text-xs"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="col-span-1 flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLine(index)}
                        disabled={formData.lines.length === 1}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-right text-xs font-medium text-muted-foreground">
                    Subtotal: ${(Number(line.quantity) * Number(line.unitPrice)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-xl font-bold">${calculateTotal().toFixed(2)}</p>
                </div>
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
                  Create Vendor Bill
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
