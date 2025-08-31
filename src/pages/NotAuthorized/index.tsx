/**
 * Página de Não Autorizado (403)
 *
 * Exibida quando o usuário está autenticado mas não tem permissões
 * suficientes para acessar uma rota ou recurso.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container, Paper, useTheme } from '@mui/material';
import {
  Block as BlockIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';

const NotAuthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            maxWidth: 500,
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <BlockIcon
              sx={{
                fontSize: 80,
                color: theme.palette.error.main,
              }}
            />
          </Box>

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: theme.palette.error.main,
              mb: 2,
            }}
          >
            403
          </Typography>

          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            Acesso Negado
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            }}
          >
            Você não tem permissão para acessar este recurso. Se acredita que isso é um erro, entre
            em contato com o administrador do sistema.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'center',
            }}
          >
            <Button
              variant="contained"
              onClick={handleGoHome}
              startIcon={<HomeIcon />}
              sx={{
                minWidth: 140,
              }}
            >
              Ir para Início
            </Button>

            <Button
              variant="outlined"
              onClick={handleGoBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                minWidth: 140,
              }}
            >
              Voltar
            </Button>
          </Box>

          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.disabled,
              }}
            >
              Código de erro: 403 - Forbidden
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default NotAuthorizedPage;
