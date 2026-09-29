import React, { useState } from 'react';
import { MediToast } from '../components/Toast';

export const Settings: React.FC = () => {
  const [hospitalName, setHospitalName] = useState('Kasturba Medical College Hospital, Manipal');
  const [networkRegion, setNetworkRegion] = useState('Karnataka Regional Health Network');
  const [fhirEndpoint, setFhirEndpoint] = useState('https://fhir.medisphere.health/v4');
  const [kafkaBrokers, setKafkaBrokers] = useState('kafka-node1.medisphere.internal:9092');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    MediToast.success('Hospital System Settings saved successfully!');
  };

  return (
    <div className="page-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>System Settings & Configuration</h1>
        <p style={{ color: '#9CA3AF', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
          Hospital Enterprise Parameters, FHIR Endpoints & Kafka Brokers
        </p>
      </div>

      <div className="card-panel" style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSave} className="form-grid">
          <div className="form-field full-width">
            <label className="form-label">Hospital Network Name</label>
            <input type="text" className="form-input" value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
          </div>

          <div className="form-field full-width">
            <label className="form-label">Healthcare Region / Territory</label>
            <input type="text" className="form-input" value={networkRegion} onChange={e => setNetworkRegion(e.target.value)} />
          </div>

          <div className="form-field full-width">
            <label className="form-label">FHIR HL7 v4 Endpoint Base URL</label>
            <input type="text" className="form-input" value={fhirEndpoint} onChange={e => setFhirEndpoint(e.target.value)} />
          </div>

          <div className="form-field full-width">
            <label className="form-label">Apache Kafka Cluster Broker Address</label>
            <input type="text" className="form-input" value={kafkaBrokers} onChange={e => setKafkaBrokers(e.target.value)} />
          </div>

          <div className="form-field full-width" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary">
              💾 Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
