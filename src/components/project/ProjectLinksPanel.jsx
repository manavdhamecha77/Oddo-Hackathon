'use client'
import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  ShoppingCart, 
  CreditCard, 
  DollarSign, 
  Receipt,
  Plus,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import GenerateInvoiceDialog from '@/components/billing/GenerateInvoiceDialog'

export default function ProjectLinksPanel({ projectId, userRole }) {
  const [activeTab, setActiveTab] = useState('sales-orders')
  const [isLoading, setIsLoading] = useState(true)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  
  const [salesOrders, setSalesOrders] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [customerInvoices, setCustomerInvoices] = useState([])
  const [vendorBills, setVendorBills] = useState([])
  const [expenses, setExpenses] = useState([])

  // Role-based permissions (normalize role to uppercase for comparison)
  const normalizedRole = userRole?.toUpperCase()
  const canViewLinks = ['ADMIN', 'PROJECT_MANAGER', 'SALES_FINANCE'].includes(normalizedRole)
  const canCreateSO = ['ADMIN', 'SALES_FINANCE'].includes(normalizedRole)
  const canCreatePO = ['ADMIN', 'PROJECT_MANAGER', 'SALES_FINANCE'].includes(normalizedRole)
  const canCreateVendorBill = ['ADMIN', 'SALES_FINANCE'].includes(normalizedRole)
  const canCreateFixedInvoice = ['ADMIN', 'SALES_FINANCE'].includes(normalizedRole)
  const canCreateSmartInvoice = ['ADMIN', 'PROJECT_MANAGER'].includes(normalizedRole)
  const canApproveExpense = ['ADMIN', 'PROJECT_MANAGER'].includes(normalizedRole)

  useEffect(() => {
    if (canViewLinks) {
      fetchAllLinks()
    }
  }, [projectId, canViewLinks])

  const fetchAllLinks = async () => {
    try {
      setIsLoading(true)
      const [soRes, poRes, invRes, vbRes, expRes] = await Promise.all([
        fetch(`/api/sales-orders?projectId=${projectId}`),
        fetch(`/api/purchase-orders?projectId=${projectId}`),
        fetch(`/api/customer-invoices?projectId=${projectId}`),
        fetch(`/api/vendor-bills?projectId=${projectId}`),
        fetch(`/api/expenses?projectId=${projectId}`)
      ])

      if (soRes.ok) setSalesOrders(await soRes.json())
      if (poRes.ok) setPurchaseOrders(await poRes.json())
      if (invRes.ok) setCustomerInvoices(await invRes.json())
      if (vbRes.ok) setVendorBills(await vbRes.json())
      if (expRes.ok) setExpenses(await expRes.json())
    } catch (error) {
      console.error('Error fetching links:', error)
      toast.error('Failed to load financial documents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveExpense = async (expenseId) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'PATCH'
      })

      if (response.ok) {
        toast.success('Expense approved successfully')
        fetchAllLinks()
      } else {
        toast.error('Failed to approve expense')
      }
    } catch (error) {
      console.error('Error approving expense:', error)
      toast.error('Error approving expense')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status) => {
    const variants = {
      draft: 'secondary',
      confirmed: 'default',
      sent: 'default',
      done: 'default',
      received: 'default',
      paid: 'default',
      posted: 'default',
      cancelled: 'destructive',
      submitted: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      reimbursed: 'default'
    }
    return (
      <Badge variant={variants[status?.toLowerCase()] || 'secondary'}>
        {status}
      </Badge>
    )
  }

  if (!canViewLinks) {
    return (
      <div className="bg-card border rounded-xl p-12 text-center">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
        <p className="text-muted-foreground">
          You don't have permission to view financial documents for this project.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-card border rounded-xl p-12 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Financial Links</h2>
        <p className="text-sm text-muted-foreground">
          All financial documents linked to this project
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="sales-orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Sales Orders
            <Badge variant="secondary" className="ml-1">{salesOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="purchase-orders" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Purchase Orders
            <Badge variant="secondary" className="ml-1">{purchaseOrders.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Invoices
            <Badge variant="secondary" className="ml-1">{customerInvoices.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="vendor-bills" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Vendor Bills
            <Badge variant="secondary" className="ml-1">{vendorBills.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Expenses
            <Badge variant="secondary" className="ml-1">{expenses.length}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* Sales Orders Tab */}
        <TabsContent value="sales-orders">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Sales Orders</h3>
            {canCreateSO && (
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Sales Order
              </Button>
            )}
          </div>
          {salesOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No sales orders linked to this project</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesOrders.map((so) => (
                  <TableRow key={so.id}>
                    <TableCell className="font-medium">{so.orderNumber}</TableCell>
                    <TableCell>{so.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(so.orderDate)}</TableCell>
                    <TableCell>{formatCurrency(so.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(so.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Purchase Orders Tab */}
        <TabsContent value="purchase-orders">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Purchase Orders</h3>
            {canCreatePO && (
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
            )}
          </div>
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No purchase orders linked to this project</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.orderNumber}</TableCell>
                    <TableCell>{po.vendor?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(po.orderDate)}</TableCell>
                    <TableCell>{formatCurrency(po.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(po.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Customer Invoices Tab */}
        <TabsContent value="invoices">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Customer Invoices</h3>
            <div className="flex gap-2">
              {canCreateFixedInvoice && (
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Fixed Invoice
                </Button>
              )}
              {canCreateSmartInvoice && (
                <Button size="sm" onClick={() => setShowInvoiceDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Smart Invoice
                </Button>
              )}
            </div>
          </div>
          {customerInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No customer invoices linked to this project</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                    <TableCell>{inv.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(inv.invoiceDate)}</TableCell>
                    <TableCell>{inv.dueDate ? formatDate(inv.dueDate) : '-'}</TableCell>
                    <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Vendor Bills Tab */}
        <TabsContent value="vendor-bills">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Vendor Bills</h3>
            {canCreateVendorBill && (
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Vendor Bill
              </Button>
            )}
          </div>
          {vendorBills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No vendor bills linked to this project</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.billNumber}</TableCell>
                    <TableCell>{bill.vendor?.name || 'N/A'}</TableCell>
                    <TableCell>{formatDate(bill.billDate)}</TableCell>
                    <TableCell>{bill.dueDate ? formatDate(bill.dueDate) : '-'}</TableCell>
                    <TableCell>{formatCurrency(bill.totalAmount)}</TableCell>
                    <TableCell>{getStatusBadge(bill.status)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Expenses</h3>
          </div>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No expenses linked to this project</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense #</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="font-medium">{exp.expenseNumber}</TableCell>
                    <TableCell>{exp.user?.firstName} {exp.user?.lastName}</TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell>{formatDate(exp.expenseDate)}</TableCell>
                    <TableCell>{formatCurrency(exp.amount)}</TableCell>
                    <TableCell>{getStatusBadge(exp.status)}</TableCell>
                    <TableCell>
                      {canApproveExpense && exp.status === 'submitted' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleApproveExpense(exp.id)}
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      {showInvoiceDialog && (
        <GenerateInvoiceDialog
          projectId={projectId}
          isOpen={showInvoiceDialog}
          onClose={() => setShowInvoiceDialog(false)}
          onSuccess={() => {
            setShowInvoiceDialog(false)
            fetchAllLinks()
          }}
        />
      )}
    </div>
  )
}
