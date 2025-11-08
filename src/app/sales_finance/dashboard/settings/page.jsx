'use client'
import React, { useEffect, useState } from 'react'
import { User, Building2, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SalesFinanceSettings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    hourlyRate: ''
  })

  useEffect(() => {
    const fetchUser = async () => {
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
      } catch (error) {
        console.error('Error fetching user:', error)
        toast.error('Failed to load settings')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
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
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account and preferences</p>
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
