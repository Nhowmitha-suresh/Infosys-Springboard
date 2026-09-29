// src/components/vitals/VitalsMonitor.jsx
//
// Live vitals readout for a single patient. In Phase 2 this feed will be
// backed by Kafka -> Spring Boot -> WebSocket (see api/vitalsService.js
// for the exact contract). For now it renders whatever
// `subscribeToVitals` emits, so swapping the data source later needs no
// changes here.

import React, { useEffect, useRef, useState } from 'react'
import { subscribeToVitals, VITAL_RANGES, isOutOfRange } from '../../api/vitalsService'

const HISTORY_LENGTH = 20

function Sparkline({ points, color }) {
  if (points.length < 2) return <svg width="100%" height="36" />
  const min = Math.min(...points)
  const max = Math.max(...points) || 1
  const span = max - min || 1
  const w = 140
  const h = 36
  const step = w / (HISTORY_LENGTH - 1)
  const coords = points.map((p, i) => {
    const x = i * step
    const y = h - ((p - min) / span) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline points={coords} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  )
}

function VitalTile({ vitalKey, value, history }) {
  const range = VITAL_RANGES[vitalKey]
  const alert = isOutOfRange(vitalKey, value)
  const tint = alert ? 'var(--coral)' : 'var(--teal-500)'

  return (
    <div className="ms-stat-card" style={{ '--tint': tint }}>
      <div className="flex-grow-1">
        <div className="ms-stat-label d-flex align-items-center gap-2">
          {range.label}
          {alert && <span className="ms-badge-status"><span className="dot" style={{ background: 'var(--coral)' }} />out of range</span>}
        </div>
        <div className="ms-stat-value">
          {value}
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-soft)', marginLeft: 4 }}>{range.unit}</span>
        </div>
        <Sparkline points={history} color={alert ? 'var(--coral)' : 'var(--teal-600)'} />
      </div>
    </div>
  )
}

export default function VitalsMonitor({ patientId }) {
  const [reading, setReading] = useState(null)
  const [history, setHistory] = useState({ heartRate: [], spo2: [], systolic: [], diastolic: [], temp: [] })
  const historyRef = useRef(history)

  useEffect(() => {
    const unsubscribe = subscribeToVitals(patientId, (data) => {
      setReading(data)
      historyRef.current = {
        heartRate: [...historyRef.current.heartRate, data.heartRate].slice(-HISTORY_LENGTH),
        spo2: [...historyRef.current.spo2, data.spo2].slice(-HISTORY_LENGTH),
        systolic: [...historyRef.current.systolic, data.systolic].slice(-HISTORY_LENGTH),
        diastolic: [...historyRef.current.diastolic, data.diastolic].slice(-HISTORY_LENGTH),
        temp: [...historyRef.current.temp, data.temp].slice(-HISTORY_LENGTH),
      }
      setHistory({ ...historyRef.current })
    }, 2000)

    return unsubscribe
  }, [patientId])

  if (!reading) return <div className="text-muted small">Connecting to vitals stream…</div>

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h6 className="mb-0 brand-font">Live Vitals</h6>
        <span className="ms-badge-status">
          <span className="dot" style={{ background: 'var(--teal-500)', animation: 'ms-pulse 1.4s infinite' }} />
          LIVE · streaming
        </span>
      </div>
      <div className="row g-3">
        <div className="col-md-6 col-lg-3"><VitalTile vitalKey="heartRate" value={reading.heartRate} history={history.heartRate} /></div>
        <div className="col-md-6 col-lg-3"><VitalTile vitalKey="spo2" value={reading.spo2} history={history.spo2} /></div>
        <div className="col-md-6 col-lg-3"><VitalTile vitalKey="systolic" value={reading.systolic} history={history.systolic} /></div>
        <div className="col-md-6 col-lg-3"><VitalTile vitalKey="temp" value={reading.temp} history={history.temp} /></div>
      </div>
      <div className="text-muted mt-2" style={{ fontSize: '0.72rem', fontFamily: 'IBM Plex Mono, monospace' }}>
        last update: {new Date(reading.ts).toLocaleTimeString()}
      </div>
    </div>
  )
}
