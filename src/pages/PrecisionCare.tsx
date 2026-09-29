import React, { useMemo, useState } from 'react';

export type PrecisionCareSection = 'all' | 'patient' | 'intervention' | 'guidelines' | 'outcomes' | 'collaboration';

const demoPatient = {
  id: 'PAT-0102',
  name: 'Arjun Verma',
  age: 52,
  conditions: ['Type 2 Diabetes', 'Hypertension', 'Elevated CVD Risk'],
  vitals: { hr: 82, bp: '138/86', spo2: 97, glucose: 142 },
  allergies: ['Penicillin'],
  medications: ['Metformin 500mg', 'Amlodipine 5mg'],
};

const goals = [
  { n: '01', title: 'Improve glycaemic control', intervention: 'Continue prescribed medication and glucose monitoring.', monitoring: 'Daily glucose log', state: 'Active' },
  { n: '02', title: 'Reduce cardiovascular risk', intervention: 'Monitor blood pressure and follow the recommended lifestyle plan.', monitoring: 'BP twice daily', state: 'Active' },
  { n: '03', title: 'Increase activity', intervention: '30-minute moderate activity on at least 5 days per week.', monitoring: 'Activity adherence', state: 'In progress' },
];

const trend = [72, 69, 67, 64, 61, 58, 55];

const sectionCopy: Record<PrecisionCareSection, { eyebrow: string; title: string; description: string }> = {
  all: {
    eyebrow: 'MILESTONE 4 · PRECISION CARE',
    title: 'Precision Care Management',
    description: 'A focused clinical workspace for patient context, interventions, quality checks, outcomes and team decisions.',
  },
  patient: {
    eyebrow: 'CLINICAL OVERVIEW',
    title: 'Patient 360',
    description: 'A complete clinical snapshot of the selected patient, including current vitals, conditions, allergies and medications.',
  },
  intervention: {
    eyebrow: 'CARE DELIVERY',
    title: 'Personalized Intervention',
    description: 'Risk-informed care goals and measurable actions tailored to the selected patient.',
  },
  guidelines: {
    eyebrow: 'QUALITY & SAFETY',
    title: 'Clinical Guideline Compliance',
    description: 'Review patient-specific guideline requirements and record the care team decision.',
  },
  outcomes: {
    eyebrow: 'MEASUREMENT',
    title: 'Outcomes',
    description: 'Track clinical progress and the measurable effect of the active intervention plan.',
  },
  collaboration: {
    eyebrow: 'CARE TEAM',
    title: 'Provider Collaboration',
    description: 'Coordinate provider updates, ownership and patient care decisions in one shared workspace.',
  },
};

