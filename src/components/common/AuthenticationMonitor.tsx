import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@store/index';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import { useAuth } from '@hooks/useAuth';

/**
 * Componente que monitora o estado de autenticação e exibe
 * modais informativos quando necessário
 */
const AuthenticationMonitor: React.FC = () => {
  const theme = useTheme();
  const { isAuthenticated, error } = useSelector((state: RootState) => state.auth);
  const { logout } = useAuth();
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = useState(false);

  useEffect(() => {
    // Verificar se há erro de sessão expirada
    if (error && error.includes('expirou')) {
      setShowSessionExpiredDialog(true);
    }
  }, [error]);

  useEffect(() => {
    // Listener para evento de sessão expirada do interceptor
    const handleSessionExpired = () => {
      setShowSessionExpiredDialog(true);
    };

    window.addEventListener('auth:sessionExpired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth:sessionExpired', handleSessionExpired);
    };
  }, []);

  const handleSessionExpiredConfirm = () => {
    setShowSessionExpiredDialog(false);
    logout();
  };

  // Se o usuário está autenticado e não há erros, não mostrar nada
  if (isAuthenticated && !error) {
    return null;
  }

  return (
    <>
      {/* Modal de Sessão Expirada */}
      <Dialog
        open={showSessionExpiredDialog}
        disableEscapeKeyDown
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(35, 41, 28, 0.95)'
                : 'rgba(245, 243, 231, 0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.mode === 'dark' ? '#E8EDAA' : theme.palette.primary.main}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            color: theme.palette.mode === 'dark' ? '#E8EDAA' : theme.palette.primary.main,
            fontWeight: 600,
          }}
        >
          Sessão Expirada
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.text.primary,
                mb: 2,
              }}
            >
              Sua sessão expirou por motivos de segurança.
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.mode === 'dark' ? '#CCCCCC' : theme.palette.text.secondary,
              }}
            >
              Você será redirecionado para a tela de login para continuar usando o sistema.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            onClick={handleSessionExpiredConfirm}
            variant="contained"
            color="primary"
            sx={{
              minWidth: 120,
              fontWeight: 600,
            }}
          >
            Fazer Login
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AuthenticationMonitor;
