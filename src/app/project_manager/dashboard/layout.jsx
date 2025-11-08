import RoleBasedLayout from '@/components/RoleBasedLayout'

export default function ProjectManagerDashboardLayout({ children }) {
    return <RoleBasedLayout role="project_manager">{children}</RoleBasedLayout>
}
