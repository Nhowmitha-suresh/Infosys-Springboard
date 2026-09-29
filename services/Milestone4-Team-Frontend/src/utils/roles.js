export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  RECEPTIONIST: 'RECEPTIONIST',
}

export const ROLE_LABELS = {
  ADMIN: 'Administrator',
  DOCTOR: 'Doctor',
  PATIENT: 'Patient',
  RECEPTIONIST: 'Receptionist',
}

export const ROLE_HOME = {
  ADMIN: '/admin/dashboard',
  DOCTOR: '/doctor/dashboard',
  PATIENT: '/patient/dashboard',
  RECEPTIONIST: '/receptionist/dashboard',
}

export function roleHome(role) {
  return ROLE_HOME[role] || '/login'
}
