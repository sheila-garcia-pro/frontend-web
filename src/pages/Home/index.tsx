import React, { ElementType } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Grid, Card, CardContent, CardActions } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Code as CodeIcon,
} from '@mui/icons-material';

// Componente da página inicial
const HomePage: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bem-vindo à Sheila Garcia Pro
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Um template completo para aplicações React com TypeScript, Material UI e muito mais.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/dashboard"
            sx={{ mx: 1 }}
          >
            Dashboard
          </Button>
          <Button
            variant="outlined"
            color="primary"
            size="large"
            component={RouterLink}
            to="/login"
            sx={{ mx: 1 }}
          >
            Login
          </Button>
        </Box>
      </Box>

      {/* Features */}
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3 }}>
        Principais Recursos
      </Typography>
      <Grid container spacing={4}>
        {/* Item 1 */}
        <Grid item xs={12} sm={6} md={3} component={'div' as ElementType}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <DashboardIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Material UI
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interface moderna e responsiva utilizando o Material UI, com suporte a temas
                light/dark.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Saiba mais
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Item 2 */}
        <Grid item xs={12} sm={6} md={3} component={'div' as ElementType}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <LockIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Autenticação
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema completo de autenticação com Redux Saga, incluindo proteção de rotas e
                tokens JWT.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Saiba mais
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Item 3 */}
        <Grid item xs={12} sm={6} md={3} component={'div' as ElementType}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <InfoIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Notificações
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sistema global de notificações e feedbacks para o usuário.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Saiba mais
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Item 4 */}
        <Grid item xs={12} sm={6} md={3} component={'div' as ElementType}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <CodeIcon color="primary" sx={{ fontSize: 40, mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Estrutura Sólida
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Organização de código escalável e testável, com padrões modernos de desenvolvimento.
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Saiba mais
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
