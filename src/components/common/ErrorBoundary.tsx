import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ Error Boundary capturou um erro:', error, errorInfo);

    // Limpar storage e redirecionar automaticamente para login
    localStorage.clear();
    sessionStorage.clear();

    // Redirecionar imediatamente para login
    setTimeout(() => {
      window.location.replace('/login');
    }, 100); // Pequeno delay para garantir que o console.error foi executado
  }
  render() {
    if (this.state.hasError) {
      // Em produção, mostrar apenas um loading simples enquanto redireciona
      if (process.env.NODE_ENV === 'production') {
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              backgroundColor: '#f5f5f5',
            }}
          >
            <div>Redirecionando...</div>
          </div>
        );
      }

      // Em desenvolvimento, mostrar detalhes do erro (opcional)
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#f5f5f5',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <h1 style={{ color: '#d32f2f', marginBottom: '16px' }}>Erro de Desenvolvimento</h1>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Redirecionando para login em alguns segundos...
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.replace('/login');
            }}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              marginBottom: '20px',
            }}
          >
            Ir para Login Agora
          </button>
          <details style={{ textAlign: 'left' }}>
            <summary>Detalhes do erro</summary>
            <pre
              style={{
                backgroundColor: '#f0f0f0',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
              }}
            >
              {this.state.error?.stack}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
