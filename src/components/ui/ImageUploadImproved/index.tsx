import React, { useState, useRef } from 'react';
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
  Alert,
  Avatar,
} from '@mui/material';
import { CloudUpload, Delete, Edit, ImageNotSupported, PhotoCamera } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import imageUploadService, { ImageUploadType } from '../../../services/imageUploadService';
import { useTheme } from '../../../contexts/ThemeContext';

export interface ImageUploadProps {
  value: string | null;
  onChange: (imageUrl: string | null) => void;
  disabled?: boolean;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  type: ImageUploadType;
  placeholder?: string;
  height?: number;
  ingredientName?: string; // Nome do ingrediente para gerar iniciais
}

const ImageUploadComponent: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Imagem',
  required = false,
  error,
  helperText,
  type,
  placeholder,
  height = 150,
  ingredientName,
}) => {
  const { t } = useTranslation();
  const { mode } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletionStatus, setDeletionStatus] = useState<string | null>(null);
  const [showDeletionFeedback, setShowDeletionFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Função para gerar iniciais do nome do ingrediente
  const getInitials = (name?: string): string => {
    if (!name) return '?';

    const words = name
      .trim()
      .split(' ')
      .filter((word) => word.length > 0);

    if (words.length === 0) return '?';
    if (words.length === 1) return words[0][0].toUpperCase();

    // Pega primeira letra da primeira palavra e primeira letra da última palavra
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const handleFileSelect = (file: File) => {
    // Validar arquivo
    const validation = imageUploadService.validateImageFile(file);
    if (validation !== true) {
      setUploadError(validation);
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    handleUpload(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    e.target.value = '';
  };

  const handleUpload = async (file: File) => {
    try {
      setUploading(true);
      setImageError(false);
      setUploadError(null);
      setDeletionStatus(null);
      setShowDeletionFeedback(false);

      // Usar o método uploadImage com a URL da imagem atual
      const result = await imageUploadService.uploadImage(file, type, value || null);

      if (result.success) {
        onChange(result.url);

        // Mostrar feedback sobre a operação realizada
        setDeletionStatus('✅ Nova imagem enviada com sucesso');
        setShowDeletionFeedback(true);

        // Auto-hide feedback após 4 segundos
        setTimeout(() => {
          setShowDeletionFeedback(false);
          setDeletionStatus(null);
        }, 4000);
      } else {
        setUploadError(result.message || 'Erro no upload');
      }
    } catch (error: any) {
      setUploadError(error.message || 'Erro inesperado no upload');
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleRemoveImage = async () => {
    if (!value) return;

    try {
      setUploading(true);
      setDeletionStatus('🗑️ Removendo imagem...');
      setShowDeletionFeedback(true);

      // Deletar imagem do servidor
      const result = await imageUploadService.deleteImage(value);

      // Atualizar feedback
      setDeletionStatus(result.success ? `✅ ${result.message}` : `⚠️ ${result.message}`);

      // Remover do estado
      onChange(null);
      setImageError(false);
      setUploadError(null);

      // Auto-hide feedback após 3 segundos
      setTimeout(() => {
        setShowDeletionFeedback(false);
        setDeletionStatus(null);
      }, 3000);
    } catch (error) {
      setDeletionStatus('❌ Erro ao remover imagem do servidor');

      // Mesmo com erro, remover localmente
      onChange(null);
      setImageError(false);

      // Auto-hide feedback após 5 segundos
      setTimeout(() => {
        setShowDeletionFeedback(false);
        setDeletionStatus(null);
      }, 5000);
    } finally {
      setUploading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const hasImage = value && !imageError;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Label */}
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>

      {/* Input de arquivo escondido */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        disabled={uploading || disabled}
      />

      {hasImage ? (
        /* Mostrar imagem atual */
        <Card
          sx={{
            position: 'relative',
            borderRadius: 2,
            overflow: 'hidden',
            mb: 2,
            border: error ? '2px solid' : '1px solid',
            borderColor: error ? 'error.main' : 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <CardMedia
            component="img"
            image={value}
            alt={`${label} preview`}
            onError={handleImageError}
            sx={{
              height,
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
                onClick={triggerFileInput}
                disabled={uploading || disabled}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                  boxShadow: 1,
                }}
              >
                <Edit fontSize="small" />
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
                borderRadius: 2,
              }}
            >
              <CircularProgress />
            </Box>
          )}
        </Card>
      ) : (
        /* Mostrar área de upload */
        <Card
          sx={{
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'grey.300',
            borderRadius: 2,
            p: 3,
            textAlign: 'center',
            bgcolor: error ? 'error.light' : 'grey.50',
            opacity: disabled || uploading ? 0.6 : 1,
            mb: 2,
            transition: 'all 0.3s',
            cursor: disabled || uploading ? 'not-allowed' : 'pointer',
            '&:hover':
              disabled || uploading
                ? {}
                : {
                    borderColor: error ? 'error.dark' : 'primary.main',
                    bgcolor: error ? 'error.light' : 'primary.light',
                  },
          }}
          onClick={disabled || uploading ? undefined : triggerFileInput}
        >
          <Stack spacing={2} alignItems="center">
            {/* Se for ingrediente e tiver nome, mostrar avatar com iniciais */}
            {type === 'ingredients' && ingredientName ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: mode === 'light' ? '#4F6D48' : '#E8EDAA',
                    color: mode === 'light' ? '#F5F3E7' : '#23291C',
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    border: '2px solid',
                    borderColor: mode === 'light' ? '#4F6D48' : '#E8EDAA',
                  }}
                >
                  {getInitials(ingredientName)}
                </Avatar>
                <Typography variant="body2" color="grey.600" sx={{ fontWeight: 500 }}>
                  {ingredientName}
                </Typography>
              </Box>
            ) : imageError ? (
              <ImageNotSupported sx={{ fontSize: 48, color: 'grey.500' }} />
            ) : (
              <PhotoCamera sx={{ fontSize: 48, color: 'grey.500' }} />
            )}

            <Typography variant="body2" color="grey.600">
              {uploading
                ? 'Fazendo upload...'
                : imageError
                  ? 'Erro ao carregar imagem'
                  : type === 'ingredients' && ingredientName
                    ? `Clique para adicionar uma imagem para "${ingredientName}"`
                    : placeholder || `Clique para selecionar ${label.toLowerCase()}`}
            </Typography>

            <Button
              variant="outlined"
              component="span"
              disabled={uploading || disabled}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
              size="small"
              sx={{
                color: 'grey.600',
                borderColor: 'grey.600',
                pointerEvents: 'none', // Evita click duplo
              }}
            >
              {uploading ? 'Enviando...' : 'Escolher Arquivo'}
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

        {/* Feedback de exclusão */}
        {showDeletionFeedback && deletionStatus && (
          <Alert
            severity={
              deletionStatus.startsWith('✅')
                ? 'success'
                : deletionStatus.startsWith('⚠️')
                  ? 'warning'
                  : 'info'
            }
            sx={{ mt: 1 }}
          >
            {deletionStatus}
          </Alert>
        )}

        {/* Mensagens de erro */}
        {uploadError && !showDeletionFeedback && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {uploadError}
          </Alert>
        )}

        {error && !uploadError && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}

        {/* Helper text */}
        {helperText && !error && !uploadError && (
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        )}
      </Stack>
    </Box>
  );
};

export default ImageUploadComponent;
