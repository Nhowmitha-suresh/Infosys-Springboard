import { MONITORING_API_URL, serviceRequest } from './serviceClients';

/**
 * Client for the Node monitoring service (services/monitoring-service, port 4000):
 * database-backed clinical rule engine, rule-execution audit trail and the
 * mobile-style notification feed.
 */
export interface ClinicalRule {
  rule_id: number;
  rule_name: string;
  description: string;
  condition: string;
  action: string;
  is_active: boolean;
  category: string;
  severity: 'critical' | 'warning' | 'info' | string;
}

export interface VitalsInput {
  hr: number;
  spo2: number;
  systolic: number;
  diastolic: number;
  temp: number;
  context: string;
  baselineHr: number;
}

export interface FiredAlert {
  id: number | string;
  ruleName: string;
  severity: string;
  message: string;
  analysis?: string;
  confidence?: number;
}

export interface EvaluationResult {
  fired: FiredAlert[];
  message?: string;
}

export interface RuleExecution {
  execution_id: number;
  patient_id: string;
  rule_name: string;
  triggered: boolean;
  executed_at?: string;
}

export interface MonitoringNotification {
  notification_id: number;
  patient_id: string;
  rule_name?: string;
  notification_type: string;
  title: string;
  message: string;
  status: string;
  created_at?: string;
}

const SERVICE = 'monitoring service (clinical rule engine, port 4000)';
const call = <T,>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' = 'GET',
  body?: unknown,
  query?: Record<string, string | number | undefined>
) => serviceRequest<T>(MONITORING_API_URL, path, { method, body, query, serviceName: SERVICE });

export const ruleEngineService = {
  listRules: () => call<ClinicalRule[]>('/api/rules'),
  setRuleActive: (ruleId: number, isActive: boolean) =>
    call<ClinicalRule>(`/api/rules/${ruleId}`, 'PATCH', { isActive }),
  evaluate: (patientId: string, vitals: VitalsInput) =>
    call<EvaluationResult>('/api/monitoring/evaluate', 'POST', {
      patient: { id: patientId, name: patientId, baselineHr: vitals.baselineHr },
      vitals,
      history: [],
    }),
  listExecutions: (limit = 25) => call<RuleExecution[]>('/api/monitoring/executions', 'GET', undefined, { limit }),
  listNotifications: (limit = 20) => call<MonitoringNotification[]>('/api/notifications', 'GET', undefined, { limit }),
  markNotification: (notificationId: number, status: 'READ' | 'DELIVERED') =>
    call<MonitoringNotification>(`/api/notifications/${notificationId}`, 'PATCH', { status }),
};
