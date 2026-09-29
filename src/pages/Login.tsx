import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediStorage } from '../services/storage';
import { ToastContainer, MediToast } from '../components/Toast';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [authView, setAuthView] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');

  // Sign in state
  const [email, setEmail] = useState('ADMIN001');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [noticeText, setNoticeText] = useState('');

  // Patient registration state
  const [regName, setRegName] = useState('');
  const [regGender, setRegGender] = useState('Female');
  const [regBlood, setRegBlood] = useState('O+');
  const [regDob, setRegDob] = useState('1990-01-01');
  const [regAge, setRegAge] = useState('36');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regEmergency, setRegEmergency] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirm, setRegPassConfirm] = useState('');

  const presets: Record<UserRole, { id: string; pass: string; placeholder: string }> = {
    admin: { id: 'ADMIN001', pass: 'admin123', placeholder: 'ADMIN001 or admin@medisphere.health' },
    doctor: { id: 'DOC1001', pass: 'doctor123', placeholder: 'DOC1001 or doctor@medisphere.health' },
    patient: { id: 'PAT1001', pass: 'patient123', placeholder: 'PAT1001 or patient@medisphere.health' },
    receptionist: { id: 'REC1001', pass: 'reception123', placeholder: 'REC1001 or reception@medisphere.health' },
    employee: { id: 'EMP1001', pass: 'employee123', placeholder: 'EMP1001 or employee@medisphere.health' }
  };

  useEffect(() => {
    const loginNotice = sessionStorage.getItem('medisphere_login_notice');
    if (loginNotice) {
      sessionStorage.removeItem('medisphere_login_notice');
      setNoticeText(loginNotice);
    }
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorText('');
    const currentVal = email.trim();
    const isAnyPreset = Object.values(presets).some(p => p.id === currentVal);
    if (isAnyPreset || !currentVal) {
      setEmail(presets[role].id);
      setPassword(presets[role].pass);
    }
  };

  const handleFillPreset = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(presets[role].id);
    setPassword(presets[role].pass);
    MediToast.info(`Filled credentials for ${role.toUpperCase()} role (${presets[role].id})`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!email.trim() || !password.trim()) {
      setErrorText('Please enter both User ID/Email and Password.');
      return;
    }

    const result = MediStorage.authenticateUser(email, password, selectedRole);

    if (!result.success) {
      setErrorText(result.message || 'Invalid User ID or Password.');
      return;
    }

    const user = result.user!;
    MediStorage.setCurrentUser(user);
    MediStorage.logActivity('User Login', `User ${user.name} (${user.role.toUpperCase()}) logged in successfully.`);

    MediToast.success(`Welcome back, ${user.name}! Accessing portal...`, 'Authentication Successful');

    setTimeout(() => {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'doctor') navigate('/doctor');
      else if (user.role === 'patient') navigate('/patient');
      else if (user.role === 'receptionist') navigate('/receptionist');
      else if (user.role === 'employee') navigate('/employee');
      else navigate('/dashboard');
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!regName.trim() || !regEmail.trim() || !regMobile.trim() || !regPass.trim()) {
      setErrorText('Please fill in all mandatory registration fields.');
      return;
    }

    if (regPass !== regPassConfirm) {
      setErrorText('Passwords do not match. Please verify password entry.');
      return;
    }

    if (regPass.length < 6) {
      setErrorText('Password must be at least 6 characters long.');
      return;
    }

    const regResult = MediStorage.registerPatient({
      fullName: regName,
      gender: regGender,
      bloodGroup: regBlood,
      dob: regDob,
      age: regAge,
      mobile: regMobile,
      email: regEmail,
      address: regAddress,
      emergencyContact: regEmergency,
      password: regPass
    });

    if (!regResult.success) {
      setErrorText(regResult.message || 'Registration failed.');
      return;
    }

    MediToast.success(`Registration Successful. Your Patient ID is ${regResult.patientId}`, 'Welcome to MediSphere');
    setNoticeText(`Registration Successful! Assigned Patient ID: ${regResult.patientId}. Please login below.`);
    setAuthView('signin');
    setSelectedRole('patient');
    setEmail(regResult.patientId);
    setPassword(regPass);
  };

  return (
    <div className="login-body" style={{ minHeight: '100vh' }}>
      <div className="login-bg-glow"></div>
      <ToastContainer />

      <div className="login-card-container page-fade-in">
        {/* Left Hero Illustration */}
        <div className="login-hero-panel">
          <div className="login-hero-brand">
            <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m-8-8h16"></path>
            </svg>
            MediSphere
          </div>

          <div className="login-hero-illustration">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h2m0 0h2m-4-10a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0zm-8 4a2 2 0 11-4 0 2 2 0 014 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h1 className="login-hero-title">Enterprise Health Operating System</h1>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
            © 2026 MediSphere Health Systems. HL7 FHIR v4 Certified.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="login-form-panel">
          {/* Auth Nav Tabs */}
          <div className="auth-nav-tabs">
            <button
              className={`auth-tab-btn ${authView === 'signin' ? 'active' : ''}`}
              onClick={() => { setAuthView('signin'); setErrorText(''); }}
            >
              🔑 Portal Login
            </button>
            <button
              className={`auth-tab-btn ${authView === 'register' ? 'active' : ''}`}
              onClick={() => { setAuthView('register'); setErrorText(''); }}
            >
              🏥 Register as Patient
            </button>
          </div>

          {/* Notice Banner */}
          {noticeText && (
            <div className="auth-notice-banner" style={{ display: 'flex' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{noticeText}</span>
            </div>
          )}

          {/* Error Banner */}
          {errorText && (
            <div className="auth-error-banner" style={{ display: 'flex' }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>{errorText}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {authView === 'signin' && (
            <div>
              <div className="login-header">
                <h2>Sign In to MediSphere</h2>
                <p>Select your hospital role and enter your User ID/Email & Password</p>
              </div>

              <span className="role-selector-label">Select Hospital Role</span>
              <div className="role-pills">
                <div className={`role-pill ${selectedRole === 'admin' ? 'active' : ''}`} onClick={() => handleRoleSelect('admin')}>Admin</div>
                <div className={`role-pill ${selectedRole === 'doctor' ? 'active' : ''}`} onClick={() => handleRoleSelect('doctor')}>Doctor</div>
                <div className={`role-pill ${selectedRole === 'patient' ? 'active' : ''}`} onClick={() => handleRoleSelect('patient')}>Patient</div>
                <div className={`role-pill ${selectedRole === 'receptionist' ? 'active' : ''}`} onClick={() => handleRoleSelect('receptionist')}>Receptionist</div>
                <div className={`role-pill ${selectedRole === 'employee' ? 'active' : ''}`} onClick={() => handleRoleSelect('employee')}>Med Staff</div>
              </div>

              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="login-email">User ID / Email Address</label>
                  <div className="input-with-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                    <input
                      type="text"
                      id="login-email"
                      placeholder={presets[selectedRole].placeholder}
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-with-icon">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" className="show-password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="remember-me">
                    <input type="checkbox" defaultChecked /> Remember session
                  </label>
                  <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); alert('Password Recovery: Please contact Administrator or use default passwords (admin123, doctor123, patient123, reception123, employee123).'); }}>
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Sign In to Dashboard
                </button>

                <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.85rem', color: '#9CA3AF' }}>
                  New Patient? <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('register'); }} style={{ color: '#60A5FA', fontWeight: 600 }}>Register as Patient here</a>
                </div>
              </form>

              <div className="demo-credentials-box">
                <p>Quick Demo One-Click Presets:</p>
                <div className="demo-btns">
                  <button className="demo-btn" onClick={() => handleFillPreset('admin')}>Admin (ADMIN001)</button>
                  <button className="demo-btn" onClick={() => handleFillPreset('doctor')}>Doctor (DOC1001)</button>
                  <button className="demo-btn" onClick={() => handleFillPreset('patient')}>Patient (PAT1001)</button>
                  <button className="demo-btn" onClick={() => handleFillPreset('receptionist')}>Receptionist (REC1001)</button>
                  <button className="demo-btn" onClick={() => handleFillPreset('employee')}>Med Staff (EMP1001)</button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: PATIENT REGISTRATION */}
          {authView === 'register' && (
            <div>
              <div className="login-header" style={{ marginBottom: '16px' }}>
                <h2>Patient Self-Registration</h2>
                <p>Create your MediSphere Patient Health Profile to access your digital twin & appointment schedule.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="reg-grid">
                <div className="form-group reg-full">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Shreya Shetty"
                    required
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    className="form-select"
                    required
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value)}
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Blood Group *</label>
                  <select
                    className="form-select"
                    required
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regBlood}
                    onChange={(e) => setRegBlood(e.target.value)}
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regDob}
                    onChange={(e) => setRegDob(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Age *</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regAge}
                    onChange={(e) => setRegAge(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 98450 12345"
                    required
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="shreya@gmail.com"
                    required
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>

                <div className="form-group reg-full">
                  <label>Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Kadri Main Road, Mangaluru, Karnataka"
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                  />
                </div>

                <div className="form-group reg-full">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Father/Spouse Name & Phone"
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regEmergency}
                    onChange={(e) => setRegEmergency(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Account Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    required
                    placeholder="••••••••"
                    style={{ width: '100%', padding: '8px 12px', background: '#0F172A', border: '1px solid rgba(255,255,255,0.12)', color: '#FFF', borderRadius: '6px' }}
                    value={regPassConfirm}
                    onChange={(e) => setRegPassConfirm(e.target.value)}
                  />
                </div>

                <div className="form-group reg-full" style={{ marginTop: '12px' }}>
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                    Complete Patient Self-Registration
                  </button>
                  <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.85rem', color: '#9CA3AF' }}>
                    Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); setAuthView('signin'); }} style={{ color: '#60A5FA', fontWeight: 600 }}>Sign In here</a>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
