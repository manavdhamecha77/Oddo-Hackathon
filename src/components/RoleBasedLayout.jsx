'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
    LogOut,
    Shield,
    Users,
    Loader2,
    Menu,
    X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

// Define navigation items for each role
const roleNavItems = {
    admin: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
        { name: 'Projects', href: '/admin/dashboard/projects', icon: FolderKanban },
        { name: 'Timesheets', href: '/admin/dashboard/timesheets', icon: Clock },
        { name: 'Expenses', href: '/admin/dashboard/expenses', icon: Receipt },
        { name: 'Sales Orders', href: '/admin/dashboard/sales-orders', icon: ShoppingCart },
        { name: 'Purchase Orders', href: '/admin/dashboard/purchase-orders', icon: FileText },
        { name: 'Invoices', href: '/admin/dashboard/invoices', icon: CreditCard },
        { name: 'Vendor Bills', href: '/admin/dashboard/vendor-bills', icon: DollarSign },
        { name: 'Team Management', href: '/admin', icon: Users },
    ],
    project_manager: [
        { name: 'Dashboard', href: '/project_manager/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '/project_manager/dashboard/analytics', icon: BarChart3 },
        { name: 'Projects', href: '/project_manager/dashboard/projects', icon: FolderKanban },
        { name: 'Timesheets', href: '/project_manager/dashboard/timesheets', icon: Clock },
        { name: 'Expenses', href: '/project_manager/dashboard/expenses', icon: Receipt },
        { name: 'Invoices', href: '/project_manager/dashboard/invoices', icon: CreditCard },
    ],
    team_member: [
        { name: 'Dashboard', href: '/team_member/dashboard', icon: LayoutDashboard },
        { name: 'My Projects', href: '/team_member/dashboard/projects', icon: FolderKanban },
        { name: 'Timesheets', href: '/team_member/dashboard/timesheets', icon: Clock },
        { name: 'Expenses', href: '/team_member/dashboard/expenses', icon: Receipt },
    ],
    sales_finance: [
        { name: 'Dashboard', href: '/sales_finance/dashboard', icon: LayoutDashboard },
        { name: 'Analytics', href: '/sales_finance/dashboard/analytics', icon: BarChart3 },
        { name: 'Sales Orders', href: '/sales_finance/dashboard/sales-orders', icon: ShoppingCart },
        { name: 'Purchase Orders', href: '/sales_finance/dashboard/purchase-orders', icon: FileText },
        { name: 'Invoices', href: '/sales_finance/dashboard/invoices', icon: CreditCard },
        { name: 'Vendor Bills', href: '/sales_finance/dashboard/vendor-bills', icon: DollarSign },
    ]
}

export default function RoleBasedLayout({ children, role }) {
    const pathname = usePathname()
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me', { credentials: 'include' })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data)
                    
                    // Redirect if user role doesn't match the expected role
                    if (data.role !== role) {
                        const userRole = data.role
                        router.push(`/${userRole}/dashboard`)
                    }
                } else {
                    router.push('/login')
                }
            } catch (error) {
                console.error('Failed to fetch user:', error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [role, router])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!user || user.role !== role) {
        return null
    }

    const navItems = roleNavItems[role] || []

    const SidebarContent = () => (
        <>
            <div className="p-4 sm:p-6 border-b">
                <Link href={`/${role}/dashboard`} className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold">OF</span>
                    </div>
                    <span className="font-bold text-lg">OneFlow</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 overflow-y-auto">
                <div className="mb-3 px-3">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {role.replace(/_/g, ' ')}
                    </div>
                </div>
                <div className="space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
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
                <div className="flex items-center justify-between mb-2 px-3">
                    <Button variant="ghost" className="flex-1 justify-start mr-2" asChild>
                        <Link href={`/${role}/dashboard/settings`} onClick={() => setMobileMenuOpen(false)}>
                            <Settings className="w-5 h-5 mr-3" />
                            Settings
                        </Link>
                    </Button>
                    <ModeToggle />
                </div>
                <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" asChild>
                    <Link href="/api/auth/logout">
                        <LogOut className="w-5 h-5 mr-3" />
                        Logout
                    </Link>
                </Button>
            </div>
        </>
    )

    return (
        <div className="flex h-screen bg-muted/10">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border rounded-lg shadow-lg hover:bg-muted transition-colors"
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Sidebar (Drawer) */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    {/* Drawer */}
                    <aside className="lg:hidden fixed inset-y-0 left-0 w-64 bg-card border-r flex flex-col z-40 transform transition-transform duration-300">
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-card border-r flex-col">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
