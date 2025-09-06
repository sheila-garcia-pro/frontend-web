import React from 'react';
import { Avatar, Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Delete, Edit, PhotoCamera } from '@mui/icons-material';
import { useTheme } from '../../../contexts/ThemeContext';

interface IngredientAvatarProps {
  image?: string | null;
  name: string;
  size?: number;
  showControls?: boolean;
  onImageClick?: () => void;
  onDeleteClick?: () => void;
  uploading?: boolean;
  disabled?: boolean;
}

const IngredientAvatar: React.FC<IngredientAvatarProps> = ({
  image,
  name,
  size = 120,
  showControls = false,
  onImageClick,
  onDeleteClick,
  uploading = false,
  disabled = false,
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
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Avatar
        src={image || undefined}
        sx={{
          width: size,
          height: size,
          bgcolor: mode === 'light' ? '#4F6D48' : '#E8EDAA',
          color: mode === 'light' ? '#F5F3E7' : '#23291C',
          fontSize: `${fontSize}px`,
          fontWeight: 'bold',
          border: '2px solid',
          borderColor: mode === 'light' ? '#4F6D48' : '#E8EDAA',
        }}
      >
        {!image && getInitials(name)}
      </Avatar>

      {/* Loading overlay */}
      {uploading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: size,
            height: size,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
            zIndex: 1,
          }}
        >
          <CircularProgress size={size * 0.3} />
        </Box>
      )}

      {/* Controles de imagem */}
      {showControls && !disabled && (
        <Box
          sx={{
            position: 'absolute',
            right: -8,
            bottom: size * 0.15,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {image && onDeleteClick && (
            <Tooltip title="Remover imagem">
              <IconButton
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  width: size * 0.25,
                  height: size * 0.25,
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'error.dark' },
                }}
                onClick={onDeleteClick}
                disabled={uploading}
              >
                <Delete sx={{ fontSize: size * 0.15 }} />
              </IconButton>
            </Tooltip>
          )}

          {onImageClick && (
            <Tooltip title={image ? 'Alterar imagem' : 'Adicionar imagem'}>
              <IconButton
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  width: size * 0.25,
                  height: size * 0.25,
                  boxShadow: 1,
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
                onClick={onImageClick}
                disabled={uploading}
              >
                {image ? (
                  <Edit sx={{ fontSize: size * 0.15 }} />
                ) : (
                  <PhotoCamera sx={{ fontSize: size * 0.15 }} />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      )}
    </Box>
  );
};

export default IngredientAvatar;
