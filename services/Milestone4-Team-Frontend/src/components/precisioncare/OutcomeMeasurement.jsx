import { useCallback, useEffect, useState } from 'react'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import { getOutcomes } from '../../api/precisionCareService'

const CHART_W = 700
const CHART_H = 220
const PAD_LEFT = 20
const PAD_RIGHT = 20
const PLOT_TOP = 20
const PLOT_BOTTOM = 145

function buildChartGeometry(trend) {
  if (!trend || trend.length === 0) return null
  const values = trend.map((t) => t.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = max - min || 1
  const step = (CHART_W - PAD_LEFT - PAD_RIGHT) / Math.max(trend.length - 1, 1)

  const points = trend.map((t, i) => {
    const x = PAD_LEFT + i * step
    const y = PLOT_TOP + (1 - (t.value - min) / range) * (PLOT_BOTTOM - PLOT_TOP)
    return { x, y, ...t }
  })

  const gridLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => (max - f * range).toFixed(1))

  return { points, max, min, gridLabels }
}

function OutcomeMeasurement({ patientId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await getOutcomes(patientId))
    } catch (err) {
      setError(err.displayMessage || 'Failed to load outcome data.')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const notify = (message) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 2200)
  }

  if (loading) return <section className="m4-section m4-outcome-section"><Loader label="Loading outcomes…" /></section>
  if (error) return <section className="m4-section m4-outcome-section"><div className="pc-error-banner">{error}</div></section>
  if (!data || (data.metrics || []).length === 0) {
    return (
      <section className="m4-section m4-outcome-section">
        <EmptyState icon="bi-graph-up-arrow" title="No outcome data yet" subtitle="Outcome measurements will appear here once the care plan starts tracking metrics." />
      </section>
    )
  }

  const { metrics, cvdRiskTrend, milestones } = data
  const geometry = buildChartGeometry(cvdRiskTrend)
  const first = cvdRiskTrend?.[0]?.value
  const latest = cvdRiskTrend?.[cvdRiskTrend.length - 1]?.value
  const pctChange = first ? (((latest - first) / first) * 100).toFixed(1) : null
  const pathPoints = geometry?.points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const areaPath = geometry
    ? `M${geometry.points.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L')} L${geometry.points[geometry.points.length - 1].x.toFixed(1)} ${PLOT_BOTTOM + 65} L${geometry.points[0].x.toFixed(1)} ${PLOT_BOTTOM + 65} Z`
    : ''

  return (
    <section className="m4-section m4-outcome-section">
      <div className="m4-section-title-row">
        <div>
          <div className="m4-section-kicker"><i className="bi bi-graph-up-arrow" /> PATIENT OUTCOMES</div>
          <h2 className="m4-section-heading">Outcome Measurement</h2>
          <p className="m4-section-subheading">Track measurable response to the careplan, compare against baseline values and identify whether clinical goals are moving toward target.</p>
        </div>
        <div className="m4-outcome-header-actions">
          <button type="button" className="m4-small-action" onClick={() => notify('Outcome report prepared')}><i className="bi bi-download" /> Export</button>
        </div>
      </div>

      <div className="m4-outcome-kpis">
        {metrics.map((metric) => (
          <article className="m4-outcome-metric" key={metric.id}>
            <div className="m4-outcome-metric-top">
              <div className={`m4-outcome-icon ${metric.tone}`}><i className={`bi ${metric.icon}`} /></div>
              <span className="m4-outcome-status"><i className="bi bi-arrow-up-right" /> {metric.status}</span>
            </div>
            <span className="m4-outcome-label">{metric.label}</span>
            <div className="m4-outcome-value-row"><strong>{metric.currentValue}</strong><span>{metric.changeText}</span></div>
            <div className="m4-outcome-target"><span>Target {metric.targetValue}</span><span>Baseline {metric.baselineValue}</span></div>
            <div className="m4-outcome-progress"><i style={{ width: `${metric.progressPercent}%` }} /></div>
            <div className="m4-outcome-progress-label"><span>Goal progress</span><b>{metric.progressPercent}%</b></div>
          </article>
        ))}
      </div>

      <div className="m4-outcome-main-grid">
        <article className="m4-outcome-panel m4-trend-panel">
          <div className="m4-outcome-panel-head">
            <div><h3>CVD Risk Trajectory</h3><p>Observed progress since the careplan started</p></div>
          </div>
          {geometry && (
            <>
              <div className="m4-trend-legend"><span><i className="trend-dot actual" /> Actual risk</span><b>{latest}% <small>current</small></b></div>
              <div className="m4-trend-chart" aria-label={`CVD risk trend from ${first}% to ${latest}%`}>
                <div className="m4-chart-grid">{geometry.gridLabels.map((g) => <span key={g}>{g}%</span>)}</div>
                <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none" role="img">
                  <path d={areaPath} className="chart-area" />
                  <polyline points={pathPoints} className="chart-line" />
                  {geometry.points.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r={i === geometry.points.length - 1 ? 5 : 4} className={`chart-point ${i === geometry.points.length - 1 ? 'current' : ''}`} />
                  ))}
                </svg>
                <div className="m4-chart-labels">{cvdRiskTrend.map((item) => <span key={item.id}>{item.dayLabel}</span>)}</div>
              </div>
              {pctChange !== null && (
                <div className="m4-trend-callout">
                  <i className="bi bi-stars" />
                  <div><strong>{pctChange < 0 ? 'Positive trajectory' : 'Trend update'}</strong><span>Risk has changed {Math.abs(pctChange)}% since the first recorded assessment.</span></div>
                  <b>{pctChange}%</b>
                </div>
              )}
            </>
          )}
        </article>

        <article className="m4-outcome-panel">
          <div className="m4-outcome-panel-head"><div><h3>Baseline vs Current</h3><p>Change since careplan activation</p></div><i className="bi bi-arrow-left-right m4-panel-icon" /></div>
          <div className="m4-comparison-list">
            {metrics.map((metric) => (
              <div key={metric.id}>
                <span>{metric.label}</span><b>{metric.baselineValue}</b><i className="bi bi-arrow-right" /><strong>{metric.currentValue}</strong><em>{metric.changeText}</em>
              </div>
            ))}
          </div>
          <div className="m4-comparison-footer"><i className="bi bi-info-circle" /> Measurements are synchronized from EHR, patient app and wearable signals.</div>
        </article>
      </div>

      <div className="m4-outcome-bottom-grid">
        <article className="m4-outcome-panel">
          <div className="m4-outcome-panel-head">
            <div><h3>Careplan Milestones</h3><p>Progress toward intervention goals</p></div>
            <span className="m4-milestone-count">{milestones.filter((m) => m.state !== 'pending').length} of {milestones.length} on track</span>
          </div>
          <div className="m4-milestones">
            {milestones.map((m) => (
              <div className={`m4-milestone ${m.state}`} key={m.id}>
                <span className="m4-milestone-icon"><i className={`bi ${m.state === 'complete' ? 'bi-check-lg' : m.state === 'active' ? 'bi-arrow-up' : 'bi-clock'}`} /></span>
                <div><strong>{m.title}</strong><small>{m.detail}</small></div>
                <b>{m.statusLabel}</b>
              </div>
            ))}
          </div>
        </article>
      </div>

      {toast && <div className="m4-toast"><i className="bi bi-check-circle-fill" /> {toast}</div>}
    </section>
  )
}

export default OutcomeMeasurement
