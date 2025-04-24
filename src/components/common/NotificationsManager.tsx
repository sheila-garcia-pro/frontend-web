import React, { useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, Typography, useTheme, Badge } from '@mui/material';
import { RootState } from '@store/index';
import { removeNotification, Notification } from '@store/slices/uiSlice';

// Interface estendida para notificações agrupadas
interface GroupedNotification extends Notification {
  count?: number;
}

// Componente que exibe notificações do sistema
const NotificationsManager: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.ui);

  // Manipulador para fechar uma notificação
  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  // Filtrar e priorizar notificações, e agrupar notificações similares por categoria
  const filteredNotifications = useMemo(() => {
    // Separar notificações por prioridade
    const highPriority = notifications.filter(notification => notification.priority === 'high');
    const mediumPriority = notifications.filter(notification => notification.priority === 'medium');
    const lowPriority = notifications.filter(notification => notification.priority === 'low');
    
    // Primeiro, adicionar as de alta prioridade
    let priorityFiltered = [...highPriority];
    
    // Adicionar as de média prioridade se houver espaço
    priorityFiltered = [...priorityFiltered, ...mediumPriority];
    
    // Adicionar as de baixa prioridade apenas se não tivermos notificações suficientes
    if (priorityFiltered.length < 3) {
      priorityFiltered = [...priorityFiltered, ...lowPriority].slice(0, 3);
    }

    // Agrupar notificações por categoria (se definida)
    const grouped = priorityFiltered.reduce((acc, notification) => {
      if (notification.category) {
        // Verificar se já existe um grupo para esta categoria
        const existingGroup = acc.find((n) => n.category === notification.category);
        if (existingGroup) {
          // Incrementar contador no grupo existente
          existingGroup.count = (existingGroup.count || 1) + 1;
          return acc;
        }
        // Criar um novo grupo com contador
        return [...acc, { ...notification, count: 1 }];
      }
      // Não agrupar se não tiver categoria
      return [...acc, notification];
    }, [] as GroupedNotification[]);

    // Limitar a 3 notificações visíveis de cada vez
    return grouped.slice(0, 3);
  }, [notifications]);

  return (
    <>
      {filteredNotifications.map((notification, index) => (
        <Snackbar
          key={notification.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          onClose={() => handleClose(notification.id)}
          autoHideDuration={notification.duration || 5000}
          sx={{
            // Cálculo para empilhar várias notificações com espaçamento
            top: theme.spacing(1 + index * 8),
            zIndex: theme.zIndex.snackbar,
          }}
        >
          <Alert
            onClose={() => handleClose(notification.id)}
            severity={notification.type}
            variant="filled"
            elevation={6}
            sx={{ width: '100%', maxWidth: '400px' }}
          >
            <Typography variant="body2">
              {notification.message}
              {(notification as GroupedNotification).count && (notification as GroupedNotification).count! > 1 && (
                <Badge 
                  badgeContent={(notification as GroupedNotification).count} 
                  color="secondary"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationsManager;
