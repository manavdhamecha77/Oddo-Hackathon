import RoleBasedLayout from '@/components/RoleBasedLayout'

export default function SalesFinanceDashboardLayout({ children }) {
    return <RoleBasedLayout role="sales_finance">{children}</RoleBasedLayout>
}
