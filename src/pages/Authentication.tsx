import React, { useCallback, useEffect, useState } from 'react';
import { MediStorage } from '../services/storage';
import { MediToast } from '../components/Toast';
import { authApi, JwtUser } from '../services/authApi';

const ROLES = ['ADMIN', 'DOCTOR', 'PATIENT', 'RECEPTIONIST'];

const labelStyle: React.CSSProperties = { fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' };
const valueStyle: React.CSSProperties = { fontSize: '0.95rem', color: '#F8FAFC', fontWeight: 600, marginTop: 4, wordBreak: 'break-all' };

export const Authentication: React.FC = () => {
  const portalUser = MediStorage.getCurrentUser();

  const [view, setView] = useState<'signin' | 'register'>('signin');
  const [jwtUser, setJwtUser] = useState<JwtUser | null>(() => authApi.getUser());
  const [expiry, setExpiry] = useState<number | null>(() => authApi.getTokenExpiry());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('admin@medisphere.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  const [specialization, setSpecialization] = useState('');

  const applySession = () => {
    setJwtUser(authApi.getUser());
    setExpiry(authApi.getTokenExpiry());
  };

  // If a token is already stored, confirm it with the server (GET /api/auth/me).
  const verifySession = useCallback(async (silent = false) => {
    if (!authApi.getToken()) return;
    setBusy(true);
    if (!silent) setError('');
    try {
      await authApi.me();
      applySession();
      if (!silent) MediToast.success('Server session is valid.', 'Session Verified');
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 401 || status === 403) {
        authApi.clearSession();
        applySession();
        setError('Your server session has expired. Please sign in again.');
      } else if (!silent) {
        setError((err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    verifySession(true);
  }, [verifySession]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setBusy(true);
    try {
      const { user } = await authApi.login(email, password);
      applySession();
      setPassword('');
      MediToast.success(`Signed in as ${user.name} (${user.role}).`, 'Authentication Successful');
    } catch (err) {
      setError((err as { status?: number }).status === 401 || (err as { status?: number }).status === 403
        ? 'Invalid email or password.'
        : (err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !regEmail.trim() || !regPassword) {
      setError('Name, email and password are required.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setBusy(true);
    try {
      const { user } = await authApi.register({ name, email: regEmail, password: regPassword, role, specialization });
      applySession();
      setName('');
      setRegEmail('');
      setRegPassword('');
      setView('signin');
      MediToast.success(`Account created for ${user.name} (${user.role}).`, 'Registration Successful');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = () => {
    authApi.clearSession();
    applySession();
    setError('');
    MediToast.info('Server (JWT) session cleared.');
  };

  const expiryText = expiry
    ? `${new Date(expiry).toLocaleString()}${expiry < Date.now() ? ' (expired)' : ''}`
    : 'Unknown';

  return (
    <div className="page-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <span className="badge badge-primary">Milestone 1 • Security & Access</span>
        <h1 style={{ color: '#FFFFFF', fontSize: '1.75rem', fontWeight: 700, margin: '10px 0 0' }}>Authentication</h1>
        <p style={{ color: '#94A3B8', marginTop: '6px', fontSize: '0.95rem' }}>
          JWT sign-in and registration served by the Spring Boot + Spring Security backend. The portal's own sign-in is unchanged.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Sessions */}
        <div className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>Session Status</h2>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>Portal session</span>
              <span className="badge badge-success">Active</span>
            </div>
            <div style={valueStyle}>{portalUser?.name} · {portalUser?.role?.toUpperCase()}</div>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: 14, borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={labelStyle}>Server session (JWT)</span>
              <span className={`badge ${jwtUser ? 'badge-success' : 'badge-warning'}`}>{jwtUser ? 'Signed in' : 'Signed out'}</span>
            </div>
            {jwtUser ? (
              <>
                <div style={valueStyle}>{jwtUser.name}</div>
                <div style={{ color: '#CBD5E1', fontSize: '0.85rem', marginTop: 4 }}>{jwtUser.email}</div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginTop: 12 }}>
                  <div>
                    <div style={labelStyle}>Role</div>
                    <div style={valueStyle}>{jwtUser.role}</div>
                  </div>
                  {jwtUser.specialization && (
                    <div>
                      <div style={labelStyle}>Specialization</div>
                      <div style={valueStyle}>{jwtUser.specialization}</div>
                    </div>
                  )}
                  <div>
                    <div style={labelStyle}>Token expires</div>
                    <div style={valueStyle}>{expiryText}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => verifySession(false)} disabled={busy}>
                    {busy ? 'Checking…' : 'Verify with server'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={handleSignOut}>Sign out of server session</button>
                </div>
              </>
            ) : (
              <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '8px 0 0' }}>
                Sign in on the right to obtain a JWT from the Spring Boot backend.
              </p>
            )}
          </div>
        </div>

        {/* Sign in / Register */}
        <div className="card-panel">
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <button
              type="button"
              className={`btn btn-sm ${view === 'signin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setView('signin'); setError(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn btn-sm ${view === 'register' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setView('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div role="alert" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#FCA5A5', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem', marginBottom: 16 }}>
              {error}
            </div>
          )}

          {view === 'signin' ? (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-field">
                <label className="form-label" htmlFor="auth-email">Email</label>
                <input id="auth-email" className="form-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="auth-password">Password</label>
                <input id="auth-password" className="form-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <label style={{ display: 'flex', gap: 6, alignItems: 'center', color: '#94A3B8', fontSize: '0.8rem', marginTop: 6 }}>
                  <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show password
                </label>
              </div>
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-name">Full name</label>
                <input id="reg-name" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-email">Email</label>
                <input id="reg-email" className="form-input" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-password">Password (min. 6 characters)</label>
                <input id="reg-password" className="form-input" type="password" autoComplete="new-password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} />
              </div>
              <div className="form-field">
                <label className="form-label" htmlFor="reg-role">Role</label>
                <select id="reg-role" className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {role === 'DOCTOR' && (
                <div className="form-field">
                  <label className="form-label" htmlFor="reg-spec">Specialization</label>
                  <input id="reg-spec" className="form-input" value={specialization} onChange={(e) => setSpecialization(e.target.value)} />
                </div>
              )}
              <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
