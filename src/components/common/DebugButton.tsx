import React from 'react';

/**
 * Componente de debug super simples
 */
const DebugButton: React.FC = () => {
  const handleClearToken = () => {
    const tokenKey = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';
    localStorage.removeItem(tokenKey);
    window.location.reload();
  };

  // Só mostrar em desenvolvimento
  if (import.meta.env.MODE === 'production') {
    return null;
  }

  const tokenKey = import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token';
  const hasToken = !!localStorage.getItem(tokenKey);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid red',
        padding: '10px',
        borderRadius: '4px',
      }}
    >
      <div style={{ marginBottom: '8px', fontSize: '12px' }}>
        Token: {hasToken ? '✅ Existe' : '❌ Não existe'}
      </div>
      <button
        onClick={handleClearToken}
        style={{
          backgroundColor: '#d32f2f',
          color: 'white',
          border: 'none',
          padding: '4px 8px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px',
        }}
      >
        Limpar Token
      </button>
    </div>
  );
};

export default DebugButton;
