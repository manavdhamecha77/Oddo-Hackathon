'use client'
import React from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InvoicesPage() {
  const invoices = [
    { id: 1, number: 'INV-001', project: 'Website Redesign', client: 'TechCorp', amount: '$15,000', date: '2025-11-01', status: 'Paid', dueDate: '2025-11-15' },
    { id: 2, number: 'INV-002', project: 'Mobile App', client: 'StartupHub', amount: '$25,000', date: '2025-11-05', status: 'Pending', dueDate: '2025-11-20' },
    { id: 3, number: 'INV-003', project: 'Website Redesign', client: 'TechCorp', amount: '$10,000', date: '2025-10-28', status: 'Overdue', dueDate: '2025-11-05' },
  ]

  const getStatusColor = (status) => {
    switch(status) {
      case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Invoices</h1>
          <p className="text-muted-foreground">Manage invoices and track revenue</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/invoices/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Link>
        </Button>
      </div>

      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Invoice #</th>
                <th className="text-left p-4 font-medium text-sm">Project</th>
                <th className="text-left p-4 font-medium text-sm">Client</th>
                <th className="text-left p-4 font-medium text-sm">Date</th>
                <th className="text-left p-4 font-medium text-sm">Due Date</th>
                <th className="text-left p-4 font-medium text-sm">Amount</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-muted/50 cursor-pointer">
                  <td className="p-4 font-medium">{invoice.number}</td>
                  <td className="p-4">{invoice.project}</td>
                  <td className="p-4">{invoice.client}</td>
                  <td className="p-4">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold">{invoice.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
