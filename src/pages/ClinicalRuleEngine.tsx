import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediToast } from '../components/Toast';
import {
  ClinicalRule,
  FiredAlert,
  MonitoringNotification,
  RuleExecution,
  VitalsInput,
  ruleEngineService,
} from '../services/ruleEngineService';

const DEMO_PATIENTS = ['P001', 'P002', 'P003'];
const POLL_MS = 5000;

const SEVERITY_COLOR: Record<string, string> = {
  critical: '#EF4444',
  warning: '#F59E0B',
  info: '#38BDF8',
};

const DEFAULT_VITALS: VitalsInput = {
  hr: 78,
  spo2: 97,
  systolic: 122,
  diastolic: 78,
  temp: 36.9,
  context: 'At rest',
  baselineHr: 70,
};

const VITAL_FIELDS: { key: keyof Omit<VitalsInput, 'context'>; label: string; step?: string }[] = [
  { key: 'hr', label: 'HR (bpm)' },
  { key: 'spo2', label: 'SpO2 (%)' },
  { key: 'temp', label: 'Temp (°C)', step: '0.1' },
  { key: 'systolic', label: 'Systolic' },
  { key: 'diastolic', label: 'Diastolic' },
  { key: 'baselineHr', label: 'Baseline HR' },
];

const fmtTime = (value?: string) => {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleTimeString();
};

const errorBox: React.CSSProperties = {
  background: 'rgba(239,68,68,0.12)',
  border: '1px solid rgba(239,68,68,0.3)',
  color: '#FCA5A5',
  padding: '12px 16px',
  borderRadius: 10,
  fontSize: '0.875rem',
};

const mutedText: React.CSSProperties = { color: '#94A3B8', fontSize: '0.85rem', margin: 0 };

