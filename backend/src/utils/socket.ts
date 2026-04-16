import { Server } from 'socket.io'

let io: Server | null = null

export function setIO(instance: Server) {
  io = instance
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

export function emitNewOrder(order: {
  id: string
  name: string
  phone: string
  comment?: string | null
  status: string
  created_at: Date
  wall_config: unknown
}) {
  try {
    getIO().emit('new_order', order)
  } catch {
    // Socket not initialized — safe to ignore (e.g. during tests)
  }
}
