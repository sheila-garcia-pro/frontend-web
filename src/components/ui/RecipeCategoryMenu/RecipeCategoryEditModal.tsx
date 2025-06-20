import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { RecipeCategory } from '../../../services/api/recipeCategories';
import api from '../../../services/api';

interface RecipeCategoryEditModalProps {
  open: boolean;
  onClose: () => void;
  category: RecipeCategory | null;
  onCategoryUpdated?: () => void;
}

const RecipeCategoryEditModal: React.FC<RecipeCategoryEditModalProps> = ({
  open,
  onClose,
  category,
  onCategoryUpdated,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    if (category) {
      setName(category.name);
    }
  }, [category]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) {
      setError('');
    }
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      setError('O nome da categoria é obrigatório');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !category) return;

    setLoading(true);
    try {
      await api.patch(`/v1/users/me/category-recipe/${category.id}`, { name: name.trim() });

      dispatch(
        addNotification({
          message: `Categoria atualizada para "${name.trim()}" com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      if (onCategoryUpdated) {
        onCategoryUpdated();
      }

      handleClose();
    } catch (error: unknown) {
      console.error('Erro ao atualizar categoria:', error);

      dispatch(
        addNotification({
          message: 'Erro ao atualizar categoria.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
          Editar Categoria
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <TextField
            label="Nome da Categoria"
            value={name}
            onChange={handleChange}
            fullWidth
            required
            variant="outlined"
            error={!!error}
            helperText={error}
            autoFocus
            disabled={loading}
            placeholder="Ex: Sobremesas, Pratos principais, Bebidas..."
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !name.trim() || name.trim() === category?.name}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeCategoryEditModal;
