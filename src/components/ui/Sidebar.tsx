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
  LocalShipping as SuppliersIcon,
  MenuBook as MenuBookIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/index';
import { toggleSidebarCollapsed } from '@store/slices/uiSlice';
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

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const handleCollapsedToggle = () => {
    dispatch(toggleSidebarCollapsed());
  };

  const menuItems = [
    { key: 'home', icon: HomeIcon, path: '/', label: t('menu.home') },
    { key: 'ingredients', icon: KitchenIcon, path: '/ingredients', label: t('menu.ingredients') },
    { key: 'recipes', icon: RestaurantIcon, path: '/recipes', label: t('menu.recipes') },
    { key: 'menu', icon: MenuBookIcon, path: '/menu', label: t('menu.menu') },
  ];

  const authenticatedItems = [
    { key: 'suppliers', icon: SuppliersIcon, path: '/suppliers', label: t('menu.suppliers') },
    { key: 'profile', icon: PersonIcon, path: '/profile', label: t('menu.profile') },
  ];

  const renderMenuItem = (item: any) => {
    const menuItem = (
      <StyledListItemButton
        onClick={() => handleNavigation(item.path)}
        sx={{
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 1.5,
        }}
      >
        <StyledListItemIcon sx={{ minWidth: collapsed ? '24px' : '40px' }}>
          <item.icon />
        </StyledListItemIcon>
        {!collapsed && <StyledListItemText primary={item.label} />}
      </StyledListItemButton>
    );

    if (collapsed) {
      return (
        <Tooltip title={item.label} placement="right" arrow>
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
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
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

        <Tooltip title={collapsed ? 'Expandir' : 'Minimizar'} placement="right">
          <IconButton
            onClick={handleCollapsedToggle}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
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
