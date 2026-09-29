import React from 'react';

export const ModuleEmbed: React.FC<{ src: string; title: string; team: 'C' | 'D' }> = ({ src, title, team }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 96px)', margin: '-32px -36px' }}>
      <div
        style={{
          padding: '10px 20px',
          background: 'rgba(56,189,248,.08)',
          borderBottom: '1px solid rgba(148,163,184,.15)',
          fontSize: '.85rem',
          color: '#94A3B8',
          flexShrink: 0,
        }}
      >
        <strong>{title}</strong> — Team-{team} component. Live data requires the Team-C/D Spring Boot backend to be
        running (see <code>backend/</code> in the Healthcare Management Platform for Clinical Operation project).
      </div>
      <iframe title={title} src={src} style={{ flex: 1, width: '100%', border: 'none', background: '#fff' }} />
    </div>
  );
};
