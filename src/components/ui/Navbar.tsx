import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Badge,
  MenuItem,
  Menu,
  Button,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { RootState } from '@store/index';
import { useAuth } from '@hooks/useAuth';
import { useTheme } from '../../contexts/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import Logo from '@components/common/Logo';

import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

// Interface de propriedades
interface NavbarProps {
  drawerWidth: number;
  open: boolean;
  handleDrawerToggle: () => void;
}

// Componente Navbar
const Navbar: React.FC<NavbarProps> = ({ drawerWidth, open, handleDrawerToggle }) => {
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();
  const { logout } = useAuth();

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
        width: { sm: `calc(100% - ${open ? drawerWidth : 0}px)` },
        ml: { sm: `${open ? drawerWidth : 0}px` },
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
      <Toolbar sx={{ height: '120px' }}>
        {' '}
        {/* Altura aumentada para melhor aparência */}
        {/* Botão de menu */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            borderRadius: '8px', // Borda mais arredondada
            '&:hover': {
              backgroundColor:
                mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        {/* Logo */}
        <Box
          sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
        >
          <Logo
            variant="symbol"
            size={60}
            showText={false}
            to="/"
            isHeader={true}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              '& img': {
                height: '60px',
                width: 'auto',
                objectFit: 'contain',
              },
            }}
          />
        </Box>
        {/* Ações da direita */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {' '}
          {/* Seletor de Idioma */}
          <LanguageSelector />
          {/* Botão de tema */}
          <Tooltip title={`Mudar para tema ${mode === 'light' ? 'escuro' : 'claro'}`}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                borderRadius: '8px', // Borda mais arredondada
                '&:hover': {
                  backgroundColor:
                    mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
                },
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          {/* Botão de notificações */}
          <Tooltip title="Notificações">
            <IconButton
              color="inherit"
              sx={{
                borderRadius: '8px', // Borda mais arredondada
                '&:hover': {
                  backgroundColor:
                    mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
                },
              }}
            >
              <Badge
                badgeContent={4}
                color="secondary" // Usa a cor secundária para o badge
                sx={{
                  '& .MuiBadge-badge': {
                    fontWeight: 'bold',
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                  },
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          {/* Menu de usuário */}
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Opções da conta">
              <IconButton
                onClick={handleMenu}
                color="inherit"
                size="small"
                sx={{
                  p: 0,
                  ml: 1,
                  border:
                    mode === 'light'
                      ? '2px solid rgba(245, 243, 231, 0.6)'
                      : '2px solid rgba(232, 237, 170, 0.4)',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.2s ease-in-out, border 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    border:
                      mode === 'light'
                        ? '2px solid rgba(245, 243, 231, 0.9)'
                        : '2px solid rgba(232, 237, 170, 0.7)',
                  },
                }}
              >
                {' '}
                {user ? (
                  <Avatar
                    alt={user.name}
                    src={user.image}
                    sx={{
                      bgcolor: mode === 'light' ? '#3A4534' : '#E8EDAA',
                      color: mode === 'light' ? '#F5F3E7' : '#23291C',
                      fontWeight: 'bold',
                      border:
                        mode === 'light'
                          ? '2px solid rgba(245, 243, 231, 0.6)'
                          : '2px solid rgba(232, 237, 170, 0.4)',
                    }}
                  >
                    {!user.image && user.name ? user.name.charAt(0) : null}
                  </Avatar>
                ) : (
                  <AccountCircle />
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
                  borderRadius: '12px', // Menu com bordas mais arredondadas
                  mt: 1.5,
                  boxShadow:
                    mode === 'light'
                      ? '0px 4px 12px rgba(58, 69, 52, 0.15)'
                      : '0px 4px 12px rgba(0, 0, 0, 0.4)',
                  border: mode === 'light' ? 'none' : '1px solid rgba(232, 237, 170, 0.15)',
                },
              }}
            >
              {' '}
              <MenuItem component={RouterLink} to="/profile" onClick={handleCloseMenu}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    mr: 1,
                    bgcolor: mode === 'light' ? '#3A4534' : '#E8EDAA',
                    color: mode === 'light' ? '#F5F3E7' : '#23291C',
                  }}
                />
                {t('navbar.profile')}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
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