export const ClinicalRuleEngine: React.FC = () => {
  const role = MediStorage.getCurrentUser()?.role;
  const canManageRules = role === 'admin' || role === 'doctor';

  const [rules, setRules] = useState<ClinicalRule[]>([]);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [rulesError, setRulesError] = useState('');

  const [notifications, setNotifications] = useState<MonitoringNotification[]>([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState('');

  const [executions, setExecutions] = useState<RuleExecution[]>([]);
  const [execLoading, setExecLoading] = useState(true);

  const [patientId, setPatientId] = useState(DEMO_PATIENTS[0]);
  const [vitals, setVitals] = useState<VitalsInput>(DEFAULT_VITALS);
  const [evaluating, setEvaluating] = useState(false);
  const [evalError, setEvalError] = useState('');
  const [lastFired, setLastFired] = useState<FiredAlert[] | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchRules = useCallback(async () => {
    setRulesLoading(true);
    setRulesError('');
    try {
      setRules(await ruleEngineService.listRules());
    } catch (err) {
      setRulesError((err as Error).message);
    } finally {
      setRulesLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async (quiet = false) => {
    if (!quiet) setNotifLoading(true);
    try {
      setNotifications(await ruleEngineService.listNotifications(20));
      setNotifError('');
    } catch (err) {
      setNotifError((err as Error).message);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const fetchExecutions = useCallback(async (quiet = false) => {
    if (!quiet) setExecLoading(true);
    try {
      setExecutions(await ruleEngineService.listExecutions(25));
    } catch {
      // Secondary panel — the rules/notifications banners already report an unreachable service.
    } finally {
      setExecLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
    fetchNotifications();
    fetchExecutions();
  }, [fetchRules, fetchNotifications, fetchExecutions]);

  // Live feed: poll so notifications produced by any client appear without a manual refresh.
  useEffect(() => {
    const timer = window.setInterval(() => {
      fetchNotifications(true);
      fetchExecutions(true);
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [fetchNotifications, fetchExecutions]);

  const activeCount = useMemo(() => rules.filter((r) => r.is_active).length, [rules]);
  const criticalCount = useMemo(() => notifications.filter((n) => n.notification_type === 'critical').length, [notifications]);
  const unreadCount = useMemo(() => notifications.filter((n) => n.status !== 'READ').length, [notifications]);

  const setVital = (key: keyof VitalsInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setVitals((prev) => ({ ...prev, [key]: key === 'context' ? e.target.value : Number(e.target.value) }));

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    setEvalError('');
    setLastFired(null);
    try {
      const result = await ruleEngineService.evaluate(patientId, vitals);
      setLastFired(result.fired || []);
      if ((result.fired || []).length > 0) {
        MediToast.warning(`${result.fired.length} clinical rule(s) fired for ${patientId}.`, 'Rule Engine Alert');
      }
      fetchExecutions(true);
      fetchNotifications(true);
    } catch (err) {
      setEvalError((err as Error).message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleToggleRule = async (rule: ClinicalRule) => {
    setTogglingId(rule.rule_id);
    try {
      const updated = await ruleEngineService.setRuleActive(rule.rule_id, !rule.is_active);
      setRules((prev) => prev.map((r) => (r.rule_id === rule.rule_id ? { ...r, is_active: updated.is_active } : r)));
    } catch (err) {
      MediToast.error((err as Error).message, 'Rule Update Failed');
    } finally {
      setTogglingId(null);
    }
  };

  const handleAcknowledge = async (id: number) => {
    try {
      await ruleEngineService.markNotification(id, 'READ');
      setNotifications((prev) => prev.map((n) => (n.notification_id === id ? { ...n, status: 'READ' } : n)));
    } catch (err) {
      MediToast.error((err as Error).message, 'Acknowledge Failed');
    }
  };

  const metricCards = [
    { label: 'Active Rules', value: rulesLoading ? '…' : String(activeCount), color: '#10B981' },
    { label: 'Rule Catalog', value: rulesLoading ? '…' : String(rules.length), color: '#38BDF8' },
    { label: 'Unread Notifications', value: notifLoading ? '…' : String(unreadCount), color: '#F59E0B' },
    { label: 'Critical (recent)', value: notifLoading ? '…' : String(criticalCount), color: '#EF4444' },
  ];

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span className="badge badge-primary">Milestone 3 • Rule Engine & Mobile Notifications</span>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 700, margin: '10px 0 0' }}>Clinical Rule Engine</h1>
        <p style={{ color: '#94A3B8', marginTop: 6, fontSize: '0.95rem' }}>
          Evaluates vitals against a database-backed clinical rule catalog, keeps an audit trail of every evaluation and pushes
          mobile-style notifications. Demo patients: {DEMO_PATIENTS.join(', ')}.
        </p>
      </div>

      {(rulesError || notifError) && <div role="alert" style={errorBox}>{rulesError || notifError}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {metricCards.map((card) => (
          <div key={card.label} className="card-panel">
            <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{card.label}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: card.color, marginTop: 6 }}>{card.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, alignItems: 'start' }}>
        {/* Simulator */}
        <form className="card-panel" onSubmit={handleEvaluate}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px' }}>Simulate a Vitals Reading</h2>
          <p style={{ ...mutedText, marginBottom: 14 }}>
            Runs every active clinical rule against this reading, logs the audit trail and raises a notification for anything that fires.
            The patient needs an existing ML prediction (Model Versioning / ML Models).
          </p>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <select className="form-select" style={{ maxWidth: 140 }} value={patientId} onChange={(e) => setPatientId(e.target.value)} aria-label="Patient">
              {DEMO_PATIENTS.map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
            <select className="form-select" style={{ maxWidth: 180 }} value={vitals.context} onChange={setVital('context')} aria-label="Activity context">
              <option value="At rest">At rest</option>
              <option value="Light activity">Light activity</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
            {VITAL_FIELDS.map((field) => (
              <div key={field.key} className="form-field">
                <label className="form-label" htmlFor={`vital-${field.key}`}>{field.label}</label>
                <input id={`vital-${field.key}`} className="form-input" style={{ width: '100%', boxSizing: 'border-box' }} type="number" step={field.step} value={vitals[field.key]} onChange={setVital(field.key)} required />
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: 16 }} disabled={evaluating}>
            {evaluating ? 'Evaluating…' : 'Run Rule Evaluation'}
          </button>

          {evalError && <div role="alert" style={{ ...errorBox, marginTop: 14 }}>{evalError}</div>}

          {lastFired && (
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lastFired.length === 0 ? (
                <p style={{ color: '#10B981', margin: 0, fontWeight: 600 }}>No rule fired for this reading — all clear.</p>
              ) : (
                lastFired.map((alert) => (
                  <div key={alert.id} style={{ borderLeft: `3px solid ${SEVERITY_COLOR[alert.severity] || '#64748B'}`, paddingLeft: 12 }}>
                    <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{alert.ruleName}</div>
                    <div style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>{alert.message}</div>
                    {(alert.analysis || alert.confidence !== undefined) && (
                      <div style={{ color: '#94A3B8', fontSize: '0.78rem', marginTop: 2 }}>
                        {alert.analysis}
                        {alert.confidence !== undefined && ` · confidence ${(alert.confidence * 100).toFixed(0)}%`}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </form>

        {/* Rule catalog */}
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Clinical Rule Catalog</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={fetchRules} disabled={rulesLoading}>Refresh</button>
          </div>
          {rulesLoading ? (
            <p style={{ ...mutedText, padding: '8px 18px 18px' }}>Loading rules…</p>
          ) : rules.length === 0 ? (
            <p style={{ ...mutedText, padding: '8px 18px 18px' }}>{rulesError ? 'Rules are unavailable until the monitoring service is reachable.' : 'No rules configured yet.'}</p>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Rule</th><th>Category</th><th>Severity</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {rules.map((rule) => (
                    <tr key={rule.rule_id} title={rule.description}>
                      <td style={{ fontWeight: 600, color: '#F8FAFC' }}>{rule.rule_name}</td>
                      <td>{rule.category}</td>
                      <td><span style={{ color: SEVERITY_COLOR[rule.severity] || '#94A3B8', fontWeight: 600, textTransform: 'capitalize' }}>{rule.severity}</span></td>
                      <td>
                        {canManageRules ? (
                          <button
                            type="button"
                            className={`btn btn-sm ${rule.is_active ? 'btn-success' : 'btn-secondary'}`}
                            disabled={togglingId === rule.rule_id}
                            onClick={() => handleToggleRule(rule)}
                            title={rule.is_active ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {rule.is_active ? 'Active' : 'Inactive'}
                          </button>
                        ) : (
                          <span className={`badge ${rule.is_active ? 'badge-success' : 'badge-warning'}`}>{rule.is_active ? 'Active' : 'Inactive'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, alignItems: 'start' }}>
        {/* Notifications */}
        <div className="card-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Mobile Notifications</h2>
            <span className="badge badge-info">Auto-refresh {POLL_MS / 1000}s</span>
          </div>
          <p style={{ ...mutedText, marginBottom: 14 }}>Push-style alerts raised whenever a rule fires.</p>
          {notifLoading ? (
            <p style={mutedText}>Loading notifications…</p>
          ) : notifications.length === 0 ? (
            <p style={mutedText}>No notifications yet — run an evaluation to generate one.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notifications.map((n) => (
                <div key={n.notification_id} style={{ borderLeft: `3px solid ${SEVERITY_COLOR[n.notification_type] || '#64748B'}`, paddingLeft: 12, display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div>
                    <div style={{ color: '#F8FAFC', fontWeight: 600 }}>{n.title}</div>
                    <div style={{ color: '#CBD5E1', fontSize: '0.85rem' }}>{n.message}</div>
                    <div style={{ color: '#94A3B8', fontSize: '0.75rem', marginTop: 2 }}>{n.patient_id} · {fmtTime(n.created_at)} · {n.status}</div>
                  </div>
                  {n.status !== 'READ' && (
                    <button type="button" className="btn btn-secondary btn-sm" style={{ alignSelf: 'flex-start' }} onClick={() => handleAcknowledge(n.notification_id)}>
                      Acknowledge
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit trail */}
        <div className="card-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Rule Execution Audit Trail</h2>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => fetchExecutions()} disabled={execLoading}>Refresh</button>
          </div>
          {execLoading ? (
            <p style={{ ...mutedText, padding: '8px 18px 18px' }}>Loading executions…</p>
          ) : executions.length === 0 ? (
            <p style={{ ...mutedText, padding: '8px 18px 18px' }}>No evaluations logged yet.</p>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr><th>Patient</th><th>Rule</th><th>Result</th></tr>
                </thead>
                <tbody>
                  {executions.map((ex) => (
                    <tr key={ex.execution_id}>
                      <td style={{ fontWeight: 600, color: '#F8FAFC' }}>{ex.patient_id}</td>
                      <td>{ex.rule_name}</td>
                      <td><span style={{ color: ex.triggered ? '#EF4444' : '#94A3B8', fontWeight: 600 }}>{ex.triggered ? 'Fired' : 'No match'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
