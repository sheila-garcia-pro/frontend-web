import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Tipos de notificação
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
// Níveis de prioridade para notificações
export type NotificationPriority = 'high' | 'medium' | 'low';

// Interface de notificação
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  category?: string;
  duration?: number;
}

// Interface do estado da UI
export interface UIState {
  loading: {
    global: boolean;
    [key: string]: boolean;
  };
  notifications: Notification[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

// Estado inicial
const initialState: UIState = {
  loading: {
    global: false,
  },
  notifications: [],
  theme: 'light',
  sidebarOpen: false,
};

// Slice da UI
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Loading
    setLoading: (state, action: PayloadAction<{ key: string; loading: boolean }>) => {
      state.loading[action.payload.key] = action.payload.loading;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },

    // Notificações
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'priority'> & { priority?: NotificationPriority }>) => {
      const id = Date.now().toString();
      
      // Definir prioridade baseada no tipo, se não fornecida
      let priority = action.payload.priority;
      if (!priority) {
        switch (action.payload.type) {
          case 'error':
            priority = 'high';
            break;
          case 'warning':
            priority = 'medium';
            break;
          default:
            priority = 'low';
        }
      }
      
      // Verificar se já existe uma notificação similar (mesma mensagem e tipo)
      const hasSimilar = state.notifications.some(
        (n) => n.message === action.payload.message && n.type === action.payload.type
      );
      
      // Não adicionar se já existir uma notificação similar
      if (!hasSimilar) {
        // Limitar a quantidade de notificações na fila (máximo 5)
        if (state.notifications.length >= 5) {
          // Remover a notificação mais antiga que não seja de alta prioridade
          const lowPriorityIndex = state.notifications.findIndex((n) => n.priority !== 'high');
          if (lowPriorityIndex >= 0) {
            state.notifications.splice(lowPriorityIndex, 1);
          } else {
            // Se todas forem de alta prioridade, remove a mais antiga
            state.notifications.shift();
          }
        }
        
        // Adicionar a nova notificação
        state.notifications.push({
          id,
          ...action.payload,
          priority,
        });
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload,
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Tema
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },

    // Sidebar
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

// Exporta actions
export const {
  setLoading,
  setGlobalLoading,
  addNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
} = uiSlice.actions;

// Exporta reducer
export default uiSlice.reducer;
