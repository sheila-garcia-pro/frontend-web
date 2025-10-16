import { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Dayjs } from 'dayjs';
import { CreateRecipeParams } from '../../types/recipes';
import { RecipeIngredient } from '../../types/recipeIngredients';
import { addNotification } from '../../store/slices/uiSlice';
import { createRecipe } from '../../services/api/recipes';
import { syncIngredientsWithAPI } from '../../utils/ingredientSync';

/**
 * Hook para gerenciar o estado do formulário de criação de receita
 *
 * Seguindo o princípio Single Responsibility:
 * - Gerencia apenas o estado do formulário
 * - Validação dos dados
 * - Submissão da receita
 */
export const useRecipeForm = () => {
  const dispatch = useDispatch();

  // Estado principal do formulário
  const [formData, setFormData] = useState<CreateRecipeParams>({
    name: '',
    category: '',
    image: '',
    yieldRecipe: '',
    typeYield: '',
    preparationTime: '',
    weightRecipe: '',
    typeWeightRecipe: '',
    descripition: '',
    ingredients: [],
    modePreparation: [],
    priceSale: 0,
    priceCost: 0,
    priceProfit: 0,
    costDirect: [],
    costIndirect: [],
    sellingPrice: undefined,
    costPrice: undefined,
    profit: undefined,
  });

  // Estados relacionados
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preparationTimeValue, setPreparationTimeValue] = useState<Dayjs | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeSteps, setRecipeSteps] = useState<string[]>([]);

  // Refs para controle de atualizações
  const isUpdatingIngredientsRef = useRef(false);
  const isUpdatingStepsRef = useRef(false);

  /**
   * Atualizar campo específico do formulário
   */
  const updateFormField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo se existir
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  /**
   * Atualizar tempo de preparação
   */
  const updatePreparationTime = useCallback(
    (newValue: Dayjs | null) => {
      setPreparationTimeValue(newValue);
      if (newValue) {
        const hours = newValue.hour();
        const minutes = newValue.minute();

        let timeString = '';
        if (hours > 0) timeString += `${hours}h `;
        if (minutes > 0) timeString += `${minutes}min`;
        if (!timeString) timeString = '0min';

        updateFormField('preparationTime', timeString.trim());
      } else {
        updateFormField('preparationTime', '');
      }
    },
    [updateFormField],
  );

  /**
   * Atualizar ingredientes da receita
   */
  const updateRecipeIngredients = useCallback((ingredients: RecipeIngredient[]) => {
    if (isUpdatingIngredientsRef.current) return;

    isUpdatingIngredientsRef.current = true;
    setRecipeIngredients(ingredients);
    setTimeout(() => {
      isUpdatingIngredientsRef.current = false;
    }, 0);
  }, []);

  /**
   * Atualizar passos da receita
   */
  const updateRecipeSteps = useCallback((steps: string[]) => {
    if (isUpdatingStepsRef.current) return;

    isUpdatingStepsRef.current = true;
    setRecipeSteps(steps);
    setTimeout(() => {
      isUpdatingStepsRef.current = false;
    }, 0);
  }, []);

  /**
   * Validar formulário completo e mostrar toast informativo se houver erros
   */
  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da receita é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.yieldRecipe) {
      newErrors.yieldRecipe = 'Rendimento é obrigatório';
    }

    if (!formData.typeYield) {
      newErrors.typeYield = 'Tipo de rendimento é obrigatório';
    }

    if (!formData.preparationTime) {
      newErrors.preparationTime = 'Tempo de preparação é obrigatório';
    }

    if (recipeIngredients.length === 0) {
      newErrors.ingredients = 'Pelo menos um ingrediente é obrigatório';
    } else {
      // Validar se todos os ingredientes têm quantidade válida
      const invalidIngredients = recipeIngredients.filter(
        (ing) => !ing.quantity || ing.quantity <= 0,
      );
      if (invalidIngredients.length > 0) {
        newErrors.ingredients = 'Todos os ingredientes devem ter quantidade válida';
      }
    }

    setErrors(newErrors);

    // Se há erros, mostrar toast informativo
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const firstErrorMessage = newErrors[firstErrorField];

      dispatch(
        addNotification({
          message: `⚠️ Preencha os campos obrigatórios: ${firstErrorMessage}`,
          type: 'warning',
          duration: 5000,
        }),
      );

      // Scroll para o primeiro campo com erro
      scrollToField(firstErrorField);
    }

    return Object.keys(newErrors).length === 0;
  }, [formData, recipeIngredients, dispatch]);

  /**
   * Fazer scroll para um campo específico com erro
   */
  const scrollToField = useCallback((fieldName: string) => {
    // Aguardar um pequeno delay para que os erros sejam renderizados
    setTimeout(() => {
      let selector = '';

      switch (fieldName) {
        case 'name':
          selector = 'input[name="name"], input[placeholder*="Nome da Receita"]';
          break;
        case 'category':
          selector = '[data-testid="category-select"], input[placeholder*="Categoria"]';
          break;
        case 'yieldRecipe':
          selector = 'input[placeholder*="Rendimento"]';
          break;
        case 'typeYield':
          selector = '[data-testid="yield-type-select"]';
          break;
        case 'preparationTime':
          selector = 'input[placeholder*="Tempo de Preparação"]';
          break;
        case 'ingredients':
          selector = '[data-testid="ingredients-section"], .ingredients-card';
          break;
        default:
          selector = `input[name="${fieldName}"]`;
      }

      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });

        // Destacar o campo visualmente
        if (element instanceof HTMLElement) {
          element.focus();
          // Adicionar classe temporária para destacar
          element.classList.add('field-error-highlight');
          setTimeout(() => {
            element.classList.remove('field-error-highlight');
          }, 3000);
        }
      }
    }, 100);
  }, []);

  /**
   * Submeter receita
   */
  const submitRecipe = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setSubmitting(true);
    try {
      // Sincronizar ingredientes com API
      await syncIngredientsWithAPI(recipeIngredients);

      // Preparar dados da receita
      const recipeData: CreateRecipeParams = {
        ...formData,
        ingredients: recipeIngredients.map((item) => ({
          idIngredient: item.ingredient._id,
          quantityIngredientRecipe: item.quantity.toString(),
          unitAmountUseIngredient: item.unitMeasure,
        })),
        modePreparation: recipeSteps,
      };

      // Criar receita
      await createRecipe(recipeData);

      dispatch(
        addNotification({
          message: 'Receita criada com sucesso!',
          type: 'success',
          duration: 4000,
        }),
      );

      return true;
    } catch (error: any) {
      console.error('Erro ao criar receita:', error);

      const errorMessage =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Erro interno do servidor';

      dispatch(
        addNotification({
          message: `Erro ao criar receita: ${errorMessage}`,
          type: 'error',
          duration: 6000,
        }),
      );

      return false;
    } finally {
      setSubmitting(false);
    }
  }, [formData, recipeIngredients, recipeSteps, validateForm, dispatch]);

  /**
   * Resetar formulário
   */
  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      category: '',
      image: '',
      yieldRecipe: '',
      typeYield: '',
      preparationTime: '',
      weightRecipe: '',
      typeWeightRecipe: '',
      descripition: '',
      ingredients: [],
      modePreparation: [],
      priceSale: 0,
      priceCost: 0,
      priceProfit: 0,
      costDirect: [],
      costIndirect: [],
      sellingPrice: undefined,
      costPrice: undefined,
      profit: undefined,
    });
    setErrors({});
    setSelectedFile(null);
    setSubmitting(false);
    setUploading(false);
    setPreparationTimeValue(null);
    setRecipeIngredients([]);
    setRecipeSteps([]);
  }, []);

  return {
    // Estado
    formData,
    errors,
    submitting,
    uploading,
    selectedFile,
    preparationTimeValue,
    recipeIngredients,
    recipeSteps,

    // Setters
    setUploading,
    setSelectedFile,

    // Actions
    updateFormField,
    updatePreparationTime,
    updateRecipeIngredients,
    updateRecipeSteps,
    validateForm,
    submitRecipe,
    resetForm,
    scrollToField,
  };
};
