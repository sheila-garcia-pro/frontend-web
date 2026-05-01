import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Alert,
} from '@mui/material';
import { Close, Delete, Warning } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { Recipe } from '../../../types/recipes';
import { deleteRecipe } from '../../../services/api/recipes';

interface RecipeDeleteModalProps {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  onRecipeDeleted: () => void;
}

const RecipeDeleteModal: React.FC<RecipeDeleteModalProps> = ({
  open,
  onClose,
  recipe,
  onRecipeDeleted,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (!recipe) return;

    setLoading(true);
    try {
      await deleteRecipe(recipe._id);

      dispatch(
        addNotification({
          message: 'Receita excluída com sucesso! Redirecionando...',
          type: 'success',
          duration: 3000,
        }),
      );

      // Pequeno delay para mostrar a notificação antes de fechar
      setTimeout(() => {
        onRecipeDeleted();
        onClose();
      }, 500);
    } catch (error) {
      console.error('Erro ao excluir receita:', error);
      dispatch(
        addNotification({
          message: 'Erro ao excluir receita. Tente novamente.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!recipe) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="error" />
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
              Confirmar Exclusão
            </Typography>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pb: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Atenção!</strong> Esta ação não pode ser desfeita.
          </Typography>
        </Alert>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Tem certeza de que deseja excluir a receita:
        </Typography>{' '}
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>
            {recipe.name}
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ opacity: 0.8 }}>
            Categoria: {recipe.category}
          </Typography>
        </Box>{' '}
        <Typography variant="body2" color="text.primary" sx={{ mt: 2, opacity: 0.9 }}>
          Todos os dados relacionados a esta receita serão permanentemente removidos.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} variant="outlined" sx={{ flex: 1 }}>
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          disabled={loading}
          startIcon={<Delete />}
          variant="contained"
          color="error"
          sx={{ flex: 1 }}
        >
          {loading ? 'Excluindo...' : 'Excluir Receita'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeDeleteModal;
