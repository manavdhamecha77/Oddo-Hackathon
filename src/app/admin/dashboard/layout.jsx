import RoleBasedLayout from '@/components/RoleBasedLayout'

export default function AdminDashboardLayout({ children }) {
    return <RoleBasedLayout role="admin">{children}</RoleBasedLayout>
}
