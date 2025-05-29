import React from 'react';
import AppRoutes from '@routes/index';
import { Provider } from 'react-redux';
import { store } from '@store/index';
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline } from '@mui/material';
import NotificationsManager from '@components/common/NotificationsManager';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <CssBaseline />
          <AppRoutes />
          <NotificationsManager />
        </ThemeProvider>
      </I18nextProvider>
    </Provider>
  );
};

export default App;
