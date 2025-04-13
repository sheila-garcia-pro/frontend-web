import React, { useEffect, ElementType } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

// Importações do Redux
import { RootState } from '@store/index';
import { addNotification } from '@store/slices/uiSlice';

// Componente da página do Dashboard
const DashboardPage: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Efeito para demonstrar notificações (apenas para exemplo)
  useEffect(() => {
    // Exibe uma notificação de boas-vindas quando o componente é montado
    dispatch(
      addNotification({
        message: `Bem-vindo ao Dashboard, ${user?.name || 'Usuário'}!`,
        type: 'success',
        duration: 5000,
      }),
    );
  }, [dispatch, user]);

  // Função para mostrar notificações (exemplos)
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Operação realizada com sucesso!',
      error: 'Ocorreu um erro ao processar sua solicitação.',
      warning: 'Atenção! Esta ação pode afetar seus dados.',
      info: 'O sistema será atualizado em breve.',
    };

    dispatch(
      addNotification({
        message: messages[type],
        type,
        duration: 3000,
      }),
    );
  };

  return (
    <Box>
      {/* Cabeçalho da página */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Bem-vindo ao seu painel de controle. Aqui você pode gerenciar todas as funcionalidades.
        </Typography>
      </Box>

      {/* Cards de informações */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Card 1 */}
        <Grid item xs={12} md={6} lg={3} component={'div' as ElementType}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Usuários
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
              42
            </Typography>
            <Typography variant="body2">Total de usuários ativos</Typography>
          </Paper>
        </Grid>

        {/* Card 2 */}
        <Grid item xs={12} md={6} lg={3} component={'div' as ElementType}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              backgroundColor: 'secondary.main',
              color: 'secondary.contrastText',
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Produtos
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
              156
            </Typography>
            <Typography variant="body2">Total de produtos</Typography>
          </Paper>
        </Grid>

        {/* Card 3 */}
        <Grid item xs={12} md={6} lg={3} component={'div' as ElementType}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              backgroundColor: 'success.main',
              color: 'success.contrastText',
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Vendas
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
              R$ 12.500
            </Typography>
            <Typography variant="body2">Vendas do mês</Typography>
          </Paper>
        </Grid>

        {/* Card 4 */}
        <Grid item xs={12} md={6} lg={3} component={'div' as ElementType}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
              backgroundColor: 'warning.main',
              color: 'warning.contrastText',
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom>
              Pedidos
            </Typography>
            <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
              32
            </Typography>
            <Typography variant="body2">Pedidos pendentes</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Segunda linha - Conteúdo principal */}
      <Grid container spacing={3}>
        {/* Coluna da esquerda */}
        <Grid item xs={12} md={4} component={'div' as ElementType}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Informações do Usuário
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText primary="Nome" secondary={user?.name || 'Usuário de Teste'} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SettingsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Função" secondary={user?.role || 'Administrador'} />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Editar Perfil
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Coluna do meio */}
        <Grid item xs={12} md={4} component={'div' as ElementType}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Atividades Recentes
              </Typography>
              <Divider sx={{ my: 2 }} />
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="Alteração de configurações" secondary="Há 2 horas" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText primary="Nova notificação recebida" secondary="Há 5 horas" />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button size="small" color="primary">
                Ver todas
              </Button>
            </CardActions>
          </Card>
        </Grid>

        {/* Coluna da direita - Demonstração de notificações */}
        <Grid item xs={12} md={4} component={'div' as ElementType}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Demonstração de Notificações
              </Typography>
              <Typography variant="body2" paragraph>
                Clique nos botões abaixo para testar os diferentes tipos de notificações.
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6} component={'div' as ElementType}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => showNotification('success')}
                  >
                    Sucesso
                  </Button>
                </Grid>
                <Grid item xs={6} component={'div' as ElementType}>
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    onClick={() => showNotification('error')}
                  >
                    Erro
                  </Button>
                </Grid>
                <Grid item xs={6} component={'div' as ElementType}>
                  <Button
                    variant="contained"
                    color="warning"
                    fullWidth
                    onClick={() => showNotification('warning')}
                  >
                    Aviso
                  </Button>
                </Grid>
                <Grid item xs={6} component={'div' as ElementType}>
                  <Button
                    variant="contained"
                    color="info"
                    fullWidth
                    onClick={() => showNotification('info')}
                  >
                    Info
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
