import DashboardLayout from '../../components/layout/DashboardLayout'
import Analytics from '../../components/ml/Analytics'
import '../../styles/ml.css'

/**
 * Analytics -- carried over from the Milestone-2 frontend as-is.
 *
 * NOTE: the charts on this page (risk distribution, prediction volume,
 * accuracy by version) use static sample data, not a live aggregation
 * endpoint -- there is no `/analytics/summary` route on ml-service/ or
 * backend/ to back it. Kept as a demo/reference view rather than wired
 * to fabricated "real" numbers; a future iteration can back it with a
 * real reporting endpoint (e.g. aggregating ml-service's `ml_predictions`
 * table) without changing this page's layout.
 */
export default function AnalyticsPage() {
  return (
    <DashboardLayout title="ML Analytics">
      <div className="ml-demo-banner">
        Demo data -- not yet wired to a live analytics endpoint.
      </div>
      <Analytics />
    </DashboardLayout>
  )
}
