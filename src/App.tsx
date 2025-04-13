import React from 'react';
import AppRoutes from '@routes/index';
import { Provider } from 'react-redux';
import { store } from '@store/index';
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline } from '@mui/material';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </Provider>
  );
};

export default App;
