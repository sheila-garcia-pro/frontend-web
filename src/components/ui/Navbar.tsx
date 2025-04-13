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
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { RootState } from '@store/index';
import { logout } from '@store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import { useTheme as useMuiTheme } from '@mui/material/styles';

// Interface de propriedades
interface NavbarProps {
  drawerWidth: number;
  open: boolean;
  handleDrawerToggle: () => void;
}

// Componente Navbar
const Navbar: React.FC<NavbarProps> = ({ drawerWidth, open, handleDrawerToggle }) => {
  const dispatch = useDispatch();
  const { mode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const { user } = useSelector((state: RootState) => state.auth);

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
    dispatch(logout());
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
      }}
    >
      <Toolbar>
        {/* Botão de menu */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Logo/Título */}
        <Typography
          variant="h6"
          noWrap
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Sheila Garcia Pro
        </Typography>

        {/* Ações da direita */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Botão de tema */}
          <Tooltip title={`Mudar para tema ${mode === 'light' ? 'escuro' : 'claro'}`}>
            <IconButton color="inherit" onClick={toggleTheme}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          {/* Botão de notificações */}
          <Tooltip title="Notificações">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Menu de usuário */}
          <Box sx={{ ml: 1 }}>
            <Tooltip title="Opções da conta">
              <IconButton onClick={handleMenu} color="inherit" size="small" sx={{ p: 0, ml: 1 }}>
                {user?.name ? (
                  <Avatar alt={user.name} src="/static/images/avatar/1.jpg">
                    {user.name.charAt(0)}
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
            >
              <MenuItem component={RouterLink} to="/profile" onClick={handleCloseMenu}>
                <Avatar sx={{ width: 24, height: 24, mr: 1 }} />
                Perfil
              </MenuItem>
              <MenuItem component={RouterLink} to="/settings" onClick={handleCloseMenu}>
                <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                Configurações
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
