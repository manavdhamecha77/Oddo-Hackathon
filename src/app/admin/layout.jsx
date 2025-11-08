import RoleBasedLayout from '@/components/RoleBasedLayout'

export default function AdminLayout({ children }) {
    return <RoleBasedLayout role="admin">{children}</RoleBasedLayout>
}
