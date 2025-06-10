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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  TextField,
} from '@mui/material';
import { Close, Edit, Category, Delete, ShoppingCart, Info } from '@mui/icons-material';
import { Ingredient } from '../../../types/ingredients';
import { getNutritionalTable } from '../../../services/api/nutritionalTable';
import { NutritionalTable } from '../../../types/nutritionalTable';
import { useDispatch } from 'react-redux';
import * as ingredientsService from '../../../services/api/ingredients';
import { addNotification } from '../../../store/slices/uiSlice';
import {
  fetchIngredientsRequest,
  deleteIngredientRequest,
} from '../../../store/slices/ingredientsSlice';
import IngredientEditModal from '../IngredientEditModal';
import { updateIngredientPriceMeasure } from '../../../services/api/ingredients/updatePriceMeasure';
import { Check, Close as CloseIcon } from '@mui/icons-material';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import { UnitMeasure } from '../../../types/unitMeasure';

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
  const [nutritionalTables, setNutritionalTables] = useState<NutritionalTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<NutritionalTable | null>(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [editingUnit, setEditingUnit] = useState(false);
  const [newPrice, setNewPrice] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('');
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);

  const loadNutritionalTables = useCallback(
    async (name: string) => {
      setLoadingTables(true);
      try {
        const data = await getNutritionalTable(name);
        setNutritionalTables(data);
        if (data.length > 0) {
          setSelectedTable(data[0]);
        }
      } catch (error) {
        dispatch(
          addNotification({
            message: 'Erro ao carregar informações nutricionais.',
            type: 'error',
            duration: 5000,
          }),
        );
      } finally {
        setLoadingTables(false);
      }
    },
    [dispatch],
  );

  const loadIngredient = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await ingredientsService.getIngredientById(id);
        setIngredient(data);
        if (data) {
          await loadNutritionalTables(data.name);
        }
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
    [dispatch, loadNutritionalTables],
  );

  const loadUnitMeasures = useCallback(async () => {
    try {
      const data = await getUnitMeasures();
      setUnitMeasures(data);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar unidades de medida.',
          type: 'error',
          duration: 5000,
        }),
      );
    }
  }, [dispatch]);

  useEffect(() => {
    if (open && ingredientId) {
      loadIngredient(ingredientId);
    } else if (!open) {
      setIngredient(null);
      setEditModalOpen(false);
    }
  }, [open, ingredientId, loadIngredient]);

  useEffect(() => {
    loadUnitMeasures();
  }, [loadUnitMeasures]);

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
  const handleUpdatePriceMeasure = async (
    field: 'price' | 'quantity' | 'unitMeasure',
    value: string,
  ) => {
    if (!ingredient?.price) return;
    let price = Number(ingredient.price.price);
    let quantity = Number(ingredient.price.quantity);
    let unitMeasure = ingredient.price.unitMeasure;

    if (field === 'price') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) return;
      price = parsed;
    } else if (field === 'quantity') {
      const parsed = parseFloat(value);
      if (isNaN(parsed)) return;
      quantity = parsed;
    } else if (field === 'unitMeasure') {
      unitMeasure = value;
    }

    const updateData = {
      price,
      quantity,
      unitMeasure,
    };

    try {
      await updateIngredientPriceMeasure(ingredient._id, updateData);
      await loadIngredient(ingredient._id);
      dispatch(
        addNotification({
          message: 'Informação atualizada com sucesso!',
          type: 'success',
          duration: 3000,
        }),
      );
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao atualizar informação.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setEditingPrice(false);
      setEditingQuantity(false);
      setEditingUnit(false);
    }
  };

  const handleCancel = (field: 'price' | 'quantity' | 'unit') => {
    switch (field) {
      case 'price':
        setEditingPrice(false);
        setNewPrice('');
        break;
      case 'quantity':
        setEditingQuantity(false);
        setNewQuantity('');
        break;
      case 'unit':
        setEditingUnit(false);
        setNewUnit('');
        break;
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
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '4px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                }}
              >
                {ingredient.isEdit && (
                  <Tooltip title="Editar ingrediente">
                    <IconButton
                      onClick={handleEditClick}
                      sx={{
                        position: 'absolute',
                        right: 4,
                        top: 4,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          bgcolor: 'primary.main',
                          '& .MuiSvgIcon-root': {
                            color: 'white',
                          },
                        },
                      }}
                      size="small"
                    >
                      <Edit fontSize="small" />
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
                    objectFit: 'cover',
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    cursor: ingredient.isEdit ? 'pointer' : 'default',
                  }}
                  onClick={ingredient.isEdit ? handleEditClick : undefined}
                />
              </Box>

              <Box sx={{ flex: 1 }}>
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
              </Box>
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
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ShoppingCart color="primary" />
                  <Typography variant="subtitle1">Informações de Preço</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {editingPrice ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          label="Preço"
                          value={newPrice}
                          onChange={(e) => setNewPrice(e.target.value)}
                          size="small"
                          type="number"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newPrice) {
                              handleUpdatePriceMeasure('price', newPrice);
                            }
                          }}
                          sx={{ width: 120 }}
                        />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleUpdatePriceMeasure('price', newPrice)}
                        >
                          <Check fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleCancel('price')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        onClick={() => {
                          if (ingredient.isEdit && ingredient.price) {
                            setNewPrice(ingredient.price.price.toString());
                            setEditingPrice(true);
                          }
                        }}
                        sx={{
                          cursor: ingredient.isEdit ? 'pointer' : 'default',
                          '&:hover': ingredient.isEdit
                            ? {
                                bgcolor: 'action.hover',
                                px: 1,
                                mx: -1,
                                borderRadius: 1,
                              }
                            : {},
                        }}
                      >
                        Preço: R$ {ingredient.price.price.toFixed(2)}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {editingQuantity ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          label="Quantidade"
                          value={newQuantity}
                          onChange={(e) => setNewQuantity(e.target.value)}
                          size="small"
                          type="number"
                          autoFocus
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newQuantity) {
                              handleUpdatePriceMeasure('quantity', newQuantity);
                            }
                          }}
                          sx={{ width: 120 }}
                        />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleUpdatePriceMeasure('quantity', newQuantity)}
                        >
                          <Check fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleCancel('quantity')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        onClick={() => {
                          if (ingredient.isEdit && ingredient.price) {
                            setNewQuantity(ingredient.price.quantity.toString());
                            setEditingQuantity(true);
                          }
                        }}
                        sx={{
                          cursor: ingredient.isEdit ? 'pointer' : 'default',
                          '&:hover': ingredient.isEdit
                            ? {
                                bgcolor: 'action.hover',
                                px: 1,
                                mx: -1,
                                borderRadius: 1,
                              }
                            : {},
                        }}
                      >
                        Quantidade: {ingredient.price.quantity}
                      </Typography>
                    )}{' '}
                    {editingUnit ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Select
                          size="small"
                          value={newUnit}
                          onChange={(e) => setNewUnit(e.target.value)}
                          autoFocus
                          sx={{ width: 200 }}
                        >
                          {unitMeasures.map((unit) => (
                            <MenuItem key={unit._id} value={unit.name}>
                              {unit.name} ({unit.acronym})
                            </MenuItem>
                          ))}
                        </Select>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleUpdatePriceMeasure('unitMeasure', newUnit)}
                        >
                          <Check fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleCancel('unit')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        onClick={() => {
                          if (ingredient.isEdit && ingredient.price) {
                            setNewUnit(ingredient.price.unitMeasure);
                            setEditingUnit(true);
                          }
                        }}
                        sx={{
                          cursor: ingredient.isEdit ? 'pointer' : 'default',
                          '&:hover': ingredient.isEdit
                            ? {
                                bgcolor: 'action.hover',
                                px: 1,
                                mx: -1,
                                borderRadius: 1,
                              }
                            : {},
                        }}
                      >
                        {ingredient.price.unitMeasure}
                      </Typography>
                    )}
                  </Box>

                  <Typography variant="body1" color="primary.main" sx={{ fontWeight: 500 }}>
                    Preço por {ingredient.price.unitMeasure}: R${' '}
                    {(ingredient.price.price / ingredient.price.quantity).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            )}

            {loadingTables ? (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <>
                <Box sx={{ mt: 4, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel id="nutritional-table-label">Informações Nutricionais</InputLabel>
                    <Select
                      labelId="nutritional-table-label"
                      value={selectedTable?.description || ''}
                      label="Informações Nutricionais"
                      onChange={(e) => {
                        const table = nutritionalTables.find(
                          (t) => t.description === e.target.value,
                        );
                        setSelectedTable(table || null);
                      }}
                    >
                      {nutritionalTables.map((table) => (
                        <MenuItem key={table.description} value={table.description}>
                          {table.description} ({table.tableName})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {selectedTable && (
                  <Box sx={{ mt: 2 }}>
                    <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                      <Typography
                        variant="h6"
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Info color="primary" />
                        Informação Nutricional
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Porção de 100g
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                        {[
                          {
                            label: 'Valor Energético',
                            value: selectedTable.energyKcal,
                            unit: 'kcal',
                          },
                          { label: 'Carboidratos', value: selectedTable.carbohydrateG, unit: 'g' },
                          { label: 'Proteínas', value: selectedTable.proteinG, unit: 'g' },
                          { label: 'Gorduras Totais', value: selectedTable.totalFatsG, unit: 'g' },
                          {
                            label: 'Gorduras Saturadas',
                            value: selectedTable.saturatedFatsG,
                            unit: 'g',
                          },
                          {
                            label: 'Fibra Alimentar',
                            value: selectedTable.dietaryFiberG,
                            unit: 'g',
                          },
                          { label: 'Sódio', value: selectedTable.sodiumMG, unit: 'mg' },
                          { label: 'Cálcio', value: selectedTable.calciumMG, unit: 'mg' },
                          { label: 'Ferro', value: selectedTable.ironMG, unit: 'mg' },
                          { label: 'Vitamina C', value: selectedTable.vitaminCMCG, unit: 'mcg' },
                        ].map(
                          (item) =>
                            item.value &&
                            item.value !== 'null' && (
                              <Box
                                key={item.label}
                                sx={{
                                  flex: '1 0 calc(50% - 8px)',
                                  minWidth: '150px',
                                }}
                              >
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    bgcolor: 'background.default',
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    {item.label}
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    {parseFloat(item.value).toFixed(1)} {item.unit}
                                  </Typography>
                                </Paper>
                              </Box>
                            ),
                        )}
                      </Box>
                    </Paper>
                  </Box>
                )}
              </>
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
