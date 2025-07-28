import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { getLogo, LOGO_ASSETS } from '../../assets/logoAssets';

interface LogoProps {
  variant?: 'symbol' | 'full' | 'original' | 'green' | 'pink' | 'beige' | 'white' | 'black';
  size?: 'tiny' | 'small' | 'medium' | 'large' | number;
  showText?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  textColor?: string;
  to?: string;
  isHeader?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'symbol',
  size = 'medium',
  showText = false,
  onClick,
  sx = {},
  textColor = 'inherit',
  to = '/',
  isHeader = false,
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  // Definir tamanho baseado na prop size
  let sizeInPx: number;
  switch (size) {
    case 'tiny':
      sizeInPx = 24;
      break;
    case 'small':
      sizeInPx = 40;
      break;
    case 'medium':
      sizeInPx = 60;
      break;
    case 'large':
      sizeInPx = 100;
      break;
    default:
      // Aceitar qualquer valor numérico, mesmo muito pequeno
      sizeInPx = typeof size === 'number' ? size : 60;
  }

  // Escolher o logo baseado na variante e tema
  let logoSrc;

  if (['green', 'pink', 'beige', 'white', 'black'].includes(variant)) {
    // Se for uma cor específica, usar a variante correspondente
    const colorVariant = variant as keyof typeof LOGO_ASSETS.variants;
    logoSrc =
      variant === 'full'
        ? LOGO_ASSETS.variants[colorVariant].full
        : LOGO_ASSETS.variants[colorVariant].symbol;
  } else if (variant === 'full') {
    // Logo completo baseado no tema
    logoSrc = getLogo(isDarkMode ? 'dark' : 'light', 'full');
  } else if (variant === 'original') {
    // Logo original baseado no tema
    logoSrc = getLogo(isDarkMode ? 'dark' : 'light', 'original');
  } else {
    // Logo símbolo baseado no tema (padrão)
    logoSrc = getLogo(isDarkMode ? 'dark' : 'light', 'symbol');
  }

  const logoComponent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: isHeader ? 'flex-start' : 'center', // Se for header, alinha à esquerda
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
          objectFit: 'contain',
          transition: 'transform 0.3s ease-in-out',
          filter: isDarkMode ? 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))' : 'none',
          '&:hover': {
            transform: 'scale(1.05)',
          },
        }}
      />
      {showText && variant !== 'full' && (
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
