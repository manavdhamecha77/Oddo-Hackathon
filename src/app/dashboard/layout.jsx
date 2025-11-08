'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    LayoutDashboard, 
    FolderKanban, 
    Clock, 
    Receipt, 
    FileText, 
    ShoppingCart, 
    CreditCard, 
    DollarSign,
    BarChart3,
    Settings,
    LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Timesheets', href: '/dashboard/timesheets', icon: Clock },
    { name: 'Expenses', href: '/dashboard/expenses', icon: Receipt },
    { name: 'Sales Orders', href: '/dashboard/sales-orders', icon: ShoppingCart },
    { name: 'Purchase Orders', href: '/dashboard/purchase-orders', icon: FileText },
    { name: 'Invoices', href: '/dashboard/invoices', icon: CreditCard },
    { name: 'Vendor Bills', href: '/dashboard/vendor-bills', icon: DollarSign },
]

export default function DashboardLayout({ children }) {
    const pathname = usePathname()

    return (
        <div className="flex h-screen bg-muted/10">
            {/* Sidebar */}
            <aside className="w-64 bg-card border-r flex flex-col">
                <div className="p-6 border-b">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-primary-foreground font-bold">OF</span>
                        </div>
                        <span className="font-bold text-lg">OneFlow</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.name}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/dashboard/settings">
                            <Settings className="w-5 h-5 mr-3" />
                            Settings
                        </Link>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" asChild>
                        <Link href="/api/auth/logout">
                            <LogOut className="w-5 h-5 mr-3" />
                            Logout
                        </Link>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
