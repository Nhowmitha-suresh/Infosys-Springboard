import {
  ActivityLog,
  Appointment,
  DigitalTwin,
  Doctor,
  FHIRResource,
  KafkaEvent,
  Patient,
  User,
  UserRole
} from '../types';
import { MediUtils } from './utils';

const KEYS = {
  USERS: 'medisphere_users',
  PATIENTS: 'medisphere_patients',
  DOCTORS: 'medisphere_doctors',
  EMPLOYEES: 'medisphere_employees',
  APPOINTMENTS: 'medisphere_appointments',
  MEDICAL_RECORDS: 'medisphere_medical_records',
  FHIR_RESOURCES: 'medisphere_fhir_resources',
  KAFKA_EVENTS: 'medisphere_kafka_events',
  DIGITAL_TWINS: 'medisphere_digital_twins',
  CURRENT_USER: 'medisphere_current_user',
  TOKEN: 'medisphere_token',
  SETTINGS: 'medisphere_settings',
  ACTIVITY_LOGS: 'medisphere_activity_logs'
};

const firstNames = [
  'Anushree', 'Ashok', 'Raghavendra', 'Shreya', 'Nikhil',
  'Pooja', 'Keerthana', 'Pranav', 'Aditi', 'Preethi',
  'Venkatesh', 'Sumithra', 'Srinivas', 'Deepika', 'Vivek',
  'Gowri', 'Santhosh', 'Archana', 'Chethan', 'Varun',
  'Rashmi', 'Shruti', 'Anand', 'Mahesh', 'Rajeshwari',
  'Suresh', 'Vinay', 'Soumya', 'Sunita', 'Kavya'
];

const lastNames = [
  'Naik', 'Shetty', 'Hegde', 'Rao', 'Bhat',
  'Kamath', 'Shenoy', 'Pai', 'Gowda', 'Kulkarni',
  'Patil', 'Deshpande', 'Poojary', 'Acharya', 'Maindan'
];

const doctorFirstNames = [
  'Ananthakrishna', 'Sudhakar', 'Veena', 'Gururaj', 'Sandhya',
  'Manjunath', 'Usha', 'Prakash', 'Suma', 'Nitin',
  'Ramesh', 'Aravind', 'Saritha', 'Ganesh', 'Latha'
];

const depts = [
  'Cardiology',
  'Neurology',
  'Oncology',
  'Pediatrics',
  'Orthopedics',
  'Emergency Medicine',
  'Radiology',
  'Dermatology',
  'Gastroenterology',
  'Endocrinology'
];

const bloodGroups = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const karnatakaHospitals = [
  'Kasturba Medical College Hospital, Manipal',
  'KMC Hospital, Attavar, Mangaluru',
  'Father Muller Medical College Hospital, Mangaluru',
  'A.J. Hospital & Research Centre, Mangaluru',
  'Yenepoya Medical College Hospital, Mangaluru',
  'K.S. Hegde Charitable Hospital, Mangaluru',
  'TMA Pai Hospital, Udupi',
  'Victoria Hospital, Bengaluru',
  'Manipal Hospital, HAL Airport Road, Bengaluru',
  'Narayana Health City, Bengaluru',
  'Fortis Hospital, Bannerghatta Road, Bengaluru',
  'St. John\'s Medical College Hospital, Bengaluru',
  'Jayadeva Institute of Cardiovascular Sciences, Bengaluru',
  'NIMHANS, Bengaluru',
  'SDM College of Medical Sciences, Dharwad',
  'Karnataka Institute of Medical Sciences (KIMS), Hubballi',
  'JSS Hospital, Mysuru',
  'Mysore Medical College (KR Hospital), Mysuru',
  'Shivamogga Institute of Medical Sciences (SIMS), Shivamogga',
  'Vijayanagar Institute of Medical Sciences (VIMS), Ballari'
];

