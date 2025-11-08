'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, ShoppingCart, Receipt, CreditCard, Wallet, Package } from 'lucide-react'
import DocumentListTable from '@/components/settings/DocumentListTable'
import PurchaseOrderForm from '@/components/forms/PurchaseOrderForm'
import CustomerInvoiceForm from '@/components/forms/CustomerInvoiceForm'
import VendorBillForm from '@/components/forms/VendorBillForm'
import CreateSalesOrderModal from '@/components/CreateSalesOrderModal'

export default function GlobalDocumentsPage() {
  const [activeTab, setActiveTab] = useState('sales-orders')
  const [loading, setLoading] = useState({})
  
  // Data states
  const [salesOrders, setSalesOrders] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [customerInvoices, setCustomerInvoices] = useState([])
  const [vendorBills, setVendorBills] = useState([])
  const [expenses, setExpenses] = useState([])
  const [products, setProducts] = useState([])
  const [projects, setProjects] = useState([])
  const [partners, setPartners] = useState([])
  
  // Form states
  const [showSOForm, setShowSOForm] = useState(false)
  const [showPOForm, setShowPOForm] = useState(false)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [showBillForm, setShowBillForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    loadProjects()
    loadPartners()
  }, [])

  useEffect(() => {
    switch (activeTab) {
      case 'sales-orders':
        loadSalesOrders()
        break
      case 'purchase-orders':
        loadPurchaseOrders()
        break
      case 'customer-invoices':
        loadCustomerInvoices()
        break
      case 'vendor-bills':
        loadVendorBills()
        break
      case 'expenses':
        loadExpenses()
        break
      case 'products':
        loadProducts()
        break
    }
  }, [activeTab])

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    }
  }

  const loadPartners = async () => {
    try {
      const res = await fetch('/api/partners')
      if (res.ok) {
        const data = await res.json()
        setPartners(data)
      }
    } catch (error) {
      console.error('Error loading partners:', error)
    }
  }

  const loadSalesOrders = async () => {
    setLoading(prev => ({ ...prev, salesOrders: true }))
    try {
      const res = await fetch('/api/sales-orders')
      if (res.ok) {
        const data = await res.json()
        setSalesOrders(data)
      }
    } catch (error) {
      toast.error('Failed to load sales orders')
    } finally {
      setLoading(prev => ({ ...prev, salesOrders: false }))
    }
  }

  const loadPurchaseOrders = async () => {
    setLoading(prev => ({ ...prev, purchaseOrders: true }))
    try {
      const res = await fetch('/api/purchase-orders')
      if (res.ok) {
        const data = await res.json()
        setPurchaseOrders(data)
      }
    } catch (error) {
      toast.error('Failed to load purchase orders')
    } finally {
      setLoading(prev => ({ ...prev, purchaseOrders: false }))
    }
  }

  const loadCustomerInvoices = async () => {
    setLoading(prev => ({ ...prev, customerInvoices: true }))
    try {
      const res = await fetch('/api/customer-invoices')
      if (res.ok) {
        const data = await res.json()
        setCustomerInvoices(data)
      }
    } catch (error) {
      toast.error('Failed to load customer invoices')
    } finally {
      setLoading(prev => ({ ...prev, customerInvoices: false }))
    }
  }

  const loadVendorBills = async () => {
    setLoading(prev => ({ ...prev, vendorBills: true }))
    try {
      const res = await fetch('/api/vendor-bills')
      if (res.ok) {
        const data = await res.json()
        setVendorBills(data)
      }
    } catch (error) {
      toast.error('Failed to load vendor bills')
    } finally {
      setLoading(prev => ({ ...prev, vendorBills: false }))
    }
  }

  const loadExpenses = async () => {
    setLoading(prev => ({ ...prev, expenses: true }))
    try {
      const res = await fetch('/api/expenses')
      if (res.ok) {
        const data = await res.json()
        setExpenses(data)
      }
    } catch (error) {
      toast.error('Failed to load expenses')
    } finally {
      setLoading(prev => ({ ...prev, expenses: false }))
    }
  }

  const loadProducts = async () => {
    setLoading(prev => ({ ...prev, products: true }))
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        const data = await res.json()
        setProducts(data)
      }
    } catch (error) {
      toast.error('Failed to load products')
    } finally {
      setLoading(prev => ({ ...prev, products: false }))
    }
  }

  // Sales Orders Configuration
  const salesOrderColumns = [
    { key: 'orderNumber', label: 'Order #', accessor: (item) => item.orderNumber },
    { key: 'customer', label: 'Customer', accessor: (item) => item.customer?.name },
    { key: 'project', label: 'Project', accessor: (item) => item.project?.name || 'Not Linked' },
    { key: 'orderDate', label: 'Date', accessor: (item) => new Date(item.orderDate).toLocaleDateString() },
    { key: 'totalAmount', label: 'Amount', accessor: (item) => item.totalAmount, format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'status', label: 'Status', accessor: (item) => item.status },
  ]

  const salesOrderGroupBy = [
    { value: 'status', label: 'Status' },
    { value: 'project', label: 'Project' },
    { value: 'customer', label: 'Customer' },
  ]

  const salesOrderFilters = {
    status: {
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'done', label: 'Done' },
        { value: 'cancelled', label: 'Cancelled' },
      ]
    }
  }

  // Purchase Orders Configuration
  const purchaseOrderColumns = [
    { key: 'orderNumber', label: 'Order #', accessor: (item) => item.orderNumber },
    { key: 'vendor', label: 'Vendor', accessor: (item) => item.vendor?.name },
    { key: 'project', label: 'Project', accessor: (item) => item.project?.name || 'Not Linked' },
    { key: 'orderDate', label: 'Date', accessor: (item) => new Date(item.orderDate).toLocaleDateString() },
    { key: 'totalAmount', label: 'Amount', accessor: (item) => item.totalAmount, format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'status', label: 'Status', accessor: (item) => item.status },
  ]

  const purchaseOrderGroupBy = [
    { value: 'status', label: 'Status' },
    { value: 'project', label: 'Project' },
    { value: 'vendor', label: 'Vendor' },
  ]

  const purchaseOrderFilters = {
    status: {
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'received', label: 'Received' },
        { value: 'cancelled', label: 'Cancelled' },
      ]
    }
  }

  // Customer Invoices Configuration
  const customerInvoiceColumns = [
    { key: 'invoiceNumber', label: 'Invoice #', accessor: (item) => item.invoiceNumber },
    { key: 'customer', label: 'Customer', accessor: (item) => item.customer?.name },
    { key: 'project', label: 'Project', accessor: (item) => item.project?.name || 'Not Linked' },
    { key: 'invoiceDate', label: 'Date', accessor: (item) => new Date(item.invoiceDate).toLocaleDateString() },
    { key: 'totalAmount', label: 'Amount', accessor: (item) => item.totalAmount, format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'paidAmount', label: 'Paid', accessor: (item) => item.paidAmount, format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'status', label: 'Status', accessor: (item) => item.status },
  ]

  const customerInvoiceGroupBy = [
    { value: 'status', label: 'Status' },
    { value: 'project', label: 'Project' },
    { value: 'customer', label: 'Customer' },
  ]

  const customerInvoiceFilters = {
    status: {
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'sent', label: 'Sent' },
        { value: 'paid', label: 'Paid' },
        { value: 'cancelled', label: 'Cancelled' },
      ]
    }
  }

  // Vendor Bills Configuration
  const vendorBillColumns = [
    { key: 'billNumber', label: 'Bill #', accessor: (item) => item.billNumber },
    { key: 'vendor', label: 'Vendor', accessor: (item) => item.vendor?.name },
    { key: 'project', label: 'Project', accessor: (item) => item.project?.name || 'Not Linked' },
    { key: 'billDate', label: 'Date', accessor: (item) => new Date(item.billDate).toLocaleDateString() },
    { key: 'totalAmount', label: 'Amount', accessor: (item) => item.totalAmount, format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'paidAmount', label: 'Paid', accessor: (item) => item.paidAmount, format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'status', label: 'Status', accessor: (item) => item.status },
  ]

  const vendorBillGroupBy = [
    { value: 'status', label: 'Status' },
    { value: 'project', label: 'Project' },
    { value: 'vendor', label: 'Vendor' },
  ]

  const vendorBillFilters = {
    status: {
      label: 'Status',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'posted', label: 'Posted' },
        { value: 'paid', label: 'Paid' },
        { value: 'cancelled', label: 'Cancelled' },
      ]
    }
  }

  // Expenses Configuration
  const expenseColumns = [
    { key: 'expenseNumber', label: 'Expense #', accessor: (item) => item.expenseNumber },
    { key: 'user', label: 'User', accessor: (item) => `${item.user?.firstName} ${item.user?.lastName}` },
    { key: 'project', label: 'Project', accessor: (item) => item.project?.name || 'Not Linked' },
    { key: 'description', label: 'Description', accessor: (item) => item.description },
    { key: 'category', label: 'Category', accessor: (item) => item.category },
    { key: 'amount', label: 'Amount', accessor: (item) => item.amount, format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'status', label: 'Status', accessor: (item) => item.status },
    { key: 'isBillable', label: 'Billable', accessor: (item) => item.isBillable ? 'Yes' : 'No' },
  ]

  const expenseGroupBy = [
    { value: 'status', label: 'Status' },
    { value: 'project', label: 'Project' },
    { value: 'category', label: 'Category' },
  ]

  const expenseFilters = {
    status: {
      label: 'Status',
      options: [
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'reimbursed', label: 'Reimbursed' },
      ]
    }
  }

  // Products Configuration
  const productColumns = [
    { key: 'name', label: 'Name', accessor: (item) => item.name },
    { key: 'description', label: 'Description', accessor: (item) => item.description },
    { key: 'unitPrice', label: 'Unit Price', accessor: (item) => item.unitPrice, format: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'costPrice', label: 'Cost Price', accessor: (item) => item.costPrice, format: (val) => val ? `$${parseFloat(val).toFixed(2)}` : '-' },
    { key: 'isService', label: 'Type', accessor: (item) => item.isService ? 'Service' : 'Product' },
  ]

  const statusColors = {
    draft: 'secondary',
    confirmed: 'default',
    sent: 'default',
    done: 'success',
    paid: 'success',
    posted: 'default',
    received: 'success',
    cancelled: 'destructive',
    submitted: 'secondary',
    approved: 'success',
    rejected: 'destructive',
    reimbursed: 'success',
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Global Documents</h1>
        <p className="text-muted-foreground">
          Manage all sales, purchases, invoices, bills, and expenses across all projects
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="sales-orders">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Sales Orders
          </TabsTrigger>
          <TabsTrigger value="purchase-orders">
            <FileText className="w-4 h-4 mr-2" />
            Purchase Orders
          </TabsTrigger>
          <TabsTrigger value="customer-invoices">
            <Receipt className="w-4 h-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="vendor-bills">
            <CreditCard className="w-4 h-4 mr-2" />
            Vendor Bills
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <Wallet className="w-4 h-4 mr-2" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="products">
            <Package className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales-orders">
          <DocumentListTable
            title="Sales Orders"
            data={salesOrders}
            columns={salesOrderColumns}
            groupByOptions={salesOrderGroupBy}
            filterOptions={salesOrderFilters}
            statusColors={statusColors}
            loading={loading.salesOrders}
            onCreate={() => setShowSOForm(true)}
            onEdit={(item) => {
              setSelectedItem(item)
              setShowSOForm(true)
            }}
          />
        </TabsContent>

        <TabsContent value="purchase-orders">
          <DocumentListTable
            title="Purchase Orders"
            data={purchaseOrders}
            columns={purchaseOrderColumns}
            groupByOptions={purchaseOrderGroupBy}
            filterOptions={purchaseOrderFilters}
            statusColors={statusColors}
            loading={loading.purchaseOrders}
            onCreate={() => setShowPOForm(true)}
            onEdit={(item) => {
              setSelectedItem(item)
              setShowPOForm(true)
            }}
          />
        </TabsContent>

        <TabsContent value="customer-invoices">
          <DocumentListTable
            title="Customer Invoices"
            data={customerInvoices}
            columns={customerInvoiceColumns}
            groupByOptions={customerInvoiceGroupBy}
            filterOptions={customerInvoiceFilters}
            statusColors={statusColors}
            loading={loading.customerInvoices}
            onCreate={() => setShowInvoiceForm(true)}
            onEdit={(item) => {
              setSelectedItem(item)
              setShowInvoiceForm(true)
            }}
          />
        </TabsContent>

        <TabsContent value="vendor-bills">
          <DocumentListTable
            title="Vendor Bills"
            data={vendorBills}
            columns={vendorBillColumns}
            groupByOptions={vendorBillGroupBy}
            filterOptions={vendorBillFilters}
            statusColors={statusColors}
            loading={loading.vendorBills}
            onCreate={() => setShowBillForm(true)}
            onEdit={(item) => {
              setSelectedItem(item)
              setShowBillForm(true)
            }}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <DocumentListTable
            title="Expenses"
            data={expenses}
            columns={expenseColumns}
            groupByOptions={expenseGroupBy}
            filterOptions={expenseFilters}
            statusColors={statusColors}
            loading={loading.expenses}
          />
        </TabsContent>

        <TabsContent value="products">
          <DocumentListTable
            title="Products & Services"
            data={products}
            columns={productColumns}
            loading={loading.products}
          />
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {showSOForm && (
        <CreateSalesOrderModal
          isOpen={showSOForm}
          onClose={() => {
            setShowSOForm(false)
            setSelectedItem(null)
          }}
          onSuccess={() => {
            loadSalesOrders()
            setShowSOForm(false)
            setSelectedItem(null)
          }}
          existingSO={selectedItem}
        />
      )}

      {showPOForm && (
        <PurchaseOrderForm
          isOpen={showPOForm}
          onClose={() => {
            setShowPOForm(false)
            setSelectedItem(null)
          }}
          onSuccess={() => {
            loadPurchaseOrders()
            setShowPOForm(false)
            setSelectedItem(null)
          }}
          existingPO={selectedItem}
          projectId={selectedItem?.projectId || null}
        />
      )}

      {showInvoiceForm && (
        <CustomerInvoiceForm
          isOpen={showInvoiceForm}
          onClose={() => {
            setShowInvoiceForm(false)
            setSelectedItem(null)
          }}
          onSuccess={() => {
            loadCustomerInvoices()
            setShowInvoiceForm(false)
            setSelectedItem(null)
          }}
          existingInvoice={selectedItem}
          projectId={selectedItem?.projectId || null}
        />
      )}

      {showBillForm && (
        <VendorBillForm
          isOpen={showBillForm}
          onClose={() => {
            setShowBillForm(false)
            setSelectedItem(null)
          }}
          onSuccess={() => {
            loadVendorBills()
            setShowBillForm(false)
            setSelectedItem(null)
          }}
          existingBill={selectedItem}
          projectId={selectedItem?.projectId || null}
        />
      )}
    </div>
  )
}
