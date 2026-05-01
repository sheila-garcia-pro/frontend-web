import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

// Hooks
import { useDevice } from '@hooks/useDevice';

// Componentes
import GlobalLoader from '@components/common/GlobalLoader';
import Logo from '@components/common/Logo';
import loginHero from '@assets/LOGOTIPOS/LOGOTIPOS _Prancheta 1 cópia 3.jpg';
import getTheme from '@themes/index';

// Layout para páginas de autenticação (login, registro, recuperação de senha)
const AuthLayout: React.FC = () => {
  const { isMobile, isTablet } = useDevice();
  const authTheme = useMemo(() => getTheme('light'), []);
  const theme = authTheme;
  const authBackground = theme.palette.background.auth || theme.palette.background.default;
  const authPanel = theme.palette.background.authPanel || theme.palette.background.paper;
  const heroOverlay = theme.palette.background.authOverlay || theme.palette.background.paper;
  const heroOverlayStrong =
    theme.palette.background.authOverlayStrong || theme.palette.background.paper;
  const heroTint = theme.palette.background.authTint || theme.palette.primary.main;

  return (
    <ThemeProvider theme={authTheme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100dvh',
          height: '100dvh',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.1fr) minmax(0, 520px)' },
          gridTemplateRows: {
            xs: 'minmax(160px, 34vh) 1fr',
            sm: 'minmax(200px, 38vh) 1fr',
            md: '1fr',
          },
          backgroundColor: authBackground,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            p: { xs: 2, sm: 3, md: 5 },
            color: theme.palette.text.primary,
            backgroundColor: authBackground,
            backgroundImage: `url(${loginHero})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(120deg, ${heroOverlayStrong} 0%, ${heroOverlay} 70%, ${heroTint} 100%)`,
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              zIndex: 1,
              maxWidth: { xs: '100%', md: 420 },
            }}
          >
            <Typography variant={isMobile ? 'h4' : 'h3'} sx={{ mb: 1 }}>
              Crie fichas tecnicas de forma simples e organizada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mais organizacao, praticidade e eficiencia para o seu negocio.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: { xs: 1.5, sm: 2, md: 2.5 },
            px: { xs: 2.5, sm: 3.5, md: 5 },
            py: { xs: 2.5, sm: 3.5, md: 5 },
            backgroundColor: authPanel,
            minHeight: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Logo
              variant="symbol"
              size={isMobile ? 'small' : 'medium'}
              showText={false}
              to="/"
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Sheila Garcia
            </Typography>
          </Box>

          <Outlet />
        </Box>
      </Box>

      <GlobalLoader />
    </ThemeProvider>
  );
};

export default AuthLayout;
