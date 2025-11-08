'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Filter, Loader2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function VendorBillsPage() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchVendorBills()
  }, [])

  const fetchVendorBills = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/vendor-bills')
      if (!response.ok) throw new Error('Failed to fetch vendor bills')
      const data = await response.json()
      setBills(data)
    } catch (error) {
      console.error('Error fetching vendor bills:', error)
      toast.error('Failed to load vendor bills')
    } finally {
      setLoading(false)
    }
  }

  const filteredBills = bills.filter(bill =>
    bill.billNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.project?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      posted: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vendor Bills</h1>
          <p className="text-muted-foreground">Manage vendor bills and track actual costs</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/vendor-bills/create">
            <Plus className="w-4 h-4 mr-2" />
            New Vendor Bill
          </Link>
        </Button>
      </div>

      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search vendor bills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            />
          </div>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filter</Button>
        </div>

        {filteredBills.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No vendor bills found</h3>
            <p className="text-muted-foreground mb-4">Record your first vendor bill to track costs</p>
            <Button asChild>
              <Link href="/dashboard/vendor-bills/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Vendor Bill
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">Bill #</th>
                  <th className="text-left p-4 font-medium text-sm">Project</th>
                  <th className="text-left p-4 font-medium text-sm">Vendor</th>
                  <th className="text-left p-4 font-medium text-sm">Bill Date</th>
                  <th className="text-left p-4 font-medium text-sm">Due Date</th>
                  <th className="text-left p-4 font-medium text-sm">Total</th>
                  <th className="text-left p-4 font-medium text-sm">Paid</th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-muted/50">
                    <td className="p-4 font-medium">{bill.billNumber}</td>
                    <td className="p-4">{bill.project?.name || 'N/A'}</td>
                    <td className="p-4">{bill.vendor?.name || 'N/A'}</td>
                    <td className="p-4">{new Date(bill.billDate).toLocaleDateString()}</td>
                    <td className="p-4">
                      {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 font-semibold">${Number(bill.totalAmount).toFixed(2)}</td>
                    <td className="p-4">${Number(bill.paidAmount).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
