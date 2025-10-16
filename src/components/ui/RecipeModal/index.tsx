import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  CircularProgress,
  Typography,
  Stack,
  Box,
  FormHelperText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  Schedule as ScheduleIcon,
  Scale as ScaleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { useDispatch } from 'react-redux';
import { CreateRecipeParams, CostItem } from '../../../types/recipes';
import { addNotification } from '../../../store/slices/uiSlice';
import { createRecipe } from '../../../services/api/recipes';
import { getUserRecipeCategories, RecipeCategory } from '../../../services/api/recipeCategories';
import { getYieldsRecipes } from '../../../services/api/yields';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import { getUserUnitsAmountUse } from '../../../services/api/unitsAmountUse';
import { UnitMeasure } from '../../../types/unitMeasure';
import { UnitAmountUse } from '../../../types/unitAmountUse';
import { RecipeIngredient } from '../../../types/recipeIngredients';
import RecipeIngredientsCard from '../RecipeIngredientsCard';
import RecipeStepsCard from '../RecipeStepsCard';
import QuickCategoryAdd from '../QuickCategoryAdd';
import QuickUnitAmountUseAdd from '../QuickUnitAmountUseAdd';
import UnitAmountUseEditModal from '../UnitAmountUseMenu/UnitAmountUseEditModal';
import UnitAmountUseDeleteModal from '../UnitAmountUseMenu/UnitAmountUseDeleteModal';
import EnhancedFinancialSection from '../EnhancedFinancialSection';
import NutritionLabel from '../NutritionLabel';
import NutritionalInfoSection from '../NutritionalInfoSection';
import { useNutritionalInfo } from '../../../hooks/useNutritionalInfo';
import api from '../../../services/api';
import imageUploadService from '../../../services/imageUploadService';

interface RecipeModalProps {
  open: boolean;
  onClose: () => void;
  onRecipeCreated?: () => void;
}