export const PrecisionCare: React.FC<{ section?: PrecisionCareSection }> = ({ section = 'all' }) => {
  const [patient, setPatient] = useState(demoPatient);
  const [approved, setApproved] = useState(false);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  const [activity, setActivity] = useState([
    { who: 'Dr. Meera', role: 'Cardiologist', text: 'Reviewed the latest CVD risk assessment.', time: '18 min ago' },
    { who: 'Dr. Arjun', role: 'Diabetologist', text: 'Updated the glucose monitoring goal.', time: '42 min ago' },
  ]);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Review glucose log', assignee: 'Dr. Arjun', done: true },
    { id: 2, title: 'Check blood-pressure trend', assignee: 'Nurse Priya', done: false },
    { id: 3, title: 'Schedule follow-up', assignee: 'Reception', done: false },
  ]);
  const [guidelines, setGuidelines] = useState([
    { id: 1, name: 'Diabetes HbA1c monitoring', status: 'Compliant', detail: 'Latest HbA1c is within the configured monitoring interval.' },
    { id: 2, name: 'Blood pressure management', status: 'Review', detail: 'Recent readings require clinician review.' },
    { id: 3, name: 'CVD risk intervention', status: 'Compliant', detail: 'Risk-reduction intervention is present in the careplan.' },
  ]);

  const adherence = useMemo(() => Math.round((tasks.filter(t => t.done).length / tasks.length) * 100), [tasks]);

  const postMessage = () => {
    if (!message.trim()) return;
    setActivity([{ who: 'You', role: 'Care Team', text: message.trim(), time: 'just now' }, ...activity]);
    setMessage('');
  };

  const toggleTask = (id: number) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const reviewGuideline = (id: number) => setGuidelines(prev => prev.map(g => g.id === id ? { ...g, status: 'Compliant', detail: 'Reviewed by the clinical team.' } : g));
  const pageCopy = sectionCopy[section];

  return (
    <div className="precision-care-page">
      <div className="pc-header">
        <div>
          <div className="pc-eyebrow">{pageCopy.eyebrow}</div>
          <h1>{pageCopy.title}</h1>
          <p>{pageCopy.description}</p>
        </div>
        <select value={patient.id} onChange={() => setPatient({ ...patient })} className="pc-select">
          <option value="PAT-0102">PAT-0102 · Arjun Verma</option>
        </select>
      </div>

      <div className="pc-kpis">
        <div className="pc-kpi"><span>Patients assessed</span><strong>128</strong><small>42 at-risk patients</small></div>
        <div className="pc-kpi"><span>Prediction confidence</span><strong>91%</strong><small>Across active plans</small></div>
        <div className="pc-kpi"><span>Adherence rate</span><strong>{adherence}%</strong><small>Current care activities</small></div>
        <div className="pc-kpi"><span>Hospitalization risk</span><strong>↓ 18%</strong><small>Projected reduction</small></div>
      </div>

      {(section === 'all' || section === 'patient') && <section className="pc-card patient360">
        <div className="pc-section-head"><div><span className="pc-label">PATIENT 360</span><h2>{patient.name}</h2><p>{patient.id} · Age {patient.age} · Complete clinical snapshot</p></div><span className="pc-status">Active</span></div>
        <div className="pc-patient-grid">
          <div><span>Heart rate</span><b>{patient.vitals.hr} bpm</b></div>
          <div><span>Blood pressure</span><b>{patient.vitals.bp}</b></div>
          <div><span>SpO₂</span><b>{patient.vitals.spo2}%</b></div>
          <div><span>Glucose</span><b>{patient.vitals.glucose} mg/dL</b></div>
        </div>
        <div className="pc-tags"><div><span>Conditions</span>{patient.conditions.map(c => <em key={c}>{c}</em>)}</div><div><span>Allergies</span>{patient.allergies.map(c => <em key={c}>{c}</em>)}</div><div><span>Medications</span>{patient.medications.map(c => <em key={c}>{c}</em>)}</div></div>
      </section>}

      {(section === 'all' || section === 'intervention') && <section className="pc-card">
        <div className="pc-section-head"><div><span className="pc-label">AI-ASSISTED INTERVENTION</span><h2>Personalized Careplan</h2><p>Risk-informed goals and measurable clinical interventions.</p></div><span className={approved ? 'pc-status success' : 'pc-status'}>{approved ? 'Approved' : 'Draft'}</span></div>
        <div className="pc-goals">{goals.map(g => <article className="pc-goal" key={g.n}><span>{g.n}</span><div><small>{g.state}</small><h3>{g.title}</h3><p><b>Intervention:</b> {g.intervention}</p><p><b>Monitoring:</b> {g.monitoring}</p></div></article>)}</div>
        <div className="pc-actions"><div><b>Predicted CVD risk ↓ to 55%</b><span>Adherence score {adherence}% · Hospitalization risk ↓ 18%</span></div><div><button className="pc-btn secondary" onClick={() => setApproved(true)}>✓ Approve plan</button><button className="pc-btn primary" onClick={() => setSent(true)}>{sent ? 'Sent to patient' : 'Send to patient'}</button></div></div>
      </section>}

      {(section === 'all' || section === 'outcomes') && <section className="pc-card">
          <div className="pc-section-head"><div><span className="pc-label">OUTCOMES</span><h2>Risk & Outcome Measurement</h2><p>CVD risk trend after careplan activation.</p></div></div>
          <div className="pc-chart"><div className="pc-chart-value">55% <span>current CVD risk</span></div><div className="pc-bars">{trend.map((v, i) => <div key={i} className="pc-bar-wrap"><div className="pc-bar" style={{ height: `${Math.max(28, v)}%` }} /><small>D{i + 1}</small></div>)}</div></div>
          <div className="pc-outcomes"><div><span>Baseline HbA1c</span><b>8.1%</b><em>↓ to 7.3%</em></div><div><span>Blood pressure</span><b>148/92</b><em>↓ to 138/86</em></div><div><span>Care milestones</span><b>3 / 4</b><em>On track</em></div></div>
      </section>}

      {(section === 'all' || section === 'intervention') && <section className="pc-card">
          <div className="pc-section-head"><div><span className="pc-label">ADHERENCE</span><h2>Care Activities</h2><p>Track completion of intervention tasks.</p></div></div>
          <div className="pc-progress"><div><strong>{adherence}%</strong><span>overall adherence</span></div><div className="pc-progress-track"><i style={{ width: `${adherence}%` }} /></div></div>
          <div className="pc-tasks">{tasks.map(t => <label key={t.id} className={t.done ? 'done' : ''}><input type="checkbox" checked={t.done} onChange={() => toggleTask(t.id)} /><span>{t.title}</span><small>{t.assignee}</small></label>)}</div>
      </section>}

      {(section === 'all' || section === 'guidelines') && <section className="pc-card">
        <div className="pc-section-head"><div><span className="pc-label">CLINICAL GUIDELINES</span><h2>Guideline Compliance</h2><p>Patient-specific rules and clinician review status.</p></div></div>
        <div className="pc-guidelines">{guidelines.map(g => <div key={g.id}><div><b>{g.name}</b><p>{g.detail}</p></div><span className={g.status === 'Compliant' ? 'pc-compliant' : 'pc-review'}>{g.status}</span>{g.status !== 'Compliant' && <button className="pc-btn secondary" onClick={() => reviewGuideline(g.id)}>Review</button>}</div>)}</div>
      </section>}

      {(section === 'all' || section === 'collaboration') && <section className="pc-card">
        <div className="pc-section-head"><div><span className="pc-label">CARE TEAM</span><h2>Provider Collaboration</h2><p>Coordinate decisions, tasks and patient communication in one workspace.</p></div><span className="pc-status success">3 providers active</span></div>
        <div className="pc-collab">
          <div className="pc-team"><div className="pc-member"><strong>Dr. Meera</strong><span>Cardiologist · Online</span></div><div className="pc-member"><strong>Dr. Arjun</strong><span>Diabetologist · Online</span></div><div className="pc-member"><strong>Nurse Priya</strong><span>Care Coordinator · Online</span></div></div>
          <div className="pc-activity">{activity.slice(0, 4).map((a, i) => <div key={i}><b>{a.who}</b><span>{a.role} · {a.time}</span><p>{a.text}</p></div>)}<div className="pc-message"><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && postMessage()} placeholder="Post an update for the care team…" /><button className="pc-btn primary" onClick={postMessage}>Send</button></div></div>
        </div>
      </section>}
    </div>
  );
};
