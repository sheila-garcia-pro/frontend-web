import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Tipos de notificação
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Interface de notificação
export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
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
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const id = Date.now().toString();
      state.notifications.push({
        id,
        ...action.payload,
      });
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
