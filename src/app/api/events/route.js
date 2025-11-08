import { NextResponse } from 'next/server'
import { getUserFromRequest } from '@/lib/roleGuard'

// Store active connections per company
const connections = new Map()

// Helper to broadcast events to company users
export function broadcastToCompany(companyId, event) {
  const companyConnections = connections.get(companyId) || []
  companyConnections.forEach(({ controller }) => {
    try {
      const data = `data: ${JSON.stringify(event)}\n\n`
      controller.enqueue(new TextEncoder().encode(data))
    } catch (error) {
      console.error('Error broadcasting event:', error)
    }
  })
}

// Helper to send events from anywhere in your app
export function sendRealtimeUpdate(companyId, eventType, data) {
  broadcastToCompany(companyId, {
    type: eventType,
    data,
    timestamp: new Date().toISOString()
  })
}

export async function GET(req) {
  const user = await getUserFromRequest(req)
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { companyId } = user

  // Create a TransformStream for SSE
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()
  const encoder = new TextEncoder()

  // Store connection
  const connectionId = Math.random().toString(36).substring(7)
  const connection = {
    id: connectionId,
    userId: user.id,
    controller: writer,
    companyId
  }

  if (!connections.has(companyId)) {
    connections.set(companyId, [])
  }
  connections.get(companyId).push(connection)

  // Send initial connection message
  writer.write(encoder.encode(`data: ${JSON.stringify({ 
    type: 'connected', 
    message: 'Connected to real-time updates',
    connectionId 
  })}\n\n`))

  // Keep-alive ping every 30 seconds
  const keepAliveInterval = setInterval(() => {
    try {
      writer.write(encoder.encode(': ping\n\n'))
    } catch (error) {
      clearInterval(keepAliveInterval)
    }
  }, 30000)

  // Cleanup on disconnect
  req.signal.addEventListener('abort', () => {
    clearInterval(keepAliveInterval)
    const companyConnections = connections.get(companyId) || []
    const index = companyConnections.findIndex(c => c.id === connectionId)
    if (index > -1) {
      companyConnections.splice(index, 1)
    }
    if (companyConnections.length === 0) {
      connections.delete(companyId)
    }
    writer.close()
  })

  return new Response(stream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
