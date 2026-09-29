import { io } from 'socket.io-client'
import { monitoringBaseURL } from './monitoringClient'

/**
 * Lazy Socket.IO singleton for the monitoring-service realtime channel
 * (see monitoring-service/src/sockets/index.js). One connection is shared
 * across every component that needs live notifications -- components
 * subscribe/unsubscribe to rooms, they don't own the socket lifecycle.
 */
let socket = null

export function getMonitoringSocket() {
  if (!socket) {
    // '' (relative) lets socket.io-client default to same-origin, which is
    // what we want when monitoringBaseURL is a same-origin path like
    // "/monitoring" (production, nginx-proxied /socket.io/).
    const url = monitoringBaseURL.startsWith('/') ? undefined : monitoringBaseURL
    socket = io(url, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

/** Joins the global notifications room + (optionally) a specific patient's room. */
export function subscribeToPatient(patientId) {
  const s = getMonitoringSocket()
  s.emit('subscribe:patient', patientId)
}

export function unsubscribeFromPatient(patientId) {
  const s = getMonitoringSocket()
  s.emit('unsubscribe:patient', patientId)
}

export function acknowledgeNotification(notificationId) {
  const s = getMonitoringSocket()
  s.emit('notification:ack', notificationId)
}
