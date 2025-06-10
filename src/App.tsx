import React from 'react';
import AppRoutes from '@routes/index';
import { Provider } from 'react-redux';
import { store } from '@store/index';
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline } from '@mui/material';
import NotificationsManager from '@components/common/NotificationsManager';
import './i18n/i18n'; // Importando a configuração do i18n

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <CssBaseline />
        <AppRoutes />
        <NotificationsManager />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
