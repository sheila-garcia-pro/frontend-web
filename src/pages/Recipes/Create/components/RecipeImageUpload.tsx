import React from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import ImageUploadComponent from '../../../../components/ui/ImageUpload';

/**
 * Interface para os props do componente
 */
interface RecipeImageUploadProps {
  // Estado da imagem
  image: string;
  selectedFile: File | null;
  uploading: boolean;

  // Erros
  errors: { [key: string]: string };

  // Handlers
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageUpdate: (imageUrl: string | null) => void;
}

/**
 * Componente para upload de imagem da receita
 *
 * Seguindo o princípio Single Responsibility:
 * - Responsável apenas pelo upload de imagem
 * - Não gerencia estado próprio
 * - Delega ações para o componente pai
 */
const RecipeImageUpload: React.FC<RecipeImageUploadProps> = ({
  image,
  selectedFile,
  uploading,
  errors,
  onFileChange,
  onImageUpdate,
}) => {
  return (
    <Box>
      {/* Cabeçalho da Seção */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 3,
        }}
      >
        📸 Imagem da Receita
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Adicione uma imagem atrativa para sua receita (opcional)
        </Typography>

        {/* Componente de Upload */}
        <ImageUploadComponent
          value={image || null}
          onChange={onImageUpdate}
          disabled={uploading}
          label="Imagem da Receita"
          helperText="Clique para selecionar uma imagem da receita. Formatos aceitos: JPG, PNG, WebP"
        />

        {/* Status do Upload */}
        {selectedFile && (
          <Box sx={{ mt: 2 }}>
            {uploading ? (
              <Alert severity="info" icon={<CircularProgress size={20} />} sx={{ borderRadius: 2 }}>
                Fazendo upload da imagem...
              </Alert>
            ) : image ? (
              <Alert severity="success" icon={<CheckCircle />} sx={{ borderRadius: 2 }}>
                ✓ Upload realizado com sucesso!
              </Alert>
            ) : null}
          </Box>
        )}

        {/* Erro de Upload */}
        {errors.image && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {errors.image}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default RecipeImageUpload;
