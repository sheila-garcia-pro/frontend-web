import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  MenuItem,
  Menu,
  Button,
  Avatar,
  Tooltip,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { RootState } from '@store/index';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useDevice } from '@hooks/useDevice';
import Logo from '@components/common/Logo';
import { useTranslation } from 'react-i18next';

// Interface de propriedades
interface NavbarProps {
  drawerWidth: number;
  open: boolean;
  collapsed: boolean;
  handleDrawerToggle: () => void;
}

// Componente Navbar
const Navbar: React.FC<NavbarProps> = ({ drawerWidth, open, collapsed, handleDrawerToggle }) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const { logout } = useAuth();

  // Responsividade com hook personalizado
  const { isMobile, isTablet, isDesktop } = useDevice();

  // Estado do menu de usuário
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  // Manipuladores de menu
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  // Manipulador de logout
  const handleLogout = () => {
    logout();
    handleCloseMenu();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: {
          xs: '100%',
          lg:
            open && !collapsed
              ? `calc(100% - ${drawerWidth}px)`
              : collapsed
                ? `calc(100% - 72px)`
                : '100%',
        },
        ml: {
          xs: 0,
          lg: open && !collapsed ? `${drawerWidth}px` : collapsed ? '72px' : 0,
        },
        borderRadius: 0,
        transition: muiTheme.transitions.create(['margin', 'width'], {
          easing: muiTheme.transitions.easing.sharp,
          duration: muiTheme.transitions.duration.leavingScreen,
        }),
        zIndex: muiTheme.zIndex.drawer + 1,
        boxShadow:
          mode === 'light' ? '0px 2px 8px rgba(0, 0, 0, 0.15)' : '0px 2px 12px rgba(0, 0, 0, 0.3)',
        borderBottom:
          mode === 'light'
            ? '1px solid rgba(58, 69, 52, 0.12)'
            : '1px solid rgba(232, 237, 170, 0.2)',
      }}
    >
      <Toolbar
        sx={{
          height: '64px',
          minHeight: '64px !important',
          px: { xs: 1, sm: 2, md: 3 },
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label={open ? 'fechar menu' : 'abrir menu'}
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: { xs: 1, sm: 2 },
              display: { lg: 'none' },
              minWidth: { xs: 40, sm: 44 },
              minHeight: { xs: 40, sm: 44 },
              borderRadius: 2,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              '&:hover': {
                backgroundColor:
                  mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
                transform: open ? 'rotate(90deg) scale(1.1)' : 'scale(1.1)',
              },
              '&:active': {
                transform: open ? 'rotate(90deg) scale(0.95)' : 'scale(0.95)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo na navbar quando sidebar fechado (mobile/tablet) */}
          {(isMobile || isTablet) && !open && (
            <Box sx={{ ml: { xs: 1, sm: 2 } }}>
              <Logo size={isMobile ? 'small' : 'medium'} />
            </Box>
          )}
        </Box>

        <Box sx={{ flexGrow: 1 }}></Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
          <Tooltip
            title={`Mudar para tema ${mode === 'light' ? 'escuro' : 'claro'}`}
            placement="bottom"
          >
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                borderRadius: 2,
                mr: { xs: 0.5, sm: 1 },
                minWidth: { xs: 40, sm: 44 },
                minHeight: { xs: 40, sm: 44 },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  backgroundColor:
                    mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
                  transform: 'scale(1.1) rotate(180deg)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          <Box>
            <Tooltip title="Opções da conta" placement="bottom-end">
              <IconButton
                onClick={handleMenu}
                color="inherit"
                size={isMobile ? 'small' : 'medium'}
                sx={{
                  p: { xs: 0.5, sm: 0.75 },
                  ml: 0,
                  borderRadius: '50%',
                  border: 'none',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.3)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                {user ? (
                  <Avatar
                    alt={user.name}
                    src={user.image}
                    sx={{
                      bgcolor: mode === 'light' ? '#3A4534' : '#E8EDAA',
                      color: mode === 'light' ? '#F5F3E7' : '#23291C',
                      fontWeight: 'bold',
                      borderRadius: '50%',
                      width: { xs: 28, sm: 32 },
                      height: { xs: 28, sm: 32 },
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                    }}
                  >
                    {!user.image && user.name ? user.name.charAt(0) : null}
                  </Avatar>
                ) : (
                  <AccountCircle sx={{ fontSize: { xs: 28, sm: 32 } }} />
                )}
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  mt: 1.5,
                  minWidth: { xs: 180, sm: 200, md: 220 },
                  maxWidth: { xs: '90vw', sm: 300 },
                  boxShadow:
                    mode === 'light'
                      ? '0px 4px 12px rgba(58, 69, 52, 0.15)'
                      : '0px 4px 12px rgba(0, 0, 0, 0.4)',
                  border: mode === 'light' ? 'none' : '1px solid rgba(232, 237, 170, 0.15)',
                  backdropFilter: 'blur(8px)',
                  bgcolor:
                    mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(35, 41, 28, 0.95)',
                },
              }}
            >
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleCloseMenu}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 2.5 },
                  minHeight: { xs: 48, sm: 56 },
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                  '&:hover': {
                    bgcolor:
                      mode === 'light' ? 'rgba(58, 69, 52, 0.08)' : 'rgba(232, 237, 170, 0.08)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 20, sm: 24 },
                    height: { xs: 20, sm: 24 },
                    mr: { xs: 1, sm: 1.5 },
                    bgcolor: mode === 'light' ? '#3A4534' : '#E8EDAA',
                    color: mode === 'light' ? '#F5F3E7' : '#23291C',
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  }}
                />
                {t('navbar.profile')}
              </MenuItem>
              <MenuItem
                onClick={handleLogout}
                sx={{
                  py: { xs: 1.5, sm: 2 },
                  px: { xs: 2, sm: 2.5 },
                  minHeight: { xs: 48, sm: 56 },
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.light',
                    color: 'error.contrastText',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <LogoutIcon
                  sx={{
                    mr: { xs: 1, sm: 1.5 },
                    fontSize: { xs: 18, sm: 22 },
                  }}
                />
                {t('navbar.logout')}
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
