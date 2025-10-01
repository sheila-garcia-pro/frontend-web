import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Chip,
  Divider,
  FormControl,
  Select,
  MenuItem,
  CircularProgress,
  Autocomplete,
  Paper,
  Alert,
} from '@mui/material';
import { Search, Delete, Edit, Save, Cancel, Restaurant, AttachMoney } from '@mui/icons-material';
import { useDebounce } from '../../../hooks/useDebounce';
import { getCachedIngredients, updateIngredient } from '../../../services/api/ingredients';
import { useUnits } from '../../../hooks/useUnits';
import { Ingredient } from '../../../types/ingredients';
import { convertToGrams } from '../../../utils/unitConversion';
import { RecipeIngredient, IngredientSearchResult } from '../../../types/recipeIngredients';
import IngredientDetailModal from '../IngredientDetailModal/IngredientDetailModal';
import { UnitConsistencyValidator } from '../UnitConsistencyValidator';
import IngredientAvatarDisplay from '../IngredientAvatarDisplay';

interface RecipeIngredientsCardProps {
  recipeId: string;
  initialIngredients?: RecipeIngredient[];
  onIngredientsUpdate?: (ingredients: RecipeIngredient[]) => void;
}

const RecipeIngredientsCard: React.FC<RecipeIngredientsCardProps> = ({
  recipeId: _recipeId,
  initialIngredients = [],
  onIngredientsUpdate,
}) => {
  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<IngredientSearchResult[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [selectedRecipeIngredient, setSelectedRecipeIngredient] = useState<RecipeIngredient | null>(
    null,
  );
  const [selectedIngredientIndex, setSelectedIngredientIndex] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState('');

  // Usar o hook de unidades robusto
  const {
    normalizedUnits,
    loading: loadingUnits,
    error: unitsError,
    validateUnitConsistency,
  } = useUnits();

  // Adicionar aviso sobre inconsistências das unidades
  useEffect(() => {
    if (unitsError) {
      console.error('⚠️ Erro ao carregar unidades de medida:', unitsError);
    }
  }, [unitsError]);

  // Debounce para busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Carregar ingredientes iniciais
  useEffect(() => {
    if (initialIngredients.length > 0) {
      setSelectedIngredients(initialIngredients);
      onIngredientsUpdate?.(initialIngredients);
    }
  }, [initialIngredients, onIngredientsUpdate]);

  // Buscar ingredientes
  useEffect(() => {
    const searchIngredients = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await getCachedIngredients({
          page: 1,
          itemPerPage: 1000,
          name: debouncedSearchTerm,
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Erro ao buscar ingredientes:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    searchIngredients();
  }, [debouncedSearchTerm]);

  // Calcular totais
  const totals = useMemo(() => {
    const totalCost = selectedIngredients.reduce((sum, item) => sum + item.totalCost, 0);
    const totalWeight = selectedIngredients.reduce((sum, item) => sum + item.totalWeight, 0);
    const totalCostPerPortion = selectedIngredients.reduce(
      (sum, item) => sum + (item.costPerPortion || 0),
      0,
    );
    return { totalCost, totalWeight, totalCostPerPortion };
  }, [selectedIngredients]);

  // Função para calcular o custo total de um ingrediente
  const calculateIngredientCost = (
    ingredient: Ingredient,
    quantity: number,
    unitMeasure: string,
  ): number => {
    if (!ingredient.price) return 0;

    // Converter quantidades para gramas para cálculo correto
    const baseQuantityInGrams = convertToGrams(
      ingredient.price.quantity,
      ingredient.price.unitMeasure,
    );
    const quantityInGrams = convertToGrams(quantity, unitMeasure);

    // Calcular preço por grama
    const pricePerGram = ingredient.price.price / baseQuantityInGrams;

    return pricePerGram * quantityInGrams;
  };

  // Abrir modal para adicionar ingrediente
  const handleAddIngredient = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setModalMode('add');
    setDetailModalOpen(true);
    setSearchTerm('');
    setSearchResults([]);
  };

  // Abrir modal para ver detalhes/editar ingrediente já adicionado
  const handleOpenIngredientDetails = (recipeIngredient: RecipeIngredient, index: number) => {
    setSelectedIngredient(recipeIngredient.ingredient);
    setSelectedRecipeIngredient(recipeIngredient);
    setSelectedIngredientIndex(index);
    setModalMode('edit');
    setDetailModalOpen(true);
  };

  // Confirmar adição/edição do ingrediente
  const handleConfirmAdd = async (data: {
    quantity: number;
    unitMeasure: string;
    correctionFactor: number;
    purchasePrice: number;
    purchaseQuantity: number;
    purchaseUnit: string;
    pricePerPortion: number;
  }) => {
    if (!selectedIngredient) return;

    // Calcular custo total com fator de correção
    // Calcular custo total usando conversão correta de unidades
    const purchaseQuantityInGrams = convertToGrams(data.purchaseQuantity, data.purchaseUnit);
    const quantityUsedInGrams = convertToGrams(data.quantity, data.unitMeasure);

    const pricePerGram = data.purchasePrice / purchaseQuantityInGrams;
    const totalCost = pricePerGram * quantityUsedInGrams * data.correctionFactor;

    // Calcular custo por porção para este ingrediente na receita
    const costPerPortion = (data.pricePerPortion * quantityUsedInGrams) / 100; // ajustado para a quantidade usada

    // Atualizar o ingrediente com novos dados de preço, fator de correção e preço por porção
    const updatedIngredient = {
      ...selectedIngredient,
      correctionFactor: data.correctionFactor, // Salvar fator de correção no ingrediente
      price: {
        price: data.purchasePrice,
        quantity: data.purchaseQuantity,
        unitMeasure: data.purchaseUnit,
        pricePerPortion: data.pricePerPortion,
      },
    };

    // Atualizar o ingrediente na API para salvar o fator de correção e preço por porção
    try {
      await updateIngredient(selectedIngredient._id, {
        correctionFactor: data.correctionFactor,
        price: {
          price: data.purchasePrice,
          quantity: data.purchaseQuantity,
          unitMeasure: data.purchaseUnit,
          pricePerPortion: data.pricePerPortion,
        },
      });
    } catch (error) {
      console.error(
        'Erro ao atualizar ingrediente com fator de correção e preço por porção:',
        error,
      );
    }

    const newRecipeIngredient: RecipeIngredient = {
      ingredient: updatedIngredient,
      quantity: data.quantity,
      unitMeasure: data.unitMeasure,
      totalWeight: data.quantity * data.correctionFactor,
      totalCost,
      costPerPortion,
      correctionFactor: data.correctionFactor, // Manter por compatibilidade
    };

    let updatedIngredients: RecipeIngredient[];

    if (modalMode === 'edit' && selectedIngredientIndex !== null) {
      // Atualizar ingrediente existente
      updatedIngredients = [...selectedIngredients];
      updatedIngredients[selectedIngredientIndex] = newRecipeIngredient;
    } else {
      // Adicionar novo ingrediente
      updatedIngredients = [...selectedIngredients, newRecipeIngredient];
    }

    setSelectedIngredients(updatedIngredients);
    onIngredientsUpdate?.(updatedIngredients);

    // Limpar estados
    setDetailModalOpen(false);
    setSelectedIngredient(null);
    setSelectedRecipeIngredient(null);
    setSelectedIngredientIndex(null);
    setModalMode('add');
  };

  // Remover ingrediente
  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = selectedIngredients.filter((_, i) => i !== index);
    setSelectedIngredients(updatedIngredients);
    onIngredientsUpdate?.(updatedIngredients);
  };

  // Editar ingrediente
  const handleEditIngredient = (index: number) => {
    const ingredient = selectedIngredients[index];
    setEditingId(ingredient.ingredient._id);
    setEditQuantity(ingredient.quantity.toString());
    setEditUnit(ingredient.unitMeasure);
  };

  // Salvar edição
  const handleSaveEdit = (index: number) => {
    const quantityNum = parseFloat(editQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) return;

    const ingredient = selectedIngredients[index];
    const totalCost = calculateIngredientCost(ingredient.ingredient, quantityNum, editUnit);

    const updatedIngredients = [...selectedIngredients];
    updatedIngredients[index] = {
      ...ingredient,
      quantity: quantityNum,
      unitMeasure: editUnit,
      totalWeight: quantityNum,
      totalCost,
    };

    setSelectedIngredients(updatedIngredients);
    onIngredientsUpdate?.(updatedIngredients);
    setEditingId(null);
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
    setEditUnit('');
  };

  return (
    <Card sx={{ mt: 4, borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Título */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Restaurant sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h5" component="h3" sx={{ fontWeight: 600 }}>
            Ingredientes da Receita
          </Typography>
        </Box>

        {/* Alerta de inconsistências */}
        {unitsError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            ⚠️ Problema ao carregar unidades: {unitsError}
          </Alert>
        )}

        {/* Validador de consistência das unidades */}
        <UnitConsistencyValidator
          units={normalizedUnits}
          onInconsistencyFound={(inconsistencies) => {
            console.warn('🔍 Inconsistências encontradas nas unidades:', inconsistencies);
          }}
        />

        {/* Campo de busca */}
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            renderOption={(props, option) => (
              <Box component="li" {...props} onClick={() => handleAddIngredient(option)}>
                <IngredientAvatarDisplay
                  src={option.image}
                  name={option.name}
                  size={32}
                  sx={{ mr: 2 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1">{option.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.category}
                  </Typography>
                </Box>
                {option.price && (
                  <Typography variant="caption" color="primary.main">
                    R$ {option.price.price.toFixed(2)}/{option.price.unitMeasure}
                  </Typography>
                )}
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Buscar ingredientes para adicionar..."
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {isSearching && <CircularProgress size={20} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
            )}
            PaperComponent={(props) => <Paper {...props} sx={{ mt: 1, borderRadius: 2 }} />}
          />
        </Box>

        {/* Lista de ingredientes selecionados */}
        {selectedIngredients.length > 0 ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                💡 Clique em um ingrediente para ver detalhes, preços e tabela nutricional
              </Typography>
            </Box>
            <List sx={{ mb: 3 }}>
              {selectedIngredients.map((recipeIngredient, index) => (
                <ListItem
                  key={`${recipeIngredient.ingredient._id}-${index}`}
                  onClick={(e) => {
                    // Prevenir que o click nos botões de ação dispare o click do item
                    if ((e.target as HTMLElement).closest('.MuiIconButton-root')) {
                      return;
                    }
                    handleOpenIngredientDetails(recipeIngredient, index);
                  }}
                  sx={{
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'divider',
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'background.paper',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'action.hover',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemAvatar>
                    <IngredientAvatarDisplay
                      src={recipeIngredient.ingredient.image}
                      name={recipeIngredient.ingredient.name}
                      size={40}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {recipeIngredient.ingredient.name}
                        </Typography>
                        <Chip
                          label={recipeIngredient.ingredient.category}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      </Box>
                    }
                    secondary={
                      editingId === recipeIngredient.ingredient._id ? (
                        <Box sx={{ display: 'flex', gap: 1, mt: 1, alignItems: 'center' }}>
                          <TextField
                            type="number"
                            size="small"
                            value={editQuantity}
                            onChange={(e) => setEditQuantity(e.target.value)}
                            sx={{ width: 100 }}
                          />
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select
                              value={editUnit}
                              onChange={(e) => setEditUnit(e.target.value)}
                              disabled={loadingUnits}
                            >
                              {loadingUnits ? (
                                <MenuItem disabled>
                                  <CircularProgress size={16} />
                                  Carregando...
                                </MenuItem>
                              ) : (
                                normalizedUnits.map((unit) => (
                                  <MenuItem key={unit.id} value={unit.name}>
                                    {unit.name} {unit.acronym && `(${unit.acronym})`}
                                    {unit.type === 'amount-use' &&
                                      unit.baseUnitName &&
                                      ` - Base: ${unit.baseUnitName}`}
                                  </MenuItem>
                                ))
                              )}
                            </Select>
                          </FormControl>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleSaveEdit(index)}
                          >
                            <Save />
                          </IconButton>
                          <IconButton size="small" color="secondary" onClick={handleCancelEdit}>
                            <Cancel />
                          </IconButton>
                        </Box>
                      ) : (
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {recipeIngredient.quantity} {recipeIngredient.unitMeasure}
                          </Typography>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                            R$ {recipeIngredient.totalCost.toFixed(2)}
                          </Typography>
                          {recipeIngredient.costPerPortion && (
                            <Typography variant="caption" color="text.secondary">
                              R$ {recipeIngredient.costPerPortion.toFixed(2)}/porção
                            </Typography>
                          )}
                        </Box>
                      )
                    }
                  />
                  <ListItemSecondaryAction>
                    {editingId !== recipeIngredient.ingredient._id && (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditIngredient(index)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveIngredient(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 3 }} />

            {/* Totais */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 3,
                bgcolor: 'primary.light',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.main',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ color: 'primary.dark' }} />
                <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 600 }}>
                  Total da Receita
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" color="primary.dark" sx={{ fontWeight: 700 }}>
                  R$ {totals.totalCost.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="primary.dark">
                  {totals.totalWeight.toFixed(2)}g total
                </Typography>
                {totals.totalCostPerPortion > 0 && (
                  <Typography variant="body2" color="error.dark" sx={{ fontWeight: 600 }}>
                    R$ {totals.totalCostPerPortion.toFixed(2)} por porção
                  </Typography>
                )}
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'background.paper',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'divider',
            }}
          >
            <Restaurant sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum ingrediente adicionado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Use a busca acima para adicionar ingredientes à sua receita
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Modal detalhado para adicionar/editar ingrediente */}
      <IngredientDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedIngredient(null);
          setSelectedRecipeIngredient(null);
          setSelectedIngredientIndex(null);
          setModalMode('add');
        }}
        ingredient={selectedIngredient}
        existingData={
          modalMode === 'edit' && selectedRecipeIngredient ? selectedRecipeIngredient : undefined
        }
        onConfirm={handleConfirmAdd}
      />
    </Card>
  );
};

export default RecipeIngredientsCard;
