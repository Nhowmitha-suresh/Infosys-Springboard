
export interface CareplanPatient {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';

  cvdRisk: string;
  cvdRiskValue: number;

  diabetesRisk: 'Low' | 'Moderate' | 'High';

  latestBp: string;
  systolicBp: number;
  diastolicBp: number;

  hba1c: string;
  hba1cValue: number;

  overallAdherence: number;
  medicationAdherence: number;
  bpAdherence: number;
  glucoseAdherence: number;
  lifestyleAdherence: number;

  weeklyProgress: {
    day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
    completed: boolean;
    date?: string;
  }[];

  attentionMessage?: string;
  recommendedAction?: string;
}

export interface GeneratedCareplan {
  patientId: string;
  patientName: string;
  generatedAt: string;

  goal1: {
    title: string;
    interventions: string[];
  };

  goal2: {
    title: string;
    interventions: string[];
  };

  predictedOutcome: {
    metric: string;
    value: string;
    note: string;
  };

  approvalStatus:
    | 'Draft'
    | 'Approved'
    | 'Under Review';
}

export interface GuidelineCheckItem {
  id: string;

  category:
    | 'Diabetes'
    | 'Hypertension'
    | 'CVD Risk'
    | 'Compatibility';

  title: string;
  ruleDescription: string;

  status:
    | 'passed'
    | 'warning'
    | 'info';

  message: string;
}

/*
============================================================
LOCAL STORAGE
============================================================
*/

const STORAGE_KEYS = {
  CAREPLANS: 'medisphere_saved_careplans',
  APPROVALS: 'medisphere_careplan_approvals'
};

/*
============================================================
WEEKLY PROGRESS
============================================================
*/

const createWeeklyProgress = (
  completedDays: number[]
): CareplanPatient['weeklyProgress'] => {
  const days: CareplanPatient['weeklyProgress'][number]['day'][] = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
  ];

  return days.map((day, index) => ({
    day,
    completed: completedDays.includes(index)
  }));
};

/*
============================================================
10 UNIQUE CAREPLAN PATIENTS
============================================================

These are the only patients displayed by the Careplan
Generator.

Each profile has unique demographic and clinical values.
============================================================
*/

