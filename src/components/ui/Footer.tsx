import React from 'react';
import { Box, Typography, Link, Container } from '@mui/material';
import { Theme } from '@mui/material/styles';
import Logo from '@components/common/Logo';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme: Theme) =>
          theme.palette.mode === 'light' 
            ? 'rgba(141, 166, 122, 0.15)' // Verde claro suave com transparência
            : theme.palette.background.paper, // Usa o papel do tema dark
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Logo 
            variant="round" 
            size="small" 
            showText={false}
            sx={{ mb: 1 }}
          />
          <Typography variant="body2" color="text.secondary" align="center">
            {'Copyright © '}
            <Link color="primary" href="/">
              Sheila Garcia
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
