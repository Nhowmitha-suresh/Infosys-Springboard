// Standalone sample data so the frontend is fully demoable before the
// Spring Boot backend endpoints exist. Shapes mirror the REST API contract
// documented in each src/api/*Service.js file.

export const mockUsers = [
  { id: 1, name: 'Ava Thompson', email: 'admin@medisphere.com', password: 'admin123', role: 'ADMIN' },
  { id: 2, name: 'Dr. Rajesh Menon', email: 'doctor@medisphere.com', password: 'doctor123', role: 'DOCTOR', specialization: 'Cardiology' },
  { id: 3, name: 'Priya Sharma', email: 'patient@medisphere.com', password: 'patient123', role: 'PATIENT' },
  { id: 4, name: 'Meera Nair', email: 'reception@medisphere.com', password: 'reception123', role: 'RECEPTIONIST' },
]

export const mockPatients = [
  { id: 101, name: 'Priya Sharma', age: 29, gender: 'Female', phone: '+91 98765 43210', bloodGroup: 'O+', condition: 'Hypertension', lastVisit: '2026-07-12', doctor: 'Dr. Rajesh Menon', status: 'Active' },
  { id: 102, name: 'Arjun Verma', age: 45, gender: 'Male', phone: '+91 91234 56780', bloodGroup: 'B+', condition: 'Type 2 Diabetes', lastVisit: '2026-07-18', doctor: 'Dr. Rajesh Menon', status: 'Active' },
  { id: 103, name: 'Kavita Iyer', age: 34, gender: 'Female', phone: '+91 99887 66554', bloodGroup: 'A-', condition: 'Post-surgery follow-up', lastVisit: '2026-06-30', doctor: 'Dr. Sana Kapoor', status: 'Discharged' },
  { id: 104, name: 'Rohan Das', age: 8, gender: 'Male', phone: '+91 90000 11223', bloodGroup: 'AB+', condition: 'Seasonal allergy', lastVisit: '2026-07-22', doctor: 'Dr. Sana Kapoor', status: 'Active' },
  { id: 105, name: 'Neha Joshi', age: 61, gender: 'Female', phone: '+91 98123 45670', bloodGroup: 'O-', condition: 'Arthritis', lastVisit: '2026-07-05', doctor: 'Dr. Rajesh Menon', status: 'Active' },
]

export const mockAppointments = [
  { id: 201, patient: 'Priya Sharma', patientId: 101, doctor: 'Dr. Rajesh Menon', date: '2026-07-31', time: '09:30', type: 'Follow-up', status: 'Confirmed' },
  { id: 202, patient: 'Arjun Verma', patientId: 102, doctor: 'Dr. Rajesh Menon', date: '2026-07-31', time: '10:15', type: 'Consultation', status: 'Pending' },
  { id: 203, patient: 'Rohan Das', patientId: 104, doctor: 'Dr. Sana Kapoor', date: '2026-07-31', time: '11:00', type: 'Check-up', status: 'Confirmed' },
  { id: 204, patient: 'Neha Joshi', patientId: 105, doctor: 'Dr. Rajesh Menon', date: '2026-08-01', time: '09:00', type: 'Follow-up', status: 'Confirmed' },
  { id: 205, patient: 'Kavita Iyer', patientId: 103, doctor: 'Dr. Sana Kapoor', date: '2026-08-01', time: '14:30', type: 'Review', status: 'Cancelled' },
]

export const mockDoctors = [
  { id: 1, name: 'Dr. Rajesh Menon', specialization: 'Cardiology' },
  { id: 2, name: 'Dr. Sana Kapoor', specialization: 'Pediatrics' },
]
