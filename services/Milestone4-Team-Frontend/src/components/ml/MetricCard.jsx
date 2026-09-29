function MetricCard({ label, value, sublabel }) {
  return (
    <div className="metric-card h-100">
      <span className="metric-card__label">{label}</span>
      <span className="metric-card__value">{value}</span>
      {sublabel && <span className="metric-card__sublabel">{sublabel}</span>}
    </div>
  )
}

export default MetricCard
