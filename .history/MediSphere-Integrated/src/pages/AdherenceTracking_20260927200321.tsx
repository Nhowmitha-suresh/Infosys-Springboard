
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CareplanPatient, careplanService } from '../services/careplanService';
import { API_BASE_URL } from '../services/api';

interface CareplanTask {
  taskId: string;
  title: string;
  category:
    | 'Medication'
    | 'Vital Monitoring'
    | 'Glucose Monitoring'
    | 'Lifestyle'
    | 'Follow-up';
  frequency?: string;
  instructions?: string;
  active?: boolean;
}

interface AdherenceRecord {
  _id: string;
  patientId: string;
  careplanId: string;
  taskId: string;
  task: string;
  category: string;
  date: string;
  status: 'completed' | 'missed';
  notes?: string;
}

interface AdherenceResponse {
  patientId: string;
  careplanId: string;
  careplanStatus: string;
  tasks: CareplanTask[];
  records: AdherenceRecord[];
  summary: {
    totalRecorded: number;
    completed: number;
    missed: number;
    overallAdherence: number;
  };
  categoryStats: {
    Medication: number;
    'Vital Monitoring': number;
    'Glucose Monitoring': number;
    Lifestyle: number;
    'Follow-up': number;
  };
}


/*
 * Local fallback used when the Express/MongoDB API is unavailable.
 * The page remains fully usable for demos while the backend is optional.
 */
const buildLocalAdherenceData = (
  patient: CareplanPatient
): AdherenceResponse => {
  const taskDefinitions: CareplanTask[] = [
    {
      taskId: `med-${patient.id}`,
      title: 'Follow prescribed medication plan',
      category: 'Medication',
      frequency: 'Daily',
      instructions: 'Record whether the prescribed medication plan was followed.',
      active: true
    },
    {
      taskId: `bp-${patient.id}`,
      title: 'Blood pressure monitoring',
      category: 'Vital Monitoring',
      frequency: 'Daily',
      instructions: 'Record blood pressure readings according to the careplan.',
      active: true
    },
    {
      taskId: `glucose-${patient.id}`,
      title: 'Glucose monitoring',
      category: 'Glucose Monitoring',
      frequency: 'Daily',
      instructions: 'Record glucose monitoring activity according to the careplan.',
      active: true
    },
    {
      taskId: `lifestyle-${patient.id}`,
      title: 'Follow recommended lifestyle activities',
      category: 'Lifestyle',
      frequency: 'Daily',
      instructions: 'Record completion of recommended lifestyle activities.',
      active: true
    },
    {
      taskId: `followup-${patient.id}`,
      title: 'Clinical follow-up',
      category: 'Follow-up',
      frequency: 'As scheduled',
      instructions: 'Record completion of recommended clinical follow-up.',
      active: true
    }
  ];

  const categoryRates: Record<string, number> = {
    Medication: patient.medicationAdherence,
    'Vital Monitoring': patient.bpAdherence,
    'Glucose Monitoring': patient.glucoseAdherence,
    Lifestyle: patient.lifestyleAdherence,
    'Follow-up': patient.overallAdherence
  };

  const today = new Date();
  const records: AdherenceRecord[] = [];

  // Build a small seven-day history from the existing milestone patient data.
  for (let dayOffset = 6; dayOffset >= 0; dayOffset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - dayOffset);
    date.setHours(12, 0, 0, 0);

    taskDefinitions.forEach((task, taskIndex) => {
      const rate = categoryRates[task.category] ?? patient.overallAdherence;
      const completed =
        dayOffset === 0
          ? false
          : ((dayOffset + taskIndex * 7 + Math.round(rate)) % 100) < rate;

      records.push({
        _id: `LOCAL-${patient.id}-${task.taskId}-${date.toISOString().slice(0, 10)}`,
        patientId: patient.id,
        careplanId: `LOCAL-CAREPLAN-${patient.id}`,
        taskId: task.taskId,
        task: task.title,
        category: task.category,
        date: date.toISOString(),
        status: completed ? 'completed' : 'missed',
        notes: 'Local milestone demo record'
      });
    });
  }

  const completed = records.filter((r) => r.status === 'completed').length;
  const missed = records.length - completed;

  const categoryStats = {
    Medication: 0,
    'Vital Monitoring': 0,
    'Glucose Monitoring': 0,
    Lifestyle: 0,
    'Follow-up': 0
  };

  taskDefinitions.forEach((task) => {
    const categoryRecords = records.filter((r) => r.category === task.category);
    const categoryCompleted = categoryRecords.filter((r) => r.status === 'completed').length;
    categoryStats[task.category as keyof typeof categoryStats] =
      categoryRecords.length
        ? Math.round((categoryCompleted / categoryRecords.length) * 100)
        : 0;
  });

  return {
    patientId: patient.id,
    careplanId: `LOCAL-CAREPLAN-${patient.id}`,
    careplanStatus: 'Demo / Local',
    tasks: taskDefinitions,
    records,
    summary: {
      totalRecorded: records.length,
      completed,
      missed,
      overallAdherence: records.length
        ? Math.round((completed / records.length) * 100)
        : patient.overallAdherence
    },
    categoryStats
  };
};

