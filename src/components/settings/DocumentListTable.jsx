'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Layers, Plus, Eye, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function DocumentListTable({
  title,
  data = [],
  columns,
  onView,
  onEdit,
  onDelete,
  onCreate,
  groupByOptions = [],
  filterOptions = {},
  statusColors = {},
  loading = false
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [groupBy, setGroupBy] = useState('none')
  const [filterBy, setFilterBy] = useState({})
  const [collapsedGroups, setCollapsedGroups] = useState(new Set())

  // Search functionality
  const searchedData = useMemo(() => {
    if (!searchQuery) return data
    
    const query = searchQuery.toLowerCase()
    return data.filter(item => {
      return columns.some(col => {
        const value = col.accessor(item)
        return value?.toString().toLowerCase().includes(query)
      })
    })
  }, [data, searchQuery, columns])

  // Filter functionality
  const filteredData = useMemo(() => {
    let result = searchedData

    Object.entries(filterBy).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter(item => {
          const itemValue = item[key]
          if (typeof itemValue === 'object' && itemValue?.id) {
            return itemValue.id.toString() === value
          }
          return itemValue?.toString() === value
        })
      }
    })

    return result
  }, [searchedData, filterBy])

  // Group functionality
  const groupedData = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Items': filteredData }
    }

    const groups = {}
    filteredData.forEach(item => {
      let groupKey = item[groupBy]
      
      // Handle nested objects
      if (typeof groupKey === 'object' && groupKey !== null) {
        groupKey = groupKey.name || groupKey.id || 'Unknown'
      }
      
      groupKey = groupKey || 'Uncategorized'
      
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
    })

    return groups
  }, [filteredData, groupBy])

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }

  const getStatusBadge = (status) => {
    const variant = statusColors[status] || 'default'
    return <Badge variant={variant}>{status}</Badge>
  }

  const formatValue = (column, item) => {
    const value = column.accessor(item)
    
    if (column.key === 'status' && statusColors) {
      return getStatusBadge(value)
    }
    
    if (column.format) {
      return column.format(value)
    }
    
    if (typeof value === 'object' && value?.name) {
      return value.name
    }
    
    return value || '-'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle className="text-2xl">{title}</CardTitle>
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Group By */}
          {groupByOptions.length > 0 && (
            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[180px]">
                <Layers className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Group by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                {groupByOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Filters */}
          {Object.keys(filterOptions).map(filterKey => (
            <Select
              key={filterKey}
              value={filterBy[filterKey] || 'all'}
              onValueChange={(value) => setFilterBy(prev => ({ ...prev, [filterKey]: value }))}
            >
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder={filterOptions[filterKey].label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All {filterOptions[filterKey].label}</SelectItem>
                {filterOptions[filterKey].options.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} items
        </div>

        {/* Data Table with Grouping */}
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No items found</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedData).map(([groupName, groupItems]) => (
              <div key={groupName} className="border rounded-lg overflow-hidden">
                {/* Group Header */}
                {groupBy !== 'none' && (
                  <div
                    className="bg-muted px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-muted/80"
                    onClick={() => toggleGroup(groupName)}
                  >
                    <div className="flex items-center gap-2">
                      {collapsedGroups.has(groupName) ? (
                        <ChevronRight className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span className="font-semibold">{groupName}</span>
                      <Badge variant="secondary">{groupItems.length}</Badge>
                    </div>
                  </div>
                )}

                {/* Group Items */}
                {!collapsedGroups.has(groupName) && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {columns.map(column => (
                            <TableHead key={column.key}>{column.label}</TableHead>
                          ))}
                          {(onView || onEdit || onDelete) && (
                            <TableHead className="text-right">Actions</TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {groupItems.map((item, index) => (
                          <TableRow key={item.id || index}>
                            {columns.map(column => (
                              <TableCell key={column.key}>
                                {formatValue(column, item)}
                              </TableCell>
                            ))}
                            {(onView || onEdit || onDelete) && (
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  {onView && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onView(item)}
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {onEdit && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onEdit(item)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {onDelete && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onDelete(item)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
