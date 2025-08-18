import React from 'react';
import { Box } from '@mui/material';
import Logo from '@components/common/Logo';

// Componente da página inicial
const HomePage: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      {/* Seção de Boas-vindas com Logo */}
      <Box
        sx={{
          textAlign: 'center',
          mb: 6,
          p: 3,
          borderRadius: 2,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
          <Logo
            variant="original"
            size={300}
            showText={false}
            sx={{
              mb: 2,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
