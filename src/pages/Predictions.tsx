import React, { useState } from 'react';
import { CvdRisk } from './CVDRisk';
import { DiabetesRisk } from './DiabetesRisk';

type PredictionTab = 'cardiovascular' | 'diabetes';

export const Predictions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PredictionTab>('cardiovascular');

  return (
    <div className="page-fade-in">
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ color: '#FFF', fontSize: '1.6rem', margin: 0 }}>Predictions</h1>
        <p style={{ margin: '5px 0 0' }}>Run and review patient cardiovascular and diabetes risk assessments.</p>
      </header>
      <div role="tablist" aria-label="Prediction type" style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button type="button" role="tab" aria-selected={activeTab === 'cardiovascular'} className={`btn ${activeTab === 'cardiovascular' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('cardiovascular')}>Cardiovascular risk</button>
        <button type="button" role="tab" aria-selected={activeTab === 'diabetes'} className={`btn ${activeTab === 'diabetes' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('diabetes')}>Diabetes risk</button>
      </div>
      {activeTab === 'cardiovascular' ? <CvdRisk /> : <DiabetesRisk />}
    </div>
  );
};