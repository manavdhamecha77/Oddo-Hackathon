'use client'
import React from 'react'
import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ExpensesPage() {
  const expenses = [
    { id: 1, project: 'Website Redesign', description: 'Client meeting travel', amount: '$250', date: '2025-11-05', status: 'Unbilled', user: 'John Doe' },
    { id: 2, project: 'Mobile App', description: 'Software license', amount: '$99', date: '2025-11-03', status: 'Billed', user: 'Jane Smith' },
    { id: 3, project: 'Website Redesign', description: 'Stock photos', amount: '$150', date: '2025-11-01', status: 'Unbilled', user: 'Mike Johnson' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Expenses</h1>
          <p className="text-muted-foreground">Submit and track project expenses</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/create">
            <Plus className="w-4 h-4 mr-2" />
            New Expense
          </Link>
        </Button>
      </div>

      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search expenses..."
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
                <th className="text-left p-4 font-medium text-sm">Project</th>
                <th className="text-left p-4 font-medium text-sm">Description</th>
                <th className="text-left p-4 font-medium text-sm">Submitted By</th>
                <th className="text-left p-4 font-medium text-sm">Date</th>
                <th className="text-left p-4 font-medium text-sm">Amount</th>
                <th className="text-left p-4 font-medium text-sm">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-muted/50">
                  <td className="p-4">{expense.project}</td>
                  <td className="p-4">{expense.description}</td>
                  <td className="p-4">{expense.user}</td>
                  <td className="p-4">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{expense.amount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      expense.status === 'Billed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {expense.status}
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
