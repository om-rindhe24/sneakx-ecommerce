import React from 'react';

export const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      gap: '16px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '3px solid var(--border-medium)',
        borderTopColor: 'var(--accent-primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{text}</span>
    </div>
  );
};
