import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert, Typography, useTheme } from '@mui/material';
import { RootState } from '@store/index';
import { removeNotification } from '@store/slices/uiSlice';

// Componente que exibe notificações do sistema
const NotificationsManager: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.ui);

  // Manipulador para fechar uma notificação
  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  return (
    <>
      {notifications.map((notification, index) => (
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
            <Typography variant="body2">{notification.message}</Typography>
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};

export default NotificationsManager;
