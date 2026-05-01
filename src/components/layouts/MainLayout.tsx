import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Container, Toolbar, styled } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/index';
import { toggleSidebar, setSidebarOpen } from '@store/slices/uiSlice';

// Hooks
import { useDevice } from '@hooks/useDevice';

// Componentes
import Navbar from '@components/ui/Navbar';
import Sidebar from '@components/ui/Sidebar';
import Footer from '@components/ui/Footer';
import GlobalLoader from '@components/common/GlobalLoader';

// Largura do sidebar quando aberto
const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 64;

// Estilização do container principal - Mobile First
const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'isMobile' && prop !== 'collapsed',
})<{
  open: boolean;
  isMobile: boolean;
  collapsed: boolean;
}>(({ theme, open, isMobile, collapsed }) => ({
  flexGrow: 1,
  // Mobile first: padding menor em mobile
  padding: theme.spacing(1, 2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // Mobile/Tablet: sempre sem margem lateral
  marginLeft: 0,
  // Desktop: margem baseada no estado do sidebar
  [theme.breakpoints.up('lg')]: {
    marginLeft: isMobile
      ? 0
      : open
        ? 0 // Sempre 0 quando o sidebar está aberto, independente se está colapsado ou não
        : `-${DRAWER_WIDTH}px`,
  },
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const MainLayout: React.FC = () => {
  // Redux
  const dispatch = useDispatch();
  const { sidebarOpen, sidebarCollapsed } = useSelector((state: RootState) => state.ui);

  // Responsividade com hook personalizado
  const { isMobile, isTablet, isDesktop } = useDevice();

  useEffect(() => {
    if (isMobile || isTablet) {
      dispatch(setSidebarOpen(false));
    }
  }, [isMobile, isTablet, dispatch]);

  // Handler para toggle do sidebar
  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Navbar no topo */}
      <Navbar
        drawerWidth={sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Sidebar lateral */}
      <Sidebar
        drawerWidth={sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        handleDrawerToggle={handleDrawerToggle}
        isMobile={isMobile || isTablet}
      />

      {/* Conteúdo principal */}
      <Main open={sidebarOpen} isMobile={isMobile} collapsed={sidebarCollapsed}>
        <Toolbar /> {/* Espaçamento para não sobrepor à navbar */}
        <Container
          maxWidth={isMobile ? 'sm' : isTablet ? 'md' : 'xl'}
          sx={{
            mt: { xs: 1, md: 2 },
            mb: { xs: 2, md: 4 },
            px: { xs: 1, sm: 2, md: 3 },
          }}
        >
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
