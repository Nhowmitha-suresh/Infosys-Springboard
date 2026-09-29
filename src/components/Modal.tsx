import React, { useState, useEffect } from 'react';
import { MediStorage } from '../services/storage';
import { MediUtils } from '../services/utils';
import { MediToast } from './Toast';

export interface ModalState {
  isOpen: boolean;
  title: string;
  type?: 'addPatient' | 'addDoctor' | 'addUser' | 'bookAppointment' | 'recordVitals' | 'printSlip' | 'custom';
  data?: any;
  customContent?: React.ReactNode;
  onSave?: (res?: any) => void;
}

let modalListener: ((state: ModalState) => void) | null = null;

export const MediModal = {
  open: (title: string, bodyHTML?: string, customContent?: React.ReactNode) => {
    if (modalListener) {
      modalListener({ isOpen: true, title, type: 'custom', customContent: customContent || (bodyHTML ? <div dangerouslySetInnerHTML={{ __html: bodyHTML }} /> : null) });
    }
  },
  close: () => {
    if (modalListener) {
      modalListener({ isOpen: false, title: '' });
    }
  },
  openAddPatient: (onSave?: (p: any) => void) => {
    if (modalListener) modalListener({ isOpen: true, title: 'Register New Patient', type: 'addPatient', onSave });
  },
  openAddDoctor: (onSave?: (d: any) => void) => {
    if (modalListener) modalListener({ isOpen: true, title: 'Add New Doctor', type: 'addDoctor', onSave });
  },
  openAddUser: (onSave?: (u: any) => void) => {
    if (modalListener) modalListener({ isOpen: true, title: 'Create System User', type: 'addUser', onSave });
  },
  openBookAppointment: (defaultPatientName?: string, onSave?: (a: any) => void) => {
    if (modalListener) modalListener({ isOpen: true, title: 'Book Appointment', type: 'bookAppointment', data: { defaultPatientName }, onSave });
  },
  openRecordVitals: (patientId: string, patientName: string, onSave?: () => void) => {
    if (modalListener) modalListener({ isOpen: true, title: `Record Vitals - ${patientName}`, type: 'recordVitals', data: { patientId, patientName }, onSave });
  },
  openPrintAppointmentSlip: (appt: any) => {
    if (modalListener) modalListener({ isOpen: true, title: 'Appointment Slip', type: 'printSlip', data: appt });
  }
};

if (typeof window !== 'undefined') {
  (window as any).MediModal = MediModal;
}

export const GlobalModalContainer: React.FC = () => {
  const [modal, setModal] = useState<ModalState>({ isOpen: false, title: '' });

  useEffect(() => {
    modalListener = (state) => setModal(state);
    return () => { modalListener = null; };
  }, []);

  if (!modal.isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => { if (e.target === e.currentTarget) setModal({ isOpen: false, title: '' }); }}>
      <div className="modal-content" style={{ maxWidth: modal.type === 'printSlip' ? '650px' : '550px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px' }}>
          <h3 style={{ color: '#FFFFFF', fontSize: '1.25rem', margin: 0 }}>{modal.title}</h3>
          <button onClick={() => setModal({ isOpen: false, title: '' })} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <div>
          {modal.type === 'addPatient' && (
            <AddPatientForm onClose={() => setModal({ isOpen: false, title: '' })} onSave={modal.onSave} />
          )}

          {modal.type === 'addDoctor' && (
            <AddDoctorForm onClose={() => setModal({ isOpen: false, title: '' })} onSave={modal.onSave} />
          )}

          {modal.type === 'addUser' && (
            <AddUserForm onClose={() => setModal({ isOpen: false, title: '' })} onSave={modal.onSave} />
          )}

          {modal.type === 'bookAppointment' && (
            <BookAppointmentForm defaultPatientName={modal.data?.defaultPatientName} onClose={() => setModal({ isOpen: false, title: '' })} onSave={modal.onSave} />
          )}

          {modal.type === 'recordVitals' && (
            <RecordVitalsForm patientId={modal.data?.patientId} patientName={modal.data?.patientName} onClose={() => setModal({ isOpen: false, title: '' })} onSave={modal.onSave} />
          )}

          {modal.type === 'printSlip' && (
            <PrintSlipView appt={modal.data} onClose={() => setModal({ isOpen: false, title: '' })} />
          )}

          {modal.type === 'custom' && modal.customContent}
        </div>
      </div>
    </div>
  );
};

