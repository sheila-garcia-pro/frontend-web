import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent,
  InputAdornment,
  Stack,
  CircularProgress,
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { Recipe, CreateRecipeParams } from '../../../types/recipes';
import { updateRecipe } from '../../../services/api/recipes';
import { getCachedIngredientById } from '../../../services/api/ingredients';
import { syncIngredientsWithAPI } from '../../../utils/ingredientSync';
import ImageUploadComponent from '../ImageUpload';
import {
  RecipeIngredient,
  convertAPIIngredientsToRecipeIngredients,
} from '../../../types/recipeIngredients';
import RecipeIngredientsCard from '../RecipeIngredientsCard';
import RecipeStepsCard from '../RecipeStepsCard';

interface RecipeEditModalProps {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  onRecipeUpdated: (updatedRecipe: Recipe) => void;
}

const RecipeEditModal: React.FC<RecipeEditModalProps> = ({
  open,
  onClose,
  recipe,
  onRecipeUpdated,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeSteps, setRecipeSteps] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateRecipeParams>({
    name: '',
    category: '',
    image: null,
    yieldRecipe: '',
    typeYield: '',
    preparationTime: '',
    weightRecipe: '',
    typeWeightRecipe: '',
    descripition: '',
    sellingPrice: undefined,
    costPrice: undefined,
    profit: undefined,
  });

  // Preencher o formulário quando a receita for carregada
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        category: recipe.category,
        image: recipe.image,
        yieldRecipe: recipe.yieldRecipe,
        typeYield: recipe.typeYield,
        preparationTime: recipe.preparationTime,
        weightRecipe: recipe.weightRecipe,
        typeWeightRecipe: recipe.typeWeightRecipe,
        descripition: recipe.descripition,
        ingredients: recipe.ingredients,
        modePreparation: recipe.modePreparation,
        sellingPrice: recipe.sellingPrice,
        costPrice: recipe.costPrice,
        profit: recipe.profit,
      });

      // Carregar passos da receita
      if (recipe.modePreparation && recipe.modePreparation.length > 0) {
        setRecipeSteps(recipe.modePreparation);
      } else {
        setRecipeSteps([]);
      }

      // Carregar ingredientes da receita
      const loadRecipeIngredients = async () => {
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          try {
            const convertedIngredients = await convertAPIIngredientsToRecipeIngredients(
              recipe.ingredients,
              getCachedIngredientById,
            );
            setRecipeIngredients(convertedIngredients);
          } catch (error) {
            setRecipeIngredients([]);
          }
        } else {
          setRecipeIngredients([]);
        }
      };

      loadRecipeIngredients();
    }
  }, [recipe]);
  const handleInputChange =
    (field: keyof CreateRecipeParams) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };
  const handleImageChange = (imageUrl: string | null) => {
    setFormData((prev) => ({
      ...prev,
      image: imageUrl,
    }));
  };

  const handleSelectChange =
    (field: keyof CreateRecipeParams) => (event: SelectChangeEvent<string>) => {
      const value = event.target.value;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  // Função para atualizar ingredientes da receita
  const handleIngredientsUpdate = (ingredients: RecipeIngredient[]) => {
    setRecipeIngredients(ingredients);
  };

  // Função para atualizar passos da receita
  const handleStepsUpdate = (steps: string[]) => {
    setRecipeSteps(steps);
  };

  const handleSubmit = async () => {
    if (!recipe) {
      return;
    }

    // Validação básica
    if (!formData.name.trim()) {
      dispatch(
        addNotification({
          message: 'Nome da receita é obrigatório!',
          type: 'error',
          duration: 4000,
        }),
      );
      return;
    }

    if (!recipe._id) {
      dispatch(
        addNotification({
          message: 'Erro: ID da receita não encontrado!',
          type: 'error',
          duration: 4000,
        }),
      );
      return;
    }

    setLoading(true);
    try {
      // Etapa 1: Atualizar ingredientes individuais
      if (recipeIngredients.length > 0) {
        try {
          await syncIngredientsWithAPI(recipeIngredients);
        } catch (error) {
          // Erro ao atualizar ingredientes - continua operação
          // Continua com a receita mesmo se houver erro nos ingredientes
        }
      }

      // Etapa 2: Preparar dados da receita com ingredientes e passos
      const recipeData = {
        ...formData,
        ingredients: recipeIngredients.map((ri) => ({
          idIngredient: ri.ingredient._id,
          quantityIngredientRecipe: ri.quantity.toString(),
          unitAmountUseIngredient: ri.unitMeasure,
          priceQuantityIngredient: ri.ingredient.price?.price || 0,
          unitMeasure: ri.ingredient.price?.unitMeasure || ri.unitMeasure,
        })),
        modePreparation: recipeSteps.length > 0 ? recipeSteps : undefined,
      };

      // Etapa 3: Atualizar a receita
      const updatedRecipe = await updateRecipe(recipe._id, recipeData);

      // Não mostrar notificação aqui, será mostrada na página pai após recarregar
      onRecipeUpdated(updatedRecipe);
      onClose();
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao atualizar receita. Tente novamente.',
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

  const categories = [
    'Entradas',
    'Pratos Principais',
    'Sobremesas',
    'Bebidas',
    'Petiscos',
    'Saladas',
    'Sopas',
    'Outros',
  ];

  const yieldTypes = ['Porções', 'Pessoas', 'Unidades', 'Fatias'];

  const weightTypes = ['Quilogramas', 'Gramas', 'Litros', 'Mililitros'];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>Editar Receita</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <Stack spacing={3}>
            {/* Nome da Receita */}
            <TextField
              fullWidth
              label="Nome da Receita"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              disabled={loading}
              autoFocus
            />

            {/* Categoria */}
            <FormControl fullWidth required>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                onChange={handleSelectChange('category')}
                label="Categoria"
                disabled={loading}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Rendimento e Tipo */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Quantidade"
                value={formData.yieldRecipe}
                onChange={handleInputChange('yieldRecipe')}
                disabled={loading}
                placeholder="Ex: 4, 6, 8"
                type="number"
                inputProps={{
                  min: 1,
                  step: 1,
                }}
                sx={{
                  flex: 1,
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

              <FormControl fullWidth required sx={{ flex: 1 }}>
                <InputLabel>Tipo de Rendimento</InputLabel>
                <Select
                  value={formData.typeYield}
                  onChange={handleSelectChange('typeYield')}
                  label="Tipo de Rendimento"
                  disabled={loading}
                >
                  {yieldTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {formData.yieldRecipe && formData.typeYield && (
              <Box sx={{ mt: -2, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Rendimento:{' '}
                  <strong>
                    {formData.yieldRecipe} {formData.typeYield?.toLowerCase()}
                  </strong>
                </Typography>
              </Box>
            )}

            {/* Tempo de Preparo */}
            <TextField
              fullWidth
              label="Tempo de Preparo"
              value={formData.preparationTime}
              onChange={handleInputChange('preparationTime')}
              placeholder="Ex: 1 hora, 30 minutos"
              disabled={loading}
            />

            {/* Peso e Unidade */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Peso da Receita"
                value={formData.weightRecipe}
                onChange={handleInputChange('weightRecipe')}
                disabled={loading}
                placeholder="Ex: 1.5, 250, 0.5"
                sx={{ flex: 2 }}
              />

              <FormControl fullWidth required sx={{ flex: 1 }}>
                <InputLabel>Unidade de Peso</InputLabel>
                <Select
                  value={formData.typeWeightRecipe}
                  onChange={handleSelectChange('typeWeightRecipe')}
                  label="Unidade de Peso"
                  disabled={loading}
                >
                  {weightTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {formData.weightRecipe && formData.typeWeightRecipe && (
              <Box sx={{ mt: -2, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Peso total:{' '}
                  <strong>
                    {formData.weightRecipe} {formData.typeWeightRecipe?.toLowerCase()}
                  </strong>
                </Typography>
              </Box>
            )}

            {/* Descrição */}
            <TextField
              fullWidth
              label="Descrição (Opcional)"
              value={formData.descripition}
              onChange={handleInputChange('descripition')}
              multiline
              rows={4}
              placeholder="Descreva os detalhes da receita (opcional)..."
              disabled={loading}
            />

            {/* Upload de Imagem */}
            <Box>
              <ImageUploadComponent
                value={formData.image || null}
                onChange={handleImageChange}
                disabled={loading}
                label="Imagem da Receita"
                helperText="Clique para selecionar uma imagem da receita. Você pode visualizar, alterar ou remover a imagem atual."
              />
            </Box>

            {/* Ingredientes da Receita */}
            {recipe && (
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  🥘 Ingredientes da Receita
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Gerencie os ingredientes utilizados nesta receita
                </Typography>

                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'divider',
                    borderRadius: 2,
                    p: 1,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'background.paper',
                  }}
                >
                  <RecipeIngredientsCard
                    recipeId={recipe._id}
                    initialIngredients={recipeIngredients}
                    onIngredientsUpdate={handleIngredientsUpdate}
                  />
                </Box>

                {recipeIngredients.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'success.light',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'success.main',
                    }}
                  >
                    <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                      ✓ {recipeIngredients.length} ingrediente(s) configurado(s)
                    </Typography>
                    <Typography variant="caption" color="success.dark">
                      Custo total estimado: R${' '}
                      {recipeIngredients
                        .reduce((total, ingredient) => total + ingredient.totalCost, 0)
                        .toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* Passos da Receita */}
            {recipe && (
              <Box sx={{ mt: 1 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  �‍🍳 Modo de Preparo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Defina os passos para preparar esta receita
                </Typography>

                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'divider',
                    borderRadius: 2,
                    p: 1,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'background.paper',
                  }}
                >
                  <RecipeStepsCard
                    recipeId={recipe._id}
                    initialSteps={recipeSteps}
                    onStepsUpdate={handleStepsUpdate}
                  />
                </Box>
              </Box>
            )}

            {/* Seção de Informações Financeiras */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                💰 Informações Financeiras (Opcional)
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Preço de Venda"
                  value={formData.sellingPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const sellingPrice = value ? parseFloat(value) : undefined;

                    setFormData((prev) => {
                      const newFormData = {
                        ...prev,
                        sellingPrice,
                      };

                      // Calcular lucro automaticamente se tiver preço de venda e custo
                      if (sellingPrice && prev.costPrice) {
                        newFormData.profit = sellingPrice - prev.costPrice;
                      } else if (!sellingPrice || !prev.costPrice) {
                        newFormData.profit = undefined;
                      }

                      return newFormData;
                    });
                  }}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="Ex: 25,00"
                  disabled={loading}
                  sx={{
                    flex: 1,
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

                <TextField
                  fullWidth
                  label="Preço de Custo"
                  value={formData.costPrice || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const costPrice = value ? parseFloat(value) : undefined;

                    setFormData((prev) => {
                      const newFormData = {
                        ...prev,
                        costPrice,
                      };

                      // Calcular lucro automaticamente se tiver preço de venda e custo
                      if (prev.sellingPrice && costPrice) {
                        newFormData.profit = prev.sellingPrice - costPrice;
                      } else if (!prev.sellingPrice || !costPrice) {
                        newFormData.profit = undefined;
                      }

                      return newFormData;
                    });
                  }}
                  onFocus={() => {
                    // Auto-preencher com o custo dos ingredientes se não tiver valor e houver ingredientes
                    if (!formData.costPrice && recipeIngredients.length > 0) {
                      const totalCost = recipeIngredients.reduce(
                        (total, ingredient) => total + ingredient.totalCost,
                        0,
                      );
                      setFormData((prev) => ({
                        ...prev,
                        costPrice: totalCost,
                        profit: prev.sellingPrice ? prev.sellingPrice - totalCost : undefined,
                      }));
                    }
                  }}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="Ex: 15,00"
                  disabled={loading}
                  helperText={
                    recipeIngredients.length > 0 && !formData.costPrice
                      ? `Clique para preencher automaticamente com R$ ${recipeIngredients.reduce((total, ingredient) => total + ingredient.totalCost, 0).toFixed(2)}`
                      : undefined
                  }
                  sx={{
                    flex: 1,
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

                <TextField
                  fullWidth
                  label="Lucro"
                  value={formData.profit !== undefined ? formData.profit.toFixed(2) : ''}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    readOnly: true,
                  }}
                  placeholder="Calculado automaticamente"
                  disabled={loading}
                  sx={{
                    flex: 1,
                    '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
                      {
                        WebkitAppearance: 'none',
                        margin: 0,
                      },
                    '& input[type="number"]': {
                      MozAppearance: 'textfield',
                    },
                    '& .MuiInputBase-input': {
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.05)'
                          : 'rgba(0, 0, 0, 0.03)',
                      cursor: 'not-allowed',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.2)'
                            : 'rgba(0, 0, 0, 0.2)',
                      },
                    },
                  }}
                />
              </Box>

              {recipeIngredients.length > 0 && !formData.costPrice && (
                <Box sx={{ mt: 1, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="caption" color="info.dark">
                    💰 Sugestão: Baseado nos ingredientes configurados, o custo estimado é R${' '}
                    {recipeIngredients
                      .reduce((total, ingredient) => total + ingredient.totalCost, 0)
                      .toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeEditModal;
