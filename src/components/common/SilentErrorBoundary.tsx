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
    console.error('❌ [SILENT ERROR BOUNDARY] Error capturado:', error, errorInfo);

    // IMPORTANTE: NÃO limpar localStorage aqui pois pode ser um erro não relacionado à autenticação
    // que pode estar limpando o token válido do usuário

    // Verificar se é realmente um erro relacionado à autenticação
    const isAuthError =
      error.message?.includes('auth') ||
      error.message?.includes('token') ||
      error.message?.includes('permission') ||
      error.message?.includes('authenticated');

    if (isAuthError) {
      localStorage.clear();
      sessionStorage.clear();
      // Redirecionar para login apenas para erros de autenticação
      window.location.replace('/login');
    }
    // Para outros tipos de erro, apenas log sem redirecionar
  }

  render() {
    // Se houve erro de autenticação, não renderizar nada (o redirecionamento já foi feito)
    // Para outros erros, tentar renderizar o children mesmo assim
    if (this.state.hasError) {
      // Resetar o estado de erro para permitir re-renderização
      // setTimeout(() => this.setState({ hasError: false }), 100);
      return null;
    }

    return this.props.children;
  }
}

export default SilentErrorBoundary;
