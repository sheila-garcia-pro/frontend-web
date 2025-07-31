import React from 'react';
import AppRoutes from '@routes/index';
import { Provider } from 'react-redux';
import { store } from '@store/index';
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline, Box } from '@mui/material';
import NotificationsManager from '@components/common/NotificationsManager';
import SilentErrorBoundary from '@components/common/SilentErrorBoundary';
import AuthProvider from '@components/providers/AuthProvider';
import './i18n/i18n'; // Importando a configuração do i18n

const App: React.FC = () => {
  return (
    <SilentErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <AuthProvider>
            <CssBaseline />
            <Box
              sx={{
                minHeight: '100vh',
                backgroundColor: 'background.default',
                color: 'text.primary',
              }}
            >
              <AppRoutes />
              <NotificationsManager />
            </Box>
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </SilentErrorBoundary>
  );
};

export default App;