const AddPatientForm: React.FC<{ onClose: () => void; onSave?: (p: any) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('45');
  const [gender, setGender] = useState('Female');
  const [blood, setBlood] = useState('O+');
  const [doctor, setDoctor] = useState('Dr. Ananthakrishna Bhat');
  const [conditions, setConditions] = useState('Essential Hypertension, Type 2 Diabetes');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = {
      id: MediUtils.generateId('PAT'),
      name,
      email,
      age: parseInt(age),
      gender,
      bloodGroup: blood,
      assignedDoctor: doctor,
      conditions: conditions.split(',').map(s => s.trim()),
      hospital: 'Kasturba Medical College Hospital, Manipal',
      vitals: { hr: 72, bp: '120/80', spo2: 98, temp: 98.6, resp: 16 },
      twinCompleteness: 90,
      onboardedDate: new Date().toISOString().split('T')[0]
    };
    MediStorage.savePatient(p as any);
    MediToast.success(`Patient ${p.name} registered successfully!`);
    onClose();
    if (onSave) onSave(p);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label className="form-label">Full Name</label>
        <input type="text" className="form-input" required placeholder="e.g. Anushree Naik" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Email</label>
        <input type="email" className="form-input" required placeholder="anushree@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Age</label>
        <input type="number" className="form-input" required value={age} onChange={e => setAge(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Gender</label>
        <select className="form-select" value={gender} onChange={e => setGender(e.target.value)}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Blood Group</label>
        <select className="form-select" value={blood} onChange={e => setBlood(e.target.value)}>
          <option value="O+">O+</option>
          <option value="A+">A+</option>
          <option value="B+">B+</option>
          <option value="AB+">AB+</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Assigned Doctor</label>
        <input type="text" className="form-input" value={doctor} onChange={e => setDoctor(e.target.value)} />
      </div>
      <div className="form-field full-width">
        <label className="form-label">Medical Conditions</label>
        <input type="text" className="form-input" placeholder="e.g. Essential Hypertension, Type 2 Diabetes" value={conditions} onChange={e => setConditions(e.target.value)} />
      </div>
      <div className="form-field full-width" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">Register Patient</button>
      </div>
    </form>
  );
};

const AddDoctorForm: React.FC<{ onClose: () => void; onSave?: (d: any) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [dept, setDept] = useState('Cardiology');
  const [spec, setSpec] = useState('Senior Specialist');
  const [exp, setExp] = useState('10 Years');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const d = {
      id: MediUtils.generateId('DOC'),
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '')}@medisphere.health`,
      department: dept,
      specialization: spec,
      experience: exp,
      phone: '+91 98450 19000',
      rating: '4.8',
      availability: 'Mon - Fri (08:00 - 17:00)',
      status: 'Available'
    };
    MediStorage.saveDoctor(d as any);
    MediToast.success(`${d.name} added to staff roster!`);
    onClose();
    if (onSave) onSave(d);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label className="form-label">Doctor Name</label>
        <input type="text" className="form-input" required placeholder="Dr. Veena Hegde" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Department</label>
        <select className="form-select" value={dept} onChange={e => setDept(e.target.value)}>
          <option value="Cardiology">Cardiology</option>
          <option value="Neurology">Neurology</option>
          <option value="Oncology">Oncology</option>
          <option value="Pediatrics">Pediatrics</option>
          <option value="Orthopedics">Orthopedics</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Specialization</label>
        <input type="text" className="form-input" required placeholder="Senior Specialist" value={spec} onChange={e => setSpec(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Experience</label>
        <input type="text" className="form-input" value={exp} onChange={e => setExp(e.target.value)} />
      </div>
      <div className="form-field full-width" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">Add Doctor</button>
      </div>
    </form>
  );
};

const AddUserForm: React.FC<{ onClose: () => void; onSave?: (u: any) => void }> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('admin');
  const [pass, setPass] = useState('medisphere2026');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const u = {
      id: MediUtils.generateId('USR'),
      name,
      email,
      username: email,
      role: role as any,
      password: pass,
      status: 'Active' as const,
      token: 'token-' + Math.floor(10000 + Math.random() * 90000)
    };
    MediStorage.saveUser(u);
    MediToast.success(`User ${u.name} created as ${u.role.toUpperCase()}!`);
    onClose();
    if (onSave) onSave(u);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label className="form-label">Full Name</label>
        <input type="text" className="form-input" required placeholder="e.g. Shreya Shetty" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Email Address</label>
        <input type="email" className="form-input" required placeholder="shreya@medisphere.health" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">System Role</label>
        <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
          <option value="admin">Admin (Super Administrator)</option>
          <option value="doctor">Doctor (Attending Physician)</option>
          <option value="patient">Patient (Health Account)</option>
          <option value="receptionist">Receptionist (Intake Desk)</option>
          <option value="employee">Medical Staff (Nurse/Tech)</option>
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Initial Password</label>
        <input type="text" className="form-input" required value={pass} onChange={e => setPass(e.target.value)} />
      </div>
      <div className="form-field full-width" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">Create User Account</button>
      </div>
    </form>
  );
};

const BookAppointmentForm: React.FC<{ defaultPatientName?: string; onClose: () => void; onSave?: (a: any) => void }> = ({ defaultPatientName, onClose, onSave }) => {
  const doctors = MediStorage.getDoctors();
  const [patientName, setPatientName] = useState(defaultPatientName || 'Anushree Naik');
  const [doctorName, setDoctorName] = useState(doctors[0]?.name || 'Dr. Ananthakrishna Bhat');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:00 AM');
  const [symptoms, setSymptoms] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedDoc = doctors.find(d => d.name === doctorName) || { id: 'DOC-1001', department: 'General Medicine' };
    const appt = {
      id: MediUtils.generateId('APT'),
      patientId: 'PAT-1001',
      patientName,
      doctorId: matchedDoc.id,
      doctorName,
      department: matchedDoc.department,
      date: MediUtils.formatDate(date),
      time,
      symptoms,
      status: 'Pending' as const,
      type: 'Outpatient Consultation'
    };
    MediStorage.saveAppointment(appt);
    MediToast.success(`Appointment ${appt.id} booked successfully!`);
    onClose();
    if (onSave) onSave(appt);
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label className="form-label">Patient Name</label>
        <input type="text" className="form-input" required value={patientName} onChange={e => setPatientName(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Select Doctor</label>
        <select className="form-select" value={doctorName} onChange={e => setDoctorName(e.target.value)}>
          {doctors.map(d => (
            <option key={d.id} value={d.name}>{d.name} ({d.department})</option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label className="form-label">Appointment Date</label>
        <input type="date" className="form-input" required value={date} onChange={e => setDate(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Preferred Time Slot</label>
        <select className="form-select" value={time} onChange={e => setTime(e.target.value)}>
          <option value="09:00 AM">09:00 AM</option>
          <option value="10:30 AM">10:30 AM</option>
          <option value="11:45 AM">11:45 AM</option>
          <option value="02:15 PM">02:15 PM</option>
          <option value="04:00 PM">04:00 PM</option>
        </select>
      </div>
      <div className="form-field full-width">
        <label className="form-label">Chief Complaints / Symptoms</label>
        <input type="text" className="form-input" required placeholder="e.g. Routine hypertension review, mild headache" value={symptoms} onChange={e => setSymptoms(e.target.value)} />
      </div>
      <div className="form-field full-width" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">Confirm Booking</button>
      </div>
    </form>
  );
};

const RecordVitalsForm: React.FC<{ patientId?: string; patientName?: string; onClose: () => void; onSave?: () => void }> = ({ patientId, patientName, onClose, onSave }) => {
  const [hr, setHr] = useState('72');
  const [bp, setBp] = useState('120/80');
  const [spo2, setSpo2] = useState('98');
  const [temp, setTemp] = useState('98.6');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patients = MediStorage.getPatients();
    const target = patients.find(p => p.id === patientId || p.name === patientName) || patients[0];
    if (target) {
      target.vitals = {
        hr: parseInt(hr),
        bp,
        spo2: parseInt(spo2),
        temp: parseFloat(temp),
        resp: 16
      };
      MediStorage.savePatient(target);
      MediStorage.logActivity('Medical Staff recorded vitals', `Updated vitals for ${target.name}: BP ${bp}, HR ${hr}`);
      MediToast.success(`Vitals recorded for ${target.name}!`);
    }
    onClose();
    if (onSave) onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-field">
        <label className="form-label">Heart Rate (bpm)</label>
        <input type="number" className="form-input" required value={hr} onChange={e => setHr(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Blood Pressure (mmHg)</label>
        <input type="text" className="form-input" required value={bp} onChange={e => setBp(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">SpO2 Oxygen (%)</label>
        <input type="number" className="form-input" required value={spo2} onChange={e => setSpo2(e.target.value)} />
      </div>
      <div className="form-field">
        <label className="form-label">Body Temperature (°F)</label>
        <input type="number" step="0.1" className="form-input" required value={temp} onChange={e => setTemp(e.target.value)} />
      </div>
      <div className="form-field full-width">
        <label className="form-label">Nursing Observation Note</label>
        <input type="text" className="form-input" placeholder="Patient comfortable, resting comfortably in triage" value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
      <div className="form-field full-width" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save Vitals</button>
      </div>
    </form>
  );
};

const PrintSlipView: React.FC<{ appt: any; onClose: () => void }> = ({ appt, onClose }) => {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.2)', color: '#FFF' }}>
      <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
        <h2 style={{ color: '#60A5FA', margin: 0 }}>MediSphere Hospital Management System</h2>
        <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: '4px' }}>Kasturba Medical College Hospital & Regional Healthcare Network, Karnataka</p>
        <h4 style={{ color: '#10B981', marginTop: '8px' }}>OUTPATIENT APPOINTMENT SLIP</h4>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.95rem' }}>
        <p><strong>Slip No:</strong> {appt?.id}</p>
        <p><strong>Booking Date:</strong> {new Date().toLocaleDateString('en-IN')}</p>
        <p><strong>Patient Name:</strong> {appt?.patientName}</p>
        <p><strong>Patient ID:</strong> {appt?.patientId || 'PAT-1001'}</p>
        <p><strong>Doctor:</strong> {appt?.doctorName}</p>
        <p><strong>Department:</strong> {appt?.department}</p>
        <p><strong>Appt Date:</strong> {appt?.date}</p>
        <p><strong>Slot Time:</strong> {appt?.time}</p>
        <p><strong>Symptoms:</strong> {appt?.symptoms}</p>
        <p><strong>Status:</strong> <span className="badge badge-success">{appt?.status}</span></p>
      </div>
      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
        Please arrive 15 minutes prior to your scheduled slot. Present this slip at the reception desk.
      </div>
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button className="btn btn-secondary" onClick={onClose}>Close</button>
        <button className="btn btn-primary" onClick={() => { window.print(); MediToast.success('Printing appointment slip...'); }}>🖨️ Print Slip</button>
      </div>
    </div>
  );
};
