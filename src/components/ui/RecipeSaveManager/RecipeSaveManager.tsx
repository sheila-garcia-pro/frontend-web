import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Restaurant as RecipeIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { RecipeIngredient } from '../../../types/recipeIngredients';
import { Recipe, CreateRecipeParams } from '../../../types/recipes';
import { updateRecipe } from '../../../services/api/recipes';
import { syncIngredientsWithAPI } from '../../../utils/ingredientSync';
import {
  filterValidIngredients,
  calculateIngredientStats,
} from '../../../utils/ingredientValidation';

interface RecipeSaveManagerProps {
  recipe: Recipe;
  recipeIngredients: RecipeIngredient[];
  recipeSteps: string[];
  onSaveComplete?: (updatedRecipe: Recipe) => void;
  onError?: (error: string) => void;
}

interface SaveStep {
  id: string;
  title: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

const RecipeSaveManager: React.FC<RecipeSaveManagerProps> = ({
  recipe,
  recipeIngredients,
  recipeSteps,
  onSaveComplete,
  onError,
}) => {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSteps, setSaveSteps] = useState<SaveStep[]>([]);

  const initializeSaveSteps = (): SaveStep[] => {
    const steps: SaveStep[] = [];

    // Atualizar preços dos ingredientes
    if (recipeIngredients.length > 0) {
      const stats = calculateIngredientStats(recipeIngredients);
      const { validIngredients } = filterValidIngredients(recipeIngredients);

      steps.push({
        id: 'ingredients',
        title: `Atualizar ${validIngredients.length} ingredientes (${stats.ingredientsWithPrice} com preço)`,
        status: 'pending',
      });
    }

    // Salvar receita
    steps.push({
      id: 'recipe',
      title: 'Salvar dados da receita',
      status: 'pending',
    });

    return steps;
  };

  const updateStepStatus = (stepId: string, status: SaveStep['status'], error?: string) => {
    setSaveSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status, error } : step)),
    );
  };

  const handleSave = async () => {
    setSaving(true);
    const steps = initializeSaveSteps();
    setSaveSteps(steps);

    try {
      // Etapa 1: Atualizar preços dos ingredientes
      if (recipeIngredients.length > 0) {
        updateStepStatus('ingredients', 'processing');

        try {
          await syncIngredientsWithAPI(recipeIngredients);
          updateStepStatus('ingredients', 'completed');
        } catch (error) {
          console.error('Erro ao sincronizar ingredientes:', error);
          updateStepStatus(
            'ingredients',
            'error',
            'Alguns ingredientes não puderam ser atualizados',
          );
          // Continua com a receita mesmo se houver erro nos ingredientes
        }
      }

      // Etapa 2: Salvar receita
      updateStepStatus('recipe', 'processing');

      const recipeData: Partial<CreateRecipeParams> = {
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
        ingredients: recipeIngredients.map((ri) => ({
          idIngredient: ri.ingredient._id,
          quantityIngredientRecipe: ri.quantity.toString(),
          unitAmountUseIngredient: ri.unitMeasure,
          priceQuantityIngredient: ri.ingredient.price?.price || 0,
          unitMeasure: ri.ingredient.price?.unitMeasure || ri.unitMeasure,
        })),
        modePreparation: recipeSteps.length > 0 ? recipeSteps : undefined,
      };

      const updatedRecipe = await updateRecipe(recipe._id, recipeData);
      updateStepStatus('recipe', 'completed');

      // Aguardar um pouco para mostrar o sucesso
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSaveComplete?.(updatedRecipe);
      setOpen(false);
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      updateStepStatus(
        'recipe',
        'error',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
      onError?.(error instanceof Error ? error.message : 'Erro ao salvar receita');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
    setSaveSteps(initializeSaveSteps());
  };

  const handleCloseDialog = () => {
    if (!saving) {
      setOpen(false);
    }
  };

  const getStepIcon = (status: SaveStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'processing':
        return <LinearProgress sx={{ width: 20, height: 20, borderRadius: 1 }} />;
      default:
        return <ShoppingCartIcon color="disabled" />;
    }
  };

  const allStepsCompleted = saveSteps.every((step) => step.status === 'completed');
  const hasErrors = saveSteps.some((step) => step.status === 'error');

  return (
    <>
      <Button
        variant="contained"
        size="large"
        onClick={handleOpenDialog}
        startIcon={<SaveIcon />}
        sx={{
          minWidth: 200,
          height: 48,
          bgcolor: 'success.main',
          '&:hover': {
            bgcolor: 'success.dark',
          },
        }}
      >
        Salvar Receita
      </Button>

      <Dialog open={open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <RecipeIcon />
            Salvar Receita
          </Box>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {saving ? 'Salvando alterações...' : 'Confirme o salvamento da receita:'}
          </Typography>

          {saveSteps.length > 0 && (
            <List sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
              {saveSteps.map((step) => (
                <ListItem key={step.id}>
                  <ListItemIcon>{getStepIcon(step.status)}</ListItemIcon>
                  <ListItemText
                    primary={step.title}
                    secondary={step.error}
                    secondaryTypographyProps={{
                      color: step.status === 'error' ? 'error' : 'text.secondary',
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {!saving && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">Esta ação irá:</Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '16px' }}>
                  <li>Atualizar os preços dos ingredientes</li>
                  <li>Salvar os ingredientes da receita</li>
                  <li>Salvar os passos do modo de preparo</li>
                  <li>Atualizar todas as informações da receita</li>
                </ul>
              </Alert>
            </Box>
          )}

          {hasErrors && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Ocorreram erros durante o salvamento. Verifique os detalhes acima.
            </Alert>
          )}

          {allStepsCompleted && !saving && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Receita salva com sucesso!
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>
            {allStepsCompleted ? 'Fechar' : 'Cancelar'}
          </Button>
          {!saving && !allStepsCompleted && (
            <Button
              onClick={handleSave}
              variant="contained"
              startIcon={<SaveIcon />}
              color="success"
            >
              Confirmar Salvamento
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RecipeSaveManager;