const conditionsList = [
  'Essential Hypertension',
  'Type 2 Diabetes Mellitus',
  'Dengue Fever',
  'Chikungunya',
  'Malaria (P. vivax)',
  'Bronchial Asthma',
  'Ischemic Heart Disease',
  'Chronic Kidney Disease',
  'Osteoarthritis',
  'Acid Peptic Disease'
];

const medicationsList = [
  'Paracetamol 650mg (Dolo 650)',
  'Metformin 500mg (Glycomet)',
  'Telmisartan 40mg (Telma 40)',
  'Pantoprazole 40mg (Pan 40)',
  'Amlodipine 5mg',
  'Atorvastatin 10mg',
  'Montelukast 10mg (Levocet-M)',
  'Azithromycin 500mg'
];

const allergiesList = [
  'Penicillin',
  'Sulfa Drugs',
  'NSAIDs',
  'Dust Mite Allergy',
  'Seafood Allergy',
  'None'
];

const insuranceList = [
  'Star Health Insurance #SH-882193',
  'Ayushman Bharat - Arogya Karnataka (AB-ARK) #ARK-90214',
  'ICICI Lombard Health #IL-44021',
  'HDFC ERGO Health #HE-30192',
  'Care Health Insurance #CHI-55102'
];

/*
 * IMPORTANT:
 * Increment this whenever the seeded authentication structure changes.
 * This forces old demo credentials/data to be recreated.
 */
const SEED_VERSION_KEY = 'medisphere_seed_v2026_role_auth_v7';

function getItem<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/*
 * Generates a session token for the current browser session.
 * This is only suitable for the current frontend/demo architecture.
 * A real production application must generate and validate sessions
 * on the backend.
 */
