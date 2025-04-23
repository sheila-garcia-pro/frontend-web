import React from 'react';
import { useSelector } from 'react-redux';
import { Backdrop, CircularProgress, Typography, Box, useTheme } from '@mui/material';
import { RootState } from '@store/index';

// Componente de loader global que é exibido em operações assíncronas importantes
const GlobalLoader: React.FC = () => {
  const theme = useTheme();
  const { loading } = useSelector((state: RootState) => state.ui);
  const isDarkMode = theme.palette.mode === 'dark';

  // Verifica se o carregamento global está ativo
  const isLoading = loading.global;

  return (
    <Backdrop
      sx={{
        zIndex: theme.zIndex.drawer + 2,
        color: isDarkMode ? '#E8EDAA' : 'primary.main', // Amarelo mais vibrante no modo escuro
        flexDirection: 'column',
        backgroundColor: isDarkMode 
          ? 'rgba(35, 41, 28, 0.85)' // Fundo verde escuro mais forte com transparência
          : 'rgba(245, 243, 231, 0.8)', // Fundo bege claro com transparência
      }}
      open={isLoading}
    >
      <CircularProgress 
        color="inherit" 
        size={60} 
        thickness={4}
        sx={{
          boxShadow: isDarkMode ? '0px 0px 15px rgba(232, 237, 170, 0.3)' : 'none',
        }}
      />
      <Box sx={{ mt: 2 }}>
        <Typography 
          variant="h6" 
          color={isDarkMode ? '#FFFFFF' : 'primary.main'} // Texto branco no modo escuro para melhor contraste
          sx={{
            fontWeight: 600,
            letterSpacing: '0.5px',
            textShadow: isDarkMode ? '0px 1px 2px rgba(0, 0, 0, 0.5)' : 'none',
          }}
        >
          Carregando...
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default GlobalLoader;
