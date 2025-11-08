'use client'
import React, { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  FolderKanban,
  Clock,
  Receipt,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Repeat2,
  FileText as FileTextIcon
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

// MetricCard Component with improved design
const MetricCard = ({ title, value, unit = '', icon, description, valueClassName, trend, isLive }) => (
  <Card className="relative overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="flex items-center gap-2">
        {trend && (
          <div className={`flex items-center gap-1 text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className={`text-2xl font-bold ${valueClassName || ''}`}>
        {unit}{typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      {isLive && (
        <div className="flex items-center gap-2 mt-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      )}
    </CardContent>
  </Card>
)

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30days') // 7days, 30days, 90days, 1year
  const [realtimeData, setRealtimeData] = useState({
    latestInvoices: [],
    latestExpenses: [],
    recentActivity: []
  })
  const [analytics, setAnalytics] = useState({
    summary: {
      totalRevenue: 0,
      totalCosts: 0,
      totalProfit: 0,
      profitMargin: 0,
      activeProjects: 0,
      totalHours: 0,
      totalInvoices: 0,
      revenueChange: 0,
      profitChange: 0
    },
    revenueByMonth: [],
    projectStatus: [],
    expenseCategories: [],
    topProjects: [],
    revenueVsCosts: [],
    hoursByProject: []
  })

  useEffect(() => {
    fetchAnalytics()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchRealtimeData()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [timeRange])

  const fetchRealtimeData = async () => {
    try {
      const [invoicesRes, expensesRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/expenses')
      ])

      if (invoicesRes.ok && expensesRes.ok) {
        const invoices = await invoicesRes.json()
        const expenses = await expensesRes.json()

        // Get latest 10 invoices
        const latestInvoices = invoices
          .sort((a, b) => new Date(b.createdAt || b.invoiceDate) - new Date(a.createdAt || a.invoiceDate))
          .slice(0, 10)

        // Get latest 10 expenses
        const latestExpenses = expenses
          .sort((a, b) => new Date(b.createdAt || b.expenseDate) - new Date(a.createdAt || a.expenseDate))
          .slice(0, 10)

        setRealtimeData({
          latestInvoices,
          latestExpenses,
          recentActivity: [...latestInvoices, ...latestExpenses]
            .sort((a, b) => {
              const dateA = new Date(a.createdAt || a.invoiceDate || a.expenseDate)
              const dateB = new Date(b.createdAt || b.invoiceDate || b.expenseDate)
              return dateB - dateA
            })
            .slice(0, 15)
        })
      }
    } catch (error) {
      console.error('Error fetching realtime data:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch all necessary data
      const [projectsRes, invoicesRes, expensesRes, timesheetsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/invoices'),
        fetch('/api/expenses'),
        fetch('/api/timesheets')
      ])

      if (!projectsRes.ok || !invoicesRes.ok || !expensesRes.ok || !timesheetsRes.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const projects = await projectsRes.json()
      const invoices = await invoicesRes.json()
      const expenses = await expensesRes.json()
      const timesheets = await timesheetsRes.json()

      // Calculate summary statistics
      const totalRevenue = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)
      const totalCosts = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0)
      const totalProfit = totalRevenue - totalCosts
      const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0
      const activeProjects = projects.filter(p => p.status === 'in_progress').length
      const totalHours = timesheets.reduce((sum, ts) => sum + Number(ts.hours || 0), 0)
      const totalInvoices = invoices.length

      // Get latest data for realtime section
      await fetchRealtimeData()

      // Revenue by month (last 6 months)
      const revenueByMonth = generateMonthlyRevenue(invoices)

      // Project status distribution
      const projectStatus = [
        { name: 'In Progress', value: projects.filter(p => p.status === 'in_progress').length },
        { name: 'Planned', value: projects.filter(p => p.status === 'planned').length },
        { name: 'Completed', value: projects.filter(p => p.status === 'completed').length },
        { name: 'On Hold', value: projects.filter(p => p.status === 'on_hold').length }
      ].filter(item => item.value > 0)

      // Expense categories
      const expenseCategoryMap = {}
      expenses.forEach(exp => {
        const category = exp.category || 'Other'
        expenseCategoryMap[category] = (expenseCategoryMap[category] || 0) + Number(exp.amount || 0)
      })
      const expenseCategories = Object.entries(expenseCategoryMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      }))

      // Top 5 projects by revenue
      const projectRevenueMap = {}
      invoices.forEach(inv => {
        if (inv.project?.name) {
          projectRevenueMap[inv.project.name] = (projectRevenueMap[inv.project.name] || 0) + Number(inv.totalAmount || 0)
        }
      })
      const topProjects = Object.entries(projectRevenueMap)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Revenue vs Costs comparison
      const revenueVsCosts = generateRevenueVsCosts(invoices, expenses)

      // Hours by project
      const projectHoursMap = {}
      timesheets.forEach(ts => {
        if (ts.project?.name) {
          projectHoursMap[ts.project.name] = (projectHoursMap[ts.project.name] || 0) + Number(ts.hours || 0)
        }
      })
      const hoursByProject = Object.entries(projectHoursMap)
        .map(([name, hours]) => ({ name, hours }))
        .sort((a, b) => b.hours - a.hours)
        .slice(0, 5)

      setAnalytics({
        summary: {
          totalRevenue,
          totalCosts,
          totalProfit,
          profitMargin,
          activeProjects,
          totalHours,
          totalInvoices,
          revenueChange: 12.5, // Mock data for now
          profitChange: 8.3 // Mock data for now
        },
        revenueByMonth,
        projectStatus,
        expenseCategories,
        topProjects,
        revenueVsCosts,
        hoursByProject
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyRevenue = (invoices) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const monthlyData = []

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      const revenue = invoices
        .filter(inv => {
          const invMonth = new Date(inv.invoiceDate).getMonth()
          return invMonth === monthIndex
        })
        .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)
      
      monthlyData.push({ month: monthName, revenue })
    }

    return monthlyData
  }

  const generateRevenueVsCosts = (invoices, expenses) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    const currentMonth = new Date().getMonth()
    const data = []

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = months[monthIndex]
      
      const revenue = invoices
        .filter(inv => new Date(inv.invoiceDate).getMonth() === monthIndex)
        .reduce((sum, inv) => sum + Number(inv.totalAmount || 0), 0)
      
      const costs = expenses
        .filter(exp => new Date(exp.expenseDate).getMonth() === monthIndex)
        .reduce((sum, exp) => sum + Number(exp.amount || 0), 0)
      
      data.push({ month: monthName, revenue, costs, profit: revenue - costs })
    }

    return data
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 flex flex-col gap-4 md:gap-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl text-primary drop-shadow-lg">
          Active Business Analytics
        </h1>
        <p className="text-md md:text-lg text-muted-foreground">
          Real-time insights into your business performance and financial health.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 flex-wrap">
        <Button 
          variant={timeRange === '7days' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setTimeRange('7days')}
        >
          7 Days
        </Button>
        <Button 
          variant={timeRange === '30days' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setTimeRange('30days')}
        >
          30 Days
        </Button>
        <Button 
          variant={timeRange === '90days' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setTimeRange('90days')}
        >
          90 Days
        </Button>
        <Button 
          variant={timeRange === '1year' ? 'default' : 'outline'} 
          size="sm"
          onClick={() => setTimeRange('1year')}
        >
          1 Year
        </Button>
      </div>

      {/* Key Metrics - Live Dashboard Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={analytics.summary.totalRevenue || 0}
          unit="$"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Cumulative revenue generated"
          valueClassName="text-emerald-500"
          trend={analytics.summary.revenueChange}
        />
        <MetricCard
          title="Net Profit"
          value={analytics.summary.totalProfit || 0}
          unit="$"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description={`${analytics.summary.profitMargin.toFixed(1)}% profit margin`}
          valueClassName="text-blue-400"
          trend={analytics.summary.profitChange}
        />
        <MetricCard
          title="Total Transactions"
          value={analytics.summary.totalInvoices || 0}
          icon={<Repeat2 className="h-4 w-4 text-muted-foreground" />}
          description="Number of invoices recorded"
        />
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activity Status</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Live
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.summary.activeProjects} active projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={analytics.revenueByMonth}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue vs Costs */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue vs Costs
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.revenueVsCosts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
              <Bar dataKey="costs" fill="#ef4444" name="Costs" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#3b82f6" name="Profit" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Status Distribution */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FolderKanban className="w-5 h-5" />
            Project Status
          </h3>
          {analytics.projectStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.projectStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.projectStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No project data available
            </div>
          )}
        </div>

        {/* Expense Categories */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Expense Categories
          </h3>
          {analytics.expenseCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={analytics.expenseCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No expense data available
            </div>
          )}
        </div>

        {/* Hours by Project */}
        <div className="bg-card border rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Hours Logged
          </h3>
          {analytics.hoursByProject.length > 0 ? (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-3xl font-bold">{analytics.summary.totalHours.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">Total Hours</p>
              </div>
              <div className="space-y-3">
                {analytics.hoursByProject.map((project, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="truncate">{project.name}</span>
                      <span className="font-medium">{project.hours.toFixed(1)}h</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${(project.hours / analytics.summary.totalHours) * 100}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              No timesheet data available
            </div>
          )}
        </div>
      </div>

      {/* Top Projects */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Projects by Revenue
        </h3>
        {analytics.topProjects.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topProjects} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis dataKey="name" type="category" stroke="#6b7280" width={150} />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => formatCurrency(value)}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No project revenue data available
          </div>
        )}
      </div>

      {/* Real-time Activity Section - Live Dashboard Style */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latest Invoices */}
        <Card className="col-span-1 max-h-[500px] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" /> 
              Latest Invoices
            </CardTitle>
            <CardDescription>Recently created invoices, updated live.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="divide-y divide-border">
                {realtimeData.latestInvoices.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">No invoices yet...</p>
                ) : (
                  realtimeData.latestInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-lg text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(Number(invoice.totalAmount || 0))}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {invoice.invoiceNumber} • {invoice.customer?.name || 'N/A'}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">
                          {invoice.project?.name || 'No project'}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={
                          invoice.status === 'paid' ? 'default' :
                          invoice.status === 'sent' ? 'secondary' : 'outline'
                        }>
                          {invoice.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(invoice.invoiceDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-4 text-sm text-muted-foreground">
            <p>Displaying the 10 most recent invoices.</p>
          </CardFooter>
        </Card>

        {/* Latest Expenses */}
        <Card className="col-span-1 max-h-[500px] overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-orange-500" /> 
              Latest Expenses
            </CardTitle>
            <CardDescription>Recent expense submissions, updated live.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[300px]">
              <div className="divide-y divide-border">
                {realtimeData.latestExpenses.length === 0 ? (
                  <p className="p-4 text-center text-muted-foreground">No expenses yet...</p>
                ) : (
                  realtimeData.latestExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-lg text-orange-600 dark:text-orange-400">
                          {formatCurrency(Number(expense.amount || 0))}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {expense.category} • {expense.user?.firstName} {expense.user?.lastName}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1 truncate">
                          {expense.description}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <Badge variant={
                          expense.status === 'approved' ? 'default' :
                          expense.status === 'reimbursed' ? 'secondary' : 'outline'
                        }>
                          {expense.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground mt-1">
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="pt-4 text-sm text-muted-foreground">
            <p>Displaying the 10 most recent expenses.</p>
          </CardFooter>
        </Card>
      </div>

      <Separator className="my-4" />

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.summary.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all projects and team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Costs</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(analytics.summary.totalCosts)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All expenses and vendor bills
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analytics.summary.activeProjects}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently in progress
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
