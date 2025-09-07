import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Paper,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Close, Search, Add, Delete, Restaurant, Calculate } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { createMenu, updateMenu, getMenuById } from '../../../services/api/menu';
import { getRecipes } from '../../../services/api/recipes';
import { getIngredients } from '../../../services/api/ingredients';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import {
  MenuListItem,
  CreateMenuParams,
  MenuItem as MenuItemType,
  MenuDetails,
} from '../../../types/menu';
import { Recipe } from '../../../types/recipes';
import { Ingredient } from '../../../types/ingredients';
import { UnitMeasure } from '../../../types/unitMeasure';
import {
  calculateMenuFinancials,
  formatCurrency,
  formatPercentage,
  MenuFinancialData,
} from '../../../utils/menuCalculations';

interface MenuModalProps {
  open: boolean;
  onClose: () => void;
  onMenuSaved: () => void;
  menu?: MenuListItem | null;
  editMode?: boolean;
}

interface RecipeSearchResult {
  _id: string;
  name: string;
  image: string;
  category: string;
}

interface IngredientSearchResult {
  _id: string;
  name: string;
  category: string;
}

interface SearchResult {
  _id: string;
  name: string;
  category: string;
  type: 'recipe' | 'ingredient';
}

const MenuModal: React.FC<MenuModalProps> = ({
  open,
  onClose,
  onMenuSaved,
  menu,
  editMode = false,
}) => {
  const dispatch = useDispatch();

  // Estados do formulário
  const [formData, setFormData] = useState<CreateMenuParams>({
    name: '',
    description: '',
    menuItems: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Estados para busca de receitas e ingredientes
  const [itemSearch, setItemSearch] = useState('');
  const [availableRecipes, setAvailableRecipes] = useState<RecipeSearchResult[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<IngredientSearchResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Estados para unidades de medida
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Estados financeiros (calculados)
  const [financialData, setFinancialData] = useState<MenuFinancialData>({
    totalCost: 0,
    unitCost: 0,
    sellPrice: 0,
    profitMargin: 0,
    markup: 0,
    itemsCost: 0,
    directCosts: 0,
    indirectCosts: 0,
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      loadRecipesAndIngredients();
      loadUnitMeasures();
      if (editMode && menu) {
        loadMenuDetails(menu._id);
      } else {
        resetForm();
      }
    }
  }, [open, editMode, menu]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      menuItems: [],
    });
    setErrors({});
    setItemSearch('');
    setFinancialData({
      totalCost: 0,
      unitCost: 0,
      sellPrice: 0,
      profitMargin: 0,
      markup: 0,
      itemsCost: 0,
      directCosts: 0,
      indirectCosts: 0,
    });
  };

  const loadMenuDetails = async (menuId: string) => {
    try {
      setLoading(true);
      const menuDetails = await getMenuById(menuId);
      setFormData({
        name: menuDetails.name,
        description: menuDetails.description || '',
        menuItems: menuDetails.menuItems,
      });

      if (menuDetails.totalCost !== undefined) {
        const calculated = calculateMenuFinancials({
          totalItems: menuDetails.menuItems.length,
          itemsCost: menuDetails.totalCost || 0,
          directCostsPercentage: 0,
          indirectCostsPercentage: 0,
          sellPrice: menuDetails.sellPrice || 0,
        });
        setFinancialData(calculated);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do cardápio:', error);
      dispatch(
        addNotification({
          message: 'Erro ao carregar detalhes do cardápio.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRecipesAndIngredients = async () => {
    try {
      setLoadingItems(true);

      // Carrega receitas
      const recipesResponse = await getRecipes({ page: 1, itemPerPage: 100 });
      const recipes = recipesResponse.data.map((recipe) => ({
        _id: recipe._id,
        name: recipe.name,
        image: recipe.image,
        category: recipe.category,
      }));
      setAvailableRecipes(recipes);

      // Carrega ingredientes
      const ingredientsResponse = await getIngredients({ page: 1, itemPerPage: 100 });
      const ingredients = ingredientsResponse.data.map((ingredient) => ({
        _id: ingredient._id,
        name: ingredient.name,
        category: ingredient.category,
      }));
      setAvailableIngredients(ingredients);
    } catch (error) {
      console.error('Erro ao carregar receitas e ingredientes:', error);
    } finally {
      setLoadingItems(false);
    }
  };

  const loadUnitMeasures = async () => {
    try {
      setLoadingUnits(true);
      const units = await getUnitMeasures();
      setUnitMeasures(units);
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
    } finally {
      setLoadingUnits(false);
    }
  };

  // Filtrar receitas e ingredientes com base na busca
  useEffect(() => {
    if (itemSearch.trim()) {
      const filteredRecipes = availableRecipes
        .filter((recipe) => recipe.name.toLowerCase().includes(itemSearch.toLowerCase()))
        .map((recipe) => ({ ...recipe, type: 'recipe' as const }));

      const filteredIngredients = availableIngredients
        .filter((ingredient) => ingredient.name.toLowerCase().includes(itemSearch.toLowerCase()))
        .map((ingredient) => ({ ...ingredient, type: 'ingredient' as const }));

      setFilteredResults([...filteredRecipes, ...filteredIngredients]);
    } else {
      setFilteredResults([]);
    }
  }, [itemSearch, availableRecipes, availableIngredients]);

  // Recalcular dados financeiros quando os itens do menu mudarem
  useEffect(() => {
    if (formData.menuItems.length > 0) {
      // Por ora usando valores simulados - idealmente calcularíamos com base nos preços reais dos itens
      const estimated = calculateMenuFinancials({
        totalItems: formData.menuItems.length,
        itemsCost: formData.menuItems.length * 2.5, // Custo estimado por item
        directCostsPercentage: 0,
        indirectCostsPercentage: 0,
        sellPrice: 0, // Usuário pode definir depois
      });
      setFinancialData(estimated);
    } else {
      setFinancialData({
        totalCost: 0,
        unitCost: 0,
        sellPrice: 0,
        profitMargin: 0,
        markup: 0,
        itemsCost: 0,
        directCosts: 0,
        indirectCosts: 0,
      });
    }
  }, [formData.menuItems]);

  const handleInputChange = (field: keyof CreateMenuParams, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddItem = (item: SearchResult) => {
    const existingItem = formData.menuItems.find((menuItem) => menuItem.idItem === item._id);
    if (existingItem) {
      dispatch(
        addNotification({
          message: `Este ${item.type === 'recipe' ? 'receita' : 'ingrediente'} já foi adicionado ao cardápio.`,
          type: 'warning',
          duration: 3000,
        }),
      );
      return;
    }

    const newItem: MenuItemType = {
      idItem: item._id,
      quantityUsed: '1',
      unitMesaure: unitMeasures[0]?.name || 'Porções',
    };

    setFormData((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, newItem],
    }));
    setItemSearch('');
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof MenuItemType, value: string) => {
    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do cardápio é obrigatório';
    }

    if (formData.menuItems.length === 0) {
      newErrors.menuItems = 'Adicione pelo menos uma receita ou ingrediente ao cardápio';
    }

    // Validar itens do menu
    formData.menuItems.forEach((item, index) => {
      if (!item.quantityUsed || parseFloat(item.quantityUsed) <= 0) {
        newErrors[`quantity_${index}`] = 'Quantidade deve ser maior que zero';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (editMode && menu) {
        await updateMenu(menu._id, formData);
        dispatch(
          addNotification({
            message: 'Cardápio atualizado com sucesso!',
            type: 'success',
            duration: 4000,
          }),
        );
      } else {
        await createMenu(formData);
        dispatch(
          addNotification({
            message: 'Cardápio criado com sucesso!',
            type: 'success',
            duration: 4000,
          }),
        );
      }
      onMenuSaved();
    } catch (error) {
      console.error('Erro ao salvar cardápio:', error);
      dispatch(
        addNotification({
          message: 'Erro ao salvar cardápio. Tente novamente.',
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

  const getItemName = (itemId: string): string => {
    const recipe = availableRecipes.find((r) => r._id === itemId);
    if (recipe) return recipe.name;

    const ingredient = availableIngredients.find((i) => i._id === itemId);
    if (ingredient) return ingredient.name;

    return 'Item não encontrado';
  };

  const getItemType = (itemId: string): 'recipe' | 'ingredient' | 'unknown' => {
    const recipe = availableRecipes.find((r) => r._id === itemId);
    if (recipe) return 'recipe';

    const ingredient = availableIngredients.find((i) => i._id === itemId);
    if (ingredient) return 'ingredient';

    return 'unknown';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2, maxHeight: '90vh' },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            {editMode ? 'Editar Cardápio' : 'Novo Cardápio'}
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        {loading && editMode ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Informações básicas */}
            <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informações Básicas
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Nome do cardápio"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      disabled={loading}
                      placeholder="Ex: Menu Executivo, Cardápio de Sobremesas..."
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Descrição"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={loading}
                      placeholder="Descreva seu cardápio..."
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Itens do cardápio */}
            <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Restaurant />
                  Itens do Cardápio
                </Typography>

                {errors.menuItems && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.menuItems}
                  </Alert>
                )}

                {/* Busca de receitas e ingredientes */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Digite aqui o nome da receita ou ingrediente..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    disabled={loading || loadingItems}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                        '& input': {
                          color: 'text.primary',
                        },
                        '& .MuiInputAdornment-root .MuiSvgIcon-root': {
                          color: 'text.secondary',
                        },
                      },
                    }}
                  />

                  {/* Lista de resultados filtrados */}
                  {itemSearch && filteredResults.length > 0 && (
                    <Paper
                      sx={{
                        mt: 1,
                        maxHeight: 200,
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      {filteredResults.slice(0, 5).map((item) => (
                        <Box
                          key={item._id}
                          sx={{
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': {
                              borderBottom: 'none',
                            },
                          }}
                          onClick={() => handleAddItem(item)}
                        >
                          <Add color="primary" />
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, color: 'text.primary' }}
                              >
                                {item.name}
                              </Typography>
                              <Chip
                                label={item.type === 'recipe' ? 'Receita' : 'Ingrediente'}
                                size="small"
                                color={item.type === 'recipe' ? 'primary' : 'secondary'}
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.category}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Paper>
                  )}
                </Box>

                {/* Lista de itens adicionados */}
                {formData.menuItems.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {formData.menuItems.map((item, index) => {
                      const itemType = getItemType(item.idItem);
                      return (
                        <Paper
                          key={index}
                          sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 500, color: 'text.primary' }}
                                >
                                  {getItemName(item.idItem)}
                                </Typography>
                                <Chip
                                  label={itemType === 'recipe' ? 'Receita' : 'Ingrediente'}
                                  size="small"
                                  color={itemType === 'recipe' ? 'primary' : 'secondary'}
                                  variant="outlined"
                                />
                              </Box>

                              <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Quantidade"
                                    type="number"
                                    value={item.quantityUsed}
                                    onChange={(e) =>
                                      handleItemChange(index, 'quantityUsed', e.target.value)
                                    }
                                    error={!!errors[`quantity_${index}`]}
                                    helperText={errors[`quantity_${index}`]}
                                    disabled={loading}
                                    sx={{
                                      '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
                                        {
                                          WebkitAppearance: 'none',
                                          margin: 0,
                                        },
                                      '& input[type="number"]': {
                                        MozAppearance: 'textfield',
                                      },
                                    }}
                                  />
                                </Grid>

                                <Grid size={{ xs: 6 }}>
                                  <FormControl fullWidth size="small">
                                    <Select
                                      value={item.unitMesaure}
                                      onChange={(e) =>
                                        handleItemChange(index, 'unitMesaure', e.target.value)
                                      }
                                      disabled={loading || loadingUnits}
                                    >
                                      {unitMeasures.map((unit) => (
                                        <MenuItem key={unit._id} value={unit.name}>
                                          {unit.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                              </Grid>
                            </Box>

                            <IconButton
                              onClick={() => handleRemoveItem(index)}
                              color="error"
                              disabled={loading}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                ) : (
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Restaurant sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Nenhum item adicionado ainda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use a busca acima para encontrar e adicionar receitas ou ingredientes ao seu
                      cardápio
                    </Typography>
                  </Paper>
                )}
              </CardContent>
            </Card>

            {/* Informações financeiras */}
            {formData.menuItems.length > 0 && (
              <Card
                sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Calculate />
                    Financeiro
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          CUSTO TOTAL
                        </Typography>
                        <Typography variant="h6" color="error">
                          {formatCurrency(financialData.totalCost)}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          CUSTO UNITÁRIO
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {formatCurrency(financialData.unitCost)}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          PREÇO DE VENDA
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {formatCurrency(financialData.sellPrice)}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 3 }}>
                      <Paper
                        sx={{
                          p: 2,
                          textAlign: 'center',
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          MARGEM DE LUCRO
                        </Typography>
                        <Typography
                          variant="h6"
                          color={financialData.profitMargin >= 0 ? 'primary' : 'error'}
                        >
                          {formatPercentage(financialData.profitMargin)}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading
            ? editMode
              ? 'Salvando...'
              : 'Criando...'
            : editMode
              ? 'Salvar Alterações'
              : 'Criar Cardápio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuModal;
