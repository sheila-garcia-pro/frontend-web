import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { styled, useTheme, Theme, alpha } from '@mui/material/styles';
import {
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Restaurant as RestaurantIcon,
  Kitchen as KitchenIcon,
  Home as HomeIcon,
  MenuBook as MenuBookIcon,
  Store as StoreIcon,
  LocalOffer as LocalOfferIcon,
  CreditCard as CreditCardIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
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
  borderRadius: '10px',
  margin: theme.spacing(0.25, 1),
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(1),
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
  minHeight: '48px',
  justifyContent: 'flex-start',
  color: alpha(theme.palette.common.white, 0.82),
  transition: 'background-color 0.2s ease-out, color 0.2s ease-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.06),
  },
  '&.Mui-selected': {
    backgroundColor: alpha(theme.palette.primary.light, 0.16),
    color: theme.palette.primary.light,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.light, 0.16),
    },
    '& .MuiListItemText-primary': {
      fontWeight: 600,
    },
    '& .MuiSvgIcon-root': {
      color: theme.palette.primary.light,
      opacity: 1,
    },
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }: { theme: Theme }) => ({
  minWidth: '40px',
  color: 'inherit',
  justifyContent: 'center',
  opacity: 0.8,
  '& .MuiSvgIcon-root': {
    fontSize: '20px',
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }: { theme: Theme }) => ({
  '& .MuiListItemText-primary': {
    fontSize: '14px',
    fontWeight: 500,
    color: 'inherit',
    opacity: 0.86,
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
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  // Hook de responsividade para otimizações adicionais
  const { isTablet, isDesktop } = useDevice();

  const sidebarBackground = alpha(theme.palette.primary.dark, 0.98);
  const sidebarBorder = alpha(theme.palette.common.white, 0.1);
  const sidebarText = alpha(theme.palette.common.white, 0.86);
  const sidebarTextMuted = alpha(theme.palette.common.white, 0.7);

  const socialLinks = [
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/chefsheilagarcia',
      icon: <InstagramIcon sx={{ fontSize: 16 }} />,
    },
    {
      label: 'WhatsApp',
      href: 'https://wa.me/5511956070390',
      icon: <WhatsAppIcon sx={{ fontSize: 16 }} />,
    },
  ];

  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

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
    { key: 'plans', icon: CreditCardIcon, path: '/planos', label: t('menu.plans') },
    { key: 'suppliers', icon: StoreIcon, path: '/suppliers', label: t('menu.suppliers') },
    { key: 'coupons', icon: LocalOfferIcon, path: '/coupons', label: t('menu.coupons') },
  ];

  const authenticatedItems = [
    { key: 'profile', icon: PersonIcon, path: '/profile', label: t('menu.profile') },
  ];

  const renderMenuItem = (item: any) => {
    const isActive = isActiveRoute(item.path);
    const menuItem = (
      <StyledListItemButton
        selected={isActive}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => handleNavigation(item.path)}
        sx={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 1.5,
          py: { xs: 1.5, sm: 1.25, md: 1 },
          minHeight: { xs: 56, sm: 52, md: 48 },
          mx: 0.5,
          my: 0.25,
        }}
      >
        <StyledListItemIcon
          sx={{
            minWidth: collapsed ? '24px' : '40px',
            transition: 'all 0.3s ease-in-out',
            color: isActive ? theme.palette.primary.light : sidebarTextMuted,
            opacity: isActive ? 1 : 0.85,
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
                fontWeight: isActive ? 600 : 500,
                color: isActive ? theme.palette.primary.light : sidebarText,
                opacity: isActive ? 1 : 0.86,
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
                bgcolor: alpha(theme.palette.common.black, 0.9),
                color: alpha(theme.palette.common.white, 0.95),
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
          backgroundColor: sidebarBackground,
          color: sidebarText,
          borderRight: `1px solid ${sidebarBorder}`,
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
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
            bgcolor: alpha(theme.palette.primary.dark, 0.96),
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
            <Logo size="small" variant="white" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: sidebarText }}>
              Sheila Garcia
            </Typography>
          </Box>
        )}

        {collapsed && (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Logo size="tiny" variant="white" />
          </Box>
        )}

        {/* Botão de colapso só visível em desktop */}
        {isDesktop && (
          <Tooltip title={collapsed ? 'Expandir' : 'Minimizar'} placement="right" enterDelay={300}>
            <IconButton
              onClick={handleCollapsedToggle}
              size={isMobile ? 'medium' : 'small'}
              sx={{
                color: sidebarTextMuted,
                minWidth: { xs: 44, sm: 40 },
                minHeight: { xs: 44, sm: 40 },
                borderRadius: 2,
                transition: 'all 0.2s ease-out',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.06),
                  transform: 'scale(1.05)',
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

      <Divider
        sx={{
          mx: collapsed ? 0.5 : 1,
          borderColor: alpha(theme.palette.common.white, 0.1),
        }}
      />

      <List
        sx={{
          px: 0,
          py: 0.5,
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        }}
      >
        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding>
            {renderMenuItem(item)}
          </ListItem>
        ))}

        {isAuthenticated && (
          <>
            <Divider
              sx={{
                mx: collapsed ? 0.5 : 2,
                my: 1,
                borderColor: alpha(theme.palette.common.white, 0.1),
              }}
            />
            {authenticatedItems.map((item) => (
              <ListItem key={item.key} disablePadding>
                {renderMenuItem(item)}
              </ListItem>
            ))}
          </>
        )}
      </List>

      <Box
        sx={{
          px: collapsed ? 1 : 2,
          pb: collapsed ? 1.5 : 2,
        }}
      >
        <Divider
          sx={{
            mb: 1,
            borderColor: alpha(theme.palette.common.white, 0.1),
          }}
        />
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              color: sidebarTextMuted,
              mb: 1,
              display: 'block',
            }}
          >
            Siga a Sheila Garcia
          </Typography>
        )}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {socialLinks.map((link) => (
            <Tooltip key={link.label} title={link.label} placement="top" arrow>
              <IconButton
                component="a"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
                sx={{
                  borderRadius: 2,
                  p: 0.75,
                  minWidth: 32,
                  minHeight: 32,
                  color: sidebarTextMuted,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                  backgroundColor: alpha(theme.palette.common.white, 0.02),
                  transition: 'all 0.2s ease-out',
                  '&:hover': {
                    color: theme.palette.primary.light,
                    borderColor: alpha(theme.palette.primary.light, 0.4),
                    backgroundColor: alpha(theme.palette.primary.light, 0.12),
                  },
                }}
              >
                {link.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
