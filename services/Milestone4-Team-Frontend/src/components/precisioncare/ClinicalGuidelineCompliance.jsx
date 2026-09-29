import { useCallback, useEffect, useState } from 'react'
import Loader from '../common/Loader'
import EmptyState from '../common/EmptyState'
import { getGuidelines, reviewGuideline } from '../../api/precisionCareService'

function ClinicalGuidelineCompliance({ patientId }) {
  const [filter, setFilter] = useState('all')
  const [guidelines, setGuidelines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setGuidelines(await getGuidelines(patientId, 'all'))
    } catch (err) {
      setError(err.displayMessage || 'Failed to load guideline compliance data.')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => { load() }, [load])

  const showToast = (text) => { setToast(text); window.setTimeout(() => setToast(''), 2200) }

  const handleReview = async (id) => {
    try {
      await reviewGuideline(id)
      await load()
      showToast('Guideline marked as reviewed')
    } catch (err) {
      showToast(err.displayMessage || 'Failed to update guideline')
    }
  }

  if (loading) return <section className="m4-section m4-guideline-section"><Loader label="Loading guideline compliance…" /></section>
  if (error) return <section className="m4-section m4-guideline-section"><div className="pc-error-banner">{error}</div></section>
  if (guidelines.length === 0) {
    return (
      <section className="m4-section m4-guideline-section">
        <EmptyState icon="bi-shield-check" title="No guidelines tracked yet" subtitle="Clinical guideline compliance checks will appear here once configured for this patient." />
      </section>
    )
  }

  const filtered = filter === 'all' ? guidelines : guidelines.filter((item) => item.status === filter)
  const compliantCount = guidelines.filter((g) => g.status === 'compliant').length
  const reviewCount = guidelines.filter((g) => g.status === 'review').length
  const nonCompliantCount = guidelines.filter((g) => g.status === 'non_compliant').length
  const overallScore = Math.round((compliantCount / guidelines.length) * 100)

  return (
    <section className="m4-section m4-guideline-section">
      <div className="m4-section-title-row">
        <div>
          <div className="m4-section-kicker"><i className="bi bi-shield-check" /> QUALITY & SAFETY</div>
          <h2 className="m4-section-heading">Clinical Guideline Compliance</h2>
          <p className="m4-section-subheading">Real-time validation of the careplan against established clinical protocols and quality measures.</p>
        </div>
        <div className="m4-compliance-score"><strong>{overallScore}%</strong><span>Overall compliance</span></div>
      </div>

      <div className="m4-compliance-overview">
        <div className="m4-compliance-progress">
          <div className="m4-ring-small"><strong>{compliantCount}/{guidelines.length}</strong><span>met</span></div>
          <div>
            <strong>Guideline readiness</strong>
            <p>{reviewCount > 0 ? `${reviewCount} item${reviewCount > 1 ? 's' : ''} need${reviewCount === 1 ? 's' : ''} review.` : 'All guideline requirements are currently satisfied.'}</p>
            <div className="m4-wide-progress"><i style={{ width: `${overallScore}%` }} /></div>
          </div>
        </div>
        <div className="m4-compliance-stats">
          <div><b>{compliantCount}</b><span>Compliant</span></div>
          <div><b>{reviewCount}</b><span>Review needed</span></div>
          <div><b>{nonCompliantCount}</b><span>Non-compliant</span></div>
        </div>
      </div>

      <div className="m4-filter-bar">
        <div className="m4-filter-tabs">
          {['all', 'compliant', 'review'].map((item) => (
            <button key={item} type="button" className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>
              {item === 'all' ? 'All guidelines' : item === 'review' ? 'Review needed' : 'Compliant'}
            </button>
          ))}
        </div>
      </div>

      <div className="m4-compliance-grid">
        {filtered.map((item) => (
          <article key={item.id} className={`m4-compliance-card status-card-${item.status}`}>
            <div className="m4-compliance-card-top">
              <div className="m4-guideline-icon"><i className={`bi ${item.icon}`} /><span>{item.code}</span></div>
              <span className={`m4-compliance-badge badge-${item.status}`}>
                <i className={`bi ${item.status === 'compliant' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`} />
                {' '}{item.status === 'compliant' ? 'Compliant' : 'Review needed'}
              </span>
            </div>
            <h3>{item.guidelineName}</h3>
            <p className="m4-guideline-requirement">{item.requirement}</p>
            <div className="m4-guideline-detail"><i className="bi bi-info-circle" /> {item.detail}</div>
            <div className="m4-guideline-footer">
              <div><span>Alignment</span><strong>{item.score}</strong></div>
              <small>{item.updatedLabel}</small>
              {item.status === 'review' && (
                <button type="button" onClick={() => handleReview(item.id)}>Review now <i className="bi bi-arrow-right" /></button>
              )}
            </div>
          </article>
        ))}
      </div>

      {toast && <div className="m4-toast"><i className="bi bi-check-circle-fill" /> {toast}</div>}
    </section>
  )
}

export default ClinicalGuidelineCompliance
