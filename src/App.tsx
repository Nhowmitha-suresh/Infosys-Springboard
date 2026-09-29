import React, { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MediStorage } from './services/storage';

const AdherenceTracking = lazy(() => import('./pages/AdherenceTracking').then(module => ({ default: module.AdherenceTracking })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.Admin })));
const AiCareplanGenerator = lazy(() => import('./pages/AiCareplanGenerator').then(module => ({ default: module.AiCareplanGenerator })));
const Authentication = lazy(() => import('./pages/Authentication').then(module => ({ default: module.Authentication })));
const Alerts = lazy(() => import('./pages/Alerts').then(module => ({ default: module.Alerts })));
const Analytics = lazy(() => import('./pages/Analytics').then(module => ({ default: module.Analytics })));
const Appointments = lazy(() => import('./pages/Appointments').then(module => ({ default: module.Appointments })));
const ClinicalGuidelineEngine = lazy(() => import('./pages/ClinicalGuidelineEngine').then(module => ({ default: module.ClinicalGuidelineEngine })));
const ClinicalRuleEngine = lazy(() => import('./pages/ClinicalRuleEngine').then(module => ({ default: module.ClinicalRuleEngine })));
const ConsentSettings = lazy(() => import('./pages/ConsentSettings').then(module => ({ default: module.ConsentSettings })));
const ConsentVerification = lazy(() => import('./pages/ConsentVerification').then(module => ({ default: module.ConsentVerification })));
const ContinuousMonitoring = lazy(() => import('./pages/ContinuousMonitoring').then(module => ({ default: module.ContinuousMonitoring })));
const CvdRisk = lazy(() => import('./pages/CVDRisk').then(module => ({ default: module.CvdRisk })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const DiabetesRisk = lazy(() => import('./pages/DiabetesRisk').then(module => ({ default: module.DiabetesRisk })));
const DigitalTwinPage = lazy(() => import('./pages/DigitalTwin').then(module => ({ default: module.DigitalTwinPage })));
const Doctor = lazy(() => import('./pages/Doctor').then(module => ({ default: module.Doctor })));
const Doctors = lazy(() => import('./pages/Doctors').then(module => ({ default: module.Doctors })));
const Employee = lazy(() => import('./pages/Employee').then(module => ({ default: module.Employee })));
const FederatedTraining = lazy(() => import('./pages/FederatedTraining').then(module => ({ default: module.FederatedTraining })));
const Fhir = lazy(() => import('./pages/Fhir').then(module => ({ default: module.Fhir })));
const KafkaStreaming = lazy(() => import('./pages/KafkaStreaming').then(module => ({ default: module.KafkaStreaming })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const MedicalRecords = lazy(() => import('./pages/MedicalRecords').then(module => ({ default: module.MedicalRecords })));
const ModelVersioning = lazy(() => import('./pages/ModelVersioning').then(module => ({ default: module.ModelVersioning })));
const Models = lazy(() => import('./pages/Models').then(module => ({ default: module.Models })));
const Patient = lazy(() => import('./pages/Patient').then(module => ({ default: module.Patient })));
const Patients = lazy(() => import('./pages/Patients').then(module => ({ default: module.Patients })));
const PrecisionCare = lazy(() => import('./pages/PrecisionCare').then(module => ({ default: module.PrecisionCare })));
const Predictions = lazy(() => import('./pages/Predictions').then(module => ({ default: module.Predictions })));
const Receptionist = lazy(() => import('./pages/Receptionist').then(module => ({ default: module.Receptionist })));
const Reports = lazy(() => import('./pages/Reports').then(module => ({ default: module.Reports })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));
const ModuleEmbed = lazy(() => import('./pages/ModuleEmbed').then(module => ({ default: module.ModuleEmbed })));

const DefaultRedirect: React.FC = () => {
  const user = MediStorage.getCurrentUser();
  const token = sessionStorage.getItem('medisphere_token');

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<div role="status">Loading...</div>}>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/models" element={<Layout><Models /></Layout>} />
        <Route path="/ml-models" element={<Layout><Models /></Layout>} />
        <Route path="/cvd-risk" element={<Layout><CvdRisk /></Layout>} />
        <Route path="/predictions" element={<Layout><Predictions /></Layout>} />
        <Route path="/diabetes-risk" element={<Layout><DiabetesRisk /></Layout>} />
        <Route path="/continuous-monitoring" element={<Layout><ContinuousMonitoring /></Layout>} />
        <Route path="/alerts" element={<Layout><Alerts /></Layout>} />
        <Route path="/federated-training" element={<Layout><FederatedTraining /></Layout>} />
        <Route path="/patients" element={<Layout><Patients /></Layout>} />
        <Route path="/reports" element={<Layout><Reports /></Layout>} />
        <Route path="/analytics" element={<Layout><Analytics /></Layout>} />
        <Route path="/ml-analytics" element={<Layout><Analytics /></Layout>} />
        <Route path="/admin" element={<Layout><Admin /></Layout>} />
        <Route path="/doctor" element={<Layout><Doctor /></Layout>} />
        <Route path="/doctors" element={<Layout><Doctors /></Layout>} />
        <Route path="/patient" element={<Layout><Patient /></Layout>} />
        <Route path="/receptionist" element={<Layout><Receptionist /></Layout>} />
        <Route path="/employee" element={<Layout><Employee /></Layout>} />
        <Route path="/appointments" element={<Layout><Appointments /></Layout>} />
        <Route path="/medical-records" element={<Layout><MedicalRecords /></Layout>} />
        <Route path="/fhir" element={<Layout><Fhir /></Layout>} />
        <Route path="/digital-twin" element={<Layout><DigitalTwinPage /></Layout>} />
        <Route path="/twins" element={<Layout><DigitalTwinPage /></Layout>} />
        <Route path="/kafka-streaming" element={<Layout><KafkaStreaming /></Layout>} />
        <Route path="/careplan-generator" element={<Layout><AiCareplanGenerator /></Layout>} />
        <Route path="/careplans" element={<Layout><AiCareplanGenerator /></Layout>} />
        <Route path="/consent-settings" element={<Layout><ConsentSettings /></Layout>} />
        <Route path="/consent-verification" element={<Layout><ConsentVerification /></Layout>} />
        <Route path="/clinical-guidelines" element={<Layout><ClinicalGuidelineEngine /></Layout>} />
        <Route path="/adherence-tracking" element={<Layout><AdherenceTracking /></Layout>} />
        <Route path="/precision-care" element={<Layout><PrecisionCare /></Layout>} />
        <Route path="/prediction-care" element={<Layout><PrecisionCare /></Layout>} />
        <Route path="/patient-360" element={<Layout><PrecisionCare section="patient" /></Layout>} />
        <Route path="/personalized-intervention" element={<Layout><PrecisionCare section="intervention" /></Layout>} />
        <Route path="/clinical-guideline-compliance" element={<Layout><PrecisionCare section="guidelines" /></Layout>} />
        <Route path="/outcomes" element={<Layout><PrecisionCare section="outcomes" /></Layout>} />
        <Route path="/provider-collaboration" element={<Layout><PrecisionCare section="collaboration" /></Layout>} />
        <Route path="/team-c/fhir-validation" element={<Layout><ModuleEmbed src="/team-c/modules/m1/fhir-validation.html" title="FHIR Validation" team="C" /></Layout>} />
        <Route path="/team-c/patient-consent" element={<Layout><ModuleEmbed src="/team-c/modules/m1/patient-consent.html" title="Patient Consent Verification" team="C" /></Layout>} />
        <Route path="/team-c/audit-logs" element={<Layout><ModuleEmbed src="/team-c/modules/m1/audit-logs.html" title="HIPAA Audit Logs" team="C" /></Layout>} />
        <Route path="/team-c/model-accuracy" element={<Layout><ModuleEmbed src="/team-c/modules/m2/model-accuracy.html" title="Model Accuracy" team="C" /></Layout>} />
        <Route path="/team-c/federated-convergence" element={<Layout><ModuleEmbed src="/team-c/modules/m2/federated-convergence.html" title="Federated Convergence" team="C" /></Layout>} />
        <Route path="/team-c/shap-validity" element={<Layout><ModuleEmbed src="/team-c/modules/m2/shap-validity.html" title="SHAP Validity" team="C" /></Layout>} />
        <Route path="/team-c/alert-fatigue-prevention" element={<Layout><ModuleEmbed src="/team-c/modules/m3/alert-fatigue-prevention.html" title="Alert Fatigue Prevention" team="C" /></Layout>} />
        <Route path="/team-c/anomaly-detection-precision" element={<Layout><ModuleEmbed src="/team-c/modules/m3/anomaly-detection-precision.html" title="Anomaly Detection Precision" team="C" /></Layout>} />
        <Route path="/team-c/vitals-range-validation" element={<Layout><ModuleEmbed src="/team-c/modules/m3/vitals-range-validation.html" title="Vitals Range Validation" team="C" /></Layout>} />
        <Route path="/team-c/careplan-safety-checks" element={<Layout><ModuleEmbed src="/team-c/modules/m4/careplan-safety-checks.html" title="Careplan Safety Checks" team="C" /></Layout>} />
        <Route path="/team-c/clinical-guideline-compliance" element={<Layout><ModuleEmbed src="/team-c/modules/m4/clinical-guideline-compliance.html" title="Clinical Guideline Compliance" team="C" /></Layout>} />
        <Route path="/team-c/drug-interaction-validation" element={<Layout><ModuleEmbed src="/team-c/modules/m4/drug-interaction-validation.html" title="Drug Interaction Validation" team="C" /></Layout>} />
        <Route path="/team-d/rbac" element={<Layout><ModuleEmbed src="/team-c/modules/d/m1/rbac.html" title="RBAC" team="D" /></Layout>} />
        <Route path="/team-d/twin-data-completeness" element={<Layout><ModuleEmbed src="/team-c/modules/d/m1/twin-data-completeness.html" title="Twin Data Completeness" team="D" /></Layout>} />
        <Route path="/team-d/vitals-range-validation" element={<Layout><ModuleEmbed src="/team-c/modules/d/m1/vitals-range-validation.html" title="Vitals Range Validation" team="D" /></Layout>} />
        <Route path="/team-d/bias-audit" element={<Layout><ModuleEmbed src="/team-c/modules/d/m2/bias-audit.html" title="Bias Audit" team="D" /></Layout>} />
        <Route path="/team-d/clinical-guidelines-compliance" element={<Layout><ModuleEmbed src="/team-c/modules/d/m2/clinical-guidelines-compliance.html" title="Clinical Guidelines Compliance" team="D" /></Layout>} />
        <Route path="/team-d/prediction-calibration" element={<Layout><ModuleEmbed src="/team-c/modules/d/m2/prediction-calibration.html" title="Prediction Calibration" team="D" /></Layout>} />
        <Route path="/team-d/acknowledgment-tracking" element={<Layout><ModuleEmbed src="/team-c/modules/d/m3/acknowledgment-tracking.html" title="Acknowledgment Tracking" team="D" /></Layout>} />
        <Route path="/team-d/alert-routing" element={<Layout><ModuleEmbed src="/team-c/modules/d/m3/alert-routing.html" title="Alert Routing" team="D" /></Layout>} />
        <Route path="/team-d/false-alert-rate" element={<Layout><ModuleEmbed src="/team-c/modules/d/m3/false-alert-rate.html" title="False Alert Rate" team="D" /></Layout>} />
        <Route path="/team-d/adherence-calculation-accuracy" element={<Layout><ModuleEmbed src="/team-c/modules/d/m4/adherence-calculation-accuracy.html" title="Adherence Calculation Accuracy" team="D" /></Layout>} />
        <Route path="/team-d/outcome-tracking-integrity" element={<Layout><ModuleEmbed src="/team-c/modules/d/m4/outcome-tracking-integrity.html" title="Outcome Tracking Integrity" team="D" /></Layout>} />
        <Route path="/team-d/provider-approval-workflow" element={<Layout><ModuleEmbed src="/team-c/modules/d/m4/provider-approval-workflow.html" title="Provider Approval Workflow" team="D" /></Layout>} />
        <Route path="/authentication" element={<Layout><Authentication /></Layout>} />
        <Route path="/model-versioning" element={<Layout><ModelVersioning /></Layout>} />
        <Route path="/clinical-rule-engine" element={<Layout><ClinicalRuleEngine /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
