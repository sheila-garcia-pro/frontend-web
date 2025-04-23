import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import { Link } from 'react-router-dom';
import logoSquare from '../../assets/logo_quadrado.png';
import logoRound from '../../assets/logo_redondo.png';
import { useTheme } from '@mui/material/styles';

interface LogoProps {
  variant?: 'square' | 'round';
  size?: 'small' | 'medium' | 'large' | number;
  showText?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  textColor?: string;
  to?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'square',
  size = 'medium',
  showText = true,
  onClick,
  sx = {},
  textColor = 'inherit',
  to = '/',
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Definir tamanho baseado na prop size
  let sizeInPx: number;
  switch (size) {
    case 'small':
      sizeInPx = 30;
      break;
    case 'medium':
      sizeInPx = 40;
      break;
    case 'large':
      sizeInPx = 80;
      break;
    default:
      sizeInPx = typeof size === 'number' ? size : 40;
  }

  // Escolher a imagem com base na variante
  const logoSrc = variant === 'square' ? logoSquare : logoRound;

  const logoComponent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        ...sx,
      }}
      onClick={onClick}
      component={to ? Link : 'div'}
      to={to}
    >
      <Box
        component="img"
        src={logoSrc}
        alt="Sheila Garcia Logo"
        sx={{
          height: sizeInPx,
          width: 'auto',
          transition: 'transform 0.3s ease-in-out',
          filter: isDarkMode ? 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))' : 'none',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      />
      {showText && (
        <Typography
          variant={size === 'large' ? 'h4' : size === 'small' ? 'body1' : 'h6'}
          component="span"
          sx={{
            ml: 1,
            fontWeight: 'bold',
            color: textColor,
            display: { xs: size === 'small' ? 'none' : 'block', sm: 'block' },
            letterSpacing: '0.5px',
            textShadow: isDarkMode ? '0px 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
          }}
        >
          Sheila Garcia
        </Typography>
      )}
    </Box>
  );

  return logoComponent;
};

export default Logo; 