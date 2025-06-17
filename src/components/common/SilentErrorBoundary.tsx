import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * ErrorBoundary silencioso que redireciona imediatamente para login
 * sem mostrar mensagens de erro para o usuário
 */
class SilentErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para debugging (apenas no console)
    console.error('❌ Error capturado - redirecionando para login:', error, errorInfo);

    // Limpar todos os dados de autenticação
    localStorage.clear();
    sessionStorage.clear();

    // Redirecionar imediatamente para login
    window.location.replace('/login');
  }

  render() {
    // Se houve erro, não renderizar nada (o redirecionamento já foi feito)
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default SilentErrorBoundary;
