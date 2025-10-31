import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { Restaurant, Kitchen, MenuBook, Person } from '@mui/icons-material';
import Logo from '@components/common/Logo';
import { useDevice } from '@hooks/useDevice';

// Componente da página inicial - Mobile First
const HomePage: React.FC = () => {
  const { isMobile, isTablet, currentBreakpoint } = useDevice();
  const navigate = useNavigate();

  // Tamanho do logo responsivo
  const getLogoSize = () => {
    if (isMobile) return 180;
    if (isTablet) return 240;
    return 300;
  };

  const quickAccessItems = [
    {
      title: 'Receitas',
      description: 'Explore e crie receitas incríveis',
      icon: Restaurant,
      color: 'primary.main',
      path: '/recipes',
    },
    {
      title: 'Ingredientes',
      description: 'Gerencie seus ingredientes',
      icon: Kitchen,
      color: 'secondary.main',
      path: '/ingredients',
    },
    {
      title: 'Cardápios',
      description: 'Monte cardápios personalizados',
      icon: MenuBook,
      color: 'success.main',
      path: '/menu',
    },
    {
      title: 'Perfil',
      description: 'Configure suas preferências',
      icon: Person,
      color: 'info.main',
      path: '/profile',
    },
  ];

  // Handler para navegação
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Box
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        minHeight: '100%',
      }}
    >
      {/* Seção de Boas-vindas com Logo */}
      <Box
        sx={{
          textAlign: 'center',
          mb: { xs: 4, md: 6 },
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: { xs: 1, md: 2 },
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Logo
            variant="original"
            size={getLogoSize()}
            showText={false}
            sx={{
              mb: { xs: 2, md: 3 },
              // Garantir que o logo não ultrapasse a tela em mobile
              maxWidth: '90%',
              height: 'auto',
            }}
          />

          {/* Texto de boas-vindas */}
          <Typography
            variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h3'}
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 600,
              color: 'primary.main',
              mt: { xs: 1, md: 2 },
            }}
          >
            Bem-vindo!
          </Typography>

          <Typography
            variant={isMobile ? 'body2' : 'body1'}
            color="text.secondary"
            sx={{
              maxWidth: { xs: '100%', sm: '80%', md: '60%' },
              px: { xs: 1, sm: 2 },
            }}
          >
            Gerencie suas receitas, ingredientes e cardápios de forma inteligente e organizada.
          </Typography>
        </Box>
      </Box>

      {/* Grid de acesso rápido */}
      <Box sx={{ mt: { xs: 3, md: 4 } }}>
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 500,
            mb: { xs: 2, md: 3 },
            px: { xs: 1, sm: 0 },
          }}
        >
          Acesso Rápido
        </Typography>

        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
          {quickAccessItems.map((item, index) => (
            <Grid
              key={item.title}
              size={{
                xs: 12,
                sm: 6,
                md: 6,
                lg: 3,
              }}
            >
              <Card
                component="button"
                onClick={() => handleNavigation(item.path)}
                role="button"
                tabIndex={0}
                aria-label={`Navegar para ${item.title}: ${item.description}`}
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: 'none',
                  background: 'inherit',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  '&:active': {
                    transform: 'translateY(0px)',
                  },
                  '&:focus': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '2px',
                  },
                  // Garantir tamanho mínimo touch-friendly
                  minHeight: { xs: 120, sm: 140 },
                }}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    p: { xs: 2, sm: 3 },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mb: { xs: 1, sm: 2 },
                    }}
                  >
                    <item.icon
                      sx={{
                        fontSize: { xs: 32, sm: 40, md: 48 },
                        color: item.color,
                      }}
                    />
                  </Box>
                  <Typography
                    variant={isMobile ? 'subtitle2' : 'h6'}
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 500,
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant={isMobile ? 'caption' : 'body2'}
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.4,
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default HomePage;
