import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Box, Container, Paper, Typography, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { useTheme } from '@mui/material/styles';

// Componentes
import GlobalLoader from '@components/common/GlobalLoader';
import NotificationsManager from '@components/common/NotificationsManager';

// Layout para páginas de autenticação (login, registro, recuperação de senha)
const AuthLayout: React.FC = () => {
  // Verifica se o usuário já está autenticado
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const location = useLocation();

  // Se estiver autenticado, redireciona para o dashboard,
  // mas não redireciona se estiver nas páginas de recuperação de senha
  const isPasswordResetPath = 
    location.pathname.includes('/forgot-password') || 
    location.pathname.includes('/reset-password');
    
  if (isAuthenticated && !isPasswordResetPath) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.palette.background.default,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Logo ou título */}
          <Typography
            component="h1"
            variant="h5"
            gutterBottom
            color="primary"
            sx={{ mb: 3, fontWeight: 'bold' }}
          >
            Sheila Garcia Pro
          </Typography>

          {/* Conteúdo da página de autenticação (via Outlet) */}
          <Outlet />
        </Paper>
      </Container>

      {/* Loader global */}
      <GlobalLoader />

      {/* Gerenciador de notificações */}
      <NotificationsManager />
    </Box>
  );
};

export default AuthLayout;
