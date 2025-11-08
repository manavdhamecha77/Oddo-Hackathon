'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff } from 'lucide-react'

/**
 * Example component showing how to use real-time updates
 * 
 * Usage:
 * <RealtimeDocumentList
 *   endpoint="/api/purchase-orders"
 *   eventTypes={['purchase_order_created', 'purchase_order_updated', 'purchase_order_deleted']}
 *   title="Purchase Orders"
 * />
 */
export default function RealtimeDocumentList({ 
  endpoint, 
  eventTypes = [], 
  title = 'Documents',
  renderItem = (item) => <div>{JSON.stringify(item)}</div>
}) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(endpoint)
      if (res.ok) {
        const items = await res.json()
        setData(items)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Setup real-time event handlers
  const eventHandlers = {
    // Handle specific event types dynamically
    onUpdate: (event) => {
      const { type, data: eventData } = event

      // Check if this event type is relevant
      if (!eventTypes.includes(type)) return

      // Handle created events
      if (type.includes('_created')) {
        setData(prev => [eventData, ...prev])
        toast.success(`New ${title.toLowerCase().slice(0, -1)} created`)
      }

      // Handle updated events
      if (type.includes('_updated')) {
        setData(prev => prev.map(item => 
          item.id === eventData.id ? { ...item, ...eventData } : item
        ))
        toast.info(`${title.slice(0, -1)} updated`)
      }

      // Handle deleted events
      if (type.includes('_deleted')) {
        setData(prev => prev.filter(item => item.id !== eventData.id))
        toast.warning(`${title.slice(0, -1)} deleted`)
      }

      // Handle status changed events
      if (type.includes('_status_changed')) {
        setData(prev => prev.map(item => 
          item.id === eventData.id ? { ...item, status: eventData.status } : item
        ))
        toast.info(`Status changed to ${eventData.status}`)
      }
    },

    onMaxReconnectAttempts: () => {
      toast.error('Lost connection. Please refresh the page.')
    }
  }

  const { isConnected } = useRealtimeUpdates(eventHandlers)

  return (
    <div>
      {/* Connection Status Indicator */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Badge variant={isConnected ? 'success' : 'secondary'}>
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 mr-1" />
              Live
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 mr-1" />
              Offline
            </>
          )}
        </Badge>
      </div>

      {/* Data List */}
      {loading ? (
        <div>Loading...</div>
      ) : data.length === 0 ? (
        <div>No items found</div>
      ) : (
        <div className="space-y-2">
          {data.map((item) => (
            <div key={item.id}>
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
