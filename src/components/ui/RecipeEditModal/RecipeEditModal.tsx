import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Divider,
  SelectChangeEvent,
} from '@mui/material';
import { Close, Save, Cancel } from '@mui/icons-material';
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
    sku: '',
    category: '',
    image: null,
    yieldRecipe: '',
    typeYield: '',
    preparationTime: '',
    weightRecipe: '',
    typeWeightRecipe: '',
    descripition: '',
  });

  // Preencher o formulário quando a receita for carregada
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        sku: recipe.sku,
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
            console.error('Erro ao converter ingredientes:', error);
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
      console.error('❌ Recipe is null or undefined');
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
      console.error('❌ Recipe ID is undefined');
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
          console.error('❌ Erro ao atualizar alguns ingredientes:', error);
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
      console.error('Erro ao atualizar receita:', error);
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
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Editar Receita
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Nome */}
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label="Nome da Receita"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              disabled={loading}
            />
          </Grid>
          {/* SKU */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="SKU"
              value={formData.sku}
              onChange={handleInputChange('sku')}
              disabled={loading}
            />
          </Grid>
          {/* Categoria */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
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
          </Grid>
          {/* Tempo de Preparo */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Tempo de Preparo"
              value={formData.preparationTime}
              onChange={handleInputChange('preparationTime')}
              placeholder="Ex: 1 hora, 30 minutos"
              disabled={loading}
            />
          </Grid>
          {/* Rendimento */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Rendimento"
              value={formData.yieldRecipe}
              onChange={handleInputChange('yieldRecipe')}
              disabled={loading}
            />
          </Grid>
          {/* Tipo de Rendimento */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
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
          </Grid>
          {/* Peso */}
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Peso"
              value={formData.weightRecipe}
              onChange={handleInputChange('weightRecipe')}
              disabled={loading}
            />
          </Grid>
          {/* Tipo de Peso */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
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
          </Grid>{' '}
          {/* Upload de Imagem */}
          <Grid size={{ xs: 12 }}>
            {' '}
            <ImageUploadComponent
              value={formData.image}
              onChange={handleImageChange}
              disabled={loading}
              label="Imagem da Receita"
              helperText="Clique para selecionar uma imagem da receita. Você pode visualizar, alterar ou remover a imagem atual."
            />
          </Grid>
          {/* Descrição */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Descrição"
              value={formData.descripition}
              onChange={handleInputChange('descripition')}
              multiline
              rows={4}
              placeholder="Descreva a receita..."
              disabled={loading}
            />
          </Grid>
          {/* Ingredientes da Receita */}
          {recipe && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mt: 2 }}>
                <RecipeIngredientsCard
                  recipeId={recipe._id}
                  initialIngredients={recipeIngredients}
                  onIngredientsUpdate={handleIngredientsUpdate}
                />
              </Box>
            </Grid>
          )}
          {/* Passos da Receita */}
          {recipe && (
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mt: 2 }}>
                <RecipeStepsCard
                  recipeId={recipe._id}
                  initialSteps={recipeSteps}
                  onStepsUpdate={handleStepsUpdate}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} startIcon={<Cancel />} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<Save />}
          variant="contained"
          color="primary"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeEditModal;
