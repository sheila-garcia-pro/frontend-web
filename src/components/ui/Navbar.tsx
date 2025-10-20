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
          md:
            open && !collapsed
              ? `calc(100% - ${drawerWidth}px)`
              : collapsed
                ? `calc(100% - 72px)`
                : '100%',
        },
        ml: {
          xs: 0,
          md: open && !collapsed ? `${drawerWidth}px` : collapsed ? '72px' : 0,
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
            aria-label="abrir menu"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: { xs: 1, sm: 2 },
              display: { md: 'none' },
              '&:hover': {
                backgroundColor:
                  mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
              },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1 }}></Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1 } }}>
          <Tooltip title={`Mudar para tema ${mode === 'light' ? 'escuro' : 'claro'}`}>
            <IconButton
              color="inherit"
              onClick={toggleTheme}
              sx={{
                borderRadius: 0,
                mr: { xs: 0.5, sm: 1 },
                '&:hover': {
                  backgroundColor:
                    mode === 'light' ? 'rgba(245, 243, 231, 0.2)' : 'rgba(232, 237, 170, 0.2)',
                },
              }}
            >
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>

          <Box>
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
                  borderRadius: 0,
                  mt: 1.5,
                  minWidth: { xs: 160, sm: 180 },
                  boxShadow:
                    mode === 'light'
                      ? '0px 4px 12px rgba(58, 69, 52, 0.15)'
                      : '0px 4px 12px rgba(0, 0, 0, 0.4)',
                  border: mode === 'light' ? 'none' : '1px solid rgba(232, 237, 170, 0.15)',
                },
              }}
            >
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleCloseMenu}
                sx={{ py: { xs: 1, sm: 1.5 } }}
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
              <MenuItem onClick={handleLogout} sx={{ py: { xs: 1, sm: 1.5 } }}>
                <LogoutIcon
                  fontSize="small"
                  sx={{
                    mr: { xs: 1, sm: 1.5 },
                    fontSize: { xs: 16, sm: 20 },
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
