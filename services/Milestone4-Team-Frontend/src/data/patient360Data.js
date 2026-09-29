// src/data/patient360Data.js
// Extra mock data for the Patient 360 view, keyed by patientId.
// Mirrors the style of src/data/mockData.js — swap for real API calls
// (GET /api/patients/{id}/allergies, GET /api/patients/{id}/prescriptions)
// once the backend is ready.

export const mockAllergies = {
  101: ['Penicillin', 'Peanuts'],
  102: ['None reported'],
  103: ['Sulfa drugs'],
  104: ['Pollen (seasonal)'],
  105: ['None reported'],
}

export const mockPrescriptions = {
  101: [
    { id: 'rx1', drug: 'Amlodipine 5mg', dosage: 'Once daily', prescribedBy: 'Dr. Rajesh Menon', date: '2026-07-12' },
    { id: 'rx2', drug: 'Aspirin 75mg', dosage: 'Once daily, after food', prescribedBy: 'Dr. Rajesh Menon', date: '2026-07-12' },
  ],
  102: [
    { id: 'rx3', drug: 'Metformin 500mg', dosage: 'Twice daily', prescribedBy: 'Dr. Rajesh Menon', date: '2026-07-18' },
  ],
  103: [],
  104: [
    { id: 'rx4', drug: 'Cetirizine 10mg', dosage: 'Once daily as needed', prescribedBy: 'Dr. Sana Kapoor', date: '2026-07-22' },
  ],
  105: [
    { id: 'rx5', drug: 'Ibuprofen 200mg', dosage: 'Twice daily with food', prescribedBy: 'Dr. Rajesh Menon', date: '2026-07-05' },
  ],
}
