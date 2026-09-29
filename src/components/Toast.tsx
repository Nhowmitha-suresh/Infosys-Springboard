import React, { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
}

let toastListener: ((toast: ToastMessage) => void) | null = null;

export const MediToast = {
  success: (msg: string, title = 'Success') => showToast(msg, 'success', title),
  error: (msg: string, title = 'Error') => showToast(msg, 'error', title),
  warning: (msg: string, title = 'Warning') => showToast(msg, 'warning', title),
  info: (msg: string, title = 'Notification') => showToast(msg, 'info', title)
};

function showToast(message: string, type: ToastMessage['type'], title?: string) {
  const toast: ToastMessage = {
    id: Math.random().toString(),
    type,
    title,
    message
  };
  if (toastListener) {
    toastListener(toast);
  }
}

if (typeof window !== 'undefined') {
  (window as any).MediToast = MediToast;
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    toastListener = (newToast) => {
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    return () => {
      toastListener = null;
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        pointerEvents: 'none'
      }}
    >
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success'
            ? '✓'
            : toast.type === 'error'
            ? '✕'
            : toast.type === 'warning'
            ? '⚠'
            : 'ℹ';
        const color =
          toast.type === 'success'
            ? '#22C55E'
            : toast.type === 'error'
            ? '#EF4444'
            : toast.type === 'warning'
            ? '#F59E0B'
            : '#3B82F6';

        return (
          <div
            key={toast.id}
            className="page-fade-in"
            style={{
              pointerEvents: 'auto',
              background: '#111827',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderLeft: `4px solid ${color}`,
              borderRadius: '8px',
              padding: '14px 18px',
              color: '#FFFFFF',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color }}>{icon}</div>
            <div style={{ flex: 1 }}>
              {toast.title && (
                <div style={{ fontWeight: 600, marginBottom: '2px' }}>{toast.title}</div>
              )}
              <div style={{ color: '#D1D5DB' }}>{toast.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
