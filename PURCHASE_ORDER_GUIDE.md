# Purchase Order (PO) Implementation Guide

## 📋 Table of Contents
1. [What is a Purchase Order?](#what-is-a-purchase-order)
2. [System Architecture](#system-architecture)
3. [Complete Workflow](#complete-workflow)
4. [Implementation Details](#implementation-details)
5. [User Guides](#user-guides)

---

## 🎯 What is a Purchase Order?

### Definition
A **Purchase Order (PO)** is a formal document that represents a **planned cost** or **earmarked fund** for your project. Think of it as a "promise to pay" - it's NOT a bill and you do NOT pay it directly.

### Key Characteristics
- **Type**: Planned Cost (Future Expense)
- **Purpose**: Budget accuracy and cost planning
- **Timing**: Created BEFORE vendor delivers goods/services
- **Financial Impact**: Shows up as "planned cost" in project dashboard
- **Lifecycle**: PO → Work Completed → Vendor Bill (actual cost)

### Real-World Example
```
Project: Brand Website Redesign
Need: Professional photography services

STEP 1: Create PO
  - Vendor: Acme Photography
  - Amount: $12,000
  - Status: Draft → Sent
  - Impact: Project shows $12,000 as "Planned Cost"

STEP 2: Vendor Delivers Work
  - Photographer completes photoshoot
  - Sends invoice for $12,000

STEP 3: Create Vendor Bill (linked to PO)
  - Reference PO number
  - Status: Draft → Posted → Paid
  - Impact: $12,000 becomes "Actual Cost"
  - Result: Profit calculation updated instantly
```

---

## 🏗️ System Architecture

### Database Schema (Prisma)

```prisma
model PurchaseOrder {
  id           Int                 @id @default(autoincrement())
  orderNumber  String              @unique
  projectId    Int
  vendorId     Int
  orderDate    DateTime            @default(now())
  status       PurchaseOrderStatus @default(draft)
  totalAmount  Decimal             @default(0.00)
  notes        String?
  createdBy    Int?
  
  // Relations
  project     Project
  vendor      Partner             // Partner with type 'vendor' or 'both'
  lines       PurchaseOrderLine[] // Line items (products/services)
  vendorBills VendorBill[]        // Linked actual bills
}

model PurchaseOrderLine {
  id              Int
  purchaseOrderId Int
  description     String
  quantity        Decimal
  unitPrice       Decimal
  
  purchaseOrder PurchaseOrder
}

enum PurchaseOrderStatus {
  draft      // Initial creation, not yet sent to vendor
  sent       // PO sent to vendor, awaiting delivery
  received   // Work/goods received, ready for billing
  cancelled  // PO cancelled
}
```

### API Endpoints

#### 1. **GET /api/partners?type=vendor**
Fetch all vendors for PO creation dropdown
```javascript
Response: [
  {
    id: 1,
    name: "Acme Photography",
    type: "vendor",
    email: "contact@acmephoto.com",
    phone: "+1 234 567 8900"
  }
]
```

#### 2. **POST /api/partners**
Create a new vendor on-the-fly
```javascript
Request: {
  name: "XYZ Consulting",
  type: "vendor",
  email: "info@xyz.com",
  phone: "+1 555 1234"
}
```

#### 3. **GET /api/purchase-orders?projectId={id}**
Fetch all POs for a specific project
```javascript
Response: [
  {
    id: 1,
    orderNumber: "PO-2025-001",
    vendor: { id: 1, name: "Acme Photography" },
    totalAmount: 12000.00,
    status: "sent",
    vendorBills: [] // Array of linked bills
  }
]
```

#### 4. **POST /api/purchase-orders**
Create new PO
```javascript
Request: {
  projectId: 5,
  orderNumber: "PO-2025-001",
  vendorId: 1,
  orderDate: "2025-11-09",
  status: "draft",
  notes: "Photography for homepage",
  lines: [
    {
      description: "Professional Photography Services",
      quantity: 1,
      unitPrice: 12000.00
    }
  ]
}
```

#### 5. **PUT /api/purchase-orders/{id}**
Update existing PO

#### 6. **DELETE /api/purchase-orders/{id}**
Delete PO (Admin only)

### Component Architecture

```
src/
├── components/
│   ├── forms/
│   │   └── PurchaseOrderForm.jsx        ← Main PO creation/edit form
│   └── project/
│       └── ProjectLinksPanel.jsx        ← Displays POs in "Purchase Orders" tab
├── app/
│   └── api/
│       ├── partners/
│       │   └── route.js                 ← Vendor/Customer API
│       └── purchase-orders/
│           ├── route.js                 ← List & Create POs
│           └── [id]/
│               └── route.js             ← Get/Update/Delete single PO
```

---

## 🔄 Complete Workflow

### Scenario: Hiring External Photographer

#### **STEP 1: Identify the Need**
**Role**: Project Manager  
**Action**: PM realizes the "Brand Website" project needs external photography

#### **STEP 2: Create Purchase Order (Plan the Cost)**
**Role**: Project Manager or Sales & Finance  
**UI Path**: 
1. Navigate to Project Page → `admin/dashboard/projects/{id}`
2. Click **"Links Panel"** tab
3. Select **"Purchase Orders"** sub-tab
4. Click **"Create Purchase Order"** button

**Form Fields**:
```
PO Number: PO-172357-42 (auto-generated)
Vendor: [Select: Acme Photography] or [+ Create New Vendor]
Order Date: 2025-11-09
Status: Draft

Line Items:
┌─────────────────────────────────────┬──────────┬─────────────┬──────────┐
│ Description                         │ Quantity │ Unit Price  │ Subtotal │
├─────────────────────────────────────┼──────────┼─────────────┼──────────┤
│ Professional Photography Services   │    1     │  $12,000.00 │ $12,000  │
│ Equipment Rental                    │    2     │     $500.00 │  $1,000  │
└─────────────────────────────────────┴──────────┴─────────────┴──────────┘
Total: $13,000.00

Notes: Homepage and product photography session
```

**Result**:
- PO created with status "draft"
- Project dashboard shows:
  ```
  Planned Costs: $13,000 (from PO)
  Actual Costs: $0 (no vendor bill yet)
  ```

#### **STEP 3: Send PO to Vendor**
**Action**: Update PO status to "sent"
- Vendor receives PO externally (email, portal, etc.)
- PO serves as formal agreement

#### **STEP 4: Vendor Completes Work**
**Role**: Vendor (External)  
**Action**: Photographer completes photoshoot and sends invoice for $13,000

#### **STEP 5: Create Vendor Bill (Log Actual Cost)**
**Role**: Sales & Finance  
**UI Path**:
1. Go to same Project Page → Links Panel
2. Select **"Vendor Bills"** sub-tab
3. Click **"Create Vendor Bill"**

**Form Fields**:
```
Bill Number: VB-2025-001
Vendor: Acme Photography
Link to PO: PO-172357-42 (optional but recommended)
Bill Date: 2025-11-15
Due Date: 2025-12-15
Status: Draft → Posted

Line Items:
┌─────────────────────────────────────┬──────────┬─────────────┬──────────┐
│ Description                         │ Quantity │ Unit Price  │ Subtotal │
├─────────────────────────────────────┼──────────┼─────────────┼──────────┤
│ Professional Photography Services   │    1     │  $12,000.00 │ $12,000  │
│ Equipment Rental                    │    2     │     $500.00 │  $1,000  │
└─────────────────────────────────────┴──────────┴─────────────┴──────────┘
Total: $13,000.00
```

**Result**:
- Vendor Bill created and linked to PO
- Project dashboard updated:
  ```
  Planned Costs: $13,000 (from PO)
  Actual Costs: $13,000 (from Vendor Bill) ✓
  Profit: Revenue - $13,000
  ```
- PO can be marked as "received" (fulfilled)

---

## 🛠️ Implementation Details

### Role-Based Access Control

| Role              | Can View POs | Can Create POs | Can Edit POs | Can Delete POs |
|-------------------|--------------|----------------|--------------|----------------|
| Team Member       | ❌ No        | ❌ No          | ❌ No        | ❌ No          |
| Project Manager   | ✅ Yes       | ✅ Yes         | ✅ Yes       | ❌ No          |
| Sales & Finance   | ✅ Yes       | ✅ Yes         | ✅ Yes       | ❌ No          |
| Admin             | ✅ Yes       | ✅ Yes         | ✅ Yes       | ✅ Yes         |

### Key Features

#### 1. **Auto-Generated PO Numbers**
```javascript
// Format: PO-{timestamp}-{random}
const timestamp = Date.now().toString().slice(-6)
const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0')
const poNumber = `PO-${timestamp}-${randomNum}` // e.g., PO-172357-42
```

#### 2. **Dynamic Line Items**
- Add multiple products/services to one PO
- Real-time subtotal calculation
- Minimum 1 line item required
- Remove any line except the last one

#### 3. **Vendor Management**
- Select existing vendor from dropdown
- Create new vendor inline (without leaving PO form)
- New vendor immediately available in dropdown

#### 4. **PO-to-Bill Linking**
- Vendor Bills can reference PO number
- Shows linked bills in PO table
- Helps track PO fulfillment status

#### 5. **Company-Level Data Isolation**
```javascript
// All PO queries filtered by user's company
whereClause = {
  project: {
    projectManager: {
      companyId: user.companyId
    }
  }
}
```

### Financial Dashboard Integration

#### Before PO Creation:
```
Project: Brand Website
Revenue: $50,000 (from Sales Order)
Costs: $10,000 (labor from timesheets)
Profit: $40,000
Margin: 80%
```

#### After PO Creation:
```
Project: Brand Website
Revenue: $50,000
Planned Costs: $13,000 (NEW - from PO)
Actual Costs: $10,000
Total Expected Costs: $23,000
Expected Profit: $27,000 ⚠️
Expected Margin: 54%
```

#### After Vendor Bill Posted:
```
Project: Brand Website
Revenue: $50,000
Planned Costs: $13,000 (PO fulfilled)
Actual Costs: $23,000 (labor + vendor bill)
Profit: $27,000 ✓
Margin: 54%
```

---

## 👥 User Guides

### For Project Managers

#### When to Create a PO:
1. **External Services**: Hiring consultants, freelancers, agencies
2. **Equipment Rental**: Cameras, servers, software licenses
3. **Materials**: Physical goods needed for project
4. **Subcontracting**: Outsourced development, design work

#### Best Practices:
- Create PO BEFORE work starts (for accurate budget tracking)
- Update status to "sent" after vendor agrees
- Mark as "received" after work is delivered
- Always link Vendor Bills to original PO

### For Sales & Finance

#### Responsibilities:
1. **Create Vendor Bills**: After receiving vendor invoices
2. **Link to POs**: Reference original PO number
3. **Verify Amounts**: Ensure bill matches PO
4. **Process Payments**: Mark bills as "paid" after payment

#### Workflow Checklist:
- [ ] Receive vendor invoice
- [ ] Find corresponding PO in system
- [ ] Create Vendor Bill with same line items
- [ ] Link to PO using `purchaseOrderId` field
- [ ] Update PO status to "received"
- [ ] Process payment and update bill status to "paid"

### For Team Members

**Access**: Team Members CANNOT view or create Purchase Orders. This is intentional to maintain financial data confidentiality.

If you need external services:
1. Request PM to create PO
2. Provide vendor details and cost estimate
3. PM will handle PO creation and tracking

---

## 🔍 Troubleshooting

### Issue: "Vendor not showing in dropdown"
**Solution**: 
1. Click the **"+"** button next to vendor dropdown
2. Fill in new vendor form
3. Click "Create Vendor"
4. New vendor will appear in dropdown automatically

### Issue: "Cannot create PO - Forbidden"
**Solution**: Check your role. Only PM, Sales & Finance, and Admin can create POs.

### Issue: "PO total doesn't match bill total"
**Solution**: This is OK! Bill can differ from PO due to:
- Change orders
- Additional services
- Discounts
- Partial billing

Always link bills to POs even if amounts differ for audit trail.

### Issue: "Cannot delete PO"
**Solution**: Only Admins can delete POs. If you need to cancel:
1. Update status to "cancelled"
2. Add notes explaining reason
3. PO remains in system for audit purposes

---

## 📊 Reports & Analytics

### Available in Financial Dashboard:
```
/api/projects/{id}/financials
```

Returns:
```json
{
  "plannedCosts": {
    "purchaseOrders": 13000.00,
    "count": 1
  },
  "actualCosts": {
    "vendorBills": 13000.00,
    "expenses": 2500.00,
    "labor": 10000.00,
    "total": 25500.00
  },
  "costVariance": {
    "amount": 0,
    "percentage": 0,
    "status": "on_track"
  }
}
```

### PO-Specific Metrics:
- Total POs by status (draft, sent, received, cancelled)
- PO fulfillment rate (linked bills / total POs)
- Average PO amount
- Top vendors by spend

---

## 🎓 Summary

**Purchase Orders are essential for**:
1. ✅ Accurate budget forecasting
2. ✅ Vendor relationship management
3. ✅ Financial transparency
4. ✅ Audit trail (linking plans to actuals)
5. ✅ Project profitability tracking

**Key Takeaway**: PO = Planned Cost → Vendor Bill = Actual Cost

This two-step process ensures your project's financial dashboard always reflects both what you *expect* to spend (POs) and what you *actually* spent (Vendor Bills), giving you real-time visibility into project health.

---

## 📝 Implementation Checklist

### Backend:
- [x] Partners API (`/api/partners`)
- [x] Purchase Orders API (`/api/purchase-orders`)
- [x] Individual PO API (`/api/purchase-orders/[id]`)
- [x] Company-level access control
- [x] Role-based permissions
- [x] Transaction-safe updates

### Frontend:
- [x] PurchaseOrderForm component
- [x] Vendor creation inline
- [x] Dynamic line items
- [x] Auto-generated PO numbers
- [x] ProjectLinksPanel integration
- [x] PO table with status badges
- [x] Linked bills display

### Database:
- [x] PurchaseOrder model
- [x] PurchaseOrderLine model
- [x] Partner model (vendors)
- [x] Relationships (Project, Vendor, VendorBill)

### Complete! 🎉
Your PO system is now fully operational and integrated into the OneFlow ERP workflow.
