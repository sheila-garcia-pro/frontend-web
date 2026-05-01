import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  IconButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  Restaurant,
  Kitchen,
  MenuBook,
  Settings,
  ArrowForward,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);

  const planLabel = 'Plano Gratis';

  const userName = user?.name || 'Usuario';

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const sectionCardSx = {
    borderRadius: 2,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    backgroundColor: theme.palette.background.paper,
    transition: 'box-shadow 0.2s ease-out, transform 0.2s ease-out',
    '&:hover': {
      boxShadow: theme.shadows[2],
      transform: 'translateY(-1px)',
    },
  } as const;

  const renderSectionHeader = (title: string, to: string) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: 2,
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Button
        component={RouterLink}
        to={to}
        size="small"
        variant="text"
        endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
      >
        Ver todos
      </Button>
    </Box>
  );

  const renderEmptyCard = (
    title: string,
    description: string,
    actionLabel: string,
    actionPath: string,
    icon: React.ReactNode,
  ) => (
    <Card
      sx={{
        ...sectionCardSx,
        p: 0,
        cursor: 'pointer',
      }}
      role="button"
      tabIndex={0}
      onClick={() => handleNavigation(actionPath)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleNavigation(actionPath);
        }
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: { xs: 2, sm: 2.5 },
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Box>
        <Typography variant="caption" color="primary.main">
          {actionLabel}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        py: { xs: 2, sm: 3, md: 4 },
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2.5, md: 3.5 },
      }}
    >
      <Card
        sx={{
          borderRadius: 2,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[1],
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Avatar src={user?.image} alt={userName} sx={{ width: 56, height: 56 }} />
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {userName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {planLabel}
            </Typography>
          </Box>
          <IconButton
            aria-label="Configurar perfil"
            onClick={() => handleNavigation('/profile')}
            sx={{
              alignSelf: { xs: 'flex-start', sm: 'center' },
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.16),
              },
            }}
          >
            <Settings fontSize="small" />
          </IconButton>
        </CardContent>
      </Card>

      <Box>
        {renderSectionHeader('Ingredientes utilizados', '/ingredients')}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {renderEmptyCard(
            'Nenhum ingrediente utilizado',
            'Adicione ingredientes para acompanhar custos e receitas.',
            'Adicionar',
            '/ingredients',
            <Kitchen fontSize="small" />,
          )}
        </Box>
      </Box>

      <Box>
        {renderSectionHeader('Minhas Receitas', '/recipes')}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {renderEmptyCard(
            'Nenhuma receita cadastrada',
            'Crie receitas para gerar fichas tecnicas completas.',
            'Criar',
            '/recipes',
            <Restaurant fontSize="small" />,
          )}
        </Box>
      </Box>

      <Box>
        {renderSectionHeader('Meus Cardapios', '/menu')}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 2,
          }}
        >
          {renderEmptyCard(
            'Nenhum cardapio criado',
            'Monte cardapios personalizados para seus clientes.',
            'Novo cardapio',
            '/menu',
            <MenuBook fontSize="small" />,
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
