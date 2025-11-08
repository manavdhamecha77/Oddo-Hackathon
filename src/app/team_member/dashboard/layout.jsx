import RoleBasedLayout from '@/components/RoleBasedLayout'

export default function TeamMemberDashboardLayout({ children }) {
    return <RoleBasedLayout role="team_member">{children}</RoleBasedLayout>
}
