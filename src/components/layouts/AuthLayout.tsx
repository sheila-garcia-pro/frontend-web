import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Box, Container, Paper, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { useTheme } from '@mui/material/styles';

// Componentes
import GlobalLoader from '@components/common/GlobalLoader';
import Logo from '@components/common/Logo';

// Layout para páginas de autenticação (login, registro, recuperação de senha)
const AuthLayout: React.FC = () => {
  // Verifica se o usuário já está autenticado
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const location = useLocation();
  const isDarkMode = theme.palette.mode === 'dark';

  // Se estiver autenticado, redireciona para o dashboard,
  // mesmo estando em páginas de recuperação de senha
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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
        backgroundImage: isDarkMode
          ? 'linear-gradient(to bottom, #333D2C, #23291C)' // Gradiente mais nítido no modo escuro
          : 'linear-gradient(rgba(193, 200, 177, 0.1), rgba(141, 166, 122, 0.1))', // Gradiente sutil no modo claro
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={isDarkMode ? 6 : 3} // Maior elevação no modo escuro para destacar
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            borderRadius: '16px', // Bordas mais arredondadas
            boxShadow: isDarkMode
              ? '0px 8px 30px rgba(0, 0, 0, 0.5), 0px 0px 1px rgba(232, 237, 170, 0.3)' // Sombra mais intensa e borda sutil
              : '0px 4px 20px rgba(58, 69, 52, 0.15)',
            border: isDarkMode ? '1px solid rgba(232, 237, 170, 0.15)' : 'none', // Borda sutil no modo escuro
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Logo 
              variant="square" 
              size="large" 
              showText={true}
              textColor={isDarkMode ? '#E8EDAA' : 'primary.main'} // Cor amarela mais vibrante no modo escuro
              to="/"
              sx={{ 
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
              }}
            />
          </Box>

          {/* Conteúdo da página de autenticação (via Outlet) */}
          <Outlet />
        </Paper>
      </Container>

      {/* Loader global */}
      <GlobalLoader />
    </Box>
  );
};

export default AuthLayout;
