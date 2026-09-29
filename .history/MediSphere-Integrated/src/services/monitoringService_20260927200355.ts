import { API_BASE_URL } from './api';

export interface MonitoredPatient {
  id: string;
  name: string;
  vitalType: string;
  vitalLabel: string;
  value: string;
  numericValue: number;
  unit: string;
  status: 'Normal' | 'Anomaly';
  lastUpdated: string;
  room: string;
  age: number;
  recentAlert?: string;
  history: { time: string; value: number }[];
}

export interface MonitoringAlert {
  id: string;
  patientId: string;
  patientName: string;
  vital: string;
  value: string;
  severity: 'HIGH' | 'MEDIUM' | 'NORMAL';
  detectedTime: string;
  timestamp: number;
  acknowledged: boolean;
  notes?: string;
}

/*
 * NOTE:
 * Patient telemetry is still simulated temporarily.
 *
 * We are currently fixing only the ALERT pipeline:
 *
 * Telemetry
 *    ↓
 * Backend Alert Engine
 *    ↓
 * MongoDB
 *    ↓
 * Frontend Alerts
 *
 * The wearable integration and Kafka modules will be added
 * in the next steps.
 */

const INITIAL_PATIENTS: MonitoredPatient[] = [
  {
    id: 'PAT-001',
    name: 'Sarah M.',
    vitalType: 'HR',
    vitalLabel: 'Heart Rate',
    value: '145 bpm',
    numericValue: 145,
    unit: 'bpm',
    status: 'Anomaly',
    lastUpdated: 'Just now',
    room: 'ICU Bed 04',
    age: 62,
    recentAlert: 'Tachycardia arrhythmia detected (>140 bpm)',
    history: [
      { time: '10:00', value: 110 },
      { time: '10:05', value: 125 },
      { time: '10:10', value: 138 },
      { time: '10:15', value: 145 }
    ]
  },
  {
    id: 'PAT-002',
    name: 'John D.',
    vitalType: 'SpO₂',
    vitalLabel: 'Blood Oxygen (SpO₂)',
    value: '97%',
    numericValue: 97,
    unit: '%',
    status: 'Normal',
    lastUpdated: '1 min ago',
    room: 'Ward 3B - Bed 12',
    age: 58,
    recentAlert: 'Oxygen saturation optimal (97%)',
    history: [
      { time: '10:00', value: 98 },
      { time: '10:05', value: 97 },
      { time: '10:10', value: 97 },
      { time: '10:15', value: 97 }
    ]
  },
  {
    id: 'PAT-003',
    name: 'Priya K.',
    vitalType: 'HR',
    vitalLabel: 'Heart Rate',
    value: '82 bpm',
    numericValue: 82,
    unit: 'bpm',
    status: 'Normal',
    lastUpdated: 'Just now',
    room: 'Cardiac Care Unit 02',
    age: 45,
    recentAlert: 'Normal sinus rhythm',
    history: [
      { time: '10:00', value: 80 },
      { time: '10:05', value: 81 },
      { time: '10:10', value: 84 },
      { time: '10:15', value: 82 }
    ]
  },
  {
    id: 'PAT-004',
    name: 'Rahul K.',
    vitalType: 'BP',
    vitalLabel: 'Blood Pressure',
    value: '130/85 mmHg',
    numericValue: 130,
    unit: 'mmHg',
    status: 'Normal',
    lastUpdated: '3 min ago',
    room: 'Ward 2A - Bed 06',
    age: 51,
    recentAlert: 'Blood pressure within stable baseline',
    history: [
      { time: '10:00', value: 128 },
      { time: '10:05', value: 132 },
      { time: '10:10', value: 130 },
      { time: '10:15', value: 130 }
    ]
  },
  {
    id: 'PAT-005',
    name: 'Emily R.',
    vitalType: 'Temp',
    vitalLabel: 'Core Temperature',
    value: '98.6 °F',
    numericValue: 98.6,
    unit: '°F',
    status: 'Normal',
    lastUpdated: '2 min ago',
    room: 'Step-down Unit 10',
    age: 34,
    recentAlert: 'Normothermic core temperature',
    history: [
      { time: '10:00', value: 98.4 },
      { time: '10:05', value: 98.6 },
      { time: '10:10', value: 98.5 },
      { time: '10:15', value: 98.6 }
    ]
  },
  {
    id: 'PAT-006',
    name: 'David P.',
    vitalType: 'HR',
    vitalLabel: 'Heart Rate',
    value: '152 bpm',
    numericValue: 152,
    unit: 'bpm',
    status: 'Anomaly',
    lastUpdated: 'Just now',
    room: 'ICU Bed 01',
    age: 67,
    recentAlert: 'Critical tachycardia alert (>150 bpm)',
    history: [
      { time: '10:00', value: 115 },
      { time: '10:05', value: 132 },
      { time: '10:10', value: 148 },
      { time: '10:15', value: 152 }
    ]
  },
  {
    id: 'PAT-007',
    name: 'Elena Rostova',
    vitalType: 'SpO₂',
    vitalLabel: 'Blood Oxygen (SpO₂)',
    value: '91%',
    numericValue: 91,
    unit: '%',
    status: 'Anomaly',
    lastUpdated: 'Just now',
    room: 'Pulmonary Ward 08',
    age: 72,
    recentAlert: 'Desaturation below critical threshold (<92%)',
    history: [
      { time: '10:00', value: 95 },
      { time: '10:05', value: 94 },
      { time: '10:10', value: 92 },
      { time: '10:15', value: 91 }
    ]
  },
  {
    id: 'PAT-008',
    name: 'Marcus Chen',
    vitalType: 'Glucose',
    vitalLabel: 'Blood Glucose',
    value: '104 mg/dL',
    numericValue: 104,
    unit: 'mg/dL',
    status: 'Normal',
    lastUpdated: '4 min ago',
    room: 'Endocrine Unit 05',
    age: 49,
    recentAlert: 'Post-prandial glucose stable',
    history: [
      { time: '10:00', value: 110 },
      { time: '10:05', value: 108 },
      { time: '10:10', value: 106 },
      { time: '10:15', value: 104 }
    ]
  }
];

