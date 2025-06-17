import React from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import tokenManager from '@utils/tokenManager';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { useLocation } from 'react-router-dom';

/**
 * Componente de debug para testar a limpeza de token
 * Remove em produção
 */
const TokenDebugger: React.FC = () => {
  const { isAuthenticated, token: reduxToken } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  const handleClearToken = () => {
    console.log('🧹 Limpando token manualmente...');
    tokenManager.clearAuthData();
    console.log('✅ Token limpo');
    // Forçar reload da página para testar redirecionamento
    window.location.reload();
  };

  const handleCheckToken = () => {
    const token = tokenManager.getToken();
    const isExpired = token ? tokenManager.isTokenExpired() : null;
    console.log('🔍 Status do Token:', {
      hasToken: !!token,
      isExpired,
      reduxAuthenticated: isAuthenticated,
      hasReduxToken: !!reduxToken,
      currentPath: location.pathname,
    });
  };

  const handleSimulate401 = () => {
    console.log('🎭 Simulando erro 401...');
    window.dispatchEvent(new CustomEvent('auth:tokenExpired'));
  };
  // Só mostrar em desenvolvimento
  if (import.meta.env.MODE === 'production') {
    return null;
  }

  const token = tokenManager.getToken();
  const isExpired = token ? tokenManager.isTokenExpired() : null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        p: 2,
        zIndex: 9999,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        border: '1px solid red',
        minWidth: 280,
      }}
    >
      <Typography variant="h6" color="error" gutterBottom>
        Token Debugger (DEV)
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" gutterBottom>
          Rota: <strong>{location.pathname}</strong>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
          <Chip
            label={`Redux: ${isAuthenticated ? 'Logado' : 'Não logado'}`}
            color={isAuthenticated ? 'success' : 'error'}
            size="small"
          />
          <Chip
            label={`Token: ${token ? 'Existe' : 'Ausente'}`}
            color={token ? 'success' : 'error'}
            size="small"
          />
          {token && (
            <Chip
              label={`Status: ${isExpired ? 'Expirado' : 'Válido'}`}
              color={isExpired ? 'warning' : 'success'}
              size="small"
            />
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
        <Button size="small" onClick={handleCheckToken}>
          Verificar Token
        </Button>
        <Button size="small" onClick={handleClearToken} color="error">
          Limpar Token
        </Button>
        <Button size="small" onClick={handleSimulate401} color="warning">
          Simular 401
        </Button>
      </Box>
    </Paper>
  );
};

export default TokenDebugger;
