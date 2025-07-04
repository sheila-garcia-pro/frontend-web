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
} from '@mui/material';
import { Search, Delete, Edit, Save, Cancel, Restaurant, AttachMoney } from '@mui/icons-material';
import { useDebounce } from '../../../hooks/useDebounce';
import { getCachedIngredients } from '../../../services/api/ingredients';
import { getCachedUnitMeasures } from '../../../services/api/unitMeasure';
import { UnitMeasure } from '../../../types/unitMeasure';
import { Ingredient } from '../../../types/ingredients';
import { RecipeIngredient, IngredientSearchResult } from '../../../types/recipeIngredients';
import IngredientDetailModal from '../IngredientDetailModal/IngredientDetailModal';

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
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Debounce para busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Carregar ingredientes iniciais
  useEffect(() => {
    if (initialIngredients.length > 0) {
      setSelectedIngredients(initialIngredients);
      onIngredientsUpdate?.(initialIngredients);
    }
  }, [initialIngredients, onIngredientsUpdate]);

  // Carregar unidades de medida da API
  useEffect(() => {
    const loadUnitMeasures = async () => {
      setLoadingUnits(true);
      try {
        const data = await getCachedUnitMeasures();
        setUnitMeasures(data || []);
      } catch (error) {
        console.error('Erro ao carregar unidades de medida:', error);
      } finally {
        setLoadingUnits(false);
      }
    };

    loadUnitMeasures();
  }, []);

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
          itemPerPage: 10,
          search: debouncedSearchTerm,
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
    return { totalCost, totalWeight };
  }, [selectedIngredients]);

  // Função para calcular o custo total de um ingrediente
  const calculateIngredientCost = (ingredient: Ingredient, quantity: number): number => {
    if (!ingredient.price) return 0;

    // Converter quantidade para a unidade base do preço
    const baseQuantity = ingredient.price.quantity;
    const basePrice = ingredient.price.price;

    // Calcular preço por unidade base
    const pricePerUnit = basePrice / baseQuantity;

    return pricePerUnit * quantity;
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
  const handleConfirmAdd = (data: {
    quantity: number;
    unitMeasure: string;
    correctionFactor: number;
    purchasePrice: number;
    purchaseQuantity: number;
    purchaseUnit: string;
  }) => {
    if (!selectedIngredient) return;

    // Calcular custo total com fator de correção
    const pricePerUnit = data.purchasePrice / data.purchaseQuantity;
    const totalCost = pricePerUnit * data.quantity * data.correctionFactor;

    // Atualizar o ingrediente com novos dados de preço
    const updatedIngredient = {
      ...selectedIngredient,
      price: {
        price: data.purchasePrice,
        quantity: data.purchaseQuantity,
        unitMeasure: data.purchaseUnit,
      },
    };

    const newRecipeIngredient: RecipeIngredient = {
      ingredient: updatedIngredient,
      quantity: data.quantity,
      unitMeasure: data.unitMeasure,
      totalWeight: data.quantity * data.correctionFactor,
      totalCost,
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
    const totalCost = calculateIngredientCost(ingredient.ingredient, quantityNum);

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

        {/* Campo de busca */}
        <Box sx={{ mb: 3 }}>
          <Autocomplete
            freeSolo
            options={searchResults}
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
            renderOption={(props, option) => (
              <Box component="li" {...props} onClick={() => handleAddIngredient(option)}>
                <Avatar
                  src={option.image}
                  alt={option.name}
                  sx={{ width: 32, height: 32, mr: 2 }}
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
                    borderColor: 'divider',
                    borderRadius: 2,
                    mb: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'primary.main',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={recipeIngredient.ingredient.image}
                      alt={recipeIngredient.ingredient.name}
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
                                unitMeasures.map((unit) => (
                                  <MenuItem key={unit._id} value={unit.name}>
                                    {unit.name} ({unit.acronym})
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
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: '2px dashed',
              borderColor: 'divider',
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