export const DEMO_PATIENTS: CareplanPatient[] = [
  {
    id: 'P-101',
    name: 'Arun Kumar',
    age: 54,
    gender: 'Male',

    cvdRisk: '16.2%',
    cvdRiskValue: 16.2,

    diabetesRisk: 'Moderate',

    latestBp: '138/86',
    systolicBp: 138,
    diastolicBp: 86,

    hba1c: '7.4%',
    hba1cValue: 7.4,

    overallAdherence: 83,
    medicationAdherence: 90,
    bpAdherence: 80,
    glucoseAdherence: 75,
    lifestyleAdherence: 85,

    weeklyProgress: createWeeklyProgress([0, 1, 3, 4, 5]),

    attentionMessage:
      'Glucose monitoring adherence has decreased this week.',

    recommendedAction:
      'Patient follow-up'
  },

  {
    id: 'P-102',
    name: 'Priya Sharma',
    age: 42,
    gender: 'Female',

    cvdRisk: '8.4%',
    cvdRiskValue: 8.4,

    diabetesRisk: 'Low',

    latestBp: '122/78',
    systolicBp: 122,
    diastolicBp: 78,

    hba1c: '6.2%',
    hba1cValue: 6.2,

    overallAdherence: 94,
    medicationAdherence: 96,
    bpAdherence: 92,
    glucoseAdherence: 95,
    lifestyleAdherence: 93,

    weeklyProgress: createWeeklyProgress([0, 1, 2, 3, 4, 5, 6]),

    recommendedAction:
      'Continue current wellness maintenance regimen'
  },

  {
    id: 'P-103',
    name: 'Ravi Wilson',
    age: 63,
    gender: 'Male',

    cvdRisk: '24.8%',
    cvdRiskValue: 24.8,

    diabetesRisk: 'High',

    latestBp: '152/94',
    systolicBp: 152,
    diastolicBp: 94,

    hba1c: '8.9%',
    hba1cValue: 8.9,

    overallAdherence: 64,
    medicationAdherence: 70,
    bpAdherence: 60,
    glucoseAdherence: 58,
    lifestyleAdherence: 68,

    weeklyProgress: createWeeklyProgress([0, 3, 5]),

    attentionMessage:
      'Medication and glucose monitoring adherence are below the recommended threshold.',

    recommendedAction:
      'Urgent clinical consultation and treatment review'
  },

  {
    id: 'P-104',
    name: 'Meena Davis',
    age: 49,
    gender: 'Female',

    cvdRisk: '14.1%',
    cvdRiskValue: 14.1,

    diabetesRisk: 'Moderate',

    latestBp: '134/84',
    systolicBp: 134,
    diastolicBp: 84,

    hba1c: '7.1%',
    hba1cValue: 7.1,

    overallAdherence: 88,
    medicationAdherence: 92,
    bpAdherence: 85,
    glucoseAdherence: 84,
    lifestyleAdherence: 91,

    weeklyProgress: createWeeklyProgress([0, 1, 2, 3, 4, 6]),

    attentionMessage:
      'Weekend glucose monitoring is slightly irregular.',

    recommendedAction:
      'Routine lifestyle adherence check-in'
  },

  {
    id: 'P-105',
    name: 'Karthik Raj',
    age: 58,
    gender: 'Male',

    cvdRisk: '19.6%',
    cvdRiskValue: 19.6,

    diabetesRisk: 'Moderate',

    latestBp: '146/88',
    systolicBp: 146,
    diastolicBp: 88,

    hba1c: '7.8%',
    hba1cValue: 7.8,

    overallAdherence: 76,
    medicationAdherence: 82,
    bpAdherence: 73,
    glucoseAdherence: 69,
    lifestyleAdherence: 80,

    weeklyProgress: createWeeklyProgress([0, 1, 2, 5]),

    attentionMessage:
      'Blood pressure readings remain above the target range.',

    recommendedAction:
      'Blood pressure monitoring and clinical review'
  },

  {
    id: 'P-106',
    name: 'Anitha Krishnan',
    age: 37,
    gender: 'Female',

    cvdRisk: '5.7%',
    cvdRiskValue: 5.7,

    diabetesRisk: 'Low',

    latestBp: '118/76',
    systolicBp: 118,
    diastolicBp: 76,

    hba1c: '5.8%',
    hba1cValue: 5.8,

    overallAdherence: 97,
    medicationAdherence: 98,
    bpAdherence: 96,
    glucoseAdherence: 97,
    lifestyleAdherence: 95,

    weeklyProgress: createWeeklyProgress([0, 1, 2, 3, 4, 5, 6]),

    recommendedAction:
      'Continue preventive health monitoring'
  },

  {
    id: 'P-107',
    name: 'Suresh Babu',
    age: 67,
    gender: 'Male',

    cvdRisk: '27.3%',
    cvdRiskValue: 27.3,

    diabetesRisk: 'High',

    latestBp: '158/96',
    systolicBp: 158,
    diastolicBp: 96,

    hba1c: '9.2%',
    hba1cValue: 9.2,

    overallAdherence: 59,
    medicationAdherence: 63,
    bpAdherence: 55,
    glucoseAdherence: 52,
    lifestyleAdherence: 65,

    weeklyProgress: createWeeklyProgress([0, 3]),

    attentionMessage:
      'Multiple clinical indicators are above target and adherence is low.',

    recommendedAction:
      'Priority clinical assessment and careplan review'
  },

  {
     id: 'P1006',
    name: 'Lakshmi Devi',
    age: 46,
    gender: 'Female',
    bloodGroup: 'B-',
    conditions: ['Hypertension'],
    medications: ['Telmisartan'],
    allergies: [],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Ananya Iyer',
    cvdRisk: '16%',
    cvdRiskValue: 16,
    diabetesRisk: 'Low',
    latestBp: '136/84',
    systolicBp: 136,
    hba1c: '5.9%',
    hba1cValue: 5.9,

    overallAdherence: 89,
    medicationAdherence: 91,
    bpAdherence: 87,
    glucoseAdherence: 88,
    lifestyleAdherence: 90,

    weeklyProgress: createWeeklyProgress([0, 1, 2, 3, 4, 6]),

    attentionMessage:
      'Diastolic blood pressure is slightly above the preferred target.',

    recommendedAction:
      'Continue monitoring and lifestyle management'
  },

  {
    id: 'P-109',
    name: 'Vignesh Kumar',
    age: 51,
    gender: 'Male',

    cvdRisk: '13.5%',
    cvdRiskValue: 13.5,

    diabetesRisk: 'Low',

    latestBp: '126/80',
    systolicBp: 126,
    diastolicBp: 80,

    hba1c: '6.4%',
    hba1cValue: 6.4,

    overallAdherence: 91,
    medicationAdherence: 94,
    bpAdherence: 90,
    glucoseAdherence: 89,
    lifestyleAdherence: 92,

    weeklyProgress: createWeeklyProgress([0, 1, 2, 4, 5, 6]),

    recommendedAction:
      'Continue current care and preventive monitoring'
  },

  {
    id: 'P-110',
    name: 'Divya Srinivasan',
    age: 59,
    gender: 'Female',

    cvdRisk: '21.7%',
    cvdRiskValue: 21.7,

    diabetesRisk: 'High',

    latestBp: '149/91',
    systolicBp: 149,
    diastolicBp: 91,

    hba1c: '8.3%',
    hba1cValue: 8.3,

    overallAdherence: 71,
    medicationAdherence: 78,
    bpAdherence: 68,
    glucoseAdherence: 64,
    lifestyleAdherence: 75,

    weeklyProgress: createWeeklyProgress([0, 1, 3, 4, 6]),

    attentionMessage:
      'Elevated cardiovascular and diabetes risk requires closer monitoring.',

    recommendedAction:
      'Clinical review of cardiovascular and glycemic control'
  }
];

