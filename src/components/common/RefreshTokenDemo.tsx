import React, { useState } from 'react';
import { Box, Typography, Button, Alert, Paper, Divider, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import tokenManager from '@utils/tokenManager';
import useRefreshToken from '@hooks/useRefreshToken';

/**
 * Componente para testar e demonstrar a funcionalidade de refresh token
 */
const RefreshTokenDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { attemptRefresh, shouldRefresh } = useRefreshToken();

  const clearMessages = () => {
    setResult(null);
    setError(null);
  };

  const handleManualRefresh = async () => {
    clearMessages();
    setLoading(true);

    try {
      const success = await attemptRefresh();

      if (success) {
        setResult('Token renovado com sucesso! ✅');
      } else {
        setError('Não foi possível renovar o token. Refresh token pode estar expirado.');
      }
    } catch (err) {
      setError(
        `Erro ao renovar token: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
      );
    } finally {
      setLoading(false);
    }
  };

  const getTokenInfo = () => {
    const token = tokenManager.getToken();
    const refreshToken = tokenManager.getRefreshToken();
    const isTokenExpired = tokenManager.isTokenExpired();
    const isRefreshTokenExpired = tokenManager.isRefreshTokenExpired();

    return {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      isTokenExpired,
      isRefreshTokenExpired,
      shouldRefresh: shouldRefresh(),
    };
  };

  const tokenInfo = getTokenInfo();

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">
          Demonstração Refresh Token
        </Typography>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Esta seção demonstra a funcionalidade de refresh token implementada na aplicação. O refresh
        token permite renovar automaticamente tokens expirados sem necessidade de novo login.
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {/* Status atual dos tokens */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Status dos Tokens:
        </Typography>

        <Box sx={{ display: 'grid', gap: 1, mb: 2 }}>
          <Typography variant="body2">
            <strong>Token de Acesso:</strong> {tokenInfo.hasToken ? '✅ Presente' : '❌ Ausente'}
            {tokenInfo.hasToken && (tokenInfo.isTokenExpired ? ' (Expirado)' : ' (Válido)')}
          </Typography>
          <Typography variant="body2">
            <strong>Refresh Token:</strong>{' '}
            {tokenInfo.hasRefreshToken ? '✅ Presente' : '❌ Ausente'}
            {tokenInfo.hasRefreshToken &&
              (tokenInfo.isRefreshTokenExpired ? ' (Expirado)' : ' (Válido)')}
          </Typography>
          <Typography variant="body2">
            <strong>Pode Renovar:</strong> {tokenInfo.shouldRefresh ? '✅ Sim' : '❌ Não'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Ação manual de refresh */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Teste Manual:
        </Typography>

        <Button
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
          onClick={handleManualRefresh}
          disabled={loading || !tokenInfo.hasRefreshToken}
          sx={{ mb: 2 }}
        >
          {loading ? 'Renovando...' : 'Renovar Token Manualmente'}
        </Button>

        {!tokenInfo.hasRefreshToken && (
          <Typography variant="body2" color="text.secondary">
            Refresh token não encontrado. Faça login para obter um novo refresh token.
          </Typography>
        )}
      </Box>

      {/* Mensagens de resultado */}
      {result && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={clearMessages}>
          {result}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearMessages}>
          {error}
        </Alert>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Informações sobre o funcionamento automático */}
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Funcionamento Automático:
        </Typography>

        <Typography variant="body2" component="div" sx={{ lineHeight: 1.6 }}>
          • A renovação automática é executada pelos interceptors do Axios quando uma requisição
          retorna 401
          <br />
          • O sistema verifica periodicamente (a cada 30 segundos) se o token está expirado
          <br />
          • Se o refresh token estiver válido, o sistema tentará renovar automaticamente
          <br />
          • Se o refresh token estiver expirado (após 7 dias), o usuário será redirecionado para o
          login
          <br />• Todas as requisições em fila são processadas automaticamente após a renovação
        </Typography>
      </Box>
    </Paper>
  );
};

export default RefreshTokenDemo;
