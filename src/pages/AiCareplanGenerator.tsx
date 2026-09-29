
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MediToast } from '../components/Toast';
import {
  CareplanPatient,
  careplanService,
  GeneratedCareplan
} from '../services/careplanService';

/*
 * ============================================================
 * AI CAREPLAN GENERATOR
 * ============================================================
 *
 * This page uses a small, controlled set of 10 unique demo
 * patient profiles.
 *
 * The backend integration is handled separately through the
 * careplan service and /api/careplans endpoints.
 * ============================================================
 */

const DEMO_PATIENTS: CareplanPatient[] = [
  {
    id: 'P1001',
    name: 'Arun Kumar',
    age: 45,
    gender: 'Male',
    conditions: ['Hypertension'],
    medications: ['Amlodipine'],
    allergies: [],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Priya Sharma',
    cvdRisk: '18%',
    cvdRiskValue: 18,
    diabetesRisk: 'Moderate',
    latestBp: '138/88',
    systolicBp: 138,
    hba1c: '6.8%',
    hba1cValue: 6.8
  },
  {
    id: 'P1002',
    name: 'Meena Raj',
    age: 52,
    gender: 'Female',
    bloodGroup: 'A+',
    conditions: ['Type 2 Diabetes'],
    medications: ['Metformin'],
    allergies: [],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Karthik Rao',
    cvdRisk: '22%',
    cvdRiskValue: 22,
    diabetesRisk: 'High',
    latestBp: '146/92',
    systolicBp: 146,
    hba1c: '8.1%',
    hba1cValue: 8.1
  },
  {
    id: 'P1003',
    name: 'Vikram Singh',
    age: 39,
    gender: 'Male',
    bloodGroup: 'B+',
    conditions: ['Hyperlipidemia'],
    medications: ['Atorvastatin'],
    allergies: ['Penicillin'],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Ananya Iyer',
    cvdRisk: '11%',
    cvdRiskValue: 11,
    diabetesRisk: 'Low',
    latestBp: '124/78',
    systolicBp: 124,
    hba1c: '5.7%',
    hba1cValue: 5.7
  },
  {
    id: 'P1004',
    name: 'Divya Nair',
    age: 34,
    gender: 'Female',
    bloodGroup: 'AB+',
    conditions: ['Prediabetes'],
    medications: [],
    allergies: [],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Rahul Menon',
    cvdRisk: '9%',
    cvdRiskValue: 9,
    diabetesRisk: 'Moderate',
    latestBp: '128/82',
    systolicBp: 128,
    hba1c: '6.2%',
    hba1cValue: 6.2
  },
  {
    id: 'P1005',
    name: 'Ramesh Babu',
    age: 61,
    gender: 'Male',
    bloodGroup: 'O-',
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    medications: ['Losartan', 'Metformin'],
    allergies: [],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Priya Sharma',
    cvdRisk: '27%',
    cvdRiskValue: 27,
    diabetesRisk: 'High',
    latestBp: '154/96',
    systolicBp: 154,
    hba1c: '8.6%',
    hba1cValue: 8.6
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
    hba1cValue: 5.9
  },
  {
    id: 'P1007',
    name: 'Sanjay Patel',
    age: 57,
    gender: 'Male',
    bloodGroup: 'A-',
    conditions: ['Coronary Risk', 'Hyperlipidemia'],
    medications: ['Rosuvastatin'],
    allergies: ['Sulfa drugs'],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Karthik Rao',
    cvdRisk: '24%',
    cvdRiskValue: 24,
    diabetesRisk: 'Moderate',
    latestBp: '142/86',
    systolicBp: 142,
    hba1c: '6.9%',
    hba1cValue: 6.9
  },
  {
    id: 'P1008',
    name: 'Anitha Joseph',
    age: 42,
    gender: 'Female',
    bloodGroup: 'O+',
    conditions: ['Prediabetes'],
    medications: [],
    allergies: [],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Rahul Menon',
    cvdRisk: '8%',
    cvdRiskValue: 8,
    diabetesRisk: 'Moderate',
    latestBp: '126/80',
    systolicBp: 126,
    hba1c: '6.4%',
    hba1cValue: 6.4
  },
  {
    id: 'P1009',
    name: 'Mohammed Faisal',
    age: 50,
    gender: 'Male',
    bloodGroup: 'AB-',
    conditions: ['Hypertension', 'Obesity'],
    medications: ['Amlodipine'],
    allergies: [],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Priya Sharma',
    cvdRisk: '20%',
    cvdRiskValue: 20,
    diabetesRisk: 'Moderate',
    latestBp: '148/90',
    systolicBp: 148,
    hba1c: '7.2%',
    hba1cValue: 7.2
  },
  {
    id: 'P1010',
    name: 'Kavitha Srinivasan',
    age: 67,
    gender: 'Female',
    bloodGroup: 'A+',
    conditions: ['Type 2 Diabetes', 'Hypertension'],
    medications: ['Metformin', 'Amlodipine'],
    allergies: [],
    hospital: 'MediSphere General Hospital',
    assignedDoctor: 'Dr. Ananya Iyer',
    cvdRisk: '29%',
    cvdRiskValue: 29,
    diabetesRisk: 'High',
    latestBp: '158/94',
    systolicBp: 158,
    hba1c: '9.0%',
    hba1cValue: 9.0
  }
];

