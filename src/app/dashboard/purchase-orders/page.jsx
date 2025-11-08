'use client'
import React from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PurchaseOrdersPage() {
  const orders = [
    { id: 1, number: 'PO-001', project: 'Website Redesign', vendor: 'Design Agency Co', amount: '$12,000', date: '2025-01-15', status: 'Approved' },
    { id: 2, number: 'PO-002', project: 'Mobile App', vendor: 'Cloud Hosting Ltd', amount: '$5,400', date: '2025-02-01', status: 'Pending' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Purchase Orders</h1>
          <p className="text-muted-foreground">Track planned costs and vendor purchases</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/purchase-orders/create">
            <Plus className="w-4 h-4 mr-2" />
            New Purchase Order
          </Link>
        </Button>
      </div>

      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search purchase orders..." className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background" />
          </div>
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filter</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-medium text-sm">PO #</th>
                <th className="text-left p-4 font-medium text-sm">Project</th>
                <th className="text-left p-4 font-medium text-sm">Vendor</th>
                <th className="text-left p-4 font-medium text-sm">Date</th>
                <th className="text-left p-4 font-medium text-sm">Amount</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-muted/50">
                  <td className="p-4 font-medium">{order.number}</td>
                  <td className="p-4">{order.project}</td>
                  <td className="p-4">{order.vendor}</td>
                  <td className="p-4">{new Date(order.date).toLocaleDateString()}</td>
                  <td className="p-4 font-semibold">{order.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'Approved' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {order.status}
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
