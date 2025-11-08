import { getUserFromRequest } from "@/lib/roleGuard";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Calculate Revenue (from Customer Invoices and Sales Orders)
    const invoices = await prisma.customerInvoice.findMany({
      where: {
        project: {
          projectManager: {
            companyId: user.companyId
          }
        }
      },
      select: {
        totalAmount: true,
        status: true
      }
    });

    const salesOrders = await prisma.salesOrder.findMany({
      where: {
        project: {
          projectManager: {
            companyId: user.companyId
          }
        }
      },
      select: {
        totalAmount: true,
        status: true
      }
    });

    // Sum up revenue from invoices
    const invoiceRevenue = invoices.reduce((sum, invoice) => {
      return sum + parseFloat(invoice.totalAmount || 0);
    }, 0);

    // Sum up revenue from sales orders (only confirmed/done)
    const salesOrderRevenue = salesOrders
      .filter(so => ['confirmed', 'done'].includes(so.status))
      .reduce((sum, so) => {
        return sum + parseFloat(so.totalAmount || 0);
      }, 0);

    const totalRevenue = invoiceRevenue + salesOrderRevenue;

    // Calculate Costs (from Purchase Orders, Vendor Bills, Expenses, Timesheets)
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: {
        project: {
          projectManager: {
            companyId: user.companyId
          }
        }
      },
      select: {
        totalAmount: true,
        status: true
      }
    });

    const vendorBills = await prisma.vendorBill.findMany({
      where: {
        project: {
          projectManager: {
            companyId: user.companyId
          }
        }
      },
      select: {
        totalAmount: true,
        status: true
      }
    });

    const expenses = await prisma.expense.findMany({
      where: {
        user: {
          companyId: user.companyId
        },
        status: 'approved'
      },
      select: {
        amount: true
      }
    });

    const timesheets = await prisma.timesheet.findMany({
      where: {
        user: {
          companyId: user.companyId
        }
      },
      select: {
        hours: true,
        hourlyRate: true
      }
    });

    // Sum up costs
    const poCosts = purchaseOrders.reduce((sum, po) => {
      return sum + parseFloat(po.totalAmount || 0);
    }, 0);

    const billCosts = vendorBills.reduce((sum, bill) => {
      return sum + parseFloat(bill.totalAmount || 0);
    }, 0);

    const expenseCosts = expenses.reduce((sum, expense) => {
      return sum + parseFloat(expense.amount || 0);
    }, 0);

    const timesheetCosts = timesheets.reduce((sum, ts) => {
      const cost = parseFloat(ts.hours || 0) * parseFloat(ts.hourlyRate || 0);
      return sum + cost;
    }, 0);

    const totalCosts = poCosts + billCosts + expenseCosts + timesheetCosts;

    // Calculate Profit
    const totalProfit = totalRevenue - totalCosts;

    return NextResponse.json({
      revenue: totalRevenue.toFixed(2),
      costs: totalCosts.toFixed(2),
      profit: totalProfit.toFixed(2),
      breakdown: {
        revenue: {
          invoices: invoiceRevenue.toFixed(2),
          salesOrders: salesOrderRevenue.toFixed(2)
        },
        costs: {
          purchaseOrders: poCosts.toFixed(2),
          vendorBills: billCosts.toFixed(2),
          expenses: expenseCosts.toFixed(2),
          timesheets: timesheetCosts.toFixed(2)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching financial summary:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
