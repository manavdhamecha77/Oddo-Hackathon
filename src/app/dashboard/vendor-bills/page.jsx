'use client'
import React from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VendorBillsPage() {
  const bills = [
    { id: 1, number: 'BILL-001', project: 'Website Redesign', vendor: 'Design Agency Co', amount: '$12,000', date: '2025-02-01', status: 'Paid', dueDate: '2025-02-15' },
    { id: 2, number: 'BILL-002', project: 'Mobile App', vendor: 'Cloud Hosting Ltd', amount: '$1,800', date: '2025-02-05', status: 'Pending', dueDate: '2025-02-20' },
  ]

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
            <input type="text" placeholder="Search vendor bills..." className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background" />
          </div>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filter</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium text-sm">Bill #</th>
                <th className="text-left p-4 font-medium text-sm">Project</th>
                <th className="text-left p-4 font-medium text-sm">Vendor</th>
                <th className="text-left p-4 font-medium text-sm">Date</th>
                <th className="text-left p-4 font-medium text-sm">Due Date</th>
                <th className="text-left p-4 font-medium text-sm">Amount</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {bills.map((bill) => (
                <tr key={bill.id} className="hover:bg-muted/50">
                  <td className="p-4 font-medium">{bill.number}</td>
                  <td className="p-4">{bill.project}</td>
                  <td className="p-4">{bill.vendor}</td>
                  <td className="p-4">{new Date(bill.date).toLocaleDateString()}</td>
                  <td className="p-4">{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold">{bill.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      bill.status === 'Paid' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {bill.status}
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
