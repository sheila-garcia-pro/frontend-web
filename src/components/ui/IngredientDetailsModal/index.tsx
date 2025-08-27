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
  ListSubheader,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Close,
  Edit,
  Category,
  Delete,
  ShoppingCart,
  Info,
  Settings,
  Add,
} from '@mui/icons-material';
import { Ingredient } from '../../../types/ingredients';
import {
  getNutritionalTable,
  getNutritionalTablesWithUserTables,
  getUserNutritionalTables,
  createUserNutritionalTable,
  updateUserNutritionalTable,
  deleteUserNutritionalTable,
} from '../../../services/api/nutritionalTable';
import {
  NutritionalTable,
  UserNutritionalTable,
  CreateUserNutritionalTableRequest,
} from '../../../types/nutritionalTable';
import { useDispatch } from 'react-redux';
import * as ingredientsService from '../../../services/api/ingredients';
import { addNotification } from '../../../store/slices/uiSlice';
import {
  fetchIngredientsRequest,
  deleteIngredientRequest,
} from '../../../store/slices/ingredientsSlice';
import IngredientEditModal from '../IngredientEditModal';
import UserNutritionalTableModal from '../UserNutritionalTableModal';
import UserNutritionalTablesManager from '../UserNutritionalTablesManager';
// Removida a importação específica, usaremos a função do ingredientsService
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
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [ingredient, setIngredient] = useState<Ingredient | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [nutritionalTables, setNutritionalTables] = useState<NutritionalTable[]>([]);
  const [userTables, setUserTables] = useState<UserNutritionalTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<
    NutritionalTable | UserNutritionalTable | null
  >(null);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingUserTables, setLoadingUserTables] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(false);
  const [editingUnit, setEditingUnit] = useState(false);
  const [newPrice, setNewPrice] = useState<string>('');
  const [newQuantity, setNewQuantity] = useState<string>('');
  const [newUnit, setNewUnit] = useState<string>('');
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);

  // User nutritional tables management
  const [userTableModalOpen, setUserTableModalOpen] = useState(false);
  const [tablesManagerOpen, setTablesManagerOpen] = useState(false);
  const [editingUserTable, setEditingUserTable] = useState<UserNutritionalTable | null>(null);
  const [savingUserTable, setSavingUserTable] = useState(false);

  const loadNutritionalTables = useCallback(
    async (name: string) => {
      // Don't load tables if name is empty or undefined
      if (!name || !name.trim()) {
        setNutritionalTables([]);
        setUserTables([]);
        setSelectedTable(null);
        return;
      }

      setLoadingTables(true);
      try {
        // Use the new API that returns both system and user tables
        const { systemTables, userTables } = await getNutritionalTablesWithUserTables(name);
        setNutritionalTables(systemTables);
        setUserTables(userTables);

        // Don't auto-select any table - let user choose explicitly
        // This prevents interference with manual selection
        if (!selectedTable && systemTables.length === 0 && userTables.length === 0) {
          setSelectedTable(null);
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
    [dispatch, t, selectedTable],
  );

  const loadUserNutritionalTables = useCallback(async () => {
    setLoadingUserTables(true);
    try {
      const data = await getUserNutritionalTables();
      setUserTables(data);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar suas tabelas nutricionais.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoadingUserTables(false);
    }
  }, [dispatch]);

  const handleSaveUserTable = async (data: CreateUserNutritionalTableRequest) => {
    setSavingUserTable(true);
    try {
      if (editingUserTable?.id) {
        // Update existing table
        await updateUserNutritionalTable(editingUserTable.id, data);
        dispatch(
          addNotification({
            message: 'Tabela nutricional atualizada com sucesso!',
            type: 'success',
            duration: 3000,
          }),
        );
      } else {
        // Create new table
        await createUserNutritionalTable(data);
        dispatch(
          addNotification({
            message: 'Tabela nutricional criada com sucesso!',
            type: 'success',
            duration: 3000,
          }),
        );
      }

      // Reload tables for current ingredient
      if (ingredient) {
        await loadNutritionalTables(ingredient.name);
      }

      // Also reload user tables for management
      await loadUserNutritionalTables();

      setUserTableModalOpen(false);
      setEditingUserTable(null);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao salvar tabela nutricional.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setSavingUserTable(false);
    }
  };

  const handleDeleteUserTable = async (tableId: string) => {
    try {
      await deleteUserNutritionalTable(tableId);
      dispatch(
        addNotification({
          message: 'Tabela nutricional excluída com sucesso!',
          type: 'success',
          duration: 3000,
        }),
      );

      // If the deleted table was selected, clear selection
      if (
        selectedTable &&
        (selectedTable as UserNutritionalTable).isUserCreated &&
        (selectedTable as UserNutritionalTable).id === tableId
      ) {
        setSelectedTable(null);
      }

      // Reload tables for current ingredient
      if (ingredient) {
        await loadNutritionalTables(ingredient.name);
      }

      // Also reload user tables for management
      await loadUserNutritionalTables();
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao excluir tabela nutricional.',
          type: 'error',
          duration: 5000,
        }),
      );
    }
  };

  const handleCreateUserTable = () => {
    setEditingUserTable(null);
    setUserTableModalOpen(true);
  };

  const handleEditUserTable = (table: UserNutritionalTable) => {
    setEditingUserTable(table);
    setUserTableModalOpen(true);
    setTablesManagerOpen(false);
  };

  const loadIngredient = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const data = await ingredientsService.getIngredientById(id);
        setIngredient(data);
        if (data && data.name && data.name.trim()) {
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

  // Função utilitária para verificar se um valor nutricional é válido
  const isValidNutritionalValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    const stringValue = value.toString().trim();
    return (
      stringValue !== '' &&
      stringValue !== '0' &&
      stringValue !== '0.0' &&
      stringValue !== 'null' &&
      stringValue !== 'undefined' &&
      !isNaN(parseFloat(stringValue)) &&
      parseFloat(stringValue) > 0
    );
  };

  // Função utilitária para formatar valor nutricional
  const formatNutritionalValue = (value: any): string => {
    if (!isValidNutritionalValue(value)) return '0';
    const numericValue = parseFloat(value.toString());
    return numericValue.toFixed(2);
  };

  // Função para obter cores adaptáveis ao tema
  const getThemeAwareColors = (theme: any) => ({
    energy: theme.palette.mode === 'dark' ? '#FF8A65' : '#D84315', // Laranja mais contrastante
    carbs: theme.palette.mode === 'dark' ? '#4DD0E1' : '#0097A7', // Ciano mais contrastante
    totalSugar: theme.palette.mode === 'dark' ? '#64B5F6' : '#1976D2', // Azul mais contrastante
    addSugar: theme.palette.mode === 'dark' ? '#81C784' : '#388E3C', // Verde mais contrastante
    protein: theme.palette.mode === 'dark' ? '#FFB74D' : '#F57C00', // Âmbar mais contrastante
    fats: theme.palette.mode === 'dark' ? '#CE93D8' : '#7B1FA2', // Roxo mais contrastante
  });

  useEffect(() => {
    if (open && ingredientId) {
      loadIngredient(ingredientId);
      // User tables will be loaded together with ingredient tables in loadNutritionalTables
    } else if (!open) {
      setIngredient(null);
      setEditModalOpen(false);
      setUserTableModalOpen(false);
      setTablesManagerOpen(false);
      setEditingUserTable(null);
      setSelectedTable(null); // Clear selection when closing
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
      await ingredientsService.updateIngredientPriceMeasure(ingredient._id, updateData);
      await loadIngredient(ingredient._id);
      dispatch(
        fetchIngredientsRequest({
          page: 1,
          itemPerPage: 10,
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <FormControl fullWidth sx={{ minWidth: 200 }}>
                          <InputLabel
                            id="nutritional-table-label"
                            sx={{
                              whiteSpace: 'nowrap',
                              overflow: 'visible',
                              textOverflow: 'clip',
                            }}
                          >
                            {selectedTable
                              ? t('ingredients.nutrition.title')
                              : 'Selecionar tabela nutricional'}
                          </InputLabel>
                          <Select
                            labelId="nutritional-table-label"
                            value={(() => {
                              if (!selectedTable) return '';

                              // Check if it's a user table by looking for id property
                              if ('id' in selectedTable && selectedTable.id) {
                                return `user_${selectedTable.id}`;
                              }

                              // Otherwise it's a system table
                              return `system_${(selectedTable as NutritionalTable).description.trim()}`;
                            })()}
                            label={
                              selectedTable
                                ? t('ingredients.nutrition.title')
                                : 'Selecionar tabela nutricional'
                            }
                            onChange={(e) => {
                              const value = e.target.value as string;

                              if (value === '__create_new__') {
                                // Handle create new table
                                handleCreateUserTable();
                                return;
                              } else if (value.startsWith('user_')) {
                                // User table selected
                                const tableId = value.replace('user_', '');
                                const userTable = userTables.find((t) => t.id === tableId);
                                setSelectedTable(userTable || null);
                              } else if (value.startsWith('system_')) {
                                // System table selected
                                const description = value.replace('system_', '').trim();
                                const systemTable = nutritionalTables.find(
                                  (t) => t.description.trim() === description,
                                );
                                setSelectedTable(systemTable || null);
                              }
                            }}
                          >
                            {/* System Tables */}
                            {nutritionalTables.length > 0 && [
                              <ListSubheader key="system-header">Tabelas do Sistema</ListSubheader>,
                              ...nutritionalTables.map((table, index) => (
                                <MenuItem
                                  key={`system_${table.description.trim()}_${index}`}
                                  value={`system_${table.description.trim()}`}
                                >
                                  {table.description} ({table.tableName})
                                </MenuItem>
                              )),
                            ]}

                            {/* User Tables */}
                            {userTables.length > 0 && [
                              <ListSubheader key="user-header">
                                Minhas Tabelas Personalizadas
                              </ListSubheader>,
                              ...userTables.map((table, index) => (
                                <MenuItem
                                  key={`user_${table.id}_${index}`}
                                  value={`user_${table.id}`}
                                >
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      width: '100%',
                                    }}
                                  >
                                    <Typography sx={{ flex: 1 }}>{table.description}</Typography>
                                  </Box>
                                </MenuItem>
                              )),
                            ]}

                            {/* Create new table option */}
                            <Divider sx={{ my: 1 }} />
                            <MenuItem
                              value="__create_new__"
                              sx={{
                                color: 'primary.main',
                                fontWeight: 600,
                                '&:hover': {
                                  bgcolor: 'primary.light',
                                  color: 'primary.contrastText',
                                },
                              }}
                            >
                              <Add sx={{ mr: 1 }} />
                              Criar Nova Tabela Personalizada
                            </MenuItem>
                          </Select>
                        </FormControl>

                        {/* Settings button for user tables management */}
                        <Tooltip title="Gerenciar Minhas Tabelas">
                          <IconButton
                            onClick={() => setTablesManagerOpen(true)}
                            sx={{
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                              },
                            }}
                          >
                            <Settings />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
                            {(() => {
                              const themeColors = getThemeAwareColors(theme);
                              const validItems = [
                                {
                                  label: t('ingredients.nutrition.fields.energy'),
                                  value: selectedTable.energyKcal,
                                  unit: t('ingredients.nutrition.units.kcal'),
                                  color: themeColors.energy,
                                  maxValue: 900,
                                },
                                {
                                  label: t('ingredients.nutrition.fields.carbs'),
                                  value: selectedTable.carbohydrateG,
                                  unit: t('ingredients.nutrition.units.g'),
                                  color: themeColors.carbs,
                                  maxValue: 100,
                                },
                                {
                                  label: t('ingredients.nutrition.fields.totalSugar'),
                                  value: selectedTable.totalSugarG,
                                  unit: t('ingredients.nutrition.units.g'),
                                  color: themeColors.totalSugar,
                                  maxValue: 50,
                                },
                                {
                                  label: t('ingredients.nutrition.fields.addSugar'),
                                  value: selectedTable.addSugarG,
                                  unit: t('ingredients.nutrition.units.g'),
                                  color: themeColors.addSugar,
                                  maxValue: 25,
                                },
                                {
                                  label: t('ingredients.nutrition.fields.protein'),
                                  value: selectedTable.proteinG,
                                  unit: t('ingredients.nutrition.units.g'),
                                  color: themeColors.protein,
                                  maxValue: 50,
                                },
                                {
                                  label: t('ingredients.nutrition.fields.totalFats'),
                                  value: selectedTable.totalFatsG,
                                  unit: t('ingredients.nutrition.units.g'),
                                  color: themeColors.fats,
                                  maxValue: 50,
                                },
                              ].filter((item) => isValidNutritionalValue(item.value));

                              if (validItems.length === 0) {
                                return (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ textAlign: 'center', py: 3, width: '100%' }}
                                  >
                                    Não há informações nutricionais válidas na API para este
                                    ingrediente.
                                  </Typography>
                                );
                              }

                              return (
                                <>
                                  {/* Grid de cards nutricionais */}
                                  <Box
                                    sx={{
                                      display: 'grid',
                                      gridTemplateColumns: {
                                        xs: '1fr',
                                        sm: 'repeat(2, 1fr)',
                                        md: 'repeat(3, 1fr)',
                                      },
                                      gap: 2,
                                      width: '100%',
                                      mb: 3,
                                    }}
                                  >
                                    {validItems.map((item) => {
                                      const numericValue = parseFloat(item.value) || 0;
                                      const percentage = Math.min(
                                        (numericValue / item.maxValue) * 100,
                                        100,
                                      );

                                      return (
                                        <Box
                                          key={item.label}
                                          sx={{
                                            p: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 2,
                                            bgcolor: 'background.default',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            transition: 'all 0.2s ease-in-out',
                                            '&:hover': {
                                              transform: 'translateY(-2px)',
                                              boxShadow: 2,
                                            },
                                          }}
                                        >
                                          {/* Barra de progresso no fundo */}
                                          <Box
                                            sx={{
                                              position: 'absolute',
                                              top: 0,
                                              left: 0,
                                              height: '100%',
                                              width: `${percentage}%`,
                                              bgcolor: item.color,
                                              opacity: 0.1,
                                              transition: 'width 0.3s ease',
                                            }}
                                          />

                                          {/* Conteúdo */}
                                          <Box sx={{ position: 'relative', zIndex: 1 }}>
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              display="block"
                                              sx={{ fontSize: '0.75rem', mb: 0.5 }}
                                            >
                                              {item.label}
                                            </Typography>
                                            <Typography
                                              variant="h6"
                                              sx={{
                                                fontWeight: 700,
                                                color: item.color,
                                                fontSize: '1.1rem',
                                              }}
                                            >
                                              {formatNutritionalValue(item.value)} {item.unit}
                                            </Typography>

                                            {/* Mini indicador visual */}
                                            <Box sx={{ mt: 1 }}>
                                              <Box
                                                sx={{
                                                  width: '100%',
                                                  height: 4,
                                                  bgcolor: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                      ? 'grey.700'
                                                      : 'grey.300',
                                                  borderRadius: 2,
                                                  overflow: 'hidden',
                                                  border: '1px solid',
                                                  borderColor: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                      ? 'grey.600'
                                                      : 'grey.400',
                                                }}
                                              >
                                                <Box
                                                  sx={{
                                                    width: `${percentage}%`,
                                                    height: '100%',
                                                    bgcolor: item.color,
                                                    transition: 'width 0.3s ease',
                                                  }}
                                                />
                                              </Box>
                                            </Box>
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </Box>

                                  {/* Gráfico de distribuição de macronutrientes */}
                                  {(() => {
                                    const carbs = parseFloat(selectedTable.carbohydrateG) || 0;
                                    const proteins = parseFloat(selectedTable.proteinG) || 0;
                                    const fats = parseFloat(selectedTable.totalFatsG) || 0;

                                    const hasValidCarbs = isValidNutritionalValue(
                                      selectedTable.carbohydrateG,
                                    );
                                    const hasValidProteins = isValidNutritionalValue(
                                      selectedTable.proteinG,
                                    );
                                    const hasValidFats = isValidNutritionalValue(
                                      selectedTable.totalFatsG,
                                    );

                                    const total =
                                      (hasValidCarbs ? carbs : 0) +
                                      (hasValidProteins ? proteins : 0) +
                                      (hasValidFats ? fats : 0);

                                    if (
                                      total > 0 &&
                                      (hasValidCarbs || hasValidProteins || hasValidFats)
                                    ) {
                                      const validMacros = [];
                                      if (hasValidCarbs)
                                        validMacros.push({
                                          name: 'Carboidratos',
                                          value: carbs,
                                          color: themeColors.carbs,
                                        });
                                      if (hasValidProteins)
                                        validMacros.push({
                                          name: 'Proteínas',
                                          value: proteins,
                                          color: themeColors.protein,
                                        });
                                      if (hasValidFats)
                                        validMacros.push({
                                          name: 'Gorduras',
                                          value: fats,
                                          color: themeColors.fats,
                                        });

                                      return (
                                        <Box
                                          sx={{
                                            mt: 2,
                                            p: 2,
                                            bgcolor: (theme) =>
                                              theme.palette.mode === 'dark'
                                                ? 'grey.800'
                                                : 'grey.50',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            boxShadow: 1,
                                          }}
                                        >
                                          <Typography
                                            variant="subtitle2"
                                            sx={{
                                              mb: 2,
                                              fontWeight: 600,
                                              color: (theme) =>
                                                theme.palette.mode === 'dark'
                                                  ? 'grey.100'
                                                  : 'grey.800',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                              fontSize: '0.9rem',
                                            }}
                                          >
                                            📊 Distribuição de Macronutrientes
                                          </Typography>

                                          {/* Barra de progresso principal */}
                                          <Box sx={{ mb: 2 }}>
                                            <Box
                                              sx={{
                                                display: 'flex',
                                                height: 16,
                                                borderRadius: 8,
                                                overflow: 'hidden',
                                                border: '1px solid',
                                                borderColor: (theme) =>
                                                  theme.palette.mode === 'dark'
                                                    ? 'grey.600'
                                                    : 'grey.300',
                                                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)',
                                              }}
                                            >
                                              {validMacros.map((macro) => (
                                                <Box
                                                  key={macro.name}
                                                  sx={{
                                                    width: `${(macro.value / total) * 100}%`,
                                                    bgcolor: macro.color,
                                                    transition: 'all 0.3s ease',
                                                    position: 'relative',
                                                    '&:hover': {
                                                      filter: 'brightness(1.1)',
                                                    },
                                                  }}
                                                />
                                              ))}
                                            </Box>
                                          </Box>

                                          {/* Legenda compacta */}
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              gap: 1.5,
                                              flexWrap: 'wrap',
                                              justifyContent: 'center',
                                            }}
                                          >
                                            {validMacros.map((macro) => (
                                              <Box
                                                key={macro.name}
                                                sx={{
                                                  display: 'flex',
                                                  alignItems: 'center',
                                                  gap: 0.5,
                                                  p: 1,
                                                  borderRadius: 1,
                                                  bgcolor: (theme) =>
                                                    theme.palette.mode === 'dark'
                                                      ? 'grey.700'
                                                      : 'white',
                                                  border: '1px solid',
                                                  borderColor: 'divider',
                                                  minWidth: 80,
                                                }}
                                              >
                                                {/* Indicador de cor */}
                                                <Box
                                                  sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: macro.color,
                                                    flexShrink: 0,
                                                  }}
                                                />

                                                {/* Texto compacto */}
                                                <Typography
                                                  variant="caption"
                                                  sx={{
                                                    fontSize: '0.65rem',
                                                    fontWeight: 600,
                                                    color: (theme) =>
                                                      theme.palette.mode === 'dark'
                                                        ? 'grey.200'
                                                        : 'grey.700',
                                                  }}
                                                >
                                                  {macro.name}{' '}
                                                  {((macro.value / total) * 100).toFixed(0)}%
                                                </Typography>
                                              </Box>
                                            ))}
                                          </Box>
                                        </Box>
                                      );
                                    }
                                    return null;
                                  })()}
                                </>
                              );
                            })()}
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

      {/* User Nutritional Table Modal */}
      <UserNutritionalTableModal
        open={userTableModalOpen}
        onClose={() => {
          setUserTableModalOpen(false);
          setEditingUserTable(null);
        }}
        onSave={handleSaveUserTable}
        table={editingUserTable}
        loading={savingUserTable}
      />

      {/* User Tables Manager Modal */}
      <UserNutritionalTablesManager
        open={tablesManagerOpen}
        onClose={() => setTablesManagerOpen(false)}
        tables={userTables}
        loading={loadingUserTables}
        onCreateNew={handleCreateUserTable}
        onEdit={handleEditUserTable}
        onDelete={handleDeleteUserTable}
      />
    </Dialog>
  );
};

export default IngredientDetailsModal;
