'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Receipt, DollarSign, ShoppingCart, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import GenerateInvoiceDialog from './GenerateInvoiceDialog'
import { toast } from 'sonner'

export default function LinksPanel({ projectId, userRole }) {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)

  useEffect(() => {
    if (projectId) {
      fetchFinancialStats()
    }
  }, [projectId])

  const fetchFinancialStats = async () => {
    if (!projectId) return
    
    try {
      setIsLoading(true)
      const [salesOrders, purchaseOrders, invoices, vendorBills] = await Promise.all([
        fetch(`/api/sales-orders?projectId=${projectId}`).then(r => r.json()),
        fetch(`/api/purchase-orders?projectId=${projectId}`).then(r => r.json()),
        fetch(`/api/customer-invoices?projectId=${projectId}`).then(r => r.json()),
        fetch(`/api/vendor-bills?projectId=${projectId}`).then(r => r.json())
      ])

      setStats({
        salesOrders: Array.isArray(salesOrders) ? salesOrders.length : 0,
        purchaseOrders: Array.isArray(purchaseOrders) ? purchaseOrders.length : 0,
        invoices: Array.isArray(invoices) ? invoices.length : 0,
        vendorBills: Array.isArray(vendorBills) ? vendorBills.length : 0
      })
    } catch (error) {
      console.error('Error fetching financial stats:', error)
      toast.error('Failed to load financial documents')
    } finally {
      setIsLoading(false)
    }
  }

  const canCreateInvoice = ['ADMIN', 'PROJECT_MANAGER', 'SALES_FINANCE'].includes(userRole)

  return (
    <>
      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Financial Documents</h2>
          {canCreateInvoice && (
            <Button 
              onClick={() => setShowInvoiceDialog(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Generate Invoice
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href={`/sales-orders?project=${projectId}`} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Sales Orders</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.salesOrders || 0} {stats?.salesOrders === 1 ? 'order' : 'orders'}
                </p>
              </div>
            </Link>

            <Link 
              href={`/purchase-orders?project=${projectId}`} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Purchase Orders</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.purchaseOrders || 0} {stats?.purchaseOrders === 1 ? 'order' : 'orders'}
                </p>
              </div>
            </Link>

            <Link 
              href={`/invoices?project=${projectId}`} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                <Receipt className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Customer Invoices</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.invoices || 0} {stats?.invoices === 1 ? 'invoice' : 'invoices'}
                </p>
              </div>
            </Link>

            <Link 
              href={`/vendor-bills?project=${projectId}`} 
              className="flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                <DollarSign className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Vendor Bills</p>
                <p className="text-xs text-muted-foreground">
                  {stats?.vendorBills || 0} {stats?.vendorBills === 1 ? 'bill' : 'bills'}
                </p>
              </div>
            </Link>
          </div>
        )}
      </div>

      {showInvoiceDialog && (
        <GenerateInvoiceDialog
          projectId={projectId}
          isOpen={showInvoiceDialog}
          onClose={() => setShowInvoiceDialog(false)}
          onSuccess={() => {
            fetchFinancialStats()
            toast.success('Invoice generated successfully!')
          }}
        />
      )}
    </>
  )
}
