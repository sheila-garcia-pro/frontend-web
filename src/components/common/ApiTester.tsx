import React from 'react';
import { Button, Box } from '@mui/material';
import api from '@services/api/index';

/**
 * Componente para testar se APIs com 401 limpam o token
 * Remove em produção
 */
const ApiTester: React.FC = () => {
  const handleTestUnauthorized = async () => {
    try {
      // Esta rota deve retornar 401 se o token estiver inválido
      const response = await api.get('/v1/users/me');
    } catch (error) {
      console.log('❌ Erro capturado:', error);
    }
  };

  // Só mostrar em desenvolvimento
  if (import.meta.env.MODE === 'production') {
    return null;
  }

  return (
    <Box sx={{ position: 'fixed', bottom: 20, left: 20, zIndex: 9999 }}>
      <Button variant="outlined" color="primary" onClick={handleTestUnauthorized} size="small">
        Testar API 401
      </Button>
    </Box>
  );
};

export default ApiTester;
