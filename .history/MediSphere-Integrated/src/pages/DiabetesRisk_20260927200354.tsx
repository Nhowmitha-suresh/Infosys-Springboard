import React, { useState } from 'react';
import { API_BASE_URL } from '../services/api';

type FormState = {
  patientId: string;
  patientName: string;
  hba1c: string;
  fastingBloodSugar: string;
  egfr: string;
  microalbuminuria: string;
  systolicBp: string;
  neuropathyScore: string;
};

type DiabetesResult = {
  recordId?: string;
  patientId?: string;
  patientName?: string;

  modelId?: string;
  modelName?: string;
  modelVersion?: string;
  architecture?: string;

  riskScore?: number;
  riskLevel?: string;

  microvascularRisk?: string;
  macrovascularRisk?: string;

  featureContributions?: Record<string, number>;

  recommendations?: string[];

  status?: string;
  validationStatus?: string;
};

const initialForm: FormState = {
  patientId: '',
  patientName: 'John Doe',
  hba1c: '',
  fastingBloodSugar: '',
  egfr: '',
  microalbuminuria: '',
  systolicBp: '',
  neuropathyScore: ''
};

export const DiabetesRisk: React.FC = () => {
  const [form, setForm] =
    useState<FormState>(initialForm);

  const [result, setResult] =
    useState<DiabetesResult | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const update = (
    key: keyof FormState,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };


  /*
  ============================================================
  SUBMIT DCR-NN2 ASSESSMENT
  ============================================================
  */

  const submitPrediction = async (
    event: React.FormEvent
  ) => {

    event.preventDefault();

    setLoading(true);
    setMessage('');
    setResult(null);


    try {

      /*
      --------------------------------------------------------
      Validate inputs before sending
      --------------------------------------------------------
      */

      const requiredNumericFields = [
        form.hba1c,
        form.fastingBloodSugar,
        form.egfr,
        form.microalbuminuria,
        form.systolicBp,
        form.neuropathyScore
      ];


      const hasInvalidInput =
        requiredNumericFields.some(
          (value) =>
            value === '' ||
            !Number.isFinite(Number(value))
        );


      if (hasInvalidInput) {
        throw new Error(
          'Please enter valid values for all diabetes risk features.'
        );
      }


      /*
      --------------------------------------------------------
      Send request to backend
      --------------------------------------------------------
      */

      const response = await fetch(
        `${API_BASE_URL}/diabetes/predict`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({

            patientId:
              form.patientId ||
              undefined,

            patientName:
              form.patientName,

            hba1c:
              Number(form.hba1c),

            fastingBloodSugar:
              Number(form.fastingBloodSugar),

            egfr:
              Number(form.egfr),

            microalbuminuria:
              Number(form.microalbuminuria),

            systolicBp:
              Number(form.systolicBp),

            neuropathyScore:
              Number(form.neuropathyScore)

          })
        }
      );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.message ||
          'Unable to submit DCR-NN2 assessment.'
        );

      }


      /*
      --------------------------------------------------------
      Store prediction result
      --------------------------------------------------------
      */

      setResult(data.data);


    } catch (error: any) {

      setMessage(
        error.message ||
        'Unable to connect to the diabetes risk backend.'
      );

    } finally {

      setLoading(false);

    }

  };


  /*
  ============================================================
  RISK BADGE CLASS
  ============================================================
  */

  const getRiskBadgeClass = (
    risk?: string
  ) => {

    if (!risk) {
      return 'badge badge-warning';
    }

    if (
      risk.toLowerCase() === 'high'
    ) {
      return 'badge badge-danger';
    }

    if (
      risk.toLowerCase() === 'moderate'
    ) {
      return 'badge badge-warning';
    }

    return 'badge badge-success';

  };


  /*
  ============================================================
  RISK SCORE DISPLAY
  ============================================================
  */

  const riskScore =
    result?.riskScore ?? null;


  /*
  ============================================================
  UI
  ============================================================
  */

  return (

    <div
      className="page-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}
    >

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div>

        <span className="badge badge-warning">
          MOD-DIA-02 • Milestone 2
        </span>

        <h1
          style={{
            marginTop: '10px'
          }}
        >
          Diabetes Complication Risk
        </h1>

        <p
          style={{
            marginTop: '6px'
          }}
        >
          DCR-NN2 — Deep Neural Network /
          Longitudinal Sequence
        </p>

      </div>


      {/* =====================================================
          INPUT FORM
      ===================================================== */}

      <div className="card-panel">

        <div
          style={{
            marginBottom: '20px'
          }}
        >

          <h2>
            Patient & Input Feature Vectors
          </h2>

          <p
            style={{
              marginTop: '5px'
            }}
          >
            Assesses progressive microvascular
            and macrovascular complication
            timelines for type-2 diabetic patients.
          </p>

        </div>


        <form
          onSubmit={submitPrediction}
        >

          <div className="form-grid">


            {/* Patient ID */}

            <div className="form-field">

              <label className="form-label">
                Patient ID
              </label>

              <input
                className="form-input"
                value={form.patientId}
                onChange={(e) =>
                  update(
                    'patientId',
                    e.target.value
                  )
                }
                placeholder="Optional"
              />

            </div>


            {/* Patient Name */}

            <div className="form-field">

              <label className="form-label">
                Patient Name
              </label>

              <input
                className="form-input"
                value={form.patientName}
                onChange={(e) =>
                  update(
                    'patientName',
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* HbA1c */}

            <div className="form-field">

              <label className="form-label">
                HbA1c (%)
              </label>

              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0"
                value={form.hba1c}
                onChange={(e) =>
                  update(
                    'hba1c',
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* Fasting Blood Sugar */}

            <div className="form-field">

              <label className="form-label">
                Fasting Blood Sugar (mg/dL)
              </label>

              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0"
                value={
                  form.fastingBloodSugar
                }
                onChange={(e) =>
                  update(
                    'fastingBloodSugar',
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* eGFR */}

            <div className="form-field">

              <label className="form-label">
                eGFR (mL/min/1.73m²)
              </label>

              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0"
                value={form.egfr}
                onChange={(e) =>
                  update(
                    'egfr',
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* Microalbuminuria */}

            <div className="form-field">

              <label className="form-label">
                Microalbuminuria
              </label>

              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0"
                value={
                  form.microalbuminuria
                }
                onChange={(e) =>
                  update(
                    'microalbuminuria',
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* Systolic BP */}

            <div className="form-field">

              <label className="form-label">
                Systolic BP (mmHg)
              </label>

              <input
                className="form-input"
                type="number"
                step="1"
                min="0"
                value={form.systolicBp}
                onChange={(e) =>
                  update(
                    'systolicBp',
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* Neuropathy */}

            <div className="form-field">

              <label className="form-label">
                Neuropathy Score
              </label>

              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0"
                value={
                  form.neuropathyScore
                }
                onChange={(e) =>
                  update(
                    'neuropathyScore',
                    e.target.value
                  )
                }
                required
              />

            </div>

          </div>


          {/* Run button */}

          <div
            style={{
              marginTop: '20px',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >

              {loading
                ? 'Running Assessment...'
                : 'Run DCR-NN2 Assessment'}

            </button>

          </div>

        </form>


        {/* Error message */}

        {message && (

          <div
            className="auth-error-banner"
            style={{
              display: 'block',
              marginTop: '16px'
            }}
          >
            {message}
          </div>

        )}

      </div>


      {/* =====================================================
          RESULT PANEL
      ===================================================== */}

      <div className="card-panel">

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >

          <div>

            <h2>
              Diabetes Complication Risk
            </h2>

            <p
              style={{
                marginTop: '6px'
              }}
            >
              Patient:{' '}
              {result?.patientName ||
                form.patientName ||
                'John Doe'}
            </p>

          </div>


          <span
            className={
              result
                ? getRiskBadgeClass(
                    result.riskLevel
                  )
                : 'badge badge-warning'
            }
          >

            {result?.riskLevel
              ? `${result.riskLevel} Risk`
              : 'Model Development in Progress'}

          </span>

        </div>


        {/* =================================================
            MAIN RISK SCORE
        ================================================= */}

        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            borderRadius: '12px',
            background:
              'rgba(15, 23, 42, 0.7)',
            border:
              '1px solid rgba(255,255,255,0.08)'
          }}
        >

          <div
            style={{
              color: '#94A3B8',
              fontSize: '0.75rem',
              textTransform: 'uppercase'
            }}
          >
            Diabetes Complication Risk
          </div>


          <div
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              marginTop: '8px'
            }}
          >

            {riskScore !== null
              ? `${riskScore}%`
              : 'Pending'}

          </div>


          <div
            style={{
              marginTop: '8px',
              fontSize: '0.95rem'
            }}
          >

            {result?.riskLevel
              ? `Overall Risk Level: ${result.riskLevel}`
              : 'Run the DCR-NN2 assessment to generate a risk result.'}

          </div>


          {result?.validationStatus && (

            <div
              style={{
                color: '#94A3B8',
                marginTop: '8px',
                fontSize: '0.8rem'
              }}
            >
              Validation Status:{' '}
              {result.validationStatus}
            </div>

          )}

        </div>


        {/* =================================================
            MICRO + MACRO VASCULAR RISK
        ================================================= */}

        {result && (

          <div
            className="form-grid"
            style={{
              marginTop: '16px'
            }}
          >

            {/* Microvascular */}

            <div
              style={{
                padding: '18px',
                borderRadius: '12px',
                background:
                  'rgba(15, 23, 42, 0.7)',
                border:
                  '1px solid rgba(255,255,255,0.08)'
              }}
            >

              <div
                style={{
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                Microvascular Risk
              </div>

              <div
                style={{
                  marginTop: '8px',
                  fontSize: '1.25rem',
                  fontWeight: 700
                }}
              >
                {result.microvascularRisk ||
                  'N/A'}
              </div>

            </div>


            {/* Macrovascular */}

            <div
              style={{
                padding: '18px',
                borderRadius: '12px',
                background:
                  'rgba(15, 23, 42, 0.7)',
                border:
                  '1px solid rgba(255,255,255,0.08)'
              }}
            >

              <div
                style={{
                  color: '#94A3B8',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase'
                }}
              >
                Macrovascular Risk
              </div>

              <div
                style={{
                  marginTop: '8px',
                  fontSize: '1.25rem',
                  fontWeight: 700
                }}
              >
                {result.macrovascularRisk ||
                  'N/A'}
              </div>

            </div>

          </div>

        )}


        {/* =================================================
            FEATURE CONTRIBUTIONS
        ================================================= */}

        {result?.featureContributions && (

          <div
            style={{
              marginTop: '16px',
              padding: '18px',
              borderRadius: '12px',
              background:
                'rgba(15, 23, 42, 0.7)',
              border:
                '1px solid rgba(255,255,255,0.08)'
            }}
          >

            <h3>
              Feature Contributions
            </h3>

            <p
              style={{
                color: '#94A3B8',
                fontSize: '0.8rem',
                marginTop: '5px'
              }}
            >
              Relative contribution of each input
              feature to the prototype risk score.
            </p>


            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginTop: '16px'
              }}
            >

              {Object.entries(
                result.featureContributions
              ).map(
                ([feature, value]) => {

                  const width =
                    Math.min(
                      Number(value) * 4,
                      100
                    );

                  return (

                    <div
                      key={feature}
                    >

                      <div
                        style={{
                          display: 'flex',
                          justifyContent:
                            'space-between',
                          fontSize: '0.8rem'
                        }}
                      >

                        <span>
                          {feature}
                        </span>

                        <span
                          style={{
                            color: '#94A3B8'
                          }}
                        >
                          {value}
                        </span>

                      </div>


                      <div
                        style={{
                          height: '6px',
                          background:
                            'rgba(255,255,255,0.08)',
                          borderRadius: '10px',
                          marginTop: '6px',
                          overflow: 'hidden'
                        }}
                      >

                        <div
                          style={{
                            height: '100%',
                            width: `${width}%`,
                            background:
                              'rgba(59,130,246,0.8)',
                            borderRadius: '10px'
                          }}
                        />

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          </div>

        )}


        {/* =================================================
            RECOMMENDATIONS
        ================================================= */}

        {result?.recommendations &&
          result.recommendations.length > 0 && (

          <div
            style={{
              marginTop: '16px',
              padding: '18px',
              borderRadius: '12px',
              background:
                'rgba(15, 23, 42, 0.7)',
              border:
                '1px solid rgba(255,255,255,0.08)'
            }}
          >

            <h3>
              Risk Monitoring Recommendations
            </h3>

            <ul
              style={{
                marginTop: '12px',
                paddingLeft: '20px'
              }}
            >

              {result.recommendations.map(
                (recommendation, index) => (

                  <li
                    key={index}
                    style={{
                      marginBottom: '8px',
                      color: '#CBD5E1'
                    }}
                  >
                    {recommendation}
                  </li>

                )
              )}

            </ul>

          </div>

        )}


        {/* =================================================
            MODEL INFORMATION
        ================================================= */}

        {result && (

          <div
            style={{
              marginTop: '16px',
              padding: '14px',
              borderRadius: '10px',
              background:
                'rgba(15, 23, 42, 0.45)',
              fontSize: '0.75rem',
              color: '#94A3B8'
            }}
          >

            <div>
              Model:{' '}
              {result.modelName ||
                'DCR-NN2'}
            </div>

            <div
              style={{
                marginTop: '4px'
              }}
            >
              Version:{' '}
              {result.modelVersion ||
                'DCR-NN2-v0.1'}
            </div>

            <div
              style={{
                marginTop: '4px'
              }}
            >
              Architecture:{' '}
              {result.architecture ||
                'Deep Neural Network / Longitudinal Sequence'}
            </div>

          </div>

        )}


        {/* =================================================
            DATABASE RECORD
        ================================================= */}

        {result?.recordId && (

          <p
            style={{
              marginTop: '12px',
              fontSize: '0.75rem'
            }}
          >
            Assessment stored with record ID:{' '}
            {result.recordId}
          </p>

        )}

      </div>

    </div>

  );

};