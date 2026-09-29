import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  badgeText?: string;
  badgeType?: 'success' | 'warning' | 'danger' | 'info';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accentColor = '#FFFFFF',
  badgeText,
  badgeType = 'info'
}) => {
  const badgeClasses: Record<string, string> = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    info: 'badge-info'
  };

  return (
    <div
      className="stat-card"
      style={{
        padding: '24px',
        borderRadius: '16px',
        background: 'rgba(17, 24, 39, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minHeight: '130px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      }}
    >
      <div className="stat-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          className="stat-label"
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: '#94A3B8',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {title}
        </span>
        {icon && (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accentColor
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div style={{ marginTop: '12px' }}>
        <div
          className="stat-value"
          style={{
            fontSize: '2.25rem',
            fontWeight: 700,
            color: accentColor,
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}
        >
          {value}
        </div>
        {(subtitle || badgeText) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            {badgeText && (
              <span className={`badge ${badgeClasses[badgeType]}`} style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
                {badgeText}
              </span>
            )}
            {subtitle && (
              <span style={{ fontSize: '0.825rem', color: '#94A3B8' }}>
                {subtitle}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
