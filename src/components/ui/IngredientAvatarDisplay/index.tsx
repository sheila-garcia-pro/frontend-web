import React from 'react';
import { Avatar } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';

interface IngredientAvatarProps {
  src?: string | null;
  name: string;
  size?: number;
  variant?: 'circular' | 'rounded' | 'square';
  sx?: object;
  alt?: string;
}

const IngredientAvatarDisplay: React.FC<IngredientAvatarProps> = ({
  src,
  name,
  size = 40,
  variant = 'circular',
  sx = {},
  alt,
}) => {
  const { mode } = useTheme();

  // Função para gerar iniciais do nome do ingrediente
  const getInitials = (ingredientName: string): string => {
    if (!ingredientName) return '?';

    const words = ingredientName
      .trim()
      .split(' ')
      .filter((word) => word.length > 0);

    if (words.length === 0) return '?';
    if (words.length === 1) return words[0][0].toUpperCase();

    // Pega primeira letra da primeira palavra e primeira letra da última palavra
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const fontSize = size * 0.4; // 40% do tamanho do avatar

  return (
    <Avatar
      src={src || undefined}
      alt={alt || `Avatar do ingrediente ${name}`}
      variant={variant}
      sx={{
        width: size,
        height: size,
        bgcolor: !src ? (mode === 'light' ? '#4F6D48' : '#E8EDAA') : 'transparent',
        color: !src ? (mode === 'light' ? '#F5F3E7' : '#23291C') : 'inherit',
        fontSize: `${fontSize}px`,
        fontWeight: 'bold',
        border: !src ? '2px solid' : 'none',
        borderColor: !src ? (mode === 'light' ? '#4F6D48' : '#E8EDAA') : 'transparent',
        ...sx,
      }}
    >
      {!src && getInitials(name)}
    </Avatar>
  );
};

export default IngredientAvatarDisplay;
