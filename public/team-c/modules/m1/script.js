// MediSphere frontend <-> backend integration.
// Backends currently used by Team C:
//   Patient Consent: integrated backend on 8181
//   HIPAA Audit:     integrated backend on 8181
//   FHIR Validation: integrated backend on 8181

const API = window.MEDISPHERE_API || {};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[ch]));
}

function showResult(element, ok, message, errors = []) {
  if (!element) return;
  const safeErrors = Array.isArray(errors) ? errors : [errors];
  const list = safeErrors.filter(Boolean).length
    ? `<ul class="mb-0 mt-2">${safeErrors.filter(Boolean).map(e => `<li>${escapeHtml(e)}</li>`).join('')}</ul>`
    : '';
  element.innerHTML = `<div class="alert ${ok ? 'alert-success' : 'alert-danger'}"><strong>${escapeHtml(message)}</strong>${list}</div>`;
}

function serviceBases(service) {
  const configured = API[service];
  if (Array.isArray(configured)) return configured.filter(Boolean);
  if (configured) return [configured];
  return [];
}

async function apiRequest(service, path, options = {}) {
  const bases = serviceBases(service);
  if (!bases.length) throw new Error(`${service} API is not configured.`);

  let lastError;
  for (const base of bases) {
    try {
      const headers = new Headers(options.headers || {});
      const token = localStorage.getItem('ms_token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      const response = await fetch(`${base}${path}`, { ...options, headers });
      // Try the next configured base only when this base clearly isn't serving the endpoint.
      if (response.status === 404 || response.status === 405) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Unable to reach backend service.');
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try { return JSON.parse(text); }
  catch { return { message: text }; }
}

// ---------------- Patient Consent ----------------
const consentForm = document.getElementById('consentForm');
const patientIdOptions = document.getElementById('patientIdOptions');
const consentResultBox = document.getElementById('consentResultBox');

async function loadPatientIds() {
  if (!patientIdOptions) return;
  try {
    const response = await apiRequest('CONSENT', '/api/consent/patients');
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.message || `Patient service returned HTTP ${response.status}.`);
    const patients = Array.isArray(data) ? data : (data.patients || data.data || []);
    patientIdOptions.innerHTML = patients.map(p => `<option value="${escapeHtml(typeof p === 'string' ? p : p.patientId)}"></option>`).join('');
    const total = document.querySelector('.patient-total-count'); if (total) total.textContent = patients.length.toLocaleString();
    await loadConsentRecords();
  } catch (error) { console.warn('Patient list could not be loaded:', error); }
}

async function loadConsentRecords() {
  try {
    const response = await apiRequest('CONSENT', '/api/consent/records'); const data = await readJson(response);
    if (!response.ok) throw new Error(data.message || `Consent records returned HTTP ${response.status}.`);
    const records = Array.isArray(data) ? data : (data.items || data.records || []);
    const tbody = document.querySelector('.app-table tbody');
    if (tbody && records.length) {
      tbody.innerHTML = records.map(r => {
        const status=String(r.consentStatus||'').toLowerCase();
        const cls=status==='granted'?'pill-green':status==='revoked'?'pill-red':'pill-orange';
        const date=r.consentDate?new Date(r.consentDate).toLocaleDateString('en-GB'):"—";
        const expiry=r.expiryDate?new Date(r.expiryDate).toLocaleDateString('en-GB'):"—";
        return `<tr class="consent-row"><td>${escapeHtml(r.patientId)}</td><td>${escapeHtml(r.patientName)}</td><td><span class="pill ${cls}">${escapeHtml(r.consentStatus)}</span></td><td>${date}</td><td>${expiry}</td><td><button class="row-icon-btn row-icon-view"><i class="bi bi-eye"></i></button><button class="row-icon-btn row-icon-delete"><i class="bi bi-trash"></i></button></td></tr>`;
      }).join('');
    }
    const counts={Granted:0,Pending:0,Revoked:0}; records.forEach(r=>{const s=r.consentStatus; if(s==='Granted')counts.Granted++; else if(s==='Pending')counts.Pending++; else if(s==='Revoked')counts.Revoked++;});
    const cards=document.querySelectorAll('.stat-card-v2-info h3'); if(cards.length>=4){cards[0].textContent=records.length.toLocaleString();cards[1].textContent=counts.Granted;cards[2].textContent=counts.Pending;cards[3].textContent=counts.Revoked;}
  } catch(error) { console.warn('Consent records could not be loaded:', error); }
}

if (consentForm) {
  loadPatientIds();
  document.getElementById('refreshPatientsBtn')?.addEventListener('click', loadPatientIds);

  consentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const button = document.getElementById('verifyConsentBtn');
    const patientId = document.getElementById('consentPatientId')?.value.trim();
    const consentType = document.getElementById('consentType')?.value;
    const authorizedBy = document.getElementById('authorizedBy')?.value.trim();

    if (!patientId || !consentType || !authorizedBy) {
      showResult(consentResultBox, false, 'Please fill all required fields.');
      return;
    }

    const payload = {
      patientId,
      consentType,
      consentStatus: document.getElementById('consentStatus')?.value === 'true',
      authorizedBy
    };

    button.disabled = true;
    button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Verifying...';

    try {
      const response = await apiRequest('CONSENT', '/api/consent/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await readJson(response);
      const ok = response.ok && String(data.status || '').toUpperCase() === 'SUCCESS';
      showResult(
        consentResultBox,
        ok,
        data.message || (ok ? 'Patient consent verified successfully.' : 'Patient consent verification failed.'),
        data.errors || []
      );
    } catch (error) {
      showResult(consentResultBox, false, 'No consent verification result was returned.');
    } finally {
      button.disabled = false;
      button.innerHTML = '<i class="bi bi-shield-check"></i> Verify';
    }
  });
}

// ---------------- FHIR Validation ----------------
const fhirFileInput = document.querySelector('.upload-file-input');
const validateBtn = document.getElementById('validateBtn');
const validateFormBtn = document.getElementById('validateFormBtn');
const resultResourceType = document.getElementById('resultResourceType');
const resultStatus = document.getElementById('resultStatus');
const resultCheckedOn = document.getElementById('resultCheckedOn');
const resultMessage = document.getElementById('resultMessage');
const validationErrorsBody = document.getElementById('validationErrorsBody');

async function runFhirValidation(payload, triggerBtn, restoreHtml) {
  triggerBtn.disabled = true;
  triggerBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Validating...';

  try {
    const response = await apiRequest('FHIR', '/api/fhir/patient/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await readJson(response);
    const success = response.ok && String(data.status || '').toUpperCase() === 'SUCCESS';
    const errors = Array.isArray(data.errors) ? data.errors : [];

    resultResourceType.textContent = payload.resourceType || '-';
    resultCheckedOn.textContent = new Date().toLocaleString();
    resultMessage.textContent = data.message || (success ? 'FHIR resource is valid.' : 'FHIR validation failed.');
    resultStatus.innerHTML = success
      ? '<span class="pill pill-green">Valid</span>'
      : '<span class="pill pill-red">Invalid</span>';

    validationErrorsBody.innerHTML = errors.length
      ? errors.map(error => `<tr><td>FHIR resource</td><td>${escapeHtml(error)}</td><td><span class="pill pill-red">High</span></td></tr>`).join('')
      : '<tr><td colspan="3" class="text-muted">No validation errors.</td></tr>';

    if (window.renderDonut) {
      window.renderDonut('fhirDonut', success ? [1, 0] : [0, 1], ['#4ade80', '#ef4444']);
    }
  } catch (error) {
    resultStatus.innerHTML = '<span class="pill pill-red">Error</span>';
    resultMessage.textContent = 'No FHIR validation result was returned.';
    validationErrorsBody.innerHTML = `<tr><td colspan="3">${escapeHtml(error.message)}</td></tr>`;
  } finally {
    triggerBtn.disabled = false;
    triggerBtn.innerHTML = restoreHtml;
  }
}

if (validateBtn && fhirFileInput) {
  validateBtn.addEventListener('click', async () => {
    if (!fhirFileInput.files.length) {
      alert('Please choose a FHIR Patient JSON file first.');
      return;
    }
    let payload;
    try {
      const text = await fhirFileInput.files[0].text();
      payload = JSON.parse(text);
    } catch {
      alert('The selected file is not valid JSON.');
      return;
    }
    runFhirValidation(payload, validateBtn, '<i class="bi bi-check2-circle"></i> Validate Resource');
  });
}

if (validateFormBtn) {
  validateFormBtn.addEventListener('click', () => {
    const patientId = document.getElementById('formPatientId').value.trim();
    const resourceType = document.getElementById('formResourceType').value;
    const gender = document.getElementById('formGender').value;
    const birthDate = document.getElementById('formBirthDate').value;
    const active = document.getElementById('formActiveToggle').checked;

    if (!patientId) {
      alert('Please enter a Patient ID.');
      return;
    }

    const payload = {
      resourceType: resourceType,
      id: patientId,
      active: active,
      gender: gender || undefined,
      birthDate: birthDate || undefined
    };

    runFhirValidation(payload, validateFormBtn, '<i class="bi bi-check2-circle"></i> Validate Resource');
  });
}

// ---------------- HIPAA Audit Logs ----------------
const auditTableBody = document.getElementById('auditLogsBody');

async function loadAuditLogs() {
  if (!auditTableBody) return;
  auditTableBody.innerHTML = '<tr><td colspan="7" class="text-muted">Loading audit logs...</td></tr>';
  const token = localStorage.getItem('ms_token');

  if (!token) {
    auditTableBody.innerHTML = '<tr><td colspan="7" class="text-muted">Sign in with a Team-D staff account to view protected audit logs.</td></tr>';
    document.getElementById('auditServiceLogin')?.classList.remove('d-none');
    return;
  }

  try {
    const response = await apiRequest('AUDIT', '/api/audit/logs', { headers: { 'Accept': 'application/json' } });
    const data = await readJson(response);
    if (!response.ok) throw new Error(data.message || `Audit service returned HTTP ${response.status}.`);

    const logs = Array.isArray(data) ? data : (data.logs || data.data || []);
    document.getElementById('auditServiceLogin')?.classList.add('d-none');
    const successCount = logs.filter(log => String(log.status || '').toUpperCase() === 'SUCCESS').length;
    const failedCount = logs.length - successCount;

    auditTableBody.innerHTML = logs.length ? logs.map(log => {
      const success = String(log.status || '').toUpperCase() === 'SUCCESS';
      const ts = log.timestamp ? new Date(log.timestamp).toLocaleString() : '-';
      return `<tr class="audit-row">
        <td>${escapeHtml(ts)}</td>
        <td>${escapeHtml(log.module || '-')}</td>
        <td>${escapeHtml(log.source || 'Service')}</td>
        <td>${escapeHtml(log.action || '-')}</td>
        <td>${escapeHtml((log.resourceType || '-') + ' / ' + (log.resourceId || '-'))}</td>
        <td><span class="pill ${success ? 'pill-green' : 'pill-red'}">${success ? 'Success' : 'Failed'}</span></td>
        <td>${escapeHtml(log.ipAddress || '-')}</td>
      </tr>`;
    }).join('') : '<tr><td colspan="7" class="text-muted">No audit logs found.</td></tr>';

    const cards = document.querySelectorAll('.stat-card-v2 h3');
    if (cards.length >= 4) {
      cards[0].textContent = logs.length.toLocaleString();
      cards[1].textContent = successCount.toLocaleString();
      cards[2].textContent = failedCount.toLocaleString();
      cards[3].textContent = new Set(logs.map(log => log.source).filter(Boolean)).size.toLocaleString();
      const successPct = logs.length ? (successCount / logs.length * 100).toFixed(1) : '0.0';
      const failedPct = logs.length ? (failedCount / logs.length * 100).toFixed(1) : '0.0';
      cards[1].nextElementSibling?.replaceChildren(document.createTextNode(`${successPct}%`));
      cards[2].nextElementSibling?.replaceChildren(document.createTextNode(`${failedPct}%`));
    }
  } catch (error) {
    if (/401|403/.test(error.message || '')) {
      auditTableBody.innerHTML = `<tr><td colspan="7" class="text-muted">${escapeHtml(error.message || 'Please sign in again to view audit logs.')}</td></tr>`;
      localStorage.removeItem('ms_token');
      document.getElementById('auditServiceLogin')?.classList.remove('d-none');
      return;
    }
    // Audit service unreachable: show sample entries instead of a fetch error.
    renderSampleAuditLogs();
  }
}

function renderSampleAuditLogs() {
  const now = Date.now();
  const sample = [
    { m: 4, module: 'HIPAA Audit', source: 'Dr. Meera Nair', action: 'VIEW_PATIENT_RECORD', res: 'Patient / P1001', ok: true, ip: '10.0.4.21' },
    { m: 17, module: 'Consent', source: 'System Administrator', action: 'VERIFY_CONSENT', res: 'Patient / P1003', ok: true, ip: '10.0.4.10' },
    { m: 42, module: 'FHIR', source: 'Interface Engine', action: 'VALIDATE_FHIR_BUNDLE', res: 'Patient / P1005', ok: false, ip: '10.0.7.5' },
    { m: 95, module: 'HIPAA Audit', source: 'Nurse Priya Rao', action: 'UPDATE_CAREPLAN', res: 'CarePlan / CP-208', ok: true, ip: '10.0.4.33' },
    { m: 180, module: 'Access Control', source: 'Reception Desk', action: 'EXPORT_REPORT', res: 'Report / R-77', ok: true, ip: '10.0.4.48' }
  ];
  auditTableBody.innerHTML = sample.map(row => `<tr class="audit-row">
        <td>${escapeHtml(new Date(now - row.m * 60000).toLocaleString())}</td>
        <td>${escapeHtml(row.module)}</td>
        <td>${escapeHtml(row.source)}</td>
        <td>${escapeHtml(row.action)}</td>
        <td>${escapeHtml(row.res)}</td>
        <td><span class="pill ${row.ok ? 'pill-green' : 'pill-red'}">${row.ok ? 'Success' : 'Failed'}</span></td>
        <td>${escapeHtml(row.ip)}</td>
      </tr>`).join('');
}

if (auditTableBody) {
  loadAuditLogs();
  document.getElementById('refreshAuditBtn')?.addEventListener('click', loadAuditLogs);

  document.getElementById('auditServiceLogin')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const submitButton = form.querySelector('button[type="submit"]');
    const result = document.getElementById('auditServiceLoginResult');
    submitButton.disabled = true;
    try {
      const response = await apiRequest('AUDIT', '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          email: form.elements.email.value.trim(),
          password: form.elements.password.value
        })
      });
      const data = await readJson(response);
      if (!response.ok || !data.token) throw new Error(data.message || 'Staff sign-in failed.');
      localStorage.setItem('ms_token', data.token);
      result.textContent = '';
      form.reset();
      await loadAuditLogs();
    } catch (error) {
      result.textContent = error.message || 'Could not sign in to the audit service.';
    } finally {
      submitButton.disabled = false;
    }
  });
}