export const AiCareplanGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  /*
   * Use only the 10 controlled patient profiles above.
   */
  const patients = DEMO_PATIENTS;

  const requestedPatientId = searchParams.get('patientId');

  const initialPatientId =
    requestedPatientId &&
    patients.some((patient) => patient.id === requestedPatientId)
      ? requestedPatientId
      : patients[0].id;

  const [selectedPatientId, setSelectedPatientId] =
    useState<string>(initialPatientId);

  const [selectedPatient, setSelectedPatient] =
    useState<CareplanPatient>(patients[0]);

  const [isGenerating, setIsGenerating] =
    useState<boolean>(false);

  const [generatedPlan, setGeneratedPlan] =
    useState<GeneratedCareplan | null>(null);

  const [saveSuccessMsg, setSaveSuccessMsg] =
    useState<string | null>(null);

  /*
   * ------------------------------------------------------------
   * Patient selection
   * ------------------------------------------------------------
   */
  useEffect(() => {
    const patient =
      patients.find(
        (item) => item.id === selectedPatientId
      ) || patients[0];

    setSelectedPatient(patient);

    setSearchParams(
      { patientId: patient.id },
      { replace: true }
    );

    setGeneratedPlan(null);
    setSaveSuccessMsg(null);
  }, [selectedPatientId, setSearchParams]);

  /*
   * ------------------------------------------------------------
   * Handle patient change
   * ------------------------------------------------------------
   */
  const handlePatientChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPatientId(event.target.value);
    setGeneratedPlan(null);
    setSaveSuccessMsg(null);
  };

  /*
   * ------------------------------------------------------------
   * Generate careplan
   * ------------------------------------------------------------
   *
   * The careplan service remains responsible for generating
   * the careplan.
   * ------------------------------------------------------------
   */
  const handleGenerateCareplan = async () => {
    try {
      setIsGenerating(true);
      setSaveSuccessMsg(null);

      const plan =
        await careplanService.generateCareplan(
          selectedPatient.id
        );

      setGeneratedPlan(plan);

      MediToast.info(
        'AI Careplan generated based on patient clinical data.'
      );
    } catch (error) {
      console.error(
        'Careplan generation failed:',
        error
      );

      MediToast.error(
        'Unable to generate careplan. Please check the backend connection.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * Save careplan
   * ------------------------------------------------------------
   */
  const handleSaveCareplan = async () => {
    if (!generatedPlan) {
      return;
    }

    try {
      await careplanService.saveCareplan(
        selectedPatient.id,
        generatedPlan
      );

      setSaveSuccessMsg(
        'Careplan saved successfully.'
      );

      MediToast.success(
        'Careplan saved successfully.'
      );
    } catch (error) {
      console.error(
        'Careplan save failed:',
        error
      );

      MediToast.error(
        'Unable to save careplan.'
      );
    }
  };

  /*
   * ------------------------------------------------------------
   * Validate plan
   * ------------------------------------------------------------
   */
  const handleValidatePlan = () => {
    navigate(
      `/clinical-guidelines?patientId=${selectedPatient.id}`
    );
  };

  return (
    <div
      className="page-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '4px'
            }}
          >
            <h1
              style={{
                color: '#FFFFFF',
                fontSize: '1.75rem',
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-0.02em'
              }}
            >
              AI Careplan Generator
            </h1>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background:
                  'rgba(59, 130, 246, 0.2)',
                color: '#60A5FA',
                border:
                  '1px solid rgba(59, 130, 246, 0.4)'
              }}
            >
              AI CLINICAL SYNTHESIS
            </span>
          </div>

          <p
            style={{
              color: '#94A3B8',
              fontSize: '0.95rem',
              margin: 0
            }}
          >
            Automated clinical careplan modeling based on
            patient vitals, risk indicators, laboratory
            markers, and monitoring data.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              navigate(
                `/clinical-guidelines?patientId=${selectedPatient.id}`
              )
            }
          >
            Guideline Engine
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              navigate(
                `/adherence-tracking?patientId=${selectedPatient.id}`
              )
            }
          >
            Adherence Tracker
          </button>
        </div>
      </div>

      {/* ======================================================
          SAFETY NOTICE
      ====================================================== */}

      <div
        style={{
          background:
            'rgba(59, 130, 246, 0.08)',
          border:
            '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#93C5FD',
          fontSize: '0.85rem'
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>
          ℹ️
        </span>

        <div>
          <strong
            style={{ color: '#BFDBFE' }}
          >
            Clinical Demonstration Notice:
          </strong>{' '}
          Demo only — careplan recommendations must be
          reviewed by qualified clinical professionals.
        </div>
      </div>

      {/* ======================================================
          PATIENT SELECTION
      ====================================================== */}

      <div
        className="card-panel"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <label
              htmlFor="careplan-patient-select"
              style={{
                display: 'block',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#94A3B8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px'
              }}
            >
              Select Patient
            </label>

            <select
              id="careplan-patient-select"
              value={selectedPatientId}
              onChange={handlePatientChange}
              style={{
                width: '300px',
                maxWidth: '100%',
                background: '#0F172A',
                color: '#FFFFFF',
                border:
                  '1px solid rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '11px 14px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                >
                  {patient.name} — {patient.age}y,{' '}
                  {patient.gender}
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-generate-careplan"
            className="btn btn-primary"
            onClick={handleGenerateCareplan}
            disabled={isGenerating}
            style={{
              padding: '12px 24px',
              fontSize: '0.95rem',
              fontWeight: 600
            }}
          >
            {isGenerating
              ? 'Analyzing patient data...'
              : 'Generate Careplan'}
          </button>
        </div>

        {/* ====================================================
            PATIENT PROFILE
        ==================================================== */}

        <div>
          <h2
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#94A3B8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '12px'
            }}
          >
            Patient Risk Summary
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}
          >
            {/* CVD */}
            <div
              className="stat-card"
              style={{
                background:
                  'rgba(15, 23, 42, 0.8)',
                border:
                  '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div
                style={{
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                CVD Risk
              </div>

              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color:
                    selectedPatient.cvdRiskValue > 20
                      ? '#EF4444'
                      : selectedPatient.cvdRiskValue > 12
                        ? '#F59E0B'
                        : '#10B981',
                  marginTop: '4px'
                }}
              >
                {selectedPatient.cvdRisk}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B'
                }}
              >
                5-Year Probability Model
              </div>
            </div>

            {/* Diabetes */}
            <div
              className="stat-card"
              style={{
                background:
                  'rgba(15, 23, 42, 0.8)',
                border:
                  '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div
                style={{
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                Diabetes Risk
              </div>

              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color:
                    selectedPatient.diabetesRisk ===
                    'High'
                      ? '#EF4444'
                      : selectedPatient.diabetesRisk ===
                        'Moderate'
                        ? '#F59E0B'
                        : '#10B981',
                  marginTop: '4px'
                }}
              >
                {selectedPatient.diabetesRisk}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B'
                }}
              >
                Diabetes Risk Classification
              </div>
            </div>

            {/* BP */}
            <div
              className="stat-card"
              style={{
                background:
                  'rgba(15, 23, 42, 0.8)',
                border:
                  '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div
                style={{
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                Latest BP
              </div>

              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color:
                    selectedPatient.systolicBp > 130
                      ? '#F59E0B'
                      : '#10B981',
                  marginTop: '4px'
                }}
              >
                {selectedPatient.latestBp}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B'
                }}
              >
                mmHg
              </div>
            </div>

            {/* HbA1c */}
            <div
              className="stat-card"
              style={{
                background:
                  'rgba(15, 23, 42, 0.8)',
                border:
                  '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div
                style={{
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}
              >
                HbA1c
              </div>

              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color:
                    selectedPatient.hba1cValue > 7
                      ? '#EF4444'
                      : '#10B981',
                  marginTop: '4px'
                }}
              >
                {selectedPatient.hba1c}
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748B'
                }}
              >
                Glycated Hemoglobin
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          LOADING
      ====================================================== */}

      {isGenerating && (
        <div
          className="card-panel"
          style={{
            textAlign: 'center',
            padding: '48px 24px'
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border:
                '3px solid rgba(59,130,246,0.2)',
              borderTopColor: '#3B82F6',
              margin: '0 auto 16px',
              animation:
                'spin 1s linear infinite'
            }}
          />

          <h3
            style={{
              color: '#FFFFFF',
              fontSize: '1.2rem',
              marginBottom: '8px'
            }}
          >
            Analyzing patient data...
          </h3>

          <p
            style={{
              color: '#94A3B8',
              maxWidth: '480px',
              margin: '0 auto',
              fontSize: '0.875rem'
            }}
          >
            Evaluating vitals, laboratory markers,
            risk indicators, and monitoring information
            for {selectedPatient.name}.
          </p>
        </div>
      )}

      {/* ======================================================
          GENERATED CAREPLAN
      ====================================================== */}

      {!isGenerating && generatedPlan && (
        <div
          className="card-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#FFFFFF',
                margin: 0
              }}
            >
              Generated Careplan
            </h2>

            <p
              style={{
                color: '#94A3B8',
                fontSize: '0.85rem',
                marginTop: '5px'
              }}
            >
              Patient:{' '}
              <strong style={{ color: '#E2E8F0' }}>
                {selectedPatient.name}
              </strong>
            </p>

            {saveSuccessMsg && (
              <span
                className="badge badge-success"
                style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  padding: '6px 12px'
                }}
              >
                ✓ {saveSuccessMsg}
              </span>
            )}
          </div>

          {/* Goals */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px'
            }}
          >
            {/* Goal 1 */}
            <div
              style={{
                background:
                  'rgba(15,23,42,0.7)',
                border:
                  '1px solid rgba(59,130,246,0.25)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <span
                style={{
                  color: '#60A5FA',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                GOAL 1
              </span>

              <h3
                style={{
                  color: '#FFFFFF',
                  fontSize: '1.2rem',
                  margin: '10px 0'
                }}
              >
                {generatedPlan.goal1.title}
              </h3>

              <div
                style={{
                  color: '#94A3B8',
                  fontSize: '0.8rem',
                  marginBottom: '8px'
                }}
              >
                Interventions
              </div>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  color: '#CBD5E1'
                }}
              >
                {generatedPlan.goal1.interventions.map(
                  (item, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: '6px'
                      }}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Goal 2 */}
            <div
              style={{
                background:
                  'rgba(15,23,42,0.7)',
                border:
                  '1px solid rgba(16,185,129,0.25)',
                borderRadius: '12px',
                padding: '20px'
              }}
            >
              <span
                style={{
                  color: '#34D399',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                GOAL 2
              </span>

              <h3
                style={{
                  color: '#FFFFFF',
                  fontSize: '1.2rem',
                  margin: '10px 0'
                }}
              >
                {generatedPlan.goal2.title}
              </h3>

              <div
                style={{
                  color: '#94A3B8',
                  fontSize: '0.8rem',
                  marginBottom: '8px'
                }}
              >
                Interventions
              </div>

              <ul
                style={{
                  margin: 0,
                  paddingLeft: '18px',
                  color: '#CBD5E1'
                }}
              >
                {generatedPlan.goal2.interventions.map(
                  (item, index) => (
                    <li
                      key={index}
                      style={{
                        marginBottom: '6px'
                      }}
                    >
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* Predicted outcome */}
          <div
            style={{
              background:
                'rgba(30,41,59,0.5)',
              border:
                '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '18px 20px'
            }}
          >
            <div
              style={{
                color: '#94A3B8',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}
            >
              Predicted Outcome
            </div>

            <div
              style={{
                marginTop: '6px',
                color: '#FFFFFF',
                fontSize: '1.1rem',
                fontWeight: 700
              }}
            >
              {generatedPlan.predictedOutcome.metric}
            </div>

            <div
              style={{
                color: '#38BDF8',
                fontSize: '1.2rem',
                fontWeight: 700,
                marginTop: '4px'
              }}
            >
              {generatedPlan.predictedOutcome.value}
            </div>

            <p
              style={{
                color: '#94A3B8',
                fontSize: '0.8rem',
                margin: '5px 0 0'
              }}
            >
              {generatedPlan.predictedOutcome.note}
            </p>
          </div>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              borderTop:
                '1px solid rgba(255,255,255,0.08)',
              paddingTop: '16px',
              flexWrap: 'wrap'
            }}
          >
            <button
              id="btn-validate-plan"
              className="btn btn-secondary"
              onClick={handleValidatePlan}
            >
              Validate Plan
            </button>

            <button
              id="btn-save-careplan"
              className="btn btn-success"
              onClick={handleSaveCareplan}
            >
              Save Careplan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};