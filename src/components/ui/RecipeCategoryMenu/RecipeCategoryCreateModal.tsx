import React, { useState } from 'react';
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
import api from '../../../services/api';

interface RecipeCategoryCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCategoryCreated?: () => void;
}

const RecipeCategoryCreateModal: React.FC<RecipeCategoryCreateModalProps> = ({
  open,
  onClose,
  onCategoryCreated,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();

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
    if (!validate()) return;

    setLoading(true);
    try {
      await api.post('/v1/users/me/category-recipe', { name: name.trim() });

      dispatch(
        addNotification({
          message: `Categoria "${name.trim()}" criada com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      if (onCategoryCreated) {
        onCategoryCreated();
      }

      handleClose();
    } catch (error: unknown) {
      console.error('Erro ao criar categoria:', error);

      dispatch(
        addNotification({
          message: 'Erro ao criar categoria.',
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
          Nova Categoria
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
          disabled={loading || !name.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Criando...' : 'Criar Categoria'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeCategoryCreateModal;
