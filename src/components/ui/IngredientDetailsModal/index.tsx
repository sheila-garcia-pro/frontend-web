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
  Divider,
  Tooltip,
} from '@mui/material';
import { Close, Edit, Category, Delete, ShoppingCart } from '@mui/icons-material';
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

      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
        Detalhes do Ingrediente
        {ingredient?.isEdit && (
          <Tooltip title="Editar ingrediente">
            <IconButton
              color="primary"
              onClick={handleEditClick}
              size="small"
              sx={{
                bgcolor: 'primary.light',
                '&:hover': {
                  bgcolor: 'primary.main',
                  '& .MuiSvgIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : ingredient ? (
          <Box>
            <Box
              sx={{
                width: '100%',
                height: 150,
                borderRadius: 2,
                overflow: 'hidden',
                mb: 3,
                position: 'relative',
              }}
            >
              {ingredient.isEdit && (
                <Tooltip title="Editar ingrediente">
                  <IconButton
                    onClick={handleEditClick}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        '& .MuiSvgIcon-root': {
                          color: 'white',
                        },
                      },
                    }}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
              )}
              <Box
                component="img"
                src={ingredient.image}
                alt={ingredient.name}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  cursor: ingredient.isEdit ? 'pointer' : 'default',
                }}
                onClick={ingredient.isEdit ? handleEditClick : undefined}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom>
                {ingredient.name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  icon={<Category />}
                  label={ingredient.category}
                  color="primary"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              </Box>

              {ingredient.price && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: ingredient.isEdit ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    '&:hover': ingredient.isEdit
                      ? {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.lighter',
                        }
                      : {},
                  }}
                  onClick={ingredient.isEdit ? handleEditClick : undefined}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <ShoppingCart color="primary" />
                    <Typography variant="subtitle1">Informações de Preço</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      Preço: R$ {ingredient.price.price.toFixed(2)}
                    </Typography>
                    <Typography variant="body2">
                      Quantidade: {ingredient.price.quantity} {ingredient.price.unitMeasure}
                    </Typography>
                    <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                      Preço por {ingredient.price.unitMeasure}: R${' '}
                      {(ingredient.price.price / ingredient.price.quantity).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {ingredient.isEdit && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  startIcon={<Edit />}
                  variant="contained"
                  onClick={handleEditClick}
                  fullWidth
                  sx={{
                    borderRadius: 3,
                    boxShadow: (theme) => `0 0 20px ${theme.palette.primary.main}20`,
                  }}
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
