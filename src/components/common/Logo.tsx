import React from 'react';
import { Box, Typography, SxProps, Theme } from '@mui/material';
import { Link } from 'react-router-dom';
import logoSquare from '../../assets/logo_transparente.png';
import logoRound from '../../assets/logo_transparente.png';
import logoWithText from '../../assets/logo_transparente_com_nome.png';
import logoWithTextLight from '../../assets/logo_transparente_com_nome_ligth.png';
import { useTheme } from '@mui/material/styles';

interface LogoProps {
  variant?: 'square' | 'round' | 'with-text';
  size?: 'small' | 'medium' | 'large' | number;
  showText?: boolean;
  onClick?: () => void;
  sx?: SxProps<Theme>;
  textColor?: string;
  to?: string;
  isHeader?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  variant = 'square',
  size = 'medium',
  showText = true,
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
    case 'small':
      sizeInPx = variant === 'with-text' ? 50 : 30;
      break;
    case 'medium':
      sizeInPx = variant === 'with-text' ? 100 : 60;
      break;
    case 'large':
      sizeInPx = variant === 'with-text' ? 180 : 80;
      break;
    default:
      sizeInPx = typeof size === 'number' ? size : 40;
  } // Escolher a imagem com base na variante, tema e se é header
  let logoSrc;
  if (variant === 'with-text') {
    // Se for header, usa sempre a imagem original, caso contrário usa a imagem baseada no tema
    if (isHeader) {
      logoSrc = logoWithText;
    } else {
      logoSrc = isDarkMode ? logoWithText : logoWithTextLight;
    }
  } else {
    logoSrc = variant === 'square' ? logoSquare : logoRound;
  }

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
      {showText && variant !== 'with-text' && (
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
          Sheila Garcia tetse
        </Typography>
      )}
    </Box>
  );

  return logoComponent;
};

export default Logo;
