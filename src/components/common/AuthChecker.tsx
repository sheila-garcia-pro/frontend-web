import React, { useEffect, useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

interface AuthCheckerProps {
  children: React.ReactNode;
}

/**
 * Componente que verifica a autenticação antes de renderizar os filhos
 * Evita a tela branca durante o carregamento inicial
 */
const AuthChecker: React.FC<AuthCheckerProps> = ({ children }) => {
  const { checkAuth, loading } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  useEffect(() => {
    // Fazer a verificação inicial de autenticação
    const performInitialCheck = async () => {
      try {
        await checkAuth();
      } finally {
        setInitialCheckDone(true);
      }
    };

    performInitialCheck();
  }, [checkAuth]);

  // Mostrar loading apenas durante a verificação inicial
  if (!initialCheckDone) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: isDarkMode ? 'rgba(35, 41, 28, 1)' : 'rgba(245, 243, 231, 1)',
        }}
      >
        <CircularProgress
          color="primary"
          size={60}
          thickness={4}
          sx={{
            mb: 2,
            color: isDarkMode ? '#E8EDAA' : 'primary.main',
          }}
        />
        <Typography
          variant="h6"
          color={isDarkMode ? '#FFFFFF' : 'primary.main'}
          sx={{
            fontWeight: 600,
            letterSpacing: '0.5px',
          }}
        >
          Verificando autenticação...
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default AuthChecker;
