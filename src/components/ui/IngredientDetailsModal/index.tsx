import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { Close, Edit, Category, Delete } from '@mui/icons-material';
import { Ingredient } from '../../../types/ingredients';
import { useDispatch } from 'react-redux';
import * as ingredientsService from '../../../services/api/ingredients';
import { addNotification } from '../../../store/slices/uiSlice';
import {
  fetchIngredientsRequest,
  deleteIngredientRequest,
} from '../../../store/slices/ingredientsSlice';
import IngredientEditModal from '../IngredientEditModal';

interface IngredientDetailsModalProps {
  open: boolean;
  onClose: () => void;
  ingredientId: string | null;
}

const IngredientDetailsModal: React.FC<IngredientDetailsModalProps> = ({
  open,
  onClose,
  ingredientId,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadIngredient = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await ingredientsService.getIngredientById(id);
        setIngredient(data);
      } catch (error) {
        dispatch(
          addNotification({
            message: 'Erro ao carregar detalhes do ingrediente.',
            type: 'error',
            duration: 5000,
          }),
        );
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );
  useEffect(() => {
    if (open && ingredientId) {
      loadIngredient(ingredientId);
    } else if (!open) {
      // Limpa o estado quando o modal é fechado
      setIngredient(null);
      setEditModalOpen(false);
    }
  }, [open, ingredientId, loadIngredient]);

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
  };

  const handleEditSuccess = async () => {
    handleCloseEdit();
    if (ingredientId) {
      await loadIngredient(ingredientId);
      // Recarrega a lista completa
      dispatch(
        fetchIngredientsRequest({
          page: 1,
          itemPerPage: 12,
          search: '',
        }),
      );
    }
  };

  const handleDelete = () => {
    if (ingredient) {
      dispatch(deleteIngredientRequest(ingredient._id));
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          position: 'relative',
        },
      }}
    >
      <IconButton
        aria-label="fechar"
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <Close />
      </IconButton>

      <DialogTitle sx={{ pb: 1 }}>Detalhes do Ingrediente</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : ingredient ? (
          <Box>
            {' '}
            <Box
              sx={{
                width: '100%',
                height: 150, // Reduzindo a altura de 300 para 200
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3,
                position: 'relative',
              }}
            >
              {' '}
              <Box
                component="img"
                src={ingredient.image}
                alt={`Imagem do ingrediente ${ingredient.name}`}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)', // Fundo neutro para melhor visualização
                }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {ingredient.name}
              </Typography>

              <Chip
                icon={<Category />}
                label={ingredient.category}
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              />
            </Box>
            {ingredient.isEdit && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  startIcon={<Edit />}
                  variant="contained"
                  onClick={handleEditClick}
                  fullWidth
                  sx={{ borderRadius: 3 }}
                >
                  Editar Ingrediente
                </Button>
                <Button
                  startIcon={<Delete />}
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  fullWidth
                  sx={{ borderRadius: 3 }}
                >
                  Deletar Ingrediente
                </Button>
              </Box>
            )}
          </Box>
        ) : (
          <Typography color="text.secondary" align="center">
            Ingrediente não encontrado
          </Typography>
        )}
      </DialogContent>

      {/* Modal de edição */}
      {ingredient && (
        <IngredientEditModal
          open={editModalOpen}
          onClose={handleCloseEdit}
          ingredient={ingredient}
          onEditSuccess={handleEditSuccess}
        />
      )}
    </Dialog>
  );
};

export default IngredientDetailsModal;
