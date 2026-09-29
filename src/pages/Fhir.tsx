import React, { useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediToast } from '../components/Toast';
import { DataTable, Column } from '../components/DataTable';
import { FHIRResource } from '../types';

export const Fhir: React.FC = () => {
  const [fhirResources, setFhirResources] = useState(MediStorage.getFHIRResources());
  const [selectedResource, setSelectedResource] = useState<FHIRResource | null>(fhirResources[0] || null);

  const columns: Column<FHIRResource>[] = [
    { key: 'id', label: 'FHIR ID' },
    { key: 'patientName', label: 'Patient Name' },
    { key: 'resourceType', label: 'Resource Type', render: (v) => <span className="badge badge-primary">{v}</span> },
    { key: 'sourceSystem', label: 'Source System' },
    { key: 'lastUpdated', label: 'Last Synced', render: (v) => new Date(v).toLocaleTimeString() },
    { key: 'status', label: 'Sync Status', render: (v) => <span className={`badge ${v === 'Synced' ? 'badge-success' : 'badge-danger'}`}>{v}</span> },
    {
      key: 'actions',
      label: 'Payload',
      render: (_, r) => (
        <button className="btn btn-secondary btn-sm" onClick={() => setSelectedResource(r)}>
          View JSON
        </button>
      )
    }
  ];

  const handleSyncAll = () => {
    MediToast.info('Triggering full HL7 FHIR v4 synchronization with hospital EHR systems...');
    setTimeout(() => {
      setFhirResources(MediStorage.getFHIRResources());
      MediToast.success('HL7 FHIR v4 Sync completed. All 500 resources up to date!');
    }, 800);
  };

  return (
    <div className="page-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>FHIR Integration Hub (HL7 v4)</h1>
          <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
            Interoperability Engine - Syncing Epic EHR, Cerner Millennium & LabCorp API
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleSyncAll}>
          ⚡ Sync All FHIR Resources
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card-panel">
          <DataTable
            data={fhirResources}
            columns={columns}
            pageSize={8}
            exportFilename="medisphere_fhir_resources.csv"
          />
        </div>

        <div className="card-panel">
          <h3 style={{ color: '#FFF', marginBottom: '12px' }}>FHIR JSON Payload Inspector</h3>
          {selectedResource ? (
            <div>
              <div style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '8px' }}>
                Resource: <strong style={{ color: '#60A5FA' }}>{selectedResource.id}</strong> ({selectedResource.resourceType})
              </div>
              <pre
                style={{
                  background: '#0F172A',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#34D399',
                  fontSize: '0.8rem',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace'
                }}
              >
                {JSON.stringify({
                  resourceType: selectedResource.resourceType,
                  id: selectedResource.id,
                  meta: { versionId: "1", lastUpdated: selectedResource.lastUpdated },
                  patient: { reference: `Patient/${selectedResource.patientId}`, display: selectedResource.patientName },
                  status: selectedResource.status,
                  source: selectedResource.sourceSystem
                }, null, 2)}
              </pre>
            </div>
          ) : (
            <div style={{ color: '#9CA3AF' }}>Select a resource from the table to view JSON payload.</div>
          )}
        </div>
      </div>
    </div>
  );
};
