import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, Paper, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import { useTheme } from '@mui/material/styles';

// Hooks
import { useDevice } from '@hooks/useDevice';

// Componentes
import GlobalLoader from '@components/common/GlobalLoader';
import Logo from '@components/common/Logo';

// Layout para páginas de autenticação (login, registro, recuperação de senha)
const AuthLayout: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const isDarkMode = theme.palette.mode === 'dark';
  const { isMobile, isTablet } = useDevice();

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
        py: { xs: 2, sm: 4, md: 6 }, // Padding responsivo
        px: { xs: 1, sm: 2 }, // Padding lateral em mobile
      }}
    >
      <Container maxWidth={isMobile ? 'xs' : isTablet ? 'sm' : 'md'} sx={{ width: '100%' }}>
        <Paper
          elevation={isDarkMode ? 6 : 3} // Maior elevação no modo escuro para destacar
          sx={{
            p: { xs: 2, sm: 3, md: 4 }, // Padding responsivo
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: theme.palette.background.paper,
            borderRadius: { xs: '12px', md: '16px' }, // Bordas adaptáveis
            boxShadow: isDarkMode
              ? '0px 8px 30px rgba(0, 0, 0, 0.5), 0px 0px 1px rgba(232, 237, 170, 0.3)' // Sombra mais intensa e borda sutil
              : '0px 4px 20px rgba(58, 69, 52, 0.15)',
            border: isDarkMode ? '1px solid rgba(232, 237, 170, 0.15)' : 'none', // Borda sutil no modo escuro
            width: '100%',
            maxWidth: { xs: '100%', sm: 'none' }, // Largura máxima em mobile
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center' }}>
            <Logo
              variant="white"
              size={isMobile ? 'medium' : 'large'} // Logo menor em mobile
              showText={false}
              textColor={isDarkMode ? '#E8EDAA' : 'primary.main'}
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
