import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import {
  Search,
  Delete,
  Edit,
  Save,
  Cancel,
  Restaurant,
  AttachMoney,
  InfoOutlined,
} from '@mui/icons-material';
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

  // Usar ref para todos os estados críticos e evitar re-renders
  const selectedIngredientsRef = useRef<RecipeIngredient[]>([]);
  const callbackDisabledRef = useRef(false);
  const mountedRef = useRef(true);

  // Sincronizar ref com estado (mas sem causar re-render)
  useEffect(() => {
    selectedIngredientsRef.current = selectedIngredients;
  }, [selectedIngredients]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

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
      console.error('Erro ao carregar unidades de medida:', unitsError);
    }
  }, [unitsError]);

  // Debounce para busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Usar ref para evitar loops com onIngredientsUpdate
  const onIngredientsUpdateRef = useRef(onIngredientsUpdate);

  // NUNCA atualizar o ref do callback (causa loops)
  // onIngredientsUpdateRef.current = onIngredientsUpdate sempre igual

  // INICIALIZAÇÃO CORRIGIDA - APENAS UMA VEZ
  const hasInitializedRef = useRef(false);

  // Solução: Uma única inicialização sem dependências que causam loops
  useEffect(() => {
    if (!hasInitializedRef.current) {
      if (initialIngredients.length > 0) {
        setSelectedIngredients(initialIngredients);
        selectedIngredientsRef.current = initialIngredients;

        // Notificar o pai imediatamente na inicialização
        if (onIngredientsUpdate) {
          onIngredientsUpdate(initialIngredients);
        }
      } else {
        setSelectedIngredients([]);
        selectedIngredientsRef.current = [];
      }

      hasInitializedRef.current = true;
    }
  }, []); // DEPENDÊNCIAS VAZIAS - NUNCA MAIS EXECUTA

  // Função segura que NUNCA causa loop
  const safeCallParentUpdate = useCallback(
    (newIngredients: RecipeIngredient[]) => {
      if (callbackDisabledRef.current) {
        return;
      }

      // Desabilita temporariamente para evitar cascata
      callbackDisabledRef.current = true;

      // Chama o pai de forma segura
      setTimeout(() => {
        if (onIngredientsUpdate) {
          onIngredientsUpdate(newIngredients);
        }
        // Re-habilita após delay
        setTimeout(() => {
          callbackDisabledRef.current = false;
        }, 100);
      }, 50);
    },
    [onIngredientsUpdate],
  );
  useEffect(() => {
    let isCancelled = false; // Flag para cancelar requisições antigas

    const searchIngredients = async () => {
      if (!debouncedSearchTerm.trim()) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await getCachedIngredients({
          page: 1,
          itemPerPage: 50, // REDUZIDO de 1000 para 50! Muito mais rápido
          name: debouncedSearchTerm,
        });

        // Só atualiza se não foi cancelado
        if (!isCancelled) {
          setSearchResults(response.data);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error('Erro ao buscar ingredientes:', error);
          setSearchResults([]);
        }
      } finally {
        if (!isCancelled) {
          setIsSearching(false);
        }
      }
    };

    searchIngredients();

    // Cleanup: cancela a requisição se o componente desmontar ou termo mudar
    return () => {
      isCancelled = true;
    };
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
    safeCallParentUpdate(updatedIngredients);

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
    safeCallParentUpdate(updatedIngredients);
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
    safeCallParentUpdate(updatedIngredients);
    setEditingId(null);
  };

  // Cancelar edição
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuantity('');
    setEditUnit('');
  };

  return (
    <Card
      sx={{
        mt: { xs: 2, sm: 3 },
        borderRadius: { xs: 2, sm: 3 },
        boxShadow: { xs: 1, sm: 2 },
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Titulo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 2.5 },
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Ingredientes
            </Typography>
            <InfoOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
          </Box>
          <Chip
            label={`${selectedIngredients.length} itens`}
            size="small"
            variant="outlined"
            color={selectedIngredients.length > 0 ? 'primary' : 'default'}
          />
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
          onInconsistencyFound={() => {
            // Inconsistências detectadas - handler removido para produção
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
                placeholder="Adicione ingredientes digitando aqui"
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: [
                    isSearching && <CircularProgress key="loading" size={18} />,
                    params.InputProps.endAdornment,
                  ].filter(Boolean),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  },
                }}
              />
            )}
            PaperComponent={(props) => (
              <Paper {...props} sx={{ mt: 1, borderRadius: 2, boxShadow: 2 }} />
            )}
          />
        </Box>

        {/* Lista de ingredientes selecionados */}
        {selectedIngredients.length > 0 ? (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Clique em um ingrediente para ver detalhes e editar informacoes
              </Typography>
            </Box>
            <List sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
                    cursor: 'pointer',
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 1.5,
                    boxShadow: { xs: 0, sm: 1 },
                    '&:hover': {
                      bgcolor: 'action.hover',
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
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {recipeIngredient.ingredient.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {recipeIngredient.ingredient.category}
                        </Typography>
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
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            mt: 0.5,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {recipeIngredient.quantity} {recipeIngredient.unitMeasure}
                          </Typography>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              R$ {recipeIngredient.totalCost.toFixed(2)}
                            </Typography>
                            {recipeIngredient.costPerPortion && (
                              <Typography variant="caption" color="text.secondary">
                                R$ {recipeIngredient.costPerPortion.toFixed(2)}/porcao
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      )
                    }
                    primaryTypographyProps={{ component: 'div' }}
                    secondaryTypographyProps={{ component: 'div' }}
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
                bgcolor: 'background.default',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ color: 'text.secondary' }} />
                <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
                  Total da Receita
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
                  R$ {totals.totalCost.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {totals.totalWeight.toFixed(2)}g total
                </Typography>
                {totals.totalCostPerPortion > 0 && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    R$ {totals.totalCostPerPortion.toFixed(2)} por porcao
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
              bgcolor: 'background.default',
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Restaurant sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
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
