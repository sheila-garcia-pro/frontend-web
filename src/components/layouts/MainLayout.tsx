import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Container, Toolbar, useMediaQuery, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/index';
import { toggleSidebar } from '@store/slices/uiSlice';

// Componentes
import Navbar from '@components/ui/Navbar';
import Sidebar from '@components/ui/Sidebar';
import Footer from '@components/ui/Footer';
import GlobalLoader from '@components/common/GlobalLoader';

// Largura do sidebar quando aberto
const DRAWER_WIDTH = 240;

// Estilização do container principal
const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile',
})<{
  open: boolean;
  isMobile: boolean;
}>(({ theme, open, isMobile }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: isMobile ? 0 : `-${DRAWER_WIDTH}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const MainLayout: React.FC = () => {
  // Redux
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  // Responsividade
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handler para toggle do sidebar
  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Navbar no topo */}
      <Navbar
        drawerWidth={DRAWER_WIDTH}
        open={sidebarOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Sidebar lateral */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        open={sidebarOpen}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Conteúdo principal */}
      <Main open={sidebarOpen} isMobile={isMobile}>
        <Toolbar /> {/* Espaçamento para não sobrepor à navbar */}
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
          {/* Outlet renderiza as rotas filhas */}
          <Outlet />
        </Container>
        {/* Rodapé */}
        <Footer />
      </Main>

      {/* Loader global */}
      <GlobalLoader />
    </Box>
  );
};

export default MainLayout;
