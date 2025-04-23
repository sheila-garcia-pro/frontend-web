import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification, NotificationType, NotificationPriority } from '@store/slices/uiSlice';

interface NotificationOptions {
  message: string;
  type?: NotificationType;
  duration?: number;
  priority?: NotificationPriority;
  category?: string;
}

/**
 * Hook para gerenciar notificações de forma simplificada
 */
export const useNotification = () => {
  const dispatch = useDispatch();

  // Função para mostrar uma notificação de erro (sempre alta prioridade)
  const showError = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'message' | 'type'>) => {
      dispatch(
        addNotification({
          message,
          type: 'error',
          priority: 'high',
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Função para mostrar uma notificação de aviso (sempre prioridade média)
  const showWarning = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'message' | 'type'>) => {
      dispatch(
        addNotification({
          message,
          type: 'warning',
          priority: 'medium',
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Função para mostrar uma notificação de sucesso (prioridade média por padrão)
  const showSuccess = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'message' | 'type'>) => {
      dispatch(
        addNotification({
          message,
          type: 'success',
          priority: options?.priority || 'medium',
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Função para mostrar uma notificação informativa (baixa prioridade por padrão)
  const showInfo = useCallback(
    (message: string, options?: Omit<NotificationOptions, 'message' | 'type'>) => {
      dispatch(
        addNotification({
          message,
          type: 'info',
          priority: options?.priority || 'low',
          ...options,
        })
      );
    },
    [dispatch]
  );

  // Função genérica para mostrar qualquer tipo de notificação
  const show = useCallback(
    (options: NotificationOptions) => {
      dispatch(
        addNotification({
          ...options,
          type: options.type || 'info',
        })
      );
    },
    [dispatch]
  );

  return {
    showError,
    showWarning,
    showSuccess,
    showInfo,
    show,
  };
};

export default useNotification; 