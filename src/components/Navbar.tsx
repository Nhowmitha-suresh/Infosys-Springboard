import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MediStorage } from '../services/storage';
import { User } from '../types';

export const Navbar: React.FC<{ currentUser: User }> = ({ currentUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    MediStorage.logout();
    navigate('/login');
  };

  return (
    <header className="top-navbar" style={{ height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', background: '#0B1120', borderBottom: '1px solid #1E293B' }}>
      {/* Brand / Main Title */}
      <div className="brand-section" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          className="brand-logo"
          onClick={() => navigate('/dashboard')}
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div className="logo-icon-bg" style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)' }}>
            <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            AI Risk Prediction Engine
          </span>
        </div>
      </div>

      {/* Right Header Navigation with User Info & Logout Button */}
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {currentUser && (
          <div className="nav-user-info" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#E2E8F0', fontSize: '0.9rem', fontWeight: 500 }}>
            <span>{currentUser.name || 'John Doe'}</span>
            <span
              className="badge badge-info"
              style={{ fontSize: '0.75rem', padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              {currentUser.role || 'Admin'}
            </span>
          </div>
        )}

        {/* Clearly Visible Logout Button */}
        <button
          id="header-logout-btn"
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#EF4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontWeight: 600,
            fontSize: '0.875rem',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
          title="Sign out of the system"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
