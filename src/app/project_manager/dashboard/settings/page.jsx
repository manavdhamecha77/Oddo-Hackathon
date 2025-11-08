'use client'
import React, { useEffect, useState } from 'react'
import { User, Building2, Save, Loader2, Users, Trash2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ProjectManagerSettings() {
  const [user, setUser] = useState(null)
  const [teamMembers, setTeamMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hourlyRate: ''
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" })
        if (!res.ok) {
          window.location.href = "/login"
          return
        }
        const data = await res.json()
        setUser(data)
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          hourlyRate: data.hourlyRate || ''
        })

        // Fetch team members (mock data for now)
        // In production, this would fetch from /api/users?companyId=${data.companyId}
        setTeamMembers([
          // Mock data - replace with actual API call
        ])
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member? This action cannot be undone.')) {
      return
    }

    setDeletingId(memberId)
    try {
      // API call would go here: DELETE /api/users/${memberId}
      await new Promise(resolve => setTimeout(resolve, 1000))
      setTeamMembers(teamMembers.filter(m => m.id !== memberId))
      toast.success('Team member removed successfully')
    } catch (error) {
      toast.error('Failed to remove team member')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account and team</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Profile Settings */}
        <div className="bg-card border rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Profile Information</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">Update your personal information</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">First Name</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Last Name</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <input
                type="email"
                value={profileData.email}
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-muted cursor-not-allowed text-sm sm:text-base"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Hourly Rate ($)</label>
              <input
                type="number"
                value={profileData.hourlyRate}
                onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSaveProfile} disabled={saving} className="w-full sm:w-auto gap-2">
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Team Management */}
        <div className="bg-card border rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold">Team Management</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">View and manage your team members</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            {teamMembers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground mb-2">No team members yet</p>
                <p className="text-sm text-muted-foreground">Contact your admin to invite team members</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {member.firstName} {member.lastName}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-center shrink-0">
                        <p className="text-xs text-muted-foreground mb-1">Role</p>
                        <span className="text-xs sm:text-sm font-medium capitalize">
                          {member.role?.name?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-center shrink-0">
                        <p className="text-xs text-muted-foreground mb-1">Rate</p>
                        <span className="text-xs sm:text-sm font-semibold">
                          ${member.hourlyRate}/hr
                        </span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteMember(member.id)}
                        disabled={deletingId === member.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 shrink-0"
                      >
                        {deletingId === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Note</p>
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-300 mt-1">
                    Removing a team member will remove them from all assigned projects and tasks. 
                    This action cannot be undone. Contact your admin to add new members.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-card border rounded-xl shadow-sm">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Company Information</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">View your company details</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Company Name</label>
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-muted text-sm sm:text-base">
                {user?.company?.name || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Company ID</label>
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-muted font-mono text-sm">
                {user?.company?.companyId || 'N/A'}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 border rounded-lg bg-muted text-sm sm:text-base capitalize">
                {user?.role?.name?.replace(/_/g, ' ') || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
