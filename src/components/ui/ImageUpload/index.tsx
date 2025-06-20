import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
  Card,
  CardMedia,
  Tooltip,
  Stack,
} from '@mui/material';
import { CloudUpload, Delete, Edit, ImageNotSupported } from '@mui/icons-material';

interface ImageUploadComponentProps {
  value: string | null;
  onChange: (imageUrl: string | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Imagem',
  required = false,
  error,
  helperText,
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageError(false);

      try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'recipes');

        const token = localStorage.getItem(
          import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token',
        );

        const response = await fetch('https://sgpro-api.squareweb.app/v1/upload/image', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.url) {
          onChange(data.url);
        } else {
          console.error('Erro no upload:', data);
          // Se houver erro, voltar ao estado anterior
          onChange(value);
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        // Se houver erro, voltar ao estado anterior
        onChange(value);
      } finally {
        setUploading(false);
        setSelectedFile(null);
        // Reset input
        e.target.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    onChange(null);
    setImageError(false);
    setSelectedFile(null);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label} {required && <span style={{ color: 'error.main' }}>*</span>}
      </Typography>

      {value && !imageError ? (
        // Mostrar imagem atual
        <Card
          sx={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 2,
            border: error ? '1px solid' : 'none',
            borderColor: error ? 'error.main' : 'transparent',
          }}
        >
          {' '}
          <CardMedia
            component="img"
            image={value}
            alt="Imagem da receita"
            onError={handleImageError}
            sx={{
              height: 150,
              objectFit: 'contain',
              bgcolor: 'grey.50',
              transition: 'opacity 0.3s',
              opacity: uploading ? 0.5 : 1,
            }}
          />
          {/* Overlay com botões */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              gap: 1,
            }}
          >
            <Tooltip title="Alterar imagem">
              <IconButton
                component="label"
                disabled={uploading || disabled}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                  boxShadow: 1,
                }}
              >
                <Edit fontSize="small" />
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading || disabled}
                />
              </IconButton>
            </Tooltip>

            <Tooltip title="Remover imagem">
              <IconButton
                onClick={handleRemoveImage}
                disabled={uploading || disabled}
                sx={{
                  bgcolor: 'rgba(244, 67, 54, 0.9)',
                  color: 'white',
                  '&:hover': { bgcolor: 'rgba(244, 67, 54, 1)' },
                  boxShadow: 1,
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Loading overlay */}
          {uploading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Card>
      ) : (
        // Mostrar área de upload
        <Card
          sx={{
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            bgcolor: error ? 'error.light' : 'grey.50',
            opacity: disabled ? 0.6 : 1,
            mb: 2,
            transition: 'all 0.3s',
            '&:hover': disabled
              ? {}
              : {
                  borderColor: error ? 'error.dark' : 'primary.main',
                  bgcolor: error ? 'error.light' : 'primary.light',
                },
          }}
        >
          <Stack spacing={2} alignItems="center">
            {imageError ? (
              <ImageNotSupported sx={{ fontSize: 48, color: 'grey.500' }} />
            ) : (
              <CloudUpload sx={{ fontSize: 48, color: 'grey.500' }} />
            )}{' '}
            <Typography variant="body2" color="grey.600">
              {imageError
                ? 'Erro ao carregar imagem anterior'
                : value
                  ? 'Erro ao carregar imagem'
                  : 'Clique para selecionar uma imagem da receita'}
            </Typography>
            <Button
              variant="outlined"
              component="label"
              disabled={uploading || disabled}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
              size="small"
              sx={{ color: 'grey.600', borderColor: 'grey.600' }}
            >
              {uploading ? 'Enviando...' : 'Escolher Arquivo'}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading || disabled}
              />
            </Button>
          </Stack>
        </Card>
      )}

      {/* Informações e status */}
      <Stack spacing={0.5}>
        {selectedFile && (
          <Typography variant="caption" color="text.secondary">
            📎 {selectedFile.name}
          </Typography>
        )}

        {uploading && (
          <Typography variant="caption" color="primary">
            🔄 Fazendo upload da imagem...
          </Typography>
        )}

        {helperText && !error && (
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        )}

        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default ImageUploadComponent;
