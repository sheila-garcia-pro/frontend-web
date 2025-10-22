import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  ListItemButton,
  Typography,
  Tooltip,
} from '@mui/material';
import { styled, useTheme, Theme } from '@mui/material/styles';
import {
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Restaurant as RestaurantIcon,
  Kitchen as KitchenIcon,
  Home as HomeIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/index';
import { toggleSidebarCollapsed } from '@store/slices/uiSlice';
import { useDevice } from '@hooks/useDevice';
import Logo from '@components/common/Logo';

interface SidebarProps {
  open: boolean;
  collapsed: boolean;
  drawerWidth: number;
  handleDrawerToggle: () => void;
  isMobile: boolean;
}

const DrawerHeader = styled('div')(({ theme }: { theme: Theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(1, 2),
  minHeight: '64px',
  justifyContent: 'space-between',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }: { theme: Theme }) => ({
  borderRadius: 0,
  margin: theme.spacing(0.25, 1),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  minHeight: '48px',
  justifyContent: 'flex-start',
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.primary.dark + '20'
        : theme.palette.primary.light + '20',
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main + '15',
    '&:hover': {
      backgroundColor: theme.palette.primary.main + '25',
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }: { theme: Theme }) => ({
  minWidth: '40px',
  color: theme.palette.text.secondary,
  justifyContent: 'center',
  '& .MuiSvgIcon-root': {
    fontSize: '20px',
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }: { theme: Theme }) => ({
  '& .MuiListItemText-primary': {
    fontSize: '14px',
    fontWeight: 500,
    color: theme.palette.text.primary,
  },
}));

const Sidebar: React.FC<SidebarProps> = ({
  open,
  collapsed,
  drawerWidth,
  handleDrawerToggle,
  isMobile,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  // Hook de responsividade para otimizações adicionais
  const { isMobile: deviceIsMobile, isTablet, isDesktop } = useDevice();

  const handleNavigation = (path: string) => {
    navigate(path);
    // Fechar sidebar em dispositivos móveis e tablets após navegação
    if (isMobile || isTablet) {
      handleDrawerToggle();
    }
  };

  const handleCollapsedToggle = () => {
    // Só permite colapso em desktop
    if (isDesktop) {
      dispatch(toggleSidebarCollapsed());
    }
  };

  const menuItems = [
    { key: 'home', icon: HomeIcon, path: '/', label: t('menu.home') },
    { key: 'ingredients', icon: KitchenIcon, path: '/ingredients', label: t('menu.ingredients') },
    { key: 'recipes', icon: RestaurantIcon, path: '/recipes', label: t('menu.recipes') },
    { key: 'menu', icon: MenuBookIcon, path: '/menu', label: t('menu.menu') },
  ];

  const authenticatedItems = [
    { key: 'profile', icon: PersonIcon, path: '/profile', label: t('menu.profile') },
  ];

  const renderMenuItem = (item: any) => {
    const menuItem = (
      <StyledListItemButton
        onClick={() => handleNavigation(item.path)}
        sx={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 1.5,
          py: { xs: 1.5, sm: 1.25, md: 1 },
          minHeight: { xs: 56, sm: 52, md: 48 },
          borderRadius: 2,
          mx: 0.5,
          my: 0.25,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateX(4px)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'translateX(2px) scale(0.98)',
          },
        }}
      >
        <StyledListItemIcon
          sx={{
            minWidth: collapsed ? '24px' : '40px',
            transition: 'all 0.3s ease-in-out',
            '& .MuiSvgIcon-root': {
              fontSize: { xs: 22, sm: 21, md: 20 },
            },
          }}
        >
          <item.icon />
        </StyledListItemIcon>
        {!collapsed && (
          <StyledListItemText
            primary={item.label}
            sx={{
              '& .MuiListItemText-primary': {
                fontSize: { xs: '1rem', sm: '0.95rem', md: '0.875rem' },
                fontWeight: 500,
                transition: 'opacity 0.3s ease-in-out',
              },
            }}
          />
        )}
      </StyledListItemButton>
    );

    if (collapsed && isDesktop) {
      return (
        <Tooltip
          title={item.label}
          placement="right"
          arrow
          enterDelay={300}
          leaveDelay={100}
          PopperProps={{
            sx: {
              '& .MuiTooltip-tooltip': {
                bgcolor: theme.palette.mode === 'light' ? '#3A4534' : '#E8EDAA',
                color: theme.palette.mode === 'light' ? '#F5F3E7' : '#23291C',
                fontSize: '0.875rem',
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              },
            },
          }}
        >
          {menuItem}
        </Tooltip>
      );
    }

    return menuItem;
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRadius: 0,
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['width', 'transform'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          zIndex: isMobile || isTablet ? theme.zIndex.drawer + 2 : 'auto',
          // Melhor performance em mobile
          willChange: isMobile || isTablet ? 'transform' : 'auto',
          // Backdrop blur para mobile/tablet
          ...((isMobile || isTablet) && {
            backdropFilter: 'blur(8px)',
            bgcolor:
              theme.palette.mode === 'light'
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(35, 41, 28, 0.95)',
          }),
        },
      }}
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={handleDrawerToggle}
    >
      <DrawerHeader>
        {!collapsed && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Logo size="small" />
          </Box>
        )}

        {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Logo size="tiny" />
          </Box>
        )}

        {/* Botão de colapso só visível em desktop */}
        {isDesktop && (
          <Tooltip title={collapsed ? 'Expandir' : 'Minimizar'} placement="right" enterDelay={300}>
            <IconButton
              onClick={handleCollapsedToggle}
              size={isMobile ? 'medium' : 'small'}
              sx={{
                color: theme.palette.text.secondary,
                minWidth: { xs: 44, sm: 40 },
                minHeight: { xs: 44, sm: 40 },
                borderRadius: 2,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  transform: 'scale(1.1)',
                  color: theme.palette.primary.main,
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
          </Tooltip>
        )}
      </DrawerHeader>

      <Divider sx={{ mx: collapsed ? 0.5 : 1 }} />

      <List sx={{ px: 0, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            {renderMenuItem(item)}
          </ListItem>
        ))}

        {isAuthenticated && (
          <>
            <Divider sx={{ mx: collapsed ? 0.5 : 2, my: 1 }} />
            {authenticatedItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                {renderMenuItem(item)}
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;
