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
import CreateSalesOrderModal from '@/components/CreateSalesOrderModal'
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm'

export default function ProjectLinksPanel({ projectId, userRole }) {
  const [activeTab, setActiveTab] = useState('sales-orders')
  const [isLoading, setIsLoading] = useState(true)
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false)
  const [showSalesOrderModal, setShowSalesOrderModal] = useState(false)
  const [project, setProject] = useState(null)
  
  const [salesOrders, setSalesOrders] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [customerInvoices, setCustomerInvoices] = useState([])
  const [vendorBills, setVendorBills] = useState([])
  const [expenses, setExpenses] = useState([])

  // Role-based permissions (normalize role to uppercase for comparison)
  const normalizedRole = userRole?.toUpperCase()
  
  // Access Control:
  // - Team Members: NO ACCESS to Links Panel (cannot view)
  // - Project Manager: FULL VIEW access
  // - Sales & Finance: FULL VIEW access
  // - Admin: FULL VIEW access (universal)
  const canViewLinks = ['ADMIN', 'PROJECT_MANAGER', 'SALES_FINANCE'].includes(normalizedRole)
  
  // Action Permissions:
  // Sales Orders - Created by Sales & Finance (sets expected revenue)
  const canCreateSO = ['ADMIN', 'SALES_FINANCE'].includes(normalizedRole)
  
  // Purchase Orders - Created by PM or Sales & Finance (plans vendor costs)
  const canCreatePO = ['ADMIN', 'PROJECT_MANAGER', 'SALES_FINANCE'].includes(normalizedRole)
  
  // Vendor Bills - Created by Sales & Finance (actual vendor costs)
  const canCreateVendorBill = ['ADMIN', 'SALES_FINANCE'].includes(normalizedRole)
  
  // Fixed Invoices - Created by Sales & Finance (milestone billing)
  const canCreateFixedInvoice = ['ADMIN', 'SALES_FINANCE'].includes(normalizedRole)
  
  // Smart Invoices - Created by PM (from timesheets/expenses - Billing Engine)
  const canCreateSmartInvoice = ['ADMIN', 'PROJECT_MANAGER'].includes(normalizedRole)
  
  // Expense Approval - Only PM can approve Team Member expenses
  const canApproveExpense = ['ADMIN', 'PROJECT_MANAGER'].includes(normalizedRole)

  useEffect(() => {
    if (canViewLinks) {
      fetchProject()
      fetchAllLinks()
    }
  }, [projectId, canViewLinks])

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
      }
    } catch (error) {
      console.error('Error fetching project:', error)
    }
  }

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

  const handleApproveExpense = async (expenseId, action = 'approve') => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        const message = action === 'approve' 
          ? 'Expense approved successfully' 
          : 'Expense rejected'
        toast.success(message)
        fetchAllLinks()
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${action} expense`)
      }
    } catch (error) {
      console.error(`Error ${action}ing expense:`, error)
      toast.error(`Error ${action}ing expense`)
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

  // Team Members cannot view the Links Panel at all
  if (!canViewLinks) {
    return null // Don't render anything for Team Members
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
              <Button size="sm" onClick={() => setShowSalesOrderModal(true)}>
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
            <div>
              <h3 className="text-lg font-semibold">Purchase Orders (Planned Costs)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                POs represent future costs earmarked for this project
              </p>
            </div>
            {canCreatePO && (
              <Button size="sm" onClick={() => {
                setSelectedPO(null)
                setShowPOForm(true)
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create Purchase Order
              </Button>
            )}
          </div>
          {purchaseOrders.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No purchase orders linked to this project</p>
              <p className="text-sm mt-2">Create a PO to plan vendor costs before receiving bills</p>
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
                  <TableHead>Linked Bills</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => {
                  const linkedBills = vendorBills.filter(vb => vb.purchaseOrderId === po.id)
                  return (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium">{po.orderNumber}</TableCell>
                      <TableCell>{po.vendor?.name || 'N/A'}</TableCell>
                      <TableCell>{formatDate(po.orderDate)}</TableCell>
                      <TableCell className="font-semibold text-orange-600">
                        {formatCurrency(po.totalAmount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(po.status)}</TableCell>
                      <TableCell>
                        {linkedBills.length > 0 ? (
                          <Badge variant="default">{linkedBills.length} bill(s)</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">No bills yet</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedPO(po)
                              setShowPOForm(true)
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
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

        {/* Expenses Tab - Team Members submit, PM approves */}
        <TabsContent value="expenses">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-semibold">Expenses</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Team expenses submitted for approval and billing
              </p>
            </div>
            {canApproveExpense && expenses.filter(e => e.status === 'submitted').length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                {expenses.filter(e => e.status === 'submitted').length} Pending Approval
              </Badge>
            )}
          </div>
          {expenses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No expenses linked to this project</p>
              <p className="text-xs mt-2">Team members can submit expenses through the Expenses module</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense #</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Billable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((exp) => (
                  <TableRow key={exp.id} className={exp.status === 'submitted' ? 'bg-amber-50/50 dark:bg-amber-900/5' : ''}>
                    <TableCell className="font-medium">{exp.expenseNumber}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{exp.user?.firstName} {exp.user?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{exp.user?.role?.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{exp.description}</TableCell>
                    <TableCell>{exp.category}</TableCell>
                    <TableCell>{formatDate(exp.expenseDate)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(exp.amount)}</TableCell>
                    <TableCell>
                      {exp.isBillable ? (
                        <Badge variant="outline" className="text-green-600 border-green-300">Billable</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500 border-gray-300">Non-billable</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(exp.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canApproveExpense && exp.status === 'submitted' ? (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleApproveExpense(exp.id, 'approve')}
                              title="Approve expense"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleApproveExpense(exp.id, 'reject')}
                              title="Reject expense"
                            >
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm" title="View details">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
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

      {showSalesOrderModal && (
        <CreateSalesOrderModal
          isOpen={showSalesOrderModal}
          onClose={() => setShowSalesOrderModal(false)}
          projectId={projectId}
          projectName={project?.name || 'Project'}
          onSuccess={() => {
            fetchAllLinks()
          }}
        />
      )}
    </div>
  )
}
