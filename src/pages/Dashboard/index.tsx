import React, { useEffect, ElementType } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';

// Importações do Redux
import { RootState, AppDispatch } from '@store/index';
import { fetchDashboardData } from '@store/slices/dashboardSlice';

// Hooks
import useNotification from '@hooks/useNotification';

// Componentes
import DashboardCard from '@components/dashboard/DashboardCard';

// Componente da página do Dashboard
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { summary, loading, error } = useSelector((state: RootState) => state.dashboard);
  const notification = useNotification();

  // Verificar se já exibiu notificação de boas-vindas hoje
  const hasShownWelcomeToday = () => {
    const lastShown = localStorage.getItem('dashboard_welcome_shown');
    if (!lastShown) return false;
    
    const lastDate = new Date(lastShown);
    const today = new Date();
    
    return lastDate.getDate() === today.getDate() && 
           lastDate.getMonth() === today.getMonth() && 
           lastDate.getFullYear() === today.getFullYear();
  };

  // Efeito para carregar os dados ao montar o componente
  useEffect(() => {
    // Carregar dados da dashboard
    dispatch(fetchDashboardData())
      .unwrap()
      .then(() => {
        // Exibir notificação de boas-vindas apenas uma vez por dia
        if (!hasShownWelcomeToday()) {
          notification.showSuccess(`Bem-vindo à sua Dashboard, ${user?.name || 'Usuário'}!`, {
            priority: 'low', // Baixa prioridade para não distrair
            duration: 5000,
          });
          
          // Marcar que exibiu a notificação hoje
          localStorage.setItem('dashboard_welcome_shown', new Date().toISOString());
        }
      })
      .catch((error) => {
        // Exibir notificação de erro (sempre alta prioridade)
        notification.showError('Erro ao carregar dados da Dashboard.');
      });
  }, [dispatch, user, notification]);

  // Funções de navegação
  // Variável para evitar mostrar múltiplas notificações do mesmo tipo
  const functionalityNotificationCategory = 'development-notification';
  
  const handleNavigateToPedidos = () => {
    navigate('/orders');
    notification.showInfo('Funcionalidade "Pedidos" em desenvolvimento.', {
      category: functionalityNotificationCategory,
      priority: 'low',
      duration: 3000,
    });
  };

  const handleNavigateToClientes = () => {
    navigate('/customers');
    notification.showInfo('Funcionalidade "Clientes" em desenvolvimento.', {
      category: functionalityNotificationCategory,
      priority: 'low',
      duration: 3000,
    });
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

      {/* Exibição de erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Estado de loading */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Cards de informações */}
          {summary && (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Card 1 - Total de pedidos */}
              <Grid item xs={12} sm={6} lg={3} component={'div' as ElementType}>
                <DashboardCard
                  title="Total de Pedidos"
                  value={summary.totalPedidos}
                  subtitle="Todos os pedidos realizados"
                  color="primary"
                  icon={<ShoppingCartIcon />}
                />
              </Grid>

              {/* Card 2 - Pedidos em andamento */}
              <Grid item xs={12} sm={6} lg={3} component={'div' as ElementType}>
                <DashboardCard
                  title="Em Andamento"
                  value={summary.pedidosEmAndamento}
                  subtitle="Pedidos sendo processados"
                  color="warning"
                  icon={<ShippingIcon />}
                />
              </Grid>

              {/* Card 3 - Clientes cadastrados */}
              <Grid item xs={12} sm={6} lg={3} component={'div' as ElementType}>
                <DashboardCard
                  title="Clientes"
                  value={summary.clientesCadastrados}
                  subtitle="Total de clientes cadastrados"
                  color="secondary"
                  icon={<PeopleIcon />}
                />
              </Grid>

              {/* Card 4 - Faturamento total */}
              <Grid item xs={12} sm={6} lg={3} component={'div' as ElementType}>
                <DashboardCard
                  title="Faturamento"
                  value={summary.faturamentoTotal}
                  subtitle="Faturamento total do período"
                  color="success"
                  icon={<MoneyIcon />}
                />
              </Grid>
            </Grid>
          )}

          {/* Botões de ação rápida */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} component={'div' as ElementType}>
              <Button 
                variant="contained" 
                fullWidth 
                startIcon={<ShoppingCartIcon />}
                onClick={handleNavigateToPedidos}
              >
                Ver detalhes dos pedidos
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} component={'div' as ElementType}>
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                startIcon={<PeopleIcon />}
                onClick={handleNavigateToClientes}
              >
                Gerenciar clientes
              </Button>
            </Grid>
          </Grid>

          {/* Informações adicionais */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" component="h3" gutterBottom>
                Resumo da Atividade
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Aqui serão exibidas informações sobre as atividades recentes e estatísticas do sistema.
                Este é um espaço dedicado para mostrar dados relevantes para o usuário.
              </Typography>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default DashboardPage;
