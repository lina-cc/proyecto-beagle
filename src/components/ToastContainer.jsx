import React from 'react';

export default function ToastContainer({ toasts }) {
  return (
    <div id="toast-container" className="toast-container">
      {toasts.map((toast) => {
        const icon = toast.type === 'success' ? '✅' : '❌';
        return (
          <div
            key={toast.id}
            className={`toast toast-${toast.type} ${toast.removing ? 'removing' : ''}`}
          >
            <span style={{ fontSize: '1.2rem' }}>{icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