// Local interface for yields to match API response format
interface YieldItem {
  _id: string;
  name: string;
  description?: string;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ open, onClose, onRecipeCreated }) => {
  const dispatch = useDispatch();

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preparationTimeValue, setPreparationTimeValue] = useState<Dayjs | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeSteps, setRecipeSteps] = useState<string[]>([]);

  const [userCategories, setUserCategories] = useState<RecipeCategory[]>([]);
  const [yields, setYields] = useState<YieldItem[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [userUnitsAmountUse, setUserUnitsAmountUse] = useState<UnitAmountUse[]>([]);

  const [loadingUserCategories, setLoadingUserCategories] = useState(false);
  const [loadingYields, setLoadingYields] = useState(false);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);
  const [loadingUserUnits, setLoadingUserUnits] = useState(false);
  const [updatingCategories, setUpdatingCategories] = useState(false);

  // Estados para modais de edição e exclusão de unidades
  const [editUnitModalOpen, setEditUnitModalOpen] = useState(false);
  const [deleteUnitModalOpen, setDeleteUnitModalOpen] = useState(false);
  const [selectedUnitForEdit, setSelectedUnitForEdit] = useState<UnitAmountUse | null>(null);

  const loadUserCategories = useCallback(async () => {
    try {
      setLoadingUserCategories(true);
      const categories = await getUserRecipeCategories();
      setUserCategories(categories);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar categorias do usuário',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingUserCategories(false);
    }
  }, [dispatch]);

  const loadYields = useCallback(async () => {
    try {
      setLoadingYields(true);
      const yieldsData = await getYieldsRecipes();
      // Map the API data to our local interface format
      const mappedYields: YieldItem[] = yieldsData.map((yieldItem) => ({
        _id: yieldItem._id,
        name: yieldItem.name,
        description: yieldItem.description,
      }));

      setYields(mappedYields);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar tipos de rendimento',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingYields(false);
    }
  }, [dispatch]);

  const loadUnitMeasures = useCallback(async () => {
    try {
      setLoadingUnitMeasures(true);
      const unitMeasuresData = await getUnitMeasures();
      setUnitMeasures(unitMeasuresData);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar unidades de medida',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingUnitMeasures(false);
    }
  }, [dispatch]);

  const loadUserUnitsAmountUse = useCallback(async () => {
    try {
      setLoadingUserUnits(true);
      const units = await getUserUnitsAmountUse();
      setUserUnitsAmountUse(units);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar unidades personalizadas',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingUserUnits(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      loadUserCategories();
      loadYields();
      loadUnitMeasures();
      loadUserUnitsAmountUse();
    }
  }, [open, loadUserCategories, loadYields, loadUnitMeasures, loadUserUnitsAmountUse]);

  useEffect(() => {
    if (!open) {
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
      });
      setErrors({});
      setSelectedFile(null);
      setSubmitting(false);
      setPreparationTimeValue(null);
      setRecipeIngredients([]);
      setRecipeSteps([]);
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
  ) => {
    const { name, value } = e.target;
    if (name) {
      // Ensure value is never undefined to prevent controlled/uncontrolled switch
      const safeValue = value === undefined ? '' : value;
      setFormData((prev) => ({ ...prev, [name]: safeValue }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
    }
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    setPreparationTimeValue(newValue);
    if (newValue) {
      const hours = newValue.hour();
      const minutes = newValue.minute();

      let timeString = '';
      if (hours > 0) {
        timeString += `${hours}h`;
      }
      if (minutes > 0) {
        timeString += `${timeString ? ' ' : ''}${minutes}min`;
      }
      if (!timeString) {
        timeString = '0min';
      }

      setFormData((prev) => ({ ...prev, preparationTime: timeString }));
      if (errors.preparationTime) {
        setErrors((prev) => ({ ...prev, preparationTime: '' }));
      }
    } else {
      setFormData((prev) => ({ ...prev, preparationTime: '' }));
    }
  };

  // Refs para controlar atualizações e prevenir loops
  const isUpdatingIngredientsRef = useRef(false);
  const isUpdatingStepsRef = useRef(false);

  const handleIngredientsUpdate = useCallback((ingredients: RecipeIngredient[]) => {
    console.log(
      '[RecipeModal] handleIngredientsUpdate chamada com:',
      ingredients.length,
      'ingredientes',
    );
    console.log(
      '[RecipeModal] Ingredientes recebidos:',
      ingredients.map((ing) => ({ name: ing.ingredient.name, quantity: ing.quantity })),
    );

    if (isUpdatingIngredientsRef.current) {
      console.warn('[RecipeModal] Bloqueou atualização circular de ingredientes');
      return;
    }

    isUpdatingIngredientsRef.current = true;
    setRecipeIngredients(ingredients);
    console.log(
      '[RecipeModal] Estado recipeIngredients atualizado para:',
      ingredients.length,
      'ingredientes',
    );

    setTimeout(() => {
      isUpdatingIngredientsRef.current = false;
    }, 0);
  }, []);

  const handleStepsUpdate = useCallback((steps: string[]) => {
    if (isUpdatingStepsRef.current) return;

    isUpdatingStepsRef.current = true;
    setRecipeSteps(steps);
    setTimeout(() => {
      isUpdatingStepsRef.current = false;
    }, 0);
  }, []);

  const handleCategoryAdded = async (categoryId: string, categoryName: string) => {
    try {
      setUpdatingCategories(true);

      // Recarrega a lista completa de categorias da API
      await loadUserCategories();

      // Seleciona automaticamente a nova categoria
      setFormData((prev) => ({ ...prev, category: categoryId }));

      // Remove erro de categoria se existir
      if (errors.category) {
        setErrors((prev) => ({ ...prev, category: '' }));
      }

      dispatch(
        addNotification({
          message: 'Lista de categorias atualizada!',
          type: 'success',
          duration: 2000,
        }),
      );
    } catch (error) {
      // Fallback: adiciona apenas localmente se a recarga falhar
      const newCategory = { id: categoryId, name: categoryName };
      setUserCategories((prev) => [...prev, newCategory]);
      setFormData((prev) => ({ ...prev, category: categoryId }));

      if (errors.category) {
        setErrors((prev) => ({ ...prev, category: '' }));
      }

      dispatch(
        addNotification({
          message: 'Categoria adicionada localmente',
          type: 'warning',
          duration: 3000,
        }),
      );
    } finally {
      setUpdatingCategories(false);
    }
  };

  const handleUnitAdded = async (
    unitId: string,
    unitName: string,
    quantity: string,
    unitMeasure: string,
  ) => {
    try {
      // Recarrega a lista completa de unidades da API
      await loadUserUnitsAmountUse();

      // Converte a nova unidade para o formato esperado pelo select
      // Usamos o nome completo como valor para compatibilidade
      const unitDisplayName = `${unitName} (${quantity} ${unitMeasure})`;

      // Seleciona automaticamente a nova unidade
      setFormData((prev) => ({ ...prev, typeWeightRecipe: unitDisplayName }));

      // Remove erro de unidade se existir
      if (errors.typeWeightRecipe) {
        setErrors((prev) => ({ ...prev, typeWeightRecipe: '' }));
      }

      dispatch(
        addNotification({
          message: 'Lista de unidades atualizada!',
          type: 'success',
          duration: 2000,
        }),
      );
    } catch (error) {
      // Fallback: adiciona apenas localmente se a recarga falhar
      const newUnit = {
        id: unitId,
        name: unitName,
        quantity: quantity,
        unitMeasure: unitMeasure,
      };
      setUserUnitsAmountUse((prev) => [...prev, newUnit]);

      const unitDisplayName = `${unitName} (${quantity} ${unitMeasure})`;
      setFormData((prev) => ({ ...prev, typeWeightRecipe: unitDisplayName }));

      if (errors.typeWeightRecipe) {
        setErrors((prev) => ({ ...prev, typeWeightRecipe: '' }));
      }

      dispatch(
        addNotification({
          message: 'Unidade adicionada localmente',
          type: 'warning',
          duration: 3000,
        }),
      );
    }
  };

  // Funções para gerenciar edição e exclusão de unidades
  const handleEditUnit = (unit: UnitAmountUse) => {
    setSelectedUnitForEdit(unit);
    setEditUnitModalOpen(true);
  };

  const handleDeleteUnit = (unit: UnitAmountUse) => {
    setSelectedUnitForEdit(unit);
    setDeleteUnitModalOpen(true);
  };

  const handleUnitUpdated = () => {
    loadUserUnitsAmountUse();
    setEditUnitModalOpen(false);
    setSelectedUnitForEdit(null);
  };

  const handleUnitDeleted = () => {
    loadUserUnitsAmountUse();
    setDeleteUnitModalOpen(false);
    setSelectedUnitForEdit(null);
  };

  const handleCloseUnitModals = () => {
    setEditUnitModalOpen(false);
    setDeleteUnitModalOpen(false);
    setSelectedUnitForEdit(null);
  };

  const formatWeight = (value: string) => {
    // Remove tudo que não é número ou ponto/vírgula
    const numericValue = value.replace(/[^\d.,]/g, '');
    // Substitui vírgula por ponto para padronização
    return numericValue.replace(',', '.');
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatWeight(e.target.value);
    setFormData((prev) => ({ ...prev, weightRecipe: formattedValue }));
    if (errors.weightRecipe) {
      setErrors((prev) => ({ ...prev, weightRecipe: '' }));
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    // Ensure value is never undefined to prevent controlled/uncontrolled switch
    const safeValue = value === undefined ? '' : value;
    setFormData((prev) => ({ ...prev, category: safeValue }));
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: '' }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      try {
        setUploading(true);

        // Usar o método uploadImage com a URL da imagem atual
        const result = await imageUploadService.uploadImage(
          file,
          'recipes',
          formData.image || null,
        );

        if (result.success) {
          setFormData((prev) => ({ ...prev, image: result.url }));
          setErrors((prev) => ({ ...prev, image: '' }));

          dispatch(
            addNotification({
              message: result.message || 'Imagem enviada com sucesso!',
              type: 'success',
              duration: 3000,
            }),
          );
        } else {
          throw new Error(result.message || 'Erro ao fazer upload da imagem');
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Erro ao fazer upload da imagem';
        setErrors((prev) => ({ ...prev, image: errorMessage }));
        dispatch(
          addNotification({
            message: errorMessage,
            type: 'error',
            duration: 4000,
          }),
        );
      } finally {
        setUploading(false);
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'A categoria é obrigatória';
    }

    if (!formData.yieldRecipe) {
      newErrors.yieldRecipe = 'O rendimento é obrigatório';
    }

    if (!formData.typeYield) {
      newErrors.typeYield = 'O tipo de rendimento é obrigatório';
    }

    if (!formData.preparationTime) {
      newErrors.preparationTime = 'O tempo de preparação é obrigatório';
    }

    console.log(
      '[RecipeModal] Validando ingredientes - recipeIngredients.length:',
      recipeIngredients.length,
    );
    console.log(
      '[RecipeModal] Dados dos ingredientes:',
      recipeIngredients.map((ing) => ({ name: ing.ingredient.name, quantity: ing.quantity })),
    );

    // Validação obrigatória para ingredientes
    if (recipeIngredients.length === 0) {
      console.error('[RecipeModal] ERRO: Nenhum ingrediente encontrado!');
      newErrors.ingredients = 'Adicione pelo menos um ingrediente à receita';
    } else {
      console.log(
        '[RecipeModal] Validação de ingredientes PASSOU - encontrados:',
        recipeIngredients.length,
        'ingredientes',
      );
    }

    // Peso da receita não é mais obrigatório
    // if (!formData.weightRecipe) {
    //   newErrors.weightRecipe = 'O peso da receita é obrigatório';
    // }

    // if (!formData.typeWeightRecipe) {
    //   newErrors.typeWeightRecipe = 'O tipo de peso é obrigatório';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);

      // Find the category name from the selected category ID
      const selectedCategory = userCategories.find((cat) => cat.id === formData.category);
      const categoryName = selectedCategory ? selectedCategory.name : formData.category;

      // Find the weight unit from the selected unit ID or custom unit
      let weightUnitName;
      const selectedWeightUnit = unitMeasures.find(
        (unit) => unit._id === formData.typeWeightRecipe,
      );

      if (selectedWeightUnit) {
        // É uma unidade do sistema
        weightUnitName = selectedWeightUnit.name;
      } else {
        // É uma unidade personalizada - usa o valor diretamente já que contém toda a informação
        weightUnitName = formData.typeWeightRecipe;
      }

      // Create the submission data with proper format
      const submissionData = {
        ...formData,
        category: categoryName,
        yieldRecipe: formData.yieldRecipe,
        typeYield: formData.typeYield,
        typeWeightRecipe: weightUnitName,
        ingredients: recipeIngredients.map((ri) => ({
          idIngredient: ri.ingredient._id,
          quantityIngredientRecipe: ri.quantity.toString(),
          // Use the unit name directly, not the ID
          unitAmountUseIngredient: ri.unitMeasure,
        })),
        modePreparation: recipeSteps.length > 0 ? recipeSteps : [],
        // Ensure required financial fields are included
        priceSale: formData.priceSale || 0,
        priceCost: formData.priceCost || 0,
        priceProfit: formData.priceProfit || 0,
        costDirect: formData.costDirect || [],
        costIndirect: formData.costIndirect || [],
      };

      await createRecipe(submissionData);

      dispatch(
        addNotification({
          message: 'Receita criada com sucesso!',
          type: 'success',
          duration: 4000,
        }),
      );

      onRecipeCreated?.();
      onClose();
    } catch (error: unknown) {
      let errorMessage = 'Erro ao criar receita';

      if (error instanceof Error && 'response' in error && error.response) {
        const responseData = (error.response as { data?: { message?: string; error?: string } })
          ?.data;

        if (responseData?.message?.includes('Unidade de quantidade de uso não existe')) {
          errorMessage = `Erro: A unidade de medida "${recipeIngredients.find((ri) => !ri.unitMeasure)?.unitMeasure || 'desconhecida'}" não é válida. Verifique se as unidades dos ingredientes estão corretas.`;
        } else {
          errorMessage = responseData?.message || responseData?.error || errorMessage;
        }
      }

      dispatch(
        addNotification({
          message: errorMessage,
          type: 'error',
          duration: 8000,
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isLoadingCategories = loadingUserCategories || updatingCategories;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          elevation: 5,
          sx: {
            borderRadius: 2,
            width: '66.67vw', // 2/3 da largura da viewport
            maxWidth: '66.67vw',
            height: '90vh',
            maxHeight: '90vh',
            margin: 'auto', // Centraliza horizontalmente
            overflow: 'hidden', // Evita scroll horizontal
          },
        }}
      >
        <DialogTitle sx={{ pb: 2 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            Nova Receita
          </Typography>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            px: 3,
            py: 2,
            overflow: 'auto', // Permite scroll vertical apenas
            maxHeight: 'calc(90vh - 120px)', // Reserva espaço para header e footer
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.3)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.5)',
              },
            },
          }}
        >
          <Box sx={{ py: 1, width: '100%', boxSizing: 'border-box' }}>
            <Stack spacing={4}>
              <TextField
                label="Nome da Receita"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name}
                autoFocus
              />

              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                    Categoria *
                  </Typography>
                  <QuickCategoryAdd onCategoryAdded={handleCategoryAdded} />
                </Box>

                <FormControl fullWidth required error={!!errors.category}>
                  <InputLabel id="category-label">Categoria</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formData.category}
                    onChange={handleCategoryChange}
                    label="Categoria"
                    disabled={isLoadingCategories}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          borderRadius: 8,
                        },
                        sx: {
                          '& .MuiMenu-list': {
                            paddingTop: 1,
                            paddingBottom: 1,
                            // Customização da scrollbar
                            '&::-webkit-scrollbar': {
                              width: '6px',
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: 'rgba(0,0,0,.1)',
                              borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                              backgroundColor: 'rgba(0,0,0,.3)',
                              borderRadius: '3px',
                              '&:hover': {
                                backgroundColor: 'rgba(0,0,0,.5)',
                              },
                            },
                          },
                          '& .MuiMenuItem-root': {
                            borderRadius: 1,
                            margin: '0 8px',
                            marginBottom: '2px',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText',
                              transform: 'translateX(2px)',
                            },
                            '&.Mui-selected': {
                              backgroundColor: 'primary.main',
                              color: 'primary.contrastText',
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: 'primary.dark',
                              },
                            },
                            '&.Mui-disabled': {
                              opacity: 0.6,
                            },
                          },
                          // Indicador de scroll no topo e bottom
                          '&::before':
                            userCategories.length > 8
                              ? {
                                  content: '""',
                                  position: 'sticky',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: '15px',
                                  background:
                                    'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                  pointerEvents: 'none',
                                  zIndex: 1,
                                }
                              : {},
                          '&::after':
                            userCategories.length > 8
                              ? {
                                  content: '""',
                                  position: 'sticky',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  height: '15px',
                                  background:
                                    'linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 100%)',
                                  pointerEvents: 'none',
                                  zIndex: 1,
                                }
                              : {},
                        },
                      },
                    }}
                  >
                    {isLoadingCategories ? (
                      <MenuItem value="" disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Carregando categorias...
                      </MenuItem>
                    ) : (
                      userCategories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))
                    )}
                    {!isLoadingCategories && userCategories.length === 0 && (
                      <MenuItem value="" disabled>
                        Nenhuma categoria disponível
                      </MenuItem>
                    )}
                  </Select>
                  {errors.category && <FormHelperText error>{errors.category}</FormHelperText>}
                </FormControl>
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Quantidade"
                  name="yieldRecipe"
                  value={formData.yieldRecipe}
                  onChange={handleChange}
                  fullWidth
                  required
                  variant="outlined"
                  error={!!errors.yieldRecipe}
                  helperText={errors.yieldRecipe || 'Digite a quantidade de rendimento'}
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

                <FormControl fullWidth required error={!!errors.typeYield} sx={{ flex: 1 }}>
                  <InputLabel id="type-yield-label">Tipo</InputLabel>
                  <Select
                    labelId="type-yield-label"
                    name="typeYield"
                    value={formData.typeYield}
                    onChange={handleChange}
                    label="Tipo"
                    disabled={loadingYields}
                  >
                    {loadingYields ? (
                      <MenuItem value="" disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Carregando tipos...
                      </MenuItem>
                    ) : (
                      yields.map((yieldItem) => (
                        <MenuItem key={yieldItem._id} value={yieldItem.name}>
                          {yieldItem.name} {yieldItem.description && `- ${yieldItem.description}`}
                        </MenuItem>
                      ))
                    )}
                    {!loadingYields && yields.length === 0 && (
                      <MenuItem value="" disabled>
                        Nenhum tipo disponível
                      </MenuItem>
                    )}
                  </Select>
                  {errors.typeYield && <FormHelperText error>{errors.typeYield}</FormHelperText>}
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

              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                <TimePicker
                  label="Tempo de Preparação"
                  value={preparationTimeValue}
                  onChange={handleTimeChange}
                  format="HH:mm"
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.preparationTime,
                      helperText: errors.preparationTime || 'Selecione o tempo de preparação',
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <ScheduleIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </LocalizationProvider>

              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'end',
                    mb: 1,
                  }}
                >
                  <QuickUnitAmountUseAdd onUnitAdded={handleUnitAdded} />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Peso da Receita (Opcional)"
                    name="weightRecipe"
                    value={formData.weightRecipe}
                    onChange={handleWeightChange}
                    fullWidth
                    variant="outlined"
                    error={!!errors.weightRecipe}
                    helperText={errors.weightRecipe || 'Digite apenas números (ex: 1.5, 250)'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScaleIcon />
                        </InputAdornment>
                      ),
                      inputProps: {
                        inputMode: 'decimal',
                        pattern: '[0-9]*[.,]?[0-9]*',
                      },
                    }}
                    placeholder="Ex: 1.5, 250, 0.5"
                    sx={{ flex: 2 }}
                  />

                  <FormControl sx={{ flex: 1 }} fullWidth error={!!errors.typeWeightRecipe}>
                    <InputLabel id="weight-type-label">Unidade (Opcional)</InputLabel>
                    <Select
                      labelId="weight-type-label"
                      name="typeWeightRecipe"
                      value={formData.typeWeightRecipe}
                      onChange={handleChange}
                      label="Unidade"
                      disabled={loadingUnitMeasures || loadingUserUnits}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            borderRadius: 8,
                          },
                          sx: {
                            '& .MuiMenu-list': {
                              paddingTop: 1,
                              paddingBottom: 1,
                              // Customização da scrollbar
                              '&::-webkit-scrollbar': {
                                width: '6px',
                              },
                              '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(0,0,0,.1)',
                                borderRadius: '3px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,.3)',
                                borderRadius: '3px',
                                '&:hover': {
                                  backgroundColor: 'rgba(0,0,0,.5)',
                                },
                              },
                            },
                            '& .MuiMenuItem-root': {
                              borderRadius: 1,
                              margin: '0 8px',
                              marginBottom: '2px',
                              transition: 'all 0.2s ease-in-out',
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                                transform: 'translateX(2px)',
                              },
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'primary.contrastText',
                                fontWeight: 600,
                                '&:hover': {
                                  backgroundColor: 'primary.dark',
                                },
                              },
                            },
                          },
                        },
                      }}
                    >
                      {loadingUnitMeasures || loadingUserUnits ? (
                        <MenuItem value="" disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Carregando unidades...
                        </MenuItem>
                      ) : (
                        [
                          /* Unidades padrão do sistema */
                          ...(unitMeasures.length > 0
                            ? [
                                <MenuItem key="system-header" disabled sx={{ opacity: 0.7 }}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    Unidades do Sistema
                                  </Typography>
                                </MenuItem>,
                                ...unitMeasures.map((unit) => (
                                  <MenuItem key={unit._id} value={unit._id}>
                                    {unit.name} ({unit.acronym})
                                  </MenuItem>
                                )),
                              ]
                            : []),

                          /* Unidades personalizadas do usuário */
                          ...(userUnitsAmountUse.length > 0
                            ? [
                                ...(unitMeasures.length > 0
                                  ? [
                                      <MenuItem key="custom-header" disabled sx={{ opacity: 0.7 }}>
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          Minhas Unidades Personalizadas
                                        </Typography>
                                      </MenuItem>,
                                    ]
                                  : []),
                                ...userUnitsAmountUse.map((unit) => (
                                  <MenuItem
                                    key={unit.id}
                                    value={`${unit.name} (${unit.quantity} ${unit.unitMeasure})`}
                                    sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      pr: 1,
                                    }}
                                  >
                                    <Box sx={{ flex: 1 }}>
                                      {unit.name} ({unit.quantity} {unit.unitMeasure})
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 0.5, ml: 1 }}>
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditUnit(unit);
                                        }}
                                        sx={{ p: 0.5 }}
                                      >
                                        <EditIcon fontSize="small" />
                                      </IconButton>
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteUnit(unit);
                                        }}
                                        sx={{ p: 0.5 }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </Box>
                                  </MenuItem>
                                )),
                              ]
                            : []),
                        ]
                      )}
                      {!loadingUnitMeasures &&
                        !loadingUserUnits &&
                        unitMeasures.length === 0 &&
                        userUnitsAmountUse.length === 0 && (
                          <MenuItem value="" disabled>
                            Nenhuma unidade disponível
                          </MenuItem>
                        )}
                    </Select>
                    {errors.typeWeightRecipe && (
                      <FormHelperText error>{errors.typeWeightRecipe}</FormHelperText>
                    )}
                  </FormControl>
                </Box>
              </Box>

              {formData.weightRecipe && formData.typeWeightRecipe && (
                <Box sx={{ mt: -2, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Peso total:{' '}
                    <strong>
                      {formData.weightRecipe}{' '}
                      {(() => {
                        // Primeiro, verifica se é uma unidade do sistema
                        const systemUnit = unitMeasures.find(
                          (u) => u._id === formData.typeWeightRecipe,
                        );
                        if (systemUnit) {
                          return systemUnit.name.toLowerCase();
                        }

                        // Se não encontrou, é uma unidade personalizada (o valor já contém a descrição completa)
                        return formData.typeWeightRecipe.toLowerCase();
                      })()}
                    </strong>
                  </Typography>
                </Box>
              )}

              <TextField
                label="Descrição (Opcional)"
                name="descripition"
                value={formData.descripition}
                onChange={handleChange}
                fullWidth
                variant="outlined"
                multiline
                rows={4}
                error={!!errors.descripition}
                helperText={errors.descripition}
                placeholder="Descreva os detalhes da receita (opcional)..."
              />

              {/* Seção de Ingredientes */}
              <Box sx={{ mt: 3 }}>
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
                  🥘 Ingredientes da Receita *{/* 🔍 DEBUG: Indicador do estado no modal */}
                  <Box
                    sx={{
                      ml: 2,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: recipeIngredients.length > 0 ? 'success.light' : 'warning.light',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                    }}
                  >
                    DEBUG: {recipeIngredients.length}
                  </Box>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Adicione os ingredientes que serão utilizados nesta receita para calcular custos
                  automaticamente
                </Typography>

                {/* Exibição do erro de ingredientes obrigatórios */}
                {errors.ingredients && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{
                      display: 'block',
                      mb: 2,
                      fontWeight: 500,
                      backgroundColor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(244, 67, 54, 0.1)'
                          : 'rgba(244, 67, 54, 0.05)',
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'error.main',
                    }}
                  >
                    ⚠️ {errors.ingredients}
                  </Typography>
                )}

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
                    recipeId="new-recipe"
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
                    <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 500 }}>
                      ✓ {recipeIngredients.length} ingrediente(s) adicionado(s)
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Custo total estimado: R${' '}
                      {recipeIngredients
                        .reduce((total, ingredient) => total + ingredient.totalCost, 0)
                        .toFixed(2)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Seção de Modo de Preparo */}
              <Box sx={{ mt: 3 }}>
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
                  👨‍🍳 Modo de Preparo (Opcional)
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
                    recipeId="new"
                    initialSteps={recipeSteps}
                    onStepsUpdate={handleStepsUpdate}
                  />
                </Box>

                {recipeSteps.length > 0 && (
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: 'info.light',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'info.main',
                    }}
                  >
                    <Typography variant="body2" color="background.default" sx={{ fontWeight: 500 }}>
                      ✓ {recipeSteps.length} passo(s) definido(s)
                    </Typography>
                    <Typography variant="caption" color="background.default">
                      Os passos ajudarão na preparação da receita
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Seção de Informações Nutricionais */}
              {recipeIngredients.length > 0 && (
                <Box sx={{ mt: 3 }}>
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
                    🍎 Informações Nutricionais
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Visualize o rótulo nutricional baseado nos ingredientes da receita
                  </Typography>

                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'divider',
                      borderRadius: 2,
                      p: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'background.paper',
                    }}
                  >
                    <NutritionalInfoSection
                      recipe={{
                        _id: 'new',
                        name: formData.name || 'Nova Receita',
                        category: formData.category || '',
                        image: formData.image || '',
                        yieldRecipe: formData.yieldRecipe || '1',
                        typeYield: formData.typeYield || '',
                        preparationTime: formData.preparationTime || '',
                        weightRecipe: formData.weightRecipe || '0',
                        typeWeightRecipe: formData.typeWeightRecipe || '',
                        descripition: formData.descripition || '',
                        ingredients: [],
                        modePreparation: recipeSteps,
                      }}
                      recipeIngredients={recipeIngredients}
                    />
                  </Box>
                </Box>
              )}

              {/* Seção de Informações Financeiras */}
              <EnhancedFinancialSection
                recipeIngredients={recipeIngredients}
                totalYield={parseInt(formData.yieldRecipe) || 1}
                onFinancialDataChange={(financialData) => {
                  // Atualizar dados financeiros no formData
                  setFormData((prev) => ({
                    ...prev,
                    priceSale: financialData.totalSalePrice || 0,
                    priceCost: financialData.ingredientsCost || 0,
                    priceProfit:
                      (financialData.totalSalePrice || 0) - (financialData.ingredientsCost || 0),
                    sellingPrice: financialData.totalSalePrice || prev.sellingPrice,
                    costPrice: financialData.ingredientsCost || prev.costPrice,
                  }));
                }}
              />

              {/* Upload de Imagem */}
              <Box>
                <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500, mb: 1 }}>
                  Imagem da Receita (Opcional)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  disabled={uploading}
                  startIcon={uploading ? <CircularProgress size={20} /> : null}
                  sx={{ py: 1.5, width: '100%' }}
                >
                  {uploading ? 'Enviando...' : 'Escolher Imagem'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                    Arquivo selecionado: {selectedFile.name}
                  </Typography>
                )}
                {formData.image && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, color: 'success.main', display: 'block' }}
                  >
                    ✓ Upload realizado com sucesso!
                  </Typography>
                )}
                {errors.image && (
                  <Typography
                    variant="caption"
                    sx={{ mt: 1, color: 'error.main', display: 'block' }}
                  >
                    {errors.image}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={onClose} color="inherit" disabled={submitting} size="large">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={uploading || submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            size="large"
          >
            {submitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modais de edição e exclusão de unidades */}
      <UnitAmountUseEditModal
        open={editUnitModalOpen}
        onClose={handleCloseUnitModals}
        unit={selectedUnitForEdit}
        onUnitUpdated={handleUnitUpdated}
      />

      <UnitAmountUseDeleteModal
        open={deleteUnitModalOpen}
        onClose={handleCloseUnitModals}
        unit={selectedUnitForEdit}
        onUnitDeleted={handleUnitDeleted}
      />
    </>
  );
};

export default RecipeModal;