function generateSessionToken(): string {
  try {
    if (
      typeof crypto !== 'undefined' &&
      typeof crypto.randomUUID === 'function'
    ) {
      return `session-${crypto.randomUUID()}`;
    }
  } catch {
    // Fallback below
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2, 15)}`;
}

/*
 * Clears only authentication/session information.
 * Application data remains untouched.
 */
function clearSession(): void {
  sessionStorage.removeItem(KEYS.CURRENT_USER);
  sessionStorage.removeItem(KEYS.TOKEN);
}

/*
 * Removes password before storing the logged-in user in sessionStorage.
 */
function sanitizeUserForSession(user: User): User {
  const safeUser = { ...user };

  delete safeUser.password;

  return safeUser;
}

/*
 * Seeds demo/application data.
 */
export function seedInitialData() {
  const isSeeded = localStorage.getItem(SEED_VERSION_KEY);

  const existingPatientsRaw =
    localStorage.getItem(KEYS.PATIENTS) || '';

  const hasForeignData =
    existingPatientsRaw.includes('John Doe') ||
    existingPatientsRaw.includes('Michael Jones') ||
    existingPatientsRaw.includes('Sarah Johnson');

  if (isSeeded && !hasForeignData) {
    return;
  }

  [
    KEYS.PATIENTS,
    KEYS.DOCTORS,
    KEYS.EMPLOYEES,
    KEYS.APPOINTMENTS,
    KEYS.MEDICAL_RECORDS,
    KEYS.FHIR_RESOURCES,
    KEYS.KAFKA_EVENTS,
    KEYS.DIGITAL_TWINS,
    KEYS.USERS,
    KEYS.ACTIVITY_LOGS
  ].forEach(key => {
    localStorage.removeItem(key);
  });

  /*
   * IMPORTANT:
   * Do not remove sessionStorage here.
   * The seed process should never silently log a user in.
   */
  localStorage.setItem(SEED_VERSION_KEY, 'true');

  const doctors: Doctor[] = [];

  for (let i = 1; i <= 50; i++) {
    const fn = doctorFirstNames[i % doctorFirstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];

    doctors.push({
      id: `DOC-${1000 + i}`,
      name: `Dr. ${fn} ${ln}`,
      email: `dr.${fn.toLowerCase()}.${ln.toLowerCase()}@medisphere.health`,
      department: depts[i % depts.length],
      specialization: `${depts[i % depts.length]} Specialist`,
      experience: `${5 + (i % 25)} Years`,
      phone: `+91 98450 ${(10000 + i).toString()}`,
      rating: (4.2 + (i % 8) * 0.1).toFixed(1),
      availability: 'Mon - Fri (08:00 - 17:00)',
      status: i % 7 === 0 ? 'On Leave' : 'Available'
    });
  }

  const patients: Patient[] = [];

  for (let i = 1; i <= 300; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 2) % lastNames.length];
    const age = 18 + (i % 65);

    patients.push({
      id: `PAT-${2000 + i}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gmail.com`,
      age,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      bloodGroup: bloodGroups[i % bloodGroups.length],
      hospital: karnatakaHospitals[i % karnatakaHospitals.length],
      assignedDoctor: doctors[i % doctors.length].name,
      phone: `+91 98440 ${(20000 + i).toString()}`,
      conditions: [
        conditionsList[i % conditionsList.length],
        conditionsList[(i + 3) % conditionsList.length]
      ],
      emergencyContact:
        `Ashok ${ln} (Spouse) - +91 98450 99887`,
      vitals: {
        hr: 65 + (i % 30),
        bp: `${110 + (i % 30)}/${70 + (i % 20)}`,
        spo2: 95 + (i % 5),
        temp: parseFloat(
          (98.2 + (i % 3) * 0.4).toFixed(1)
        ),
        resp: 14 + (i % 6)
      },
      twinCompleteness: 85 + (i % 16),
      onboardedDate:
        new Date(
          Date.now() - i * 86400000
        ).toISOString().split('T')[0]
    });
  }

  patients[0] = {
    id: 'PAT-2001',
    name: 'Anushree Naik',
    email: 'patient@medisphere.health',
    age: 58,
    gender: 'Female',
    bloodGroup: 'O+',
    hospital: 'Kasturba Medical College Hospital, Manipal',
    assignedDoctor: 'Dr. Ananthakrishna Bhat',
    phone: '+91 98450 12834',
    conditions: [
      'Essential Hypertension',
      'Type 2 Diabetes Mellitus'
    ],
    emergencyContact:
      'Ashok Naik (Spouse) - +91 98450 99988',
    vitals: {
      hr: 72,
      bp: '130/85',
      spo2: 98,
      temp: 98.6,
      resp: 16
    },
    twinCompleteness: 100,
    onboardedDate: '2026-01-15'
  };

  const employees: any[] = [];

  const staffFirstNames = [
    'Manoj',
    'Harsha',
    'Swathi',
    'Preethi',
    'Vivek',
    'Anil',
    'Ramesh',
    'Shilpa',
    'Keerthana'
  ];

  for (let i = 1; i <= 25; i++) {
    const efn =
      staffFirstNames[i % staffFirstNames.length];

    const eln =
      lastNames[(i * 3) % lastNames.length];

    employees.push({
      id: `EMP-${4000 + i}`,
      name: `${efn} ${eln}`,
      email:
        `emp.${efn.toLowerCase()}.${eln.toLowerCase()}@medisphere.health`,
      role:
        i % 2 === 0
          ? 'Lab Technician'
          : 'Nurse Specialist',
      department: depts[i % depts.length],
      shift: 'Day Shift'
    });
  }

  /*
   * DEMO USERS
   *
   * Passwords are still present here because this application
   * currently uses browser localStorage instead of a backend
   * authentication service.
   *
   * For production, passwords MUST NOT be stored in frontend code.
   */
  const users: User[] = [
    {
      id: 'ADMIN001',
      name: 'System Administrator',
      email: 'admin@medisphere.health',
      username: 'ADMIN001',
      password: 'admin123',
      role: 'admin',
      status: 'Active',
      department: 'Administration',
      phone: '+91 98450 11223'
    },
    {
      id: 'DOC1001',
      name: 'Dr. Ananthakrishna Bhat',
      email: 'doctor@medisphere.health',
      username: 'DOC1001',
      password: 'doctor123',
      role: 'doctor',
      status: 'Active',
      department: 'Cardiology',
      phone: '+91 98450 12345'
    },
    {
      id: 'PAT1001',
      name: 'Anushree Naik',
      email: 'patient@medisphere.health',
      username: 'PAT1001',
      password: 'patient123',
      role: 'patient',
      status: 'Active',
      department: 'Outpatient',
      phone: '+91 98440 20001'
    },
    {
      id: 'REC1001',
      name: 'Pooja Rao',
      email: 'reception@medisphere.health',
      username: 'REC1001',
      password: 'reception123',
      role: 'receptionist',
      status: 'Active',
      department: 'Reception Desk',
      phone: '+91 98450 33445'
    },
    {
      id: 'EMP1001',
      name: 'Keerthana Bhat',
      email: 'employee@medisphere.health',
      username: 'EMP1001',
      password: 'employee123',
      role: 'employee',
      status: 'Active',
      department: 'Medical Staff (Nurse)',
      phone: '+91 98450 55667'
    }
  ];

  const appointments: Appointment[] = [];

  for (let i = 1; i <= 1000; i++) {
    const p = patients[i % patients.length];
    const d = doctors[i % doctors.length];

    const daysOffset = (i % 30) - 15;

    const apptDate =
      new Date(
        Date.now() + daysOffset * 86400000
      ).toISOString().split('T')[0];

    appointments.push({
      id: `APT-${5000 + i}`,
      patientId: p.id,
      patientName: p.name,
      doctorId: d.id,
      doctorName: d.name,
      department: d.department,
      date: apptDate,
      time: `${8 + (i % 9)}:00 AM`,
      symptoms:
        'Routine consultation & follow up checkup.',
      status:
        daysOffset < 0
          ? i % 10 === 0
            ? 'Cancelled'
            : 'Completed'
          : i % 3 === 0
            ? 'Pending'
            : 'Confirmed',
      type: 'Outpatient Consultation'
    });
  }

  const fhirResources: FHIRResource[] = [];

  const resourceTypes: FHIRResource['resourceType'][] = [
    'Patient',
    'Observation',
    'Condition',
    'MedicationRequest',
    'DiagnosticReport'
  ];

  for (let i = 1; i <= 500; i++) {
    const p = patients[i % patients.length];

    fhirResources.push({
      id: `FHIR-RES-${10000 + i}`,
      patientId: p.id,
      patientName: p.name,
      resourceType:
        resourceTypes[i % resourceTypes.length],
      sourceSystem:
        i % 3 === 0
          ? 'Epic EHR'
          : i % 2 === 0
            ? 'Cerner Millennium'
            : 'LabCorp API',
      lastUpdated:
        new Date(
          Date.now() - i * 3600000
        ).toISOString(),
      status:
        i % 25 === 0
          ? 'Failed'
          : 'Synced',
      payload: {
        id: `FHIR-${i}`,
        resourceType:
          resourceTypes[i % resourceTypes.length]
      }
    });
  }

  const kafkaEvents: KafkaEvent[] = [];

  for (let i = 1; i <= 500; i++) {
    const p = patients[i % patients.length];

    kafkaEvents.push({
      id: `KFK-EVT-${20000 + i}`,
      topic: 'vitals.stream.v1',
      partition: i % 4,
      offset: 1000 + i,
      timestamp:
        new Date(
          Date.now() - i * 120000
        ).toISOString(),
      source: 'ICU-IOT-Gateway',
      eventType: 'VitalsStreamUpdated',
      payload: JSON.stringify({
        patientId: p.id,
        vitals: p.vitals
      })
    });
  }

  const digitalTwins: DigitalTwin[] =
    patients.slice(0, 100).map((p, idx) => ({
      patientId: p.id,
      patientName: p.name,
      completeness: p.twinCompleteness,
      organRisks: {
        brain: 'Normal',
        heart:
          idx % 3 === 0
            ? 'High'
            : 'Normal',
        lungs: 'Normal',
        liver: 'Normal',
        kidneys:
          idx % 4 === 0
            ? 'Moderate'
            : 'Normal'
      },
      aiRecommendations: [
        '30-Day Readmission Risk: 12% (Low)',
        'Cardiovascular Event Probability: 8% (Stable)'
      ],
      lastSync: new Date().toISOString()
    }));

  const initialLogs: ActivityLog[] = [
    {
      id: 'LOG-9001',
      action: 'Admin added Doctor',
      details:
        'Added Dr. Veena Hegde to Cardiology department',
      user: 'System Administrator',
      timestamp:
        '02/08/2026, 08:30:15 AM'
    },
    {
      id: 'LOG-9002',
      action: 'Doctor completed appointment',
      details:
        'Completed appointment APT-5001 for Anushree Naik',
      user: 'Dr. Ananthakrishna Bhat',
      timestamp:
        '02/08/2026, 09:15:22 AM'
    },
    {
      id: 'LOG-9003',
      action: 'Patient booked appointment',
      details:
        'Booked appointment with Dr. Sudhakar Shetty',
      user: 'Anushree Naik',
      timestamp:
        '02/08/2026, 10:05:40 AM'
    },
    {
      id: 'LOG-9004',
      action: 'Receptionist confirmed appointment',
      details:
        'Confirmed appointment APT-5002 for Shreya Shetty',
      user: 'Pooja Rao (Reception)',
      timestamp:
        '02/08/2026, 10:30:00 AM'
    },
    {
      id: 'LOG-9005',
      action: 'Medical Staff updated vitals',
      details:
        'Recorded HR 72, BP 130/85, SpO2 98% for Anushree Naik',
      user: 'Keerthana Bhat (Med Staff)',
      timestamp:
        '02/08/2026, 11:12:05 AM'
    }
  ];

  setItem(KEYS.USERS, users);
  setItem(KEYS.PATIENTS, patients);
  setItem(KEYS.DOCTORS, doctors);
  setItem(KEYS.EMPLOYEES, employees);
  setItem(KEYS.APPOINTMENTS, appointments);
  setItem(KEYS.FHIR_RESOURCES, fhirResources);
  setItem(KEYS.KAFKA_EVENTS, kafkaEvents);
  setItem(KEYS.DIGITAL_TWINS, digitalTwins);
  setItem(KEYS.ACTIVITY_LOGS, initialLogs);
}

seedInitialData();

export const MediStorage = {
  getUsers: (): User[] =>
    getItem<User>(KEYS.USERS),

  getPatients: (): Patient[] =>
    getItem<Patient>(KEYS.PATIENTS),

  getDoctors: (): Doctor[] =>
    getItem<Doctor>(KEYS.DOCTORS),

  getEmployees: (): any[] =>
    getItem<any>(KEYS.EMPLOYEES),

  getAppointments: (): Appointment[] =>
    getItem<Appointment>(KEYS.APPOINTMENTS),

  getFHIRResources: (): FHIRResource[] =>
    getItem<FHIRResource>(KEYS.FHIR_RESOURCES),

  getKafkaEvents: (): KafkaEvent[] =>
    getItem<KafkaEvent>(KEYS.KAFKA_EVENTS),

  getDigitalTwins: (): DigitalTwin[] =>
    getItem<DigitalTwin>(KEYS.DIGITAL_TWINS),

  getActivityLogs: (): ActivityLog[] =>
    getItem<ActivityLog>(KEYS.ACTIVITY_LOGS),

  /*
   * SECURITY FIX:
   *
   * There is NO default admin session anymore.
   *
   * If the user has not logged in, this returns null.
   */
  getCurrentUser: (): User | null => {
    try {
      const rawUser =
        sessionStorage.getItem(KEYS.CURRENT_USER);

      const token =
        sessionStorage.getItem(KEYS.TOKEN);

      if (!rawUser || !token) {
        return null;
      }

      const user: User = JSON.parse(rawUser);

      if (!user || !user.id || !user.role) {
        clearSession();
        return null;
      }

      /*
       * Ensure the session token actually exists.
       * This prevents a stale user object from being
       * considered logged in without a session token.
       */
      if (!token.startsWith('session-')) {
        clearSession();
        return null;
      }

      return user;
    } catch {
      clearSession();
      return null;
    }
  },

  /*
   * Stores only the sanitized user in sessionStorage.
   * Password is removed before storage.
   */
  setCurrentUser: (user: User) => {
    const safeUser =
      sanitizeUserForSession(user);

    const token =
      generateSessionToken();

    sessionStorage.setItem(
      KEYS.CURRENT_USER,
      JSON.stringify(safeUser)
    );

    sessionStorage.setItem(
      KEYS.TOKEN,
      token
    );
  },

  /*
   * Proper logout.
   */
  logout: () => {
    clearSession();
    window.location.href = '#/login';
  },

  /*
   * ROLE-AWARE AUTHENTICATION
   *
   * Login ID + password + selected role
   * must all match.
   */
  authenticateUser: (
    loginId: string,
    password: string,
    selectedRole?: UserRole
  ) => {
    const users =
      getItem<User>(KEYS.USERS);

    const term =
      (loginId || '')
        .trim()
        .toLowerCase();

    const pass =
      (password || '').trim();

    const role =
      selectedRole || 'admin';

    if (!term || !pass) {
      return {
        success: false,
        message:
          'Please enter both User ID/Email and Password.'
      };
    }

    /*
     * IMPORTANT:
     * Find account using BOTH identity and selected role.
     *
     * Previously the code could find a user by ID/email
     * without checking whether the selected role matched.
     */
    const user = users.find(u => {
      if (!u || u.status !== 'Active') {
        return false;
      }

      if (u.role !== role) {
        return false;
      }

      const matchId =
        !!u.id &&
        u.id.toLowerCase() === term;

      const matchEmail =
        !!u.email &&
        u.email.toLowerCase() === term;

      const matchUsername =
        !!u.username &&
        u.username.toLowerCase() === term;

      return (
        matchId ||
        matchEmail ||
        matchUsername
      );
    });

    if (!user) {
      return {
        success: false,
        message:
          `No active ${String(role).toUpperCase()} account found for '${loginId}'.`
      };
    }

    /*
     * SECURITY FIX:
     *
     * Removed the old password bypass:
     *
     * pass !== 'admin123'
     * pass !== 'doctor123'
     * ...
     *
     * Now the password MUST match the selected account.
     */
    if (!user.password || user.password !== pass) {
      return {
        success: false,
        message:
          'Invalid Password. Please verify your credentials.'
      };
    }

    /*
     * Create a fresh session only after
     * successful authentication.
     */
    const authenticatedUser: User = {
      ...user,
      token: undefined
    };

    MediStorage.setCurrentUser(
      authenticatedUser
    );

    /*
     * Return the user without password.
     */
    return {
      success: true,
      user: sanitizeUserForSession(
        authenticatedUser
      )
    };
  },

  registerPatient: (
    data: any
  ): {
    success: boolean;
    patientId: string;
    user: User;
    message?: string;
  } => {
    const patients =
      getItem<Patient>(KEYS.PATIENTS);

    const users =
      getItem<User>(KEYS.USERS);

    const newId =
      MediUtils.generateId('PAT');

    const newPatient: Patient = {
      id: newId,
      name: data.fullName,
      email: data.email,
      age: parseInt(data.age) || 30,
      gender: data.gender || 'Female',
      bloodGroup: data.bloodGroup || 'O+',
      hospital:
        'Kasturba Medical College Hospital, Manipal',
      assignedDoctor:
        'Dr. Ananthakrishna Bhat',
      phone:
        data.mobile || '+91 98450 00000',
      address: data.address,
      emergencyContact:
        data.emergencyContact,
      conditions: [
        'New Registration - Assessment Pending'
      ],
      vitals: {
        hr: 72,
        bp: '120/80',
        spo2: 98,
        temp: 98.6,
        resp: 16
      },
      twinCompleteness: 90,
      onboardedDate:
        new Date()
          .toISOString()
          .split('T')[0]
    };

    const newUser: User = {
      id: newId,
      name: data.fullName,
      email: data.email,
      username: newId,

      /*
       * Password is required here because the current
       * project still uses frontend/localStorage auth.
       */
      password:
        data.password || 'medisphere2026',

      role: 'patient',
      status: 'Active',
      phone: data.mobile
    };

    patients.unshift(newPatient);
    users.unshift(newUser);

    setItem(
      KEYS.PATIENTS,
      patients
    );

    setItem(
      KEYS.USERS,
      users
    );

    /*
     * Do NOT automatically log the newly registered
     * patient into an admin session.
     */
    return {
      success: true,
      patientId: newId,
      user: sanitizeUserForSession(
        newUser
      )
    };
  },

  savePatient: (
    patient: Patient
  ) => {
    const list =
      getItem<Patient>(KEYS.PATIENTS);

    const idx =
      list.findIndex(
        p => p.id === patient.id
      );

    if (idx >= 0) {
      list[idx] = patient;
    } else {
      list.unshift(patient);
    }

    setItem(
      KEYS.PATIENTS,
      list
    );
  },

  deletePatient: (
    patientId: string
  ): boolean => {
    const list =
      getItem<Patient>(KEYS.PATIENTS);

    const remaining = list.filter(
      p => p.id !== patientId
    );

    if (remaining.length === list.length) {
      return false;
    }

    setItem(
      KEYS.PATIENTS,
      remaining
    );

    /*
     * Also remove the patient's own login account
     * (created with the same id at registration).
     */
    const users =
      getItem<User>(KEYS.USERS);

    setItem(
      KEYS.USERS,
      users.filter(
        u =>
          !(
            u.id === patientId &&
            u.role === 'patient'
          )
      )
    );

    return true;
  },

  saveDoctor: (
    doctor: Doctor
  ) => {
    const list =
      getItem<Doctor>(KEYS.DOCTORS);

    const idx =
      list.findIndex(
        d => d.id === doctor.id
      );

    if (idx >= 0) {
      list[idx] = doctor;
    } else {
      list.unshift(doctor);
    }

    setItem(
      KEYS.DOCTORS,
      list
    );
  },

  saveUser: (
    user: User
  ) => {
    const list =
      getItem<User>(KEYS.USERS);

    const idx =
      list.findIndex(
        u => u.id === user.id
      );

    if (idx >= 0) {
      list[idx] = user;
    } else {
      list.unshift(user);
    }

    setItem(
      KEYS.USERS,
      list
    );
  },

  saveAppointment: (
    appt: Appointment
  ) => {
    const list =
      getItem<Appointment>(
        KEYS.APPOINTMENTS
      );

    const idx =
      list.findIndex(
        a => a.id === appt.id
      );

    if (idx >= 0) {
      list[idx] = appt;
    } else {
      list.unshift(appt);
    }

    setItem(
      KEYS.APPOINTMENTS,
      list
    );

    MediStorage.logActivity(
      'Appointment Booked',
      `Booked ${appt.id} for ${appt.patientName}`
    );
  },

  logActivity: (
    action: string,
    details: string
  ) => {
    const logs =
      getItem<ActivityLog>(
        KEYS.ACTIVITY_LOGS
      );

    const current =
      MediStorage.getCurrentUser();

    logs.unshift({
      id: MediUtils.generateId('LOG'),
      action,
      details,
      user:
        current
          ? current.name
          : 'System',
      timestamp:
        new Date().toLocaleString()
    });

    setItem(
      KEYS.ACTIVITY_LOGS,
      logs.slice(0, 100)
    );
  }
};

if (typeof window !== 'undefined') {
  /*
   * Expose storage only for development/demo compatibility.
   *
   * NOTE:
   * Do not rely on this object for real security.
   * Production authorization must happen on the backend.
   */
  (window as any).MediStorage =
    MediStorage;
}