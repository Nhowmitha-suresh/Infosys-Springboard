import React, { useState } from 'react';
import { Column, DataTable } from '../components/DataTable';
import { MediModal } from '../components/Modal';
import { API_BASE_URL } from '../services/api';
import { MediStorage } from '../services/storage';
import { Patient } from '../types';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>(
    MediStorage.getPatients()
  );

  const [showAddDetails, setShowAddDetails] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [heartbeat, setHeartbeat] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [spo2, setSpo2] = useState('');
  const [temperature, setTemperature] = useState('');
  const [savingVitals, setSavingVitals] = useState(false);

  const refreshPatients = () => {
    setPatients(MediStorage.getPatients());
  };

  const closeAddDetails = () => {
    setShowAddDetails(false);
    setSelectedPatientId('');
    setHeartbeat('');
    setBloodPressure('');
    setSpo2('');
    setTemperature('');
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatientId) {
      alert('Please select a patient.');
      return;
    }

    const patient = patients.find(
      p => p.id === selectedPatientId
    );

    if (!patient) {
      alert('Patient not found.');
      return;
    }

    const heartRate = Number(heartbeat);
    const oxygen = Number(spo2);
    const temp = Number(temperature);

    if (!Number.isFinite(heartRate) || heartRate <= 0) {
      alert('Please enter a valid heart rate.');
      return;
    }

    if (!bloodPressure.trim()) {
      alert('Please enter blood pressure.');
      return;
    }

    if (!Number.isFinite(oxygen) || oxygen <= 0 || oxygen > 100) {
      alert('Please enter a valid SpO₂ value.');
      return;
    }

    if (!Number.isFinite(temp) || temp <= 0) {
      alert('Please enter a valid temperature.');
      return;
    }

    setSavingVitals(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/vitals`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patientId: patient.id,
            patientName: patient.name,
            age: patient.age,
            room: patient.hospital || '',
            heartRate,
            bloodPressure: bloodPressure.trim(),
            spo2: oxygen,
            temperature: temp,
            timestamp: new Date().toISOString()
          })
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
          `Failed to save vitals: HTTP ${response.status}`
        );
      }

      alert(`Vitals saved for ${patient.name}`);

      closeAddDetails();
      refreshPatients();
    } catch (error: any) {
      console.error('Vitals API error:', error);

      alert(
        error?.message ||
        'Unable to save vitals to the backend.'
      );
    } finally {
      setSavingVitals(false);
    }
  };

  const columns: Column<Patient>[] = [
    {
      key: 'id',
      label: 'Patient ID'
    },
    {
      key: 'name',
      label: 'Patient Name'
    },
    {
      key: 'age',
      label: 'Age / Gender',
      render: (_, r) =>
        `${r.age} yrs, ${r.gender}`
    },
    {
      key: 'bloodGroup',
      label: 'Blood Group',
      render: v => (
        <span className="badge badge-primary">
          {v}
        </span>
      )
    },
    {
      key: 'hospital',
      label: 'Hospital Unit'
    },
    {
      key: 'assignedDoctor',
      label: 'Assigned Doctor'
    },
    {
      key: 'twinCompleteness',
      label: 'Digital Twin %',
      render: v => (
        <span
          style={{
            fontWeight: 700,
            color:
              v >= 90
                ? '#10B981'
                : '#F59E0B'
          }}
        >
          {v}%
        </span>
      )
    },
    {
      key: 'vitals',
      label: 'Current Vitals',
      render: v =>
        v
          ? `${v.bp} | HR ${v.hr} | SpO₂ ${v.spo2}%`
          : 'N/A'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, r) => (
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap'
          }}
        >
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              MediModal.openRecordVitals(
                r.id,
                r.name,
                refreshPatients
              )
            }
          >
            Vitals
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() =>
              MediModal.openBookAppointment(r.name)
            }
          >
            Book
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSelectedPatientId(r.id);

              setHeartbeat(
                r.vitals?.hr
                  ? String(r.vitals.hr)
                  : ''
              );

              setBloodPressure(
                r.vitals?.bp || ''
              );

              setSpo2(
                r.vitals?.spo2
                  ? String(r.vitals.spo2)
                  : ''
              );

              setTemperature(
                r.vitals?.temp
                  ? String(r.vitals.temp)
                  : ''
              );

              setShowAddDetails(true);
            }}
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-fade-in">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '20px'
        }}
      >
        <div>
          <h1
            style={{
              color: '#FFF',
              fontSize: '1.6rem',
              margin: 0
            }}
          >
            Patient Directory & Registry
          </h1>

          <p
            style={{
              color: '#9CA3AF',
              margin: '4px 0 0',
              fontSize: '0.9rem'
            }}
          >
            Registered Karnataka Patients,
            Health Profile Records & Vitals History
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexShrink: 0
          }}
        >
          <button
            className="btn btn-primary"
            onClick={() =>
              MediModal.openAddPatient(
                refreshPatients
              )
            }
          >
            + Register New Patient
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => {
              closeAddDetails();
              setShowAddDetails(true);
            }}
          >
            + Add Details
          </button>
        </div>
      </div>

      <div className="card-panel">
        <DataTable
          data={patients}
          columns={columns}
          pageSize={10}
          exportFilename="medisphere_patient_registry.csv"
        />
      </div>

      {showAddDetails && (
        <>
          <style>
            {`
              .patient-details-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                background: rgba(2, 6, 23, 0.78);
                backdrop-filter: blur(5px);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                overflow-y: auto;
              }

              .patient-details-modal {
                width: 100%;
                max-width: 760px;
                max-height: calc(100vh - 48px);
                background: #0f172a;
                border: 1px solid rgba(148, 163, 184, 0.22);
                border-radius: 18px;
                box-shadow:
                  0 25px 70px rgba(0, 0, 0, 0.55),
                  0 0 0 1px rgba(255,255,255,0.02);
                display: flex;
                flex-direction: column;
                overflow: hidden;
              }

              .patient-details-header {
                padding: 26px 30px 20px;
                border-bottom: 1px solid rgba(148, 163, 184, 0.15);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-shrink: 0;
              }

              .patient-details-title {
                margin: 0;
                color: #ffffff;
                font-size: 1.45rem;
                font-weight: 700;
              }

              .patient-details-close {
                width: 36px;
                height: 36px;
                border: none;
                background: transparent;
                color: #94a3b8;
                font-size: 28px;
                line-height: 1;
                cursor: pointer;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
              }

              .patient-details-close:hover {
                background: rgba(255,255,255,0.06);
                color: #ffffff;
              }

              .patient-details-body {
                padding: 26px 30px;
                overflow-y: auto;
              }

              .patient-details-form {
                display: flex;
                flex-direction: column;
                gap: 20px;
              }

              .patient-details-field {
                display: flex;
                flex-direction: column;
                min-width: 0;
              }

              .patient-details-grid {
                display: grid;
                grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
                gap: 20px 24px;
              }

              .patient-details-label {
                display: block;
                margin-bottom: 8px;
                color: #aeb7c7;
                font-size: 0.78rem;
                font-weight: 700;
                letter-spacing: 0.04em;
                text-transform: uppercase;
              }

              .patient-details-input,
              .patient-details-select {
                width: 100%;
                height: 54px;
                box-sizing: border-box;
                padding: 0 16px;
                border-radius: 11px;
                border: 1px solid rgba(148, 163, 184, 0.22);
                background: #111b30;
                color: #f8fafc;
                font-size: 0.98rem;
                outline: none;
              }

              .patient-details-input:focus,
              .patient-details-select:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
              }

              .patient-details-input::placeholder {
                color: #64748b;
              }

              .patient-details-select {
                appearance: auto;
                cursor: pointer;
              }

              .patient-details-footer {
                padding: 20px 30px 26px;
                border-top: 1px solid rgba(148, 163, 184, 0.15);
                display: flex;
                gap: 12px;
                justify-content: flex-end;
                flex-shrink: 0;
              }

              .patient-details-footer button {
                min-width: 130px;
              }

              @media (max-width: 700px) {
                .patient-details-overlay {
                  padding: 12px;
                  align-items: flex-start;
                }

                .patient-details-modal {
                  max-height: calc(100vh - 24px);
                  border-radius: 14px;
                }

                .patient-details-header {
                  padding: 20px;
                }

                .patient-details-body {
                  padding: 20px;
                }

                .patient-details-grid {
                  grid-template-columns: 1fr;
                  gap: 18px;
                }

                .patient-details-footer {
                  padding: 16px 20px 20px;
                  flex-direction: column-reverse;
                }

                .patient-details-footer button {
                  width: 100%;
                }
              }
            `}
          </style>

          <div
            className="patient-details-overlay"
            onMouseDown={e => {
              if (e.target === e.currentTarget) {
                closeAddDetails();
              }
            }}
          >
            <div
              className="patient-details-modal"
              role="dialog"
              aria-modal="true"
            >
              <div className="patient-details-header">
                <h2 className="patient-details-title">
                  {selectedPatientId
                    ? 'Edit Patient Details'
                    : 'Add Patient Details'}
                </h2>

                <button
                  type="button"
                  className="patient-details-close"
                  onClick={closeAddDetails}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="patient-details-body">
                <form
                  id="patient-details-form"
                  className="patient-details-form"
                  onSubmit={handleSaveDetails}
                >
                  <div className="patient-details-field">
                    <label className="patient-details-label">
                      Patient
                    </label>

                    <select
                      className="patient-details-select"
                      value={selectedPatientId}
                      onChange={e =>
                        setSelectedPatientId(
                          e.target.value
                        )
                      }
                      required
                    >
                      <option value="">
                        Select Registered Patient
                      </option>

                      {patients.map(patient => (
                        <option
                          key={patient.id}
                          value={patient.id}
                        >
                          {patient.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="patient-details-grid">
                    <div className="patient-details-field">
                      <label className="patient-details-label">
                        Heart Rate
                      </label>

                      <input
                        className="patient-details-input"
                        type="number"
                        min="1"
                        max="300"
                        value={heartbeat}
                        onChange={e =>
                          setHeartbeat(e.target.value)
                        }
                        placeholder="e.g. 80"
                        required
                      />
                    </div>

                    <div className="patient-details-field">
                      <label className="patient-details-label">
                        Blood Pressure
                      </label>

                      <input
                        className="patient-details-input"
                        type="text"
                        value={bloodPressure}
                        onChange={e =>
                          setBloodPressure(e.target.value)
                        }
                        placeholder="e.g. 120/80"
                        required
                      />
                    </div>

                    <div className="patient-details-field">
                      <label className="patient-details-label">
                        Oxygen / SpO₂
                      </label>

                      <input
                        className="patient-details-input"
                        type="number"
                        min="1"
                        max="100"
                        value={spo2}
                        onChange={e =>
                          setSpo2(e.target.value)
                        }
                        placeholder="e.g. 98"
                        required
                      />
                    </div>

                    <div className="patient-details-field">
                      <label className="patient-details-label">
                        Temperature °F
                      </label>

                      <input
                        className="patient-details-input"
                        type="number"
                        step="0.1"
                        min="90"
                        max="115"
                        value={temperature}
                        onChange={e =>
                          setTemperature(e.target.value)
                        }
                        placeholder="e.g. 98.6"
                        required
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="patient-details-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeAddDetails}
                  disabled={savingVitals}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  form="patient-details-form"
                  className="btn btn-primary"
                  disabled={savingVitals}
                >
                  {savingVitals
                    ? 'Saving...'
                    : 'Save Details'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};