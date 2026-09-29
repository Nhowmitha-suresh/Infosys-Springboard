// src/api/vitalsService.js
// ---------------------------------------------------------------------
// REAL BACKEND CONTRACT (Phase 2 — once Kafka + backend are ready):
//
//   Bedside monitors / wearables publish readings to a Kafka topic,
//   e.g. "vitals.raw". A Spring Boot consumer service reads that topic
//   and re-broadcasts live updates to the frontend over a WebSocket
//   (or Server-Sent Events) endpoint:
//
//     WS  /ws/vitals/{patientId}
//         -> { patientId, heartRate, spo2, systolic, diastolic, temp, ts }
//
//   The frontend never talks to Kafka directly — it only ever opens a
//   WebSocket to the backend, which is what actually reads Kafka.
//
// This file SIMULATES that live feed locally (setInterval + a bounded
// random walk) so the UI is fully demoable before Kafka and the
// WebSocket bridge exist on the backend. Swapping the simulation for
// a real `new WebSocket(...)` connection later requires no changes to
// any component that uses `subscribeToVitals`.
// ---------------------------------------------------------------------

const USE_MOCK = String(import.meta.env.VITE_USE_MOCK_DATA) === 'true'

const BASELINE = {
  heartRate: 78,
  spo2: 98,
  systolic: 122,
  diastolic: 80,
  temp: 98.4,
}

// Normal ranges used by the UI to flag a reading as "alert"
export const VITAL_RANGES = {
  heartRate: { low: 60, high: 100, unit: 'bpm', label: 'Heart Rate' },
  spo2: { low: 95, high: 100, unit: '%', label: 'SpO₂' },
  systolic: { low: 90, high: 130, unit: 'mmHg', label: 'Systolic BP' },
  diastolic: { low: 60, high: 85, unit: 'mmHg', label: 'Diastolic BP' },
  temp: { low: 97.0, high: 99.5, unit: '°F', label: 'Temperature' },
}

function jitter(value, range) {
  return +(value + (Math.random() - 0.5) * range).toFixed(1)
}

function subscribeToMockVitals(patientId, onReading, intervalMs) {
  let last = { ...BASELINE }

  // emit one immediately so the UI isn't empty while waiting for the first tick
  onReading({ patientId, ...last, ts: new Date().toISOString() })

  const timer = setInterval(() => {
    last = {
      heartRate: Math.round(jitter(last.heartRate, 6)),
      spo2: Math.min(100, Math.round(jitter(last.spo2, 1.2))),
      systolic: Math.round(jitter(last.systolic, 5)),
      diastolic: Math.round(jitter(last.diastolic, 4)),
      temp: jitter(last.temp, 0.3),
    }
    onReading({ patientId, ...last, ts: new Date().toISOString() })
  }, intervalMs)

  return () => clearInterval(timer)
}

/**
 * Derives the ws:// (or wss://) vitals URL from VITE_API_BASE_URL.
 * Handles both absolute ("https://api.example.com/api") and relative
 * ("/api", same-origin deploy) values. No hardcoded localhost.
 */
function buildWsUrl(patientId) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
  const httpUrl = new URL(apiBase, window.location.origin)
  const wsProtocol = httpUrl.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${wsProtocol}//${httpUrl.host}/ws/vitals/${patientId}`
}

function subscribeToLiveVitals(patientId, onReading) {
  let socket = null
  let reconnectTimer = null
  let closedByCaller = false

  function connect() {
    socket = new WebSocket(buildWsUrl(patientId))

    socket.onmessage = (event) => {
      try {
        onReading(JSON.parse(event.data))
      } catch {
        // ignore malformed frames
      }
    }

    socket.onclose = () => {
      if (!closedByCaller) {
        // brief backoff, then try to reconnect (handles brief network blips / server restarts)
        reconnectTimer = setTimeout(connect, 3000)
      }
    }
  }

  connect()

  return () => {
    closedByCaller = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    if (socket) socket.close()
  }
}

/**
 * Subscribe to a live vitals stream for a patient.
 * In mock mode this simulates readings locally; otherwise it opens a
 * real WebSocket to the Spring Boot backend at WS /ws/vitals/{patientId}.
 * @param {number|string} patientId
 * @param {(reading: object) => void} onReading called with each new reading
 * @param {number} intervalMs how often a new (mock) reading arrives — ignored in live mode, the backend controls cadence
 * @returns {() => void} unsubscribe function — call on component unmount
 */
export function subscribeToVitals(patientId, onReading, intervalMs = 2000) {
  if (USE_MOCK) {
    return subscribeToMockVitals(patientId, onReading, intervalMs)
  }
  return subscribeToLiveVitals(patientId, onReading)
}

export function isOutOfRange(key, value) {
  const range = VITAL_RANGES[key]
  if (!range) return false
  return value < range.low || value > range.high
}
