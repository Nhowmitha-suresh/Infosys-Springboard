import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ROLES, roleHome } from './utils/roles'

import ProtectedRoute from './components/common/ProtectedRoute'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import NotFound from './pages/NotFound'
import Patient360 from './pages/patients/Patient360'
import ConsentManagement from './pages/consent/ConsentManagement'
import ConsentVerification from './pages/consent/ConsentVerification'

import TwinsPage from './pages/twin/TwinsPage'
import PredictionsPage from './pages/twin/PredictionsPage'
import AlertsPage from './pages/twin/AlertsPage'
import CarePlansPage from './pages/twin/CarePlansPage'
import ReportsPage from './pages/twin/ReportsPage'

import AdminDashboard from './pages/dashboard/AdminDashboard'
import DoctorDashboard from './pages/dashboard/DoctorDashboard'
import PatientDashboard from './pages/dashboard/PatientDashboard'
import ReceptionistDashboard from './pages/dashboard/ReceptionistDashboard'

import PatientsPage from './pages/patients/PatientsPage'
import AppointmentsPage from './pages/appointments/AppointmentsPage'

// ML console (Milestone 2 integration) — talks to ml-service/ (Flask),
// not the Java backend. Restricted to ADMIN/DOCTOR, the same roles that
// can act on the existing (heuristic) Predictions feature.
import ModelsPage from './pages/ml/ModelsPage'
import AnalyticsPage from './pages/ml/AnalyticsPage'
import FederatedTrainingPage from './pages/ml/FederatedTrainingPage'
import MonitoringPage from './pages/ml/MonitoringPage'

// Precision Care (Milestone 4): AI-assisted risk prediction, personalized
// care plans, outcome measurement, provider collaboration and clinical
// guideline compliance — talks to the Java backend's PrecisionCareController,
// same ADMIN/DOCTOR restriction as the rest of the ML/AI console.
import PrecisionCarePage from './pages/precisioncare/PrecisionCarePage'

// Twin-suite pages are shared across ADMIN / DOCTOR / RECEPTIONIST — same
// roles the Sidebar already links /twins, /predictions, /alerts, /careplans
// and /reports for.
const TWIN_SUITE_ROLES = [ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]

export default function App() {
  const { user, loading } = useAuth()

  if (loading) return null

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? roleHome(user.role) : '/login'} replace />} />
      <Route path="/login" element={user ? <Navigate to={roleHome(user.role)} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={roleHome(user.role)} replace /> : <Register />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/patients" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><PatientsPage /></ProtectedRoute>
      } />
      <Route path="/admin/appointments" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN]}><AppointmentsPage /></ProtectedRoute>
      } />

      {/* Shared: patient 360, consent, and the digital-twin suite */}
      <Route path="/patients/:id/360" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT]}>
          <Patient360 />
        </ProtectedRoute>
      } />
      <Route path="/consent" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT]}>
          <ConsentManagement />
        </ProtectedRoute>
      } />
      {/* Staff arriving from a specific patient's 360 page land on THAT
          patient's consent settings, not the self-service default above. */}
      <Route path="/patients/:id/consent" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST, ROLES.PATIENT]}>
          <ConsentManagement />
        </ProtectedRoute>
      } />
      <Route path="/consent/verify" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.RECEPTIONIST]}>
          <ConsentVerification />
        </ProtectedRoute>
      } />
      <Route path="/twins" element={
        <ProtectedRoute allowedRoles={TWIN_SUITE_ROLES}><TwinsPage /></ProtectedRoute>
      } />
      <Route path="/predictions" element={
        <ProtectedRoute allowedRoles={TWIN_SUITE_ROLES}><PredictionsPage /></ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute allowedRoles={TWIN_SUITE_ROLES}><AlertsPage /></ProtectedRoute>
      } />
      <Route path="/careplans" element={
        <ProtectedRoute allowedRoles={TWIN_SUITE_ROLES}><CarePlansPage /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute allowedRoles={TWIN_SUITE_ROLES}><ReportsPage /></ProtectedRoute>
      } />

      {/* ML console (Milestone 2): Model Versioning, Prediction, SHAP,
          Analytics, Federated Training — ADMIN/DOCTOR only, same as the
          existing clinical Predictions feature. */}
      <Route path="/ml/models" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}><ModelsPage /></ProtectedRoute>
      } />
      <Route path="/ml/analytics" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}><AnalyticsPage /></ProtectedRoute>
      } />
      <Route path="/ml/federated-training" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}><FederatedTrainingPage /></ProtectedRoute>
      } />
      {/* Milestone 3: Clinical Rule Engine + Mobile Notifications, served by
          monitoring-service/ (Node/Express + Socket.IO) -- same ADMIN/DOCTOR
          restriction as the rest of the ML console. */}
      <Route path="/ml/monitoring" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}><MonitoringPage /></ProtectedRoute>
      } />
      {/* Milestone 4: Precision Care Management */}
      <Route path="/precision-care" element={
        <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR]}><PrecisionCarePage /></ProtectedRoute>
      } />

      {/* Doctor */}
      <Route path="/doctor/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}><DoctorDashboard /></ProtectedRoute>
      } />
      <Route path="/doctor/patients" element={
        <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}><PatientsPage /></ProtectedRoute>
      } />
      <Route path="/doctor/appointments" element={
        <ProtectedRoute allowedRoles={[ROLES.DOCTOR]}><AppointmentsPage /></ProtectedRoute>
      } />

      {/* Patient */}
      <Route path="/patient/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.PATIENT]}><PatientDashboard /></ProtectedRoute>
      } />
      <Route path="/patient/appointments" element={
        <ProtectedRoute allowedRoles={[ROLES.PATIENT]}><AppointmentsPage /></ProtectedRoute>
      } />

      {/* Receptionist */}
      <Route path="/receptionist/dashboard" element={
        <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}><ReceptionistDashboard /></ProtectedRoute>
      } />
      <Route path="/receptionist/patients" element={
        <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}><PatientsPage /></ProtectedRoute>
      } />
      <Route path="/receptionist/appointments" element={
        <ProtectedRoute allowedRoles={[ROLES.RECEPTIONIST]}><AppointmentsPage /></ProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
