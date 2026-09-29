import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { careplanService, CareplanPatient } from '../services/careplanService';
import { MediToast } from '../components/Toast';

export const ClinicalGuidelineEngine: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const patients = careplanService.getPatients();

  const initialPatientId = searchParams.get('patientId') || patients[0].id;
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [selectedPatient, setSelectedPatient] = useState<CareplanPatient>(() =>
    careplanService.getPatientById(initialPatientId)
  );

  const [approvalStatus, setApprovalStatus] = useState<'Draft' | 'Approved' | 'Under Review'>(() =>
    careplanService.getApprovalStatus(initialPatientId)
  );
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    const patient = careplanService.getPatientById(selectedPatientId);
    setSelectedPatient(patient);
    setSearchParams({ patientId: selectedPatientId }, { replace: true });
    setApprovalStatus(careplanService.getApprovalStatus(selectedPatientId));
    setActionNotice(null);
  }, [selectedPatientId, setSearchParams]);

  const validationResult = careplanService.validatePatientGuidelines(selectedPatient.id);
  const isCompliant = validationResult.overallStatus === 'GUIDELINE COMPLIANT';

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPatientId(e.target.value);
  };

  const handleApproveCareplan = () => {
    careplanService.setApprovalStatus(selectedPatient.id, 'Approved');
    setApprovalStatus('Approved');
    setActionNotice('Careplan approved.');
    MediToast.success('Careplan approved.');
  };

  const handleSendForReview = () => {
    careplanService.setApprovalStatus(selectedPatient.id, 'Under Review');
    setApprovalStatus('Under Review');
    setActionNotice('Careplan sent for clinical review.');
    MediToast.info('Careplan sent for clinical review.');
  };

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              Clinical Guideline Engine
            </h1>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                border: '1px solid rgba(16, 185, 129, 0.4)'
              }}
            >
              RULE VERIFICATION ENGINE
            </span>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
            Automated verification of careplan goals, pharmacological safety thresholds, and evidence-based clinical protocols.
          </p>
        </div>

        {/* Navigation jump */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/careplan-generator?patientId=${selectedPatient.id}`)}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            AI Careplan
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => navigate(`/adherence-tracking?patientId=${selectedPatient.id}`)}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Adherence Tracking
          </button>
        </div>
      </div>

      {/* Demo Notice Banner */}
      <div
        style={{
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#93C5FD',
          fontSize: '0.85rem'
        }}
      >
        <span style={{ fontSize: '1.25rem' }}>🛡️</span>
        <div>
          <strong style={{ color: '#BFDBFE' }}>Demo Guideline Validation:</strong> All safety heuristics and guideline evaluations are computed using standardized clinical demonstration parameters.
        </div>
      </div>

      {/* Patient Selection Bar */}
      <div className="card-panel" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60A5FA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1.1rem'
              }}
            >
              {selectedPatient.name.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>
                Active Patient
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                {selectedPatient.name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <label htmlFor="guideline-patient-select" style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
              Switch Patient:
            </label>
            <select
              id="guideline-patient-select"
              value={selectedPatientId}
              onChange={handlePatientChange}
              style={{
                background: '#0F172A',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                  {p.name} ({p.gender}, {p.age}y)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overall Status Banner */}
      <div
        style={{
          background: isCompliant
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 95, 70, 0.25) 100%)'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(180, 83, 9, 0.25) 100%)',
          border: isCompliant ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '16px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: isCompliant ? '0 10px 30px rgba(16, 185, 129, 0.1)' : '0 10px 30px rgba(245, 158, 11, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: isCompliant ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              color: isCompliant ? '#10B981' : '#F59E0B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              fontWeight: 800
            }}
          >
            {isCompliant ? '✓' : '⚠'}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: isCompliant ? '#6EE7B7' : '#FDE68A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Guideline Validation Output
            </div>
            <div
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: isCompliant ? '#10B981' : '#F59E0B',
                letterSpacing: '-0.01em',
                margin: '2px 0'
              }}
            >
              {isCompliant ? '✓ GUIDELINE COMPLIANT' : '⚠ REVIEW REQUIRED'}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#CBD5E1' }}>
              {isCompliant
                ? 'All clinical targets, blood pressure benchmarks, and glycemic goals align with verified clinical guidelines.'
                : 'One or more patient metrics exceed standard baseline safety boundaries and require clinical physician review.'}
            </div>
          </div>
        </div>

        {approvalStatus !== 'Draft' && (
          <div
            style={{
              background: approvalStatus === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)',
              border: `1px solid ${approvalStatus === 'Approved' ? '#10B981' : '#60A5FA'}`,
              borderRadius: '10px',
              padding: '8px 16px',
              textAlign: 'right'
            }}
          >
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', textTransform: 'uppercase' }}>Current Workflow State</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: approvalStatus === 'Approved' ? '#10B981' : '#60A5FA' }}>
              {approvalStatus === 'Approved' ? '✓ Careplan Approved' : '⏳ In Clinical Review'}
            </div>
          </div>
        )}
      </div>

      {/* Guideline Rules Section (Clearly visible as requested) */}
      <div className="card-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '1.2rem' }}>📜</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Guideline Rules
          </h2>
          <span className="badge badge-info" style={{ marginLeft: 'auto' }}>
            Active Reference Standards
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}
        >
          {/* Diabetes Rule Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>
                Diabetes Protocol
              </span>
              <span className="badge badge-purple">Standard Guideline</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
              Diabetes
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#F59E0B',
                background: 'rgba(245, 158, 11, 0.1)',
                padding: '8px 12px',
                borderRadius: '8px',
                borderLeft: '3px solid #F59E0B'
              }}
            >
              HbA1c &gt; 7% <span style={{ color: '#E2E8F0', fontWeight: 400 }}>→</span> Increased monitoring
            </div>
          </div>

          {/* Hypertension Rule Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>
                Hypertension Protocol
              </span>
              <span className="badge badge-purple">Standard Guideline</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
              Hypertension
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#38BDF8',
                background: 'rgba(56, 189, 248, 0.1)',
                padding: '8px 12px',
                borderRadius: '8px',
                borderLeft: '3px solid #38BDF8'
              }}
            >
              BP &gt; 130/80 <span style={{ color: '#E2E8F0', fontWeight: 400 }}>→</span> BP monitoring
            </div>
          </div>

          {/* High CVD Risk Rule Card */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', textTransform: 'uppercase' }}>
                Cardiovascular Protocol
              </span>
              <span className="badge badge-purple">Standard Guideline</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', marginTop: '2px' }}>
              High CVD Risk
            </div>
            <div
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '8px 12px',
                borderRadius: '8px',
                borderLeft: '3px solid #EF4444'
              }}
            >
              High CVD Risk <span style={{ color: '#E2E8F0', fontWeight: 400 }}>→</span> Clinical review recommended
            </div>
          </div>
        </div>
      </div>

      {/* Careplan Validation Checks Section */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
              Careplan Validation
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
              Verification checks evaluated against {selectedPatient.name}'s biometric profile.
            </p>
          </div>

          {actionNotice && (
            <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              ✓ {actionNotice}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {validationResult.checks.map((chk) => {
            const isWarning = chk.status === 'warning';
            return (
              <div
                key={chk.id}
                style={{
                  background: isWarning ? 'rgba(245, 158, 11, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                  border: isWarning ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isWarning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: isWarning ? '#F59E0B' : '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1rem',
                      flexShrink: 0
                    }}
                  >
                    {isWarning ? '⚠' : '✓'}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '0.95rem' }}>
                        {isWarning ? '⚠' : '✓'} {chk.title}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#94A3B8'
                        }}
                      >
                        {chk.category}
                      </span>
                    </div>
                    <div style={{ color: isWarning ? '#FDE68A' : '#CBD5E1', fontSize: '0.85rem', marginTop: '4px' }}>
                      {chk.message}
                    </div>
                  </div>
                </div>

                <span className={`badge ${isWarning ? 'badge-warning' : 'badge-success'}`}>
                  {isWarning ? 'Attention Required' : 'Validated'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            marginTop: '20px',
            paddingTop: '16px',
            flexWrap: 'wrap'
          }}
        >
          <button
            id="btn-send-review"
            className="btn btn-secondary"
            onClick={handleSendForReview}
            style={{
              fontSize: '0.875rem',
              padding: '10px 20px',
              borderColor: 'rgba(245, 158, 11, 0.4)'
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Send for Clinical Review</span>
          </button>

          <button
            id="btn-approve-careplan"
            className="btn btn-primary"
            onClick={handleApproveCareplan}
            style={{
              fontSize: '0.875rem',
              padding: '10px 22px'
            }}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>Approve Careplan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
