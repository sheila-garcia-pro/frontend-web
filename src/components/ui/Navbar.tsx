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
import Logo from '@components/common/Logo';

import LanguageSelector from './LanguageSelector';
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

  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

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
          md: `calc(100% - ${open ? drawerWidth : 0}px)`,
        },
        ml: {
          xs: 0,
          md: `${open ? drawerWidth : 0}px`,
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
      <Toolbar sx={{ height: '64px' }}>
        <IconButton
          color="inherit"
          aria-label="abrir menu"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { md: 'none' },
            '&:hover': {
              backgroundColor:
                mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box
          sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
        ></Box>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <LanguageSelector />

          <Tooltip title={`Mudar para tema ${mode === 'light' ? 'escuro' : 'claro'}`}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                borderRadius: 0,
                '&:hover': {
                  backgroundColor:
                    mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
                },
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          <Box sx={{ ml: 0.5 }}>
            <Tooltip title="Opções da conta">
              <IconButton
                onClick={handleMenu}
                color="inherit"
                size="small"
                sx={{
                  p: 0.5,
                  ml: 0,
                  borderRadius: '50%',
                  border: 'none',
                  boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.2)',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.3)',
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
                      width: 32,
                      height: 32,
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
                  borderRadius: 0,
                  mt: 1.5,
                  boxShadow:
                    mode === 'light'
                      ? '0px 4px 12px rgba(58, 69, 52, 0.15)'
                      : '0px 4px 12px rgba(0, 0, 0, 0.4)',
                  border: mode === 'light' ? 'none' : '1px solid rgba(232, 237, 170, 0.15)',
                },
              }}
            >
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
