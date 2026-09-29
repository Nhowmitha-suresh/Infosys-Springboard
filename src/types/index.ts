export type UserRole = 'admin' | 'doctor' | 'patient' | 'receptionist' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole;
  status: 'Active' | 'Inactive' | 'Disabled';
  department?: string;
  phone?: string;
  token?: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  phone?: string;
  dob?: string;
  address?: string;
  emergencyContact?: string;
  assignedDoctor: string;
  hospital: string;
  conditions: string[];
  vitals: {
    hr: number;
    bp: string;
    spo2: number;
    temp: number;
    resp: number;
  };
  twinCompleteness: number;
  onboardedDate: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  experience: string;
  phone: string;
  rating: string;
  availability: string;
  status: 'Available' | 'In Consultation' | 'On Leave';
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  time: string;
  symptoms: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Checked-In';
  type: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  department: string;
  date: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  status: 'Final' | 'Draft' | 'Amended';
}

export interface FHIRResource {
  id: string;
  resourceType: 'Patient' | 'Observation' | 'Condition' | 'MedicationRequest' | 'DiagnosticReport' | 'Encounter';
  patientId: string;
  patientName: string;
  sourceSystem: string;
  lastUpdated: string;
  status: string;
  payload: Record<string, any>;
}

export interface KafkaEvent {
  id: string;
  topic: string;
  partition: number;
  offset: number;
  timestamp: string;
  source: string;
  eventType: string;
  payload: string;
}

export interface DigitalTwin {
  patientId: string;
  patientName: string;
  completeness: number;
  organRisks: {
    brain: string;
    heart: string;
    lungs: string;
    liver: string;
    kidneys: string;
  };
  aiRecommendations: string[];
  lastSync: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}
