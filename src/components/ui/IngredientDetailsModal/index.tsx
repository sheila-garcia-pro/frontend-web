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
  DialogActions,
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
            message: t('ingredients.nutrition.error'),
            type: 'error',
            duration: 5000,
          }),
        );
      } finally {
        setLoadingTables(false);
      }
    },
    [dispatch, t],
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
        fetchIngredientsRequest({
          page: 1,
          itemPerPage: 1000,
          search: '',
        }),
      );
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          position: 'relative',
          minWidth: { sm: '600px', md: '900px' },
        },
      }}
    >
      <DialogTitle sx={{ pr: 6 }}>{t('ingredients.details')}</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {ingredient ? (
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
                      {' '}
                      <ShoppingCart color="primary" />
                      <Typography variant="subtitle1">{t('ingredients.priceInfo')}</Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {editingPrice ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              label={t('ingredients.fields.price')}
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
                            {' '}
                            {t('ingredients.fields.price')}: R$ {ingredient.price.price.toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {editingQuantity ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {' '}
                            <TextField
                              label={t('ingredients.fields.quantity')}
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
                            {' '}
                            {t('ingredients.fields.quantity')}: {ingredient.price.quantity}
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
                      </Box>{' '}
                      <Typography variant="body1" color="primary.main" sx={{ fontWeight: 500 }}>
                        {t('ingredients.pricePerUnit', { unit: ingredient.price.unitMeasure })}: R${' '}
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
                        {' '}
                        <InputLabel id="nutritional-table-label">
                          {t('ingredients.nutrition.title')}
                        </InputLabel>
                        <Select
                          labelId="nutritional-table-label"
                          value={selectedTable?.description || ''}
                          label={t('ingredients.nutrition.title')}
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
                            {' '}
                            <Info color="primary" />
                            {t('ingredients.nutrition.title')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t('ingredients.nutrition.per100g')}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: { xs: 1.5, sm: 2 },
                              mt: 2,
                              mx: -1,
                              p: 1,
                            }}
                          >
                            {[
                              {
                                label: t('ingredients.nutrition.fields.energy'),
                                value: selectedTable.energyKcal,
                                unit: t('ingredients.nutrition.units.kcal'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.carbs'),
                                value: selectedTable.carbohydrateG,
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.totalSugar'),
                                value: selectedTable.totalSugarG || '0',
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.addSugar'),
                                value: selectedTable.addSugarG || '0',
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.protein'),
                                value: selectedTable.proteinG,
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.totalFats'),
                                value: selectedTable.totalFatsG,
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.saturatedFats'),
                                value: selectedTable.saturatedFatsG || '0',
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.transFats'),
                                value: selectedTable.transFatsG || '0',
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.monounsaturated'),
                                value: selectedTable.monounsaturatedG || '0',
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.polyunsaturated'),
                                value: selectedTable.polyunsaturatedG || '0',
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.fiber'),
                                value: selectedTable.dietaryFiberG,
                                unit: t('ingredients.nutrition.units.g'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.cholesterol'),
                                value: selectedTable.cholesterolMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.sodium'),
                                value: selectedTable.sodiumMG,
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.potassium'),
                                value: selectedTable.potassiumMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.calcium'),
                                value: selectedTable.calciumMG,
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.magnesium'),
                                value: selectedTable.magnesiumMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.phosphorus'),
                                value: selectedTable.phosphorusMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.iron'),
                                value: selectedTable.ironMG,
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.copper'),
                                value: selectedTable.copperMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.zinc'),
                                value: selectedTable.zincMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.manganese'),
                                value: selectedTable.manganeseMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.retinol'),
                                value: selectedTable.retinolMCG || '0',
                                unit: t('ingredients.nutrition.units.mcg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.rae'),
                                value: selectedTable.raeMCG || '0',
                                unit: t('ingredients.nutrition.units.mcg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.vitaminD'),
                                value: selectedTable.vitaminDMCG || '0',
                                unit: t('ingredients.nutrition.units.mcg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.thiamine'),
                                value: selectedTable.thiamineMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.riboflavin'),
                                value: selectedTable.riboflavinMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.niacin'),
                                value: selectedTable.niacinMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.vitaminB6'),
                                value: selectedTable.vitaminB6PiridoxinaMG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.vitaminB12'),
                                value: selectedTable.vitaminB12MG || '0',
                                unit: t('ingredients.nutrition.units.mg'),
                              },
                              {
                                label: t('ingredients.nutrition.fields.vitaminC'),
                                value: selectedTable.vitaminCMCG || '0',
                                unit: t('ingredients.nutrition.units.mcg'),
                              },
                            ].map((item) => (
                              <Box
                                key={item.label}
                                sx={{
                                  flex: {
                                    xs: '1 0 100%',
                                    sm: '1 0 calc(50% - 8px)',
                                    md: '1 0 calc(25% - 12px)',
                                  },
                                  minWidth: { xs: '100%', sm: '200px' },
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
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                      transform: 'translateY(-2px)',
                                      boxShadow: 1,
                                    },
                                  }}
                                >
                                  <Typography variant="body2" color="text.secondary">
                                    {item.label}
                                  </Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    {(() => {
                                      const value = parseFloat(item.value || '0');
                                      return isNaN(value) ? '0' : value.toFixed(1);
                                    })()}{' '}
                                    {item.unit}
                                  </Typography>
                                </Paper>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">{t('ingredients.messages.loadError')}</Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('ingredients.actions.close')}
        </Button>
        {ingredient && (
          <>
            <Button onClick={handleEditClick} color="primary" startIcon={<Edit />}>
              {t('ingredients.actions.edit')}
            </Button>
            <Button onClick={handleDelete} color="error" startIcon={<Delete />}>
              {t('ingredients.actions.delete')}
            </Button>
          </>
        )}
      </DialogActions>

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