/*
 * IMPORTANT:
 *
 * INITIAL_ALERTS has been completely removed.
 *
 * Alerts are now loaded from:
 *
 * GET /api/alerts
 *
 * The backend Alert Engine is responsible for creating
 * and storing alerts in MongoDB.
 */

class MonitoringStore {
  private patients: MonitoredPatient[] = INITIAL_PATIENTS;

  // Alerts now come from backend/MongoDB.
  private alerts: MonitoringAlert[] = [];

  private alertCounter: number = 0;

  private activeTwins: number = 47;

  private avgResponseTime: string = '3.2 min';

  private subscribers: Set<() => void> = new Set();

  /*
   * Temporary frontend telemetry simulation.
   *
   * This will be replaced by Wearable Device Integration
   * in the next step.
   */
  private simulationInterval: ReturnType<typeof setInterval> | null = null;

  /*
   * Temporary polling for backend alerts.
   *
   * Later this will be replaced with Socket.IO/WebSocket
   * for true push-based real-time updates.
   */
  private alertPollingInterval: ReturnType<typeof setInterval> | null = null;

  private alertRequestInFlight = false;

  constructor() {
    this.startSimulation();
    this.startAlertPolling();
  }

  public subscribe(callback: () => void) {
    this.subscribers.add(callback);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public getPatients(): MonitoredPatient[] {
    return this.patients;
  }

  public getAlerts(): MonitoringAlert[] {
    return this.alerts;
  }

  public getMetrics() {
    return {
      activeTwins: this.activeTwins,
      alerts: this.alertCounter,
      avgResponseTime: this.avgResponseTime
    };
  }

  public getPatientById(id: string): MonitoredPatient | undefined {
    return this.patients.find((p) => p.id === id);
  }

  /*
   * ---------------------------------------------------------
   * BACKEND ALERT INTEGRATION
   * ---------------------------------------------------------
   *
   * Loads alerts stored by the backend Alert Engine.
   */

  private getLocalFallbackAlerts(): MonitoringAlert[] {
    // Keep the Alerts page useful when MongoDB/backend is not available.
    // Backend alerts are still preferred whenever the API responds.
    const anomalyPatients = this.patients.filter(
      (patient) => patient.status === 'Anomaly'
    );

    return anomalyPatients.map((patient, index) => ({
      id: `LOCAL-ALT-${patient.id}`,
      patientId: patient.id,
      patientName: patient.name,
      vital: patient.vitalLabel,
      value: patient.value,
      severity:
        patient.vitalType === 'HR' && patient.numericValue >= 150
          ? 'HIGH'
          : 'MEDIUM',
      detectedTime: 'Detected recently',
      timestamp: Date.now() - index * 60000,
      acknowledged: false,
      notes: patient.recentAlert || 'Clinical anomaly detected by monitoring simulation.'
    }));
  }

  private async loadAlertsFromBackend() {
    if (this.alertRequestInFlight) {
      return;
    }

    this.alertRequestInFlight = true;

    try {
      const response = await fetch(`${API_BASE_URL}/alerts`, {
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch alerts: ${response.status}`
        );
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.alerts)) {
        throw new Error('Invalid alert response from backend.');
      }

      this.alerts = data.alerts.map((alert: any) => ({
        id: alert.alertId,

        patientId: alert.patientId,

        patientName: alert.patientName,

        vital: alert.vital,

        value: alert.value,

        severity: alert.severity,

        detectedTime: this.formatDetectedTime(
          alert.detectedAt
        ),

        timestamp: new Date(alert.detectedAt).getTime(),

        acknowledged:
          alert.status === 'ACKNOWLEDGED' ||
          alert.status === 'RESOLVED',

        notes:
          alert.notes ||
          alert.message ||
          ''
      }));

      this.alertCounter = this.alerts.length;

      this.notify();

    } catch (error) {
      console.warn(
        'Backend alert API unavailable. Using local monitoring alerts:',
        error
      );

      // Do not leave the Alerts tab blank just because the backend is offline.
      // The same simulated monitoring patients already used by Continuous
      // Monitoring provide safe demo data for the alert queue.
      const fallbackAlerts = this.getLocalFallbackAlerts();

      if (fallbackAlerts.length > 0) {
        this.alerts = fallbackAlerts;
        this.alertCounter = fallbackAlerts.length;
        this.notify();
      }
    } finally {
      this.alertRequestInFlight = false;
    }
  }

  /*
   * Converts MongoDB timestamp into a dashboard-friendly
   * "Detected X min ago" format.
   */

  private formatDetectedTime(
    timestamp: string | number
  ): string {
    const detectedAt = new Date(timestamp);

    if (Number.isNaN(detectedAt.getTime())) {
      return 'Detected recently';
    }

    const diffMs =
      Date.now() - detectedAt.getTime();

    const diffMinutes =
      Math.floor(diffMs / 60000);

    if (diffMinutes <= 0) {
      return 'Detected just now';
    }

    if (diffMinutes === 1) {
      return 'Detected 1 min ago';
    }

    return `Detected ${diffMinutes} min ago`;
  }

  /*
   * Temporary polling mechanism.
   *
   * Every 3 seconds we check MongoDB through the backend.
   *
   * IMPORTANT:
   * This is only an intermediate step.
   *
   * Later:
   *
   * Backend Alert Engine
   *        ↓
   * Socket.IO
   *        ↓
   * React
   *
   * will provide true real-time updates.
   */

  private startAlertPolling() {
    if (this.alertPollingInterval) {
      return;
    }

    // Load existing alerts immediately.
    this.loadAlertsFromBackend();

    this.alertPollingInterval =
      setInterval(() => {
        this.loadAlertsFromBackend();
      }, 3000);
  }

  /*
   * ---------------------------------------------------------
   * SEND TELEMETRY TO BACKEND ALERT ENGINE
   * ---------------------------------------------------------
   *
   * Currently only Heart Rate is connected to the backend.
   *
   * Wearable Integration + Kafka will be added later.
   */

  private async sendVitalToAlertEngine(
    patientId: string,
    patientName: string,
    vitalType: string,
    value: number,
    unit: string
  ) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/alerts/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            patientId,
            patientName,
            vitalType,
            value,
            unit,
            previousAverage: vitalType === 'HEART_RATE' ? 90 : undefined
          })
        }
      );

      if (!response.ok) {
        throw new Error(
          `Alert Engine returned ${response.status}`
        );
      }

      const data = await response.json();

      /*
       * If the backend detected an anomaly and created
       * an alert, reload alerts from MongoDB.
       */

      if (data.alertCreated) {
        console.log(
          'Real-Time Alert Engine created alert:',
          data.alert
        );

        await this.loadAlertsFromBackend();
      }

    } catch (error) {
      console.error(
        'Failed to send telemetry to Alert Engine:',
        error
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * ALERT ACKNOWLEDGEMENT
   * ---------------------------------------------------------
   */

  public async acknowledgeAlert(
    alertId: string
  ) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/alerts/${alertId}/acknowledge`,
        {
          method: 'PATCH',

          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(
          'Failed to acknowledge alert'
        );
      }

      await this.loadAlertsFromBackend();

    } catch (error) {
      console.warn(
        'Backend acknowledgement unavailable. Acknowledging locally:',
        error
      );

      this.alerts = this.alerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, acknowledged: true }
          : alert
      );

      this.notify();
    }
  }

  public async acknowledgeAllAlerts() {
    const activeAlerts =
      this.alerts.filter(
        (alert) => !alert.acknowledged
      );

    for (const alert of activeAlerts) {
      await this.acknowledgeAlert(alert.id);
    }

    await this.loadAlertsFromBackend();
  }

  /*
   * ---------------------------------------------------------
   * TEMPORARY TELEMETRY SIMULATION
   * ---------------------------------------------------------
   *
   * IMPORTANT:
   *
   * This is NOT the final Milestone 3 architecture.
   *
   * It will be replaced by:
   *
   * Wearable Device
   *       ↓
   * Backend
   *       ↓
   * Kafka
   *       ↓
   * Anomaly Detection
   *       ↓
   * Alert Engine
   *
   * in the next steps.
   */

  private startSimulation() {
    if (this.simulationInterval) {
      return;
    }

    this.simulationInterval =
      setInterval(() => {

        const randomIndex =
          Math.floor(
            Math.random() *
            this.patients.length
          );

        const patient = {
          ...this.patients[randomIndex]
        };

        const timeStr =
          new Date().toLocaleTimeString(
            [],
            {
              hour: '2-digit',
              minute: '2-digit'
            }
          );

        /*
         * -----------------------------------------------
         * HEART RATE
         * -----------------------------------------------
         */

        if (patient.vitalType === 'HR') {

          const delta =
            Math.floor(Math.random() * 9) - 4;

          const newHR =
            Math.max(
              65,
              Math.min(
                160,
                patient.numericValue + delta
              )
            );

          const isAnomaly =
            newHR > 135 ||
            newHR < 55;

          patient.numericValue =
            newHR;

          patient.value =
            `${newHR} bpm`;

          patient.status =
            isAnomaly
              ? 'Anomaly'
              : 'Normal';

          patient.lastUpdated =
            'Just now';

          patient.recentAlert =
            isAnomaly
              ? `Tachycardia detected (${newHR} bpm)`
              : `Normal sinus rhythm (${newHR} bpm)`;

          patient.history = [
            ...patient.history.slice(-5),
            {
              time: timeStr,
              value: newHR
            }
          ];

          /*
           * IMPORTANT:
           *
           * Previously this code called:
           *
           * triggerNewAlert()
           *
           * which created a fake frontend alert.
           *
           * That has now been removed.
           *
           * Instead the anomaly is sent to the
           * backend Real-Time Alert Engine.
           */

          if (isAnomaly) {

            this.sendVitalToAlertEngine(
              patient.id,
              patient.name,
              'HEART_RATE',
              newHR,
              'bpm'
            );
          }

        /*
         * -----------------------------------------------
         * SpO2
         * -----------------------------------------------
         */

        } else if (
          patient.vitalType === 'SpO₂'
        ) {

          const delta =
            Math.floor(
              Math.random() * 3
            ) - 1;

          const newSpo2 =
            Math.max(
              88,
              Math.min(
                100,
                patient.numericValue + delta
              )
            );

          const isAnomaly =
            newSpo2 < 93;

          patient.numericValue =
            newSpo2;

          patient.value =
            `${newSpo2}%`;

          patient.status =
            isAnomaly
              ? 'Anomaly'
              : 'Normal';

          patient.lastUpdated =
            'Just now';

          patient.recentAlert =
            isAnomaly
              ? `Desaturation episode (${newSpo2}%)`
              : `Optimal saturation (${newSpo2}%)`;

          patient.history = [
            ...patient.history.slice(-5),
            {
              time: timeStr,
              value: newSpo2
            }
          ];

          if (isAnomaly) {
            this.sendVitalToAlertEngine(
              patient.id,
              patient.name,
              'SPO2',
              newSpo2,
              '%'
            );
          }

        /*
         * -----------------------------------------------
         * TEMPERATURE
         * -----------------------------------------------
         */

        } else if (
          patient.vitalType === 'Temp'
        ) {

          const delta =
            Math.random() * 0.4 - 0.2;

          const newTemp =
            parseFloat(
              (
                patient.numericValue +
                delta
              ).toFixed(1)
            );

          const isAnomaly =
            newTemp > 101.0;

          patient.numericValue =
            newTemp;

          patient.value =
            `${newTemp} °F`;

          patient.status =
            isAnomaly
              ? 'Anomaly'
              : 'Normal';

          patient.lastUpdated =
            'Just now';

          patient.history = [
            ...patient.history.slice(-5),
            {
              time: timeStr,
              value: newTemp
            }
          ];

          if (isAnomaly) {
            this.sendVitalToAlertEngine(
              patient.id,
              patient.name,
              'TEMPERATURE',
              newTemp,
              '°F'
            );
          }

        /*
         * -----------------------------------------------
         * BLOOD PRESSURE
         * -----------------------------------------------
         */

        } else if (
          patient.vitalType === 'BP'
        ) {

          const sysDelta =
            Math.floor(
              Math.random() * 5
            ) - 2;

          const newSys =
            Math.max(
              110,
              Math.min(
                165,
                patient.numericValue +
                sysDelta
              )
            );

          const newDia =
            Math.round(
              newSys * 0.65
            );

          const isAnomaly =
            newSys > 145;

          patient.numericValue =
            newSys;

          patient.value =
            `${newSys}/${newDia} mmHg`;

          patient.status =
            isAnomaly
              ? 'Anomaly'
              : 'Normal';

          patient.lastUpdated =
            'Just now';

          patient.history = [
            ...patient.history.slice(-5),
            {
              time: timeStr,
              value: newSys
            }
          ];

          if (isAnomaly) {
            this.sendVitalToAlertEngine(
              patient.id,
              patient.name,
              'BLOOD_PRESSURE',
              newSys,
              'mmHg systolic'
            );
          }
        }

        /*
         * Replace the updated patient inside the array.
         */

        this.patients = [
          ...this.patients.slice(
            0,
            randomIndex
          ),

          patient,

          ...this.patients.slice(
            randomIndex + 1
          )
        ];

        this.notify();

      }, 3500);
  }
}

export const monitoringService =
  new MonitoringStore();