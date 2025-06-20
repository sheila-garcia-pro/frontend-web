import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { RecipeCategory } from '../../../services/api/recipeCategories';
import api from '../../../services/api';

interface RecipeCategoryDeleteModalProps {
  open: boolean;
  onClose: () => void;
  category: RecipeCategory | null;
  onCategoryDeleted?: () => void;
}

const RecipeCategoryDeleteModal: React.FC<RecipeCategoryDeleteModalProps> = ({
  open,
  onClose,
  category,
  onCategoryDeleted,
}) => {
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const handleConfirmDelete = async () => {
    if (!category) return;

    setLoading(true);
    try {
      await api.delete(`/v1/users/me/category-recipe/${category.id}`);

      dispatch(
        addNotification({
          message: `Categoria "${category.name}" excluída com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      if (onCategoryDeleted) {
        onCategoryDeleted();
      }

      onClose();
    } catch (error: unknown) {
      console.error('Erro ao excluir categoria:', error);

      dispatch(
        addNotification({
          message: 'Erro ao excluir categoria.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
            Confirmar Exclusão
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta ação não pode ser desfeita!
          </Alert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Tem certeza que deseja excluir a categoria{' '}
            <strong>&ldquo;{category?.name}&rdquo;</strong>?
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Receitas que usam esta categoria não serão excluídas, mas perderão a referência à
            categoria.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmDelete}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Excluindo...' : 'Excluir Categoria'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeCategoryDeleteModal;