/*
============================================================
CAREPLAN SERVICE
============================================================
*/

export const careplanService = {

  /*
  ----------------------------------------------------------
  GET PATIENTS
  ----------------------------------------------------------
  */

  getPatients(): CareplanPatient[] {
    return DEMO_PATIENTS;
  },

  /*
  ----------------------------------------------------------
  GET PATIENT BY ID
  ----------------------------------------------------------
  */

  getPatientById(id: string): CareplanPatient {
    return (
      DEMO_PATIENTS.find(
        patient => patient.id === id
      ) || DEMO_PATIENTS[0]
    );
  },

  /*
  ----------------------------------------------------------
  GET PATIENT BY NAME
  ----------------------------------------------------------
  */

  getPatientByName(name: string): CareplanPatient {
    return (
      DEMO_PATIENTS.find(
        patient =>
          patient.name.toLowerCase() ===
          name.toLowerCase()
      ) || DEMO_PATIENTS[0]
    );
  },

  /*
  ----------------------------------------------------------
  GENERATE CAREPLAN
  ----------------------------------------------------------
  */

  generateCareplan(
    patientId: string
  ): GeneratedCareplan {

    const patient =
      this.getPatientById(patientId);

    let goal1 = {
      title: 'Maintain current health status',
      interventions: [
        'Continue routine monitoring',
        'Follow prescribed care plan',
        'Continue healthy lifestyle practices'
      ]
    };

    let goal2 = {
      title: 'Maintain optimal blood pressure',
      interventions: [
        'Continue regular BP monitoring',
        'Maintain lifestyle measures',
        'Continue routine clinical follow-up'
      ]
    };

    /*
    Diabetes-based goal
    */

    if (patient.hba1cValue > 7) {
      goal1 = {
        title: 'Improve glycemic control',
        interventions: [
          'Regular glucose monitoring',
          'Review glycemic trends',
          'Follow the prescribed diabetes care plan'
        ]
      };
    }

    /*
    Blood-pressure-based goal
    */

    if (
      patient.systolicBp > 130 ||
      patient.diastolicBp > 80
    ) {
      goal2 = {
        title: 'Improve blood pressure control',
        interventions: [
          'Regular BP monitoring',
          'Review BP trends',
          'Clinical review when required'
        ]
      };
    }

    /*
    CVD risk-based goal
    */

    if (patient.cvdRiskValue >= 20) {
      goal2 = {
        title: 'Reduce cardiovascular risk',
        interventions: [
          'Monitor cardiovascular risk factors',
          'Review recent vital trends',
          'Clinical cardiovascular risk review'
        ]
      };
    }

    /*
    Planning target only.
    This is NOT a medically validated prediction.
    */

    const projectedRisk = Math.max(
      0,
      patient.cvdRiskValue - 3.5
    ).toFixed(1);

    return {
      patientId: patient.id,

      patientName: patient.name,

      generatedAt:
        new Date().toLocaleDateString(
          'en-US',
          {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }
        ),

      goal1,

      goal2,

      predictedOutcome: {
        metric: 'CVD Risk',

        value: patient.cvdRisk,

        note:
          `Current CVD risk is ${patient.cvdRisk}. ` +
          `The demonstration planning target is approximately ${projectedRisk}% ` +
          `with improved adherence and management of modifiable risk factors.`
      },

      approvalStatus: 'Draft'
    };
  },

  /*
  ----------------------------------------------------------
  SAVE CAREPLAN
  ----------------------------------------------------------
  */

  saveCareplan(
    patientId: string,
    plan: GeneratedCareplan
  ): void {

    try {

      const existing =
        this.getAllSavedCareplans();

      existing[patientId] = plan;

      localStorage.setItem(
        STORAGE_KEYS.CAREPLANS,
        JSON.stringify(existing)
      );

    } catch (error) {

      console.warn(
        'Failed to save careplan:',
        error
      );
    }
  },

  /*
  ----------------------------------------------------------
  GET SAVED CAREPLAN
  ----------------------------------------------------------
  */

  getSavedCareplan(
    patientId: string
  ): GeneratedCareplan | null {

    try {

      const existing =
        this.getAllSavedCareplans();

      return existing[patientId] || null;

    } catch (error) {

      return null;
    }
  },

  /*
  ----------------------------------------------------------
  GET ALL SAVED CAREPLANS
  ----------------------------------------------------------
  */

  getAllSavedCareplans():
    Record<string, GeneratedCareplan> {

    try {

      const data =
        localStorage.getItem(
          STORAGE_KEYS.CAREPLANS
        );

      return data
        ? JSON.parse(data)
        : {};

    } catch (error) {

      return {};
    }
  },

  /*
  ----------------------------------------------------------
  GUIDELINE VALIDATION
  ----------------------------------------------------------
  */

  validatePatientGuidelines(
    patientId: string
  ): {
    overallStatus:
      | 'GUIDELINE COMPLIANT'
      | 'REVIEW REQUIRED';

    checks: GuidelineCheckItem[];
  } {

    const patient =
      this.getPatientById(patientId);

    const checks: GuidelineCheckItem[] = [];

    /*
    Diabetes
    */

    if (patient.hba1cValue > 7) {

      checks.push({
        id: 'chk-diabetes',
        category: 'Diabetes',
        title: 'Diabetes Guideline',
        ruleDescription:
          'HbA1c > 7% → Increased monitoring',
        status: 'warning',
        message:
          `HbA1c (${patient.hba1c}) is above the demonstration target.`
      });

    } else {

      checks.push({
        id: 'chk-diabetes',
        category: 'Diabetes',
        title: 'Diabetes Guideline',
        ruleDescription:
          'HbA1c <= 7% → Standard target met',
        status: 'passed',
        message:
          `HbA1c (${patient.hba1c}) is within the demonstration target.`
      });
    }

    /*
    HbA1c target
    */

    checks.push({
      id: 'chk-hba1c-target',
      category: 'Diabetes',
      title: 'HbA1c Target Validation',
      ruleDescription:
        'Target Goal: HbA1c < 7.0%',
      status: 'info',
      message:
        'The careplan uses HbA1c < 7% as a demonstration target. Final targets require clinician review.'
    });

    /*
    Blood pressure
    */

    if (
      patient.systolicBp > 130 ||
      patient.diastolicBp > 80
    ) {

      checks.push({
        id: 'chk-bp',
        category: 'Hypertension',
        title: 'BP Monitoring Guideline',
        ruleDescription:
          'BP > 130/80 → BP monitoring',
        status: 'warning',
        message:
          `Blood pressure (${patient.latestBp}) requires continued monitoring.`
      });

    } else {

      checks.push({
        id: 'chk-bp',
        category: 'Hypertension',
        title: 'BP Monitoring Guideline',
        ruleDescription:
          'BP <= 130/80 → Within demonstration target',
        status: 'passed',
        message:
          `Blood pressure (${patient.latestBp}) is within the demonstration target.`
      });
    }

    /*
    CVD risk
    */

    if (patient.cvdRiskValue >= 20) {

      checks.push({
        id: 'chk-cvd',
        category: 'CVD Risk',
        title: 'High CVD Risk Assessment',
        ruleDescription:
          'CVD Risk >= 20% → Clinical review',
        status: 'warning',
        message:
          `Elevated CVD risk (${patient.cvdRisk}) requires clinical review.`
      });

    } else {

      checks.push({
        id: 'chk-cvd',
        category: 'Compatibility',
        title: 'Intervention Compatibility',
        ruleDescription:
          'Standard cross-treatment compatibility protocol',
        status: 'passed',
        message:
          'No compatibility issue is identified by this demonstration rule set.'
      });
    }

    const hasWarning =
      checks.some(
        check =>
          check.status === 'warning'
      );

    return {
      overallStatus:
        hasWarning
          ? 'REVIEW REQUIRED'
          : 'GUIDELINE COMPLIANT',

      checks
    };
  },

  /*
  ----------------------------------------------------------
  SET APPROVAL STATUS
  ----------------------------------------------------------
  */

  setApprovalStatus(
    patientId: string,
    status:
      | 'Approved'
      | 'Under Review'
  ): void {

    try {

      const data =
        this.getAllApprovalStatuses();

      data[patientId] = {
        status,
        timestamp:
          new Date().toISOString()
      };

      localStorage.setItem(
        STORAGE_KEYS.APPROVALS,
        JSON.stringify(data)
      );

    } catch (error) {

      console.warn(
        'Failed to update approval status:',
        error
      );
    }
  },

  /*
  ----------------------------------------------------------
  GET APPROVAL STATUS
  ----------------------------------------------------------
  */

  getApprovalStatus(
    patientId: string
  ):
    | 'Draft'
    | 'Approved'
    | 'Under Review' {

    try {

      const data =
        this.getAllApprovalStatuses();

      return (
        data[patientId]?.status ||
        'Draft'
      );

    } catch (error) {

      return 'Draft';
    }
  },

  /*
  ----------------------------------------------------------
  GET ALL APPROVAL STATUSES
  ----------------------------------------------------------
  */

  getAllApprovalStatuses():
    Record<
      string,
      {
        status:
          | 'Approved'
          | 'Under Review';

        timestamp: string;
      }
    > {

    try {

      const data =
        localStorage.getItem(
          STORAGE_KEYS.APPROVALS
        );

      return data
        ? JSON.parse(data)
        : {};

    } catch (error) {

      return {};
    }
  }
};

