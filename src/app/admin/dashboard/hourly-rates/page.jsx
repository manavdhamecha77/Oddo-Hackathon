'use client'
import React, { useState, useEffect } from 'react'
import { DollarSign, Search, Loader2, Save, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function HourlyRatesPage() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [bulkRate, setBulkRate] = useState('')
  const [selectAll, setSelectAll] = useState(false)

  const roles = [
    { id: 2, name: 'Project Manager' },
    { id: 3, name: 'Team Member' }
  ]

  useEffect(() => {
    fetchUsers()
  }, [selectedRoles])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      let url = '/api/admin/users'
      
      if (selectedRoles.length > 0) {
        url += `?role=${selectedRoles.join(',')}`
      }

      const response = await fetch(url, { credentials: 'include' })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
      setFilteredUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase()
      const email = (user.email || '').toLowerCase()
      const query = searchQuery.toLowerCase()
      return fullName.includes(query) || email.includes(query)
    })
    setFilteredUsers(filtered)
  }

  const handleRoleFilterChange = (roleId) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
    setSelectAll(false)
    setSelectedUsers([])
  }

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        setSelectAll(false)
        return prev.filter(id => id !== userId)
      } else {
        const newSelection = [...prev, userId]
        if (newSelection.length === filteredUsers.length) {
          setSelectAll(true)
        }
        return newSelection
      }
    })
  }

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers([])
      setSelectAll(false)
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id))
      setSelectAll(true)
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user')
      return
    }

    if (!bulkRate || isNaN(parseFloat(bulkRate)) || parseFloat(bulkRate) < 0) {
      toast.error('Please enter a valid hourly rate')
      return
    }

    try {
      setUpdating(true)
      const response = await fetch('/api/admin/users/rates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userIds: selectedUsers,
          hourlyRate: parseFloat(bulkRate)
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update rates')
      }

      toast.success(result.message)
      
      // Refresh users list
      await fetchUsers()
      
      // Reset selections
      setSelectedUsers([])
      setSelectAll(false)
      setBulkRate('')

    } catch (error) {
      console.error('Error updating rates:', error)
      toast.error(error.message || 'Failed to update hourly rates')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Manage Hourly Rates</h1>
        <p className="text-muted-foreground">Set hourly rates for team members and project managers</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-card border rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Role Filters */}
          <div>
            <label className="block text-sm font-medium mb-3">Filter by Role</label>
            <div className="space-y-2">
              {roles.map(role => (
                <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleFilterChange(role.id)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm">{role.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-3">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
              />
            </div>
          </div>

          {/* Bulk Update */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Bulk Set Rate ({selectedUsers.length} selected)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  placeholder="0.00"
                  value={bulkRate}
                  onChange={(e) => setBulkRate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background"
                  step="0.01"
                  min="0"
                  disabled={selectedUsers.length === 0}
                />
              </div>
              <Button 
                onClick={handleBulkUpdate} 
                disabled={updating || selectedUsers.length === 0}
              >
                {updating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Users</p>
          <p className="text-2xl font-bold">{filteredUsers.length}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Selected</p>
          <p className="text-2xl font-bold">{selectedUsers.length}</p>
        </div>
        <div className="bg-card border rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Active Filters</p>
          <p className="text-2xl font-bold">{selectedRoles.length}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border rounded-xl">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Users</h2>
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectAll ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'No users match your search criteria' 
                : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-sm w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-sm">Name</th>
                  <th className="text-left p-4 font-medium text-sm">Email</th>
                  <th className="text-left p-4 font-medium text-sm">Role</th>
                  <th className="text-left p-4 font-medium text-sm">Current Rate</th>
                  <th className="text-left p-4 font-medium text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr 
                    key={user.id} 
                    className={`hover:bg-muted/50 transition-colors ${
                      selectedUsers.includes(user.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    </td>
                    <td className="p-4 text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.role?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-semibold">
                      ${parseFloat(user.hourlyRate || 0).toFixed(2)}/hr
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}