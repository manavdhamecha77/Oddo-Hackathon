import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET project financials (revenue, costs, profit)
export async function GET(req, { params }) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    const projectId = parseInt(id);

    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { name: true, budget: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Calculate Revenue (from Customer Invoices)
    const revenueData = await prisma.customerInvoice.aggregate({
      where: { 
        projectId,
        status: { in: ['Sent', 'Paid'] } // Only count confirmed invoices
      },
      _sum: { totalAmount: true },
      _count: true
    });

    const totalRevenue = revenueData._sum.totalAmount || 0;
    const invoiceCount = revenueData._count;

    // Calculate Labor Costs (from Timesheets)
    const timesheetCosts = await prisma.timesheet.aggregate({
      where: {
        task: {
          projectId
        }
      },
      _sum: { 
        hoursSpent: true 
      }
    });

    const totalHours = timesheetCosts._sum.hoursSpent || 0;

    // Get average billable rate for labor cost estimation
    const avgRateData = await prisma.timesheet.aggregate({
      where: {
        task: { projectId },
        billableRate: { not: null }
      },
      _avg: { billableRate: true }
    });

    const avgBillableRate = avgRateData._avg.billableRate || 0;
    const laborCost = totalHours * avgBillableRate;

    // Calculate Expense Costs
    const expenseData = await prisma.expense.aggregate({
      where: { projectId },
      _sum: { amount: true },
      _count: true
    });

    const totalExpenses = expenseData._sum.amount || 0;
    const expenseCount = expenseData._count;

    // Calculate Purchase Order Costs
    const purchaseOrderData = await prisma.purchaseOrder.aggregate({
      where: { 
        projectId,
        status: { in: ['Confirmed', 'Received'] }
      },
      _sum: { totalAmount: true }
    });

    const purchaseOrderCosts = purchaseOrderData._sum.totalAmount || 0;

    // Calculate Vendor Bill Costs
    const vendorBillData = await prisma.vendorBill.aggregate({
      where: { 
        projectId,
        status: { in: ['Posted', 'Paid'] }
      },
      _sum: { totalAmount: true }
    });

    const vendorBillCosts = vendorBillData._sum.totalAmount || 0;

    // Total Costs
    const totalCosts = laborCost + totalExpenses + purchaseOrderCosts + vendorBillCosts;

    // Profit Calculation
    const profit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

    // Budget Analysis
    const budgetUsed = totalCosts;
    const budgetRemaining = project.budget ? project.budget - budgetUsed : null;
    const budgetUtilization = project.budget && project.budget > 0 
      ? (budgetUsed / project.budget) * 100 
      : null;

    // Unbilled Items
    const unbilledTimesheets = await prisma.timesheet.count({
      where: {
        task: { projectId },
        isBilled: false
      }
    });

    const unbilledExpenses = await prisma.expense.count({
      where: {
        projectId,
        isBilled: false
      }
    });

    return NextResponse.json({
      projectName: project.name,
      revenue: {
        total: totalRevenue,
        invoiceCount
      },
      costs: {
        labor: {
          amount: laborCost,
          hours: totalHours,
          avgRate: avgBillableRate
        },
        expenses: {
          amount: totalExpenses,
          count: expenseCount
        },
        purchaseOrders: purchaseOrderCosts,
        vendorBills: vendorBillCosts,
        total: totalCosts
      },
      profitability: {
        profit,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        status: profit > 0 ? 'Profitable' : profit < 0 ? 'Loss' : 'Break-even'
      },
      budget: {
        allocated: project.budget,
        used: budgetUsed,
        remaining: budgetRemaining,
        utilization: budgetUtilization ? parseFloat(budgetUtilization.toFixed(2)) : null
      },
      unbilled: {
        timesheets: unbilledTimesheets,
        expenses: unbilledExpenses
      }
    });

  } catch (error) {
    console.error('Error fetching project financials:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
