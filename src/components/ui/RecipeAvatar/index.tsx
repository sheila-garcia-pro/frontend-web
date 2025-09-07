import React from 'react';
import { Avatar, Box, Typography } from '@mui/material';
import { useTheme } from '../../../contexts/ThemeContext';

interface RecipeAvatarProps {
  image?: string | null;
  name: string;
  size?: number;
  borderRadius?: number;
}

const RecipeAvatar: React.FC<RecipeAvatarProps> = ({
  image,
  name,
  size = 140,
  borderRadius = 0,
}) => {
  const { mode } = useTheme();

  // Função para gerar iniciais do nome da receita
  const getInitials = (recipeName: string): string => {
    if (!recipeName) return '?';

    const words = recipeName
      .trim()
      .split(' ')
      .filter((word) => word.length > 0);

    if (words.length === 0) return '?';
    if (words.length === 1) return words[0][0].toUpperCase();

    // Pega primeira letra da primeira palavra e primeira letra da última palavra
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const fontSize = size * 0.35; // 35% do tamanho do avatar

  return (
    <Box
      sx={{
        width: '100%',
        height: size,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: borderRadius,
      }}
    >
      {image ? (
        <Box
          component="img"
          src={image}
          alt={`Imagem da receita ${name}`}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: mode === 'light' ? '#4F6D48' : '#E8EDAA',
            color: mode === 'light' ? '#F5F3E7' : '#23291C',
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontSize: `${fontSize}px`,
              fontWeight: 'bold',
              textAlign: 'center',
            }}
          >
            {getInitials(name)}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default RecipeAvatar;