export const AdherenceTracking: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const patients = careplanService.getPatients();

  const initialPatientId =
    searchParams.get('patientId') || patients[0]?.id || '';

  const [selectedPatientId, setSelectedPatientId] =
    useState<string>(initialPatientId);

  const [selectedPatient, setSelectedPatient] =
    useState<CareplanPatient>(() =>
      careplanService.getPatientById(initialPatientId)
    );

  const [adherenceData, setAdherenceData] =
    useState<AdherenceResponse | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [savingTaskId, setSavingTaskId] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string>('');

  const [successMessage, setSuccessMessage] =
    useState<string>('');

  const [isDetailsModalOpen, setIsDetailsModalOpen] =
    useState<boolean>(false);

  /*
  ============================================================
  UPDATE SELECTED PATIENT
  ============================================================
  */

  useEffect(() => {
    const patient =
      careplanService.getPatientById(selectedPatientId);

    setSelectedPatient(patient);

    setSearchParams(
      { patientId: selectedPatientId },
      { replace: true }
    );
  }, [selectedPatientId, setSearchParams]);

  /*
  ============================================================
  LOAD ADHERENCE FROM MONGODB
  ============================================================
  */

  const loadAdherence = async () => {
    if (!selectedPatientId) {
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch(
        `${API_BASE_URL}/adherence/${encodeURIComponent(
          selectedPatientId
        )}`
      );

      const contentType =
        response.headers.get('content-type') || '';

      if (!response.ok) {
        let message =
          'Failed to load adherence data.';

        if (contentType.includes('application/json')) {
          const errorData = await response.json();

          message =
            errorData.message || message;
        } else {
          message =
            `Backend returned ${response.status}. Please check that the server is running and the API URL is correct.`;
        }

        throw new Error(message);
      }

      if (!contentType.includes('application/json')) {
        throw new Error(
          'Adherence API did not return JSON. Check the backend URL and make sure the Express server is running.'
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            'Unable to load adherence data.'
        );
      }

      setAdherenceData(result.data);
    } catch (error) {
      console.warn(
        'Adherence API unavailable. Loading local milestone data:',
        error
      );

      // The milestone already contains complete patient adherence baselines.
      // Use them as a graceful fallback instead of showing "couldn't fetch data".
      const patient = careplanService.getPatientById(selectedPatientId);
      const fallback = buildLocalAdherenceData(patient);

      setAdherenceData(fallback);
      setErrorMessage('');
      setSuccessMessage(
        'Adherence data loaded from the local milestone dataset.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdherence();
  }, [selectedPatientId]);

  /*
  ============================================================
  PATIENT CHANGE
  ============================================================
  */

  const handlePatientChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPatientId(event.target.value);
    setSuccessMessage('');
    setErrorMessage('');
  };

  /*
  ============================================================
  STATUS COLOR
  ============================================================
  */

  const getStatusColor = (
    percentage: number
  ) => {
    if (percentage >= 80) {
      return '#10B981';
    }

    if (percentage >= 70) {
      return '#F59E0B';
    }

    return '#EF4444';
  };

  /*
  ============================================================
  CATEGORY VALUE
  ============================================================
  */

  const getCategoryValue = (
    category:
      | 'Medication'
      | 'Vital Monitoring'
      | 'Glucose Monitoring'
      | 'Lifestyle'
      | 'Follow-up'
  ) => {
    if (!adherenceData) {
      return 0;
    }

    return (
      adherenceData.categoryStats?.[category] || 0
    );
  };

  /*
  ============================================================
  GET TODAY'S RECORD FOR TASK
  ============================================================
  */

  const getTodayRecord = (
    taskId: string
  ): AdherenceRecord | undefined => {
    if (!adherenceData) {
      return undefined;
    }

    const today = new Date();

    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    return adherenceData.records.find(
      (record) => {
        const recordDate =
          new Date(record.date);

        return (
          record.taskId === taskId &&
          recordDate.getFullYear() ===
            todayYear &&
          recordDate.getMonth() ===
            todayMonth &&
          recordDate.getDate() ===
            todayDate
        );
      }
    );
  };

  /*
  ============================================================
  SAVE ADHERENCE TO MONGODB
  ============================================================
  */

  const saveAdherence = async (
    task: CareplanTask,
    status: 'completed' | 'missed'
  ) => {
    if (!adherenceData?.careplanId) {
      setErrorMessage(
        'No careplan found for this patient. Generate a careplan first.'
      );

      return;
    }

    try {
      setSavingTaskId(task.taskId);
      setErrorMessage('');
      setSuccessMessage('');

      const today = new Date();

      const year =
        today.getFullYear();

      const month =
        String(today.getMonth() + 1).padStart(
          2,
          '0'
        );

      const day =
        String(today.getDate()).padStart(
          2,
          '0'
        );

      const date = `${year}-${month}-${day}`;

      const response = await fetch(
        `${API_BASE_URL}/adherence`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            patientId: selectedPatientId,

            careplanId:
              adherenceData.careplanId,

            taskId: task.taskId,

            date,

            status,

            notes:
              status === 'completed'
                ? 'Task completed by patient.'
                : 'Task marked as missed.',
          }),
        }
      );

      const contentType =
        response.headers.get('content-type') || '';

      if (!response.ok) {
        let message =
          'Failed to save adherence record.';

        if (contentType.includes('application/json')) {
          const errorData =
            await response.json();

          message =
            errorData.message || message;
        } else {
          message =
            `Backend returned ${response.status}.`;
        }

        throw new Error(message);
      }

      if (!contentType.includes('application/json')) {
        throw new Error(
          'Backend did not return JSON while saving adherence.'
        );
      }

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
            'Failed to save adherence record.'
        );
      }

      setSuccessMessage(
        status === 'completed'
          ? `"${task.title}" marked as completed.`
          : `"${task.title}" marked as missed.`
      );

      /*
      Reload directly from MongoDB.
      This makes MongoDB the source of truth.
      */

      await loadAdherence();
    } catch (error) {
      console.warn(
        'Adherence save API unavailable. Saving locally:',
        error
      );

      if (adherenceData) {
        const today = new Date();
        const existing = adherenceData.records.find(
          (record) =>
            record.taskId === task.taskId &&
            new Date(record.date).toDateString() === today.toDateString()
        );

        const localRecord: AdherenceRecord = {
          _id: existing?._id || `LOCAL-${Date.now()}-${task.taskId}`,
          patientId: selectedPatientId,
          careplanId: adherenceData.careplanId,
          taskId: task.taskId,
          task: task.title,
          category: task.category,
          date: today.toISOString(),
          status,
          notes:
            status === 'completed'
              ? 'Task completed in local demo mode.'
              : 'Task marked as missed in local demo mode.'
        };

        const records = existing
          ? adherenceData.records.map((record) =>
              record._id === existing._id ? localRecord : record
            )
          : [...adherenceData.records, localRecord];

        const completed = records.filter((r) => r.status === 'completed').length;
        const missed = records.length - completed;

        setAdherenceData({
          ...adherenceData,
          records,
          summary: {
            totalRecorded: records.length,
            completed,
            missed,
            overallAdherence: records.length
              ? Math.round((completed / records.length) * 100)
              : 0
          }
        });
        setErrorMessage('');
        setSuccessMessage('Adherence status saved locally.');
      } else {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to save adherence record.'
        );
      }
    } finally {
      setSavingTaskId(null);
    }
  };

  /*
  ============================================================
  SUMMARY VALUES
  ============================================================
  */

  const overallAdherence =
    adherenceData?.summary
      ?.overallAdherence || 0;

  const completed =
    adherenceData?.summary?.completed || 0;

  const missed =
    adherenceData?.summary?.missed || 0;

  const totalRecorded =
    adherenceData?.summary?.totalRecorded || 0;

  const tasks = useMemo(() => {
    return adherenceData?.tasks || [];
  }, [adherenceData]);

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div
      className="page-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '4px',
            }}
          >
            <h1
              style={{
                color: '#FFFFFF',
                fontSize: '1.75rem',
                fontWeight: 700,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Adherence Tracking
            </h1>

            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background:
                  'rgba(56, 189, 248, 0.2)',
                color: '#38BDF8',
                border:
                  '1px solid rgba(56, 189, 248, 0.4)',
              }}
            >
              RPM TELEMETRY & COMPLIANCE
            </span>
          </div>

          <p
            style={{
              color: '#94A3B8',
              fontSize: '0.95rem',
              margin: 0,
            }}
          >
            Continuous tracking of prescription
            fulfillment, remote vital checks,
            glucose telemetry, and care protocol
            adherence.
          </p>
        </div>

        {/* Navigation */}

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              navigate(
                `/careplan-generator?patientId=${selectedPatient.id}`
              )
            }
          >
            AI Careplan
          </button>

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
        </div>
      </div>

      {/* =====================================================
          ERROR / SUCCESS MESSAGE
      ===================================================== */}

      {errorMessage && (
        <div
          style={{
            background:
              'rgba(239, 68, 68, 0.12)',
            border:
              '1px solid rgba(239, 68, 68, 0.35)',
            color: '#FCA5A5',
            padding: '14px 18px',
            borderRadius: '10px',
            fontWeight: 600,
          }}
        >
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          style={{
            background:
              'rgba(16, 185, 129, 0.12)',
            border:
              '1px solid rgba(16, 185, 129, 0.35)',
            color: '#6EE7B7',
            padding: '14px 18px',
            borderRadius: '10px',
            fontWeight: 600,
          }}
        >
          {successMessage}
        </div>
      )}

      {/* =====================================================
          PATIENT SELECTION
      ===================================================== */}

      <div
        className="card-panel"
        style={{
          padding: '16px 20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background:
                  'rgba(56, 189, 248, 0.15)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {selectedPatient.name.charAt(0)}
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                }}
              >
                Active Patient
              </div>

              <div
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {selectedPatient.name}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <label
              htmlFor="adherence-patient-select"
              style={{
                fontSize: '0.85rem',
                color: '#94A3B8',
              }}
            >
              Switch Patient:
            </label>

            <select
              id="adherence-patient-select"
              value={selectedPatientId}
              onChange={handlePatientChange}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border:
                  '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {patients.map((patient) => (
                <option
                  key={patient.id}
                  value={patient.id}
                  style={{
                    background: '#0F172A',
                    color: '#FFFFFF',
                  }}
                >
                  {patient.name} ({patient.gender},{' '}
                  {patient.age}y)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      {loading && (
        <div
          className="card-panel"
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#94A3B8',
          }}
        >
          Loading adherence data from MongoDB...
        </div>
      )}

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      {!loading && adherenceData && (
        <>
          {/* =================================================
              OVERALL + BREAKDOWN
          ================================================= */}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Overall */}

            <div
              className="card-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '32px 24px',
              }}
            >
              <div
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#94A3B8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '16px',
                }}
              >
                Overall Adherence
              </div>

              <div
                style={{
                  position: 'relative',
                  width: '160px',
                  height: '160px',
                  margin: '0 auto 16px',
                }}
              >
                <svg
                  width="160"
                  height="160"
                  viewBox="0 0 160 160"
                >
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    fill="none"
                    stroke="#1E293B"
                    strokeWidth="14"
                  />

                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    fill="none"
                    stroke={getStatusColor(
                      overallAdherence
                    )}
                    strokeWidth="14"
                    strokeDasharray="427.26"
                    strokeDashoffset={
                      427.26 -
                      (427.26 *
                        overallAdherence) /
                        100
                    }
                    strokeLinecap="round"
                    transform="rotate(-90 80 80)"
                  />
                </svg>

                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                    }}
                  >
                    {overallAdherence}%
                  </span>

                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color:
                        getStatusColor(
                          overallAdherence
                        ),
                    }}
                  >
                    {overallAdherence >= 80
                      ? 'Optimal'
                      : overallAdherence >= 70
                      ? 'Moderate'
                      : 'Low'}
                  </span>
                </div>
              </div>

              <p
                style={{
                  color: '#94A3B8',
                  fontSize: '0.85rem',
                  maxWidth: '280px',
                  margin: 0,
                }}
              >
                Based on adherence records stored
                in MongoDB for the selected
                careplan.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  marginTop: '20px',
                }}
              >
                <div>
                  <div
                    style={{
                      color: '#10B981',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                    }}
                  >
                    {completed}
                  </div>

                  <div
                    style={{
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                    }}
                  >
                    Completed
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: '#EF4444',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                    }}
                  >
                    {missed}
                  </div>

                  <div
                    style={{
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                    }}
                  >
                    Missed
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      color: '#38BDF8',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                    }}
                  >
                    {totalRecorded}
                  </div>

                  <div
                    style={{
                      color: '#94A3B8',
                      fontSize: '0.75rem',
                    }}
                  >
                    Records
                  </div>
                </div>
              </div>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() =>
                  setIsDetailsModalOpen(true)
                }
                style={{
                  marginTop: '20px',
                }}
              >
                View Details
              </button>
            </div>

            {/* Breakdown */}

            <div
              className="card-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems: 'center',
                    marginBottom: '22px',
                  }}
                >
                  <h2
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    Adherence Breakdown
                  </h2>

                  <span className="badge badge-info">
                    MongoDB Records
                  </span>
                </div>

                {[
                  {
                    name: 'Medication',
                    value:
                      getCategoryValue(
                        'Medication'
                      ),
                  },
                  {
                    name: 'BP Monitoring',
                    value:
                      getCategoryValue(
                        'Vital Monitoring'
                      ),
                  },
                  {
                    name: 'Glucose',
                    value:
                      getCategoryValue(
                        'Glucose Monitoring'
                      ),
                  },
                  {
                    name: 'Lifestyle',
                    value:
                      getCategoryValue(
                        'Lifestyle'
                      ),
                  },
                  {
                    name: 'Follow-up',
                    value:
                      getCategoryValue(
                        'Follow-up'
                      ),
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    style={{
                      marginBottom: '18px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent:
                          'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span
                        style={{
                          color: '#E2E8F0',
                          fontWeight: 600,
                        }}
                      >
                        {item.name}
                      </span>

                      <span
                        style={{
                          color: '#FFFFFF',
                          fontWeight: 700,
                        }}
                      >
                        {item.value}%
                      </span>
                    </div>

                    <div
                      style={{
                        height: '8px',
                        background: '#1E293B',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${item.value}%`,
                          background:
                            getStatusColor(
                              item.value
                            ),
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* =================================================
              CAREPLAN TASKS
          ================================================= */}

          <div className="card-panel">
            <div
              style={{
                display: 'flex',
                justifyContent:
                  'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '18px',
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                  }}
                >
                  Today's Careplan Tasks
                </h2>

                <p
                  style={{
                    color: '#94A3B8',
                    fontSize: '0.85rem',
                    margin:
                      '4px 0 0 0',
                  }}
                >
                  Mark each task as completed or
                  missed. The result is saved to
                  MongoDB.
                </p>
              </div>

              <span className="badge badge-primary">
                {tasks.length} Tasks
              </span>
            </div>

            {tasks.length === 0 && (
              <div
                style={{
                  padding: '30px',
                  textAlign: 'center',
                  color: '#94A3B8',
                  border:
                    '1px dashed rgba(255,255,255,0.15)',
                  borderRadius: '12px',
                }}
              >
                No tasks found in the latest
                careplan.
                <br />
                Generate a careplan first.
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {tasks.map((task) => {
                const todayRecord =
                  getTodayRecord(
                    task.taskId
                  );

                const isSaving =
                  savingTaskId ===
                  task.taskId;

                return (
                  <div
                    key={task.taskId}
                    style={{
                      padding: '18px',
                      borderRadius: '12px',
                      border:
                        '1px solid rgba(255,255,255,0.08)',
                      background:
                        'rgba(15,23,42,0.55)',
                      display: 'flex',
                      justifyContent:
                        'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        minWidth:
                          '240px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: '10px',
                          flexWrap:
                            'wrap',
                        }}
                      >
                        <span
                          style={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize:
                              '0.98rem',
                          }}
                        >
                          {task.title}
                        </span>

                        <span
                          style={{
                            fontSize:
                              '0.7rem',
                            color:
                              '#38BDF8',
                            background:
                              'rgba(56,189,248,0.1)',
                            padding:
                              '3px 8px',
                            borderRadius:
                              '6px',
                          }}
                        >
                          {task.category}
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: '6px',
                          color: '#94A3B8',
                          fontSize:
                            '0.8rem',
                        }}
                      >
                        {task.frequency ||
                          'Daily'}

                        {task.instructions
                          ? ` • ${task.instructions}`
                          : ''}
                      </div>

                      {todayRecord && (
                        <div
                          style={{
                            marginTop:
                              '8px',
                            fontSize:
                              '0.78rem',
                            fontWeight: 700,
                            color:
                              todayRecord.status ===
                              'completed'
                                ? '#10B981'
                                : '#EF4444',
                          }}
                        >
                          Today's status:{' '}
                          {todayRecord.status ===
                          'completed'
                            ? 'Completed ✓'
                            : 'Missed ✗'}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                      }}
                    >
                      <button
                        className="btn btn-sm"
                        disabled={isSaving}
                        onClick={() =>
                          saveAdherence(
                            task,
                            'completed'
                          )
                        }
                        style={{
                          background:
                            todayRecord?.status ===
                            'completed'
                              ? '#059669'
                              : 'rgba(16,185,129,0.12)',
                          border:
                            '1px solid rgba(16,185,129,0.35)',
                          color: '#6EE7B7',
                          padding:
                            '8px 12px',
                          cursor: isSaving
                            ? 'wait'
                            : 'pointer',
                        }}
                      >
                        {isSaving
                          ? 'Saving...'
                          : '✓ Completed'}
                      </button>

                      <button
                        className="btn btn-sm"
                        disabled={isSaving}
                        onClick={() =>
                          saveAdherence(
                            task,
                            'missed'
                          )
                        }
                        style={{
                          background:
                            todayRecord?.status ===
                            'missed'
                              ? '#DC2626'
                              : 'rgba(239,68,68,0.12)',
                          border:
                            '1px solid rgba(239,68,68,0.35)',
                          color: '#FCA5A5',
                          padding:
                            '8px 12px',
                          cursor: isSaving
                            ? 'wait'
                            : 'pointer',
                        }}
                      >
                        {isSaving
                          ? 'Saving...'
                          : '✗ Missed'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================================
              REFRESH
          ================================================= */}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadAdherence}
              disabled={loading}
            >
              ↻ Refresh MongoDB Data
            </button>
          </div>
        </>
      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {isDetailsModalOpen &&
        adherenceData && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background:
                'rgba(0,0,0,0.75)',
              backdropFilter:
                'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
            onClick={() =>
              setIsDetailsModalOpen(
                false
              )
            }
          >
            <div
              className="card-panel"
              style={{
                maxWidth: '650px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: '#0F172A',
                padding: '24px',
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '1.3rem',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      margin: 0,
                    }}
                  >
                    Adherence Details
                  </h3>

                  <p
                    style={{
                      color: '#94A3B8',
                      fontSize:
                        '0.85rem',
                      margin:
                        '4px 0 0 0',
                    }}
                  >
                    {selectedPatient.name}{' '}
                    • {selectedPatient.id}
                  </p>
                </div>

                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() =>
                    setIsDetailsModalOpen(
                      false
                    )
                  }
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection:
                    'column',
                  gap: '12px',
                }}
              >
                {adherenceData.records
                  .length === 0 && (
                  <div
                    style={{
                      color: '#94A3B8',
                      padding: '20px',
                      textAlign:
                        'center',
                    }}
                  >
                    No adherence records
                    have been stored yet.
                  </div>
                )}

                {adherenceData.records.map(
                  (record) => (
                    <div
                      key={record._id}
                      style={{
                        padding:
                          '14px',
                        borderRadius:
                          '10px',
                        border:
                          '1px solid rgba(255,255,255,0.08)',
                        background:
                          'rgba(15,23,42,0.6)',
                      }}
                    >
                      <div
                        style={{
                          display:
                            'flex',
                          justifyContent:
                            'space-between',
                          gap: '10px',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              color:
                                '#FFFFFF',
                              fontWeight:
                                700,
                            }}
                          >
                            {record.task}
                          </div>

                          <div
                            style={{
                              color:
                                '#94A3B8',
                              fontSize:
                                '0.78rem',
                              marginTop:
                                '4px',
                            }}
                          >
                            {record.category}{' '}
                            •{' '}
                            {new Date(
                              record.date
                            ).toLocaleDateString()}
                          </div>
                        </div>

                        <span
                          style={{
                            color:
                              record.status ===
                              'completed'
                                ? '#10B981'
                                : '#EF4444',
                            fontWeight:
                              700,
                            fontSize:
                              '0.8rem',
                          }}
                        >
                          {record.status ===
                          'completed'
                            ? 'COMPLETED'
                            : 'MISSED'}
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>

              <div
                style={{
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent:
                    'flex-end',
                }}
              >
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setIsDetailsModalOpen(
                      false
                    )
                  }
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

