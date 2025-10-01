import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Fade,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import api from '../../../services/api';

interface QuickCategoryAddProps {
  onCategoryAdded?: (categoryId: string, categoryName: string) => void;
}

const QuickCategoryAddComponent: React.FC<QuickCategoryAddProps> = ({ onCategoryAdded }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const dispatch = useDispatch();

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setCategoryName('');
    setError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!categoryName.trim()) {
      setError('O nome da categoria é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/v1/users/me/category-recipe', {
        name: categoryName.trim(),
      });

      dispatch(
        addNotification({
          message: `Categoria "${categoryName.trim()}" criada com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      // Chama o callback com os dados da nova categoria
      if (onCategoryAdded && response.data) {
        // Usa o ID retornado pela API ou fallback para um ID temporário
        const categoryId = response.data.id || response.data._id || `temp-${Date.now()}`;
        const responseCategoryName = response.data.name || categoryName.trim();
        onCategoryAdded(categoryId, responseCategoryName);
      }

      handleCloseModal();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error && error.response
          ? (error.response as { data?: { message?: string } })?.data?.message ||
            'Erro ao criar categoria'
          : 'Erro ao criar categoria';

      dispatch(
        addNotification({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [categoryName, dispatch, onCategoryAdded, handleCloseModal]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCategoryName(e.target.value);
      if (error) setError('');
    },
    [error],
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <>
      <Button
        variant="text"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenModal}
        size="small"
        sx={{
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: 1.5,
          px: 2,
          py: 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
          },
        }}
      >
        Nova Categoria
      </Button>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 3,
            backgroundColor: 'background.paper',
          },
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle sx={{ pb: 1, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AddIcon sx={{ fontSize: '1.2em', color: 'primary.main' }} />
              Nova Categoria
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              disabled={loading}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: 'error.light',
                  opacity: 0.1,
                },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3, backgroundColor: 'background.default' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Crie uma nova categoria para organizar melhor suas receitas.
            </Typography>

            <TextField
              label="Nome da Categoria"
              value={categoryName}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              fullWidth
              required
              variant="outlined"
              error={!!error}
              helperText={error || 'Ex: Sobremesas, Pratos principais, Bebidas...'}
              autoFocus
              disabled={loading}
              placeholder="Digite o nome da nova categoria"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'background.paper',
                },
                '& .MuiInputLabel-root': {
                  color: 'text.primary',
                },
                '& .MuiOutlinedInput-input': {
                  color: 'text.primary',
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1, backgroundColor: 'background.paper' }}>
          <Button
            onClick={handleCloseModal}
            color="inherit"
            disabled={loading}
            sx={{
              borderRadius: 2,
              px: 3,
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || !categoryName.trim()}
            startIcon={loading ? <CircularProgress size={18} /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            {loading ? 'Criando...' : 'Criar Categoria'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Exportar com React.memo para otimização
const QuickCategoryAdd = React.memo(QuickCategoryAddComponent);

export default QuickCategoryAdd;
