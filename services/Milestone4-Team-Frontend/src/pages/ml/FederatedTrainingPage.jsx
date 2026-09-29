import DashboardLayout from '../../components/layout/DashboardLayout'
import FederatedTraining from '../../components/ml/FederatedTraining'
import '../../styles/ml.css'

/**
 * Federated Training -- carried over from the Milestone-2 frontend as-is.
 *
 * NOTE: this page is a UI mockup. The round/node data below is static
 * (see components/ml/FederatedTraining.jsx) -- there is no federated
 * learning coordinator service in this project, and building one is out
 * of scope for this integration. Kept as a demo/reference view rather
 * than removed, and clearly labeled so it isn't mistaken for a live
 * feature. Wire it to a real coordinator endpoint later if/when one exists.
 */
export default function FederatedTrainingPage() {
  return (
    <DashboardLayout title="Federated Training">
      <div className="ml-demo-banner">
        Demo data -- UI mockup, not backed by a live federated-learning coordinator.
      </div>
      <FederatedTraining />
    </DashboardLayout>
  )
}
