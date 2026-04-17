import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export interface IncomingOrder {
  id: string
  name: string
  phone: string
  comment?: string | null
  status: string
  created_at: string
  wall_config: Record<string, unknown>
}

export function useOrderSocket(onNewOrder: (order: IncomingOrder) => void) {
  const socketRef = useRef<Socket | null>(null)
  // Keep onNewOrder stable inside the effect via a ref
  const callbackRef = useRef(onNewOrder)
  callbackRef.current = onNewOrder

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 2000,
    })
    socketRef.current = socket

    socket.on('new_order', (order: IncomingOrder) => {
      callbackRef.current(order)
    })

    socket.on('connect_error', () => {
      // suppress — socket auto-reconnects; noise in prod
    })

    return () => {
      socket.disconnect()
    }
  }, []) // connect once on mount

  return socketRef
}
