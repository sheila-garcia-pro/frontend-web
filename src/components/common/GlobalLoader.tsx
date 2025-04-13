import React from 'react';
import { useSelector } from 'react-redux';
import { Backdrop, CircularProgress, Typography, Box, useTheme } from '@mui/material';
import { RootState } from '@store/index';

// Componente de loader global que é exibido em operações assíncronas importantes
const GlobalLoader: React.FC = () => {
  const theme = useTheme();
  const { loading } = useSelector((state: RootState) => state.ui);

  // Verifica se o carregamento global está ativo
  const isLoading = loading.global;

  return (
    <Backdrop
      sx={{
        zIndex: theme.zIndex.drawer + 2,
        color: 'primary.main',
        flexDirection: 'column',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
      }}
      open={isLoading}
    >
      <CircularProgress color="inherit" size={60} thickness={4} />
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" color="primary.contrastText">
          Carregando...
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default GlobalLoader;
