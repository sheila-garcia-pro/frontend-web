import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Schedule as ScheduleIcon, Scale as ScaleIcon } from '@mui/icons-material';
import { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { useDispatch } from 'react-redux';
import { CreateRecipeParams } from '../../../types/recipes';
import { addNotification } from '../../../store/slices/uiSlice';
import { createRecipe } from '../../../services/api/recipes';
import { getUserRecipeCategories, RecipeCategory } from '../../../services/api/recipeCategories';
import { getYieldsRecipes } from '../../../services/api/yields';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import { UnitMeasure } from '../../../types/unitMeasure';
import { RecipeIngredient } from '../../../types/recipeIngredients';
import RecipeIngredientsCard from '../RecipeIngredientsCard';
import QuickCategoryAdd from '../QuickCategoryAdd';
import api from '../../../services/api';

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
    sku: '',
    category: '',
    image: '',
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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preparationTimeValue, setPreparationTimeValue] = useState<Dayjs | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

  const [userCategories, setUserCategories] = useState<RecipeCategory[]>([]);
  const [yields, setYields] = useState<YieldItem[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);

  const [loadingUserCategories, setLoadingUserCategories] = useState(false);
  const [loadingYields, setLoadingYields] = useState(false);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);
  const [updatingCategories, setUpdatingCategories] = useState(false);

  const loadUserCategories = useCallback(async () => {
    try {
      setLoadingUserCategories(true);
      const categories = await getUserRecipeCategories();
      setUserCategories(categories);
    } catch (error) {
      console.error('Erro ao carregar categorias do usuário:', error);
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
      console.error('Erro ao carregar rendimentos:', error);
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
      console.error('Erro ao carregar unidades de medida:', error);
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

  useEffect(() => {
    if (open) {
      loadUserCategories();
      loadYields();
      loadUnitMeasures();
    }
  }, [open, loadUserCategories, loadYields, loadUnitMeasures]);

  useEffect(() => {
    if (!open) {
      setFormData({
        name: '',
        sku: '',
        category: '',
        image: '',
        yieldRecipe: '',
        typeYield: '',
        preparationTime: '',
        weightRecipe: '',
        typeWeightRecipe: '',
        descripition: '',
      });
      setErrors({});
      setSelectedFile(null);
      setSubmitting(false);
      setPreparationTimeValue(null);
      setRecipeIngredients([]);
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

  const handleIngredientsUpdate = (ingredients: RecipeIngredient[]) => {
    setRecipeIngredients(ingredients);
  };

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
      console.error('Erro ao recarregar categorias:', error);
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
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('type', 'recipes');

        const response = await api.post('/v1/upload/image', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.data?.url) {
          setFormData((prev) => ({ ...prev, image: response.data.url }));
          setErrors((prev) => ({ ...prev, image: '' }));
          dispatch(
            addNotification({
              message: 'Imagem enviada com sucesso!',
              type: 'success',
              duration: 3000,
            }),
          );
        } else {
          const errorMessage = response.data?.message || 'Erro ao fazer upload da imagem';
          setErrors((prev) => ({ ...prev, image: errorMessage }));
        }
      } catch (error: unknown) {
        console.error('Erro no upload:', error);
        const errorMessage =
          error instanceof Error && 'response' in error && error.response
            ? (error.response as { data?: { message?: string } })?.data?.message ||
              'Erro ao fazer upload da imagem'
            : 'Erro ao fazer upload da imagem';
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

    if (!formData.weightRecipe) {
      newErrors.weightRecipe = 'O peso da receita é obrigatório';
    }

    if (!formData.typeWeightRecipe) {
      newErrors.typeWeightRecipe = 'O tipo de peso é obrigatório';
    }

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

      // Find the weight unit from the selected unit ID
      const selectedWeightUnit = unitMeasures.find(
        (unit) => unit._id === formData.typeWeightRecipe,
      );
      const weightUnitName = selectedWeightUnit
        ? selectedWeightUnit.name
        : formData.typeWeightRecipe;

      // Create the submission data with proper format
      const submissionData = {
        ...formData,
        category: categoryName,
        yieldRecipe: formData.yieldRecipe, // This is now a free text field
        typeYield: formData.typeYield, // This is now the name directly
        typeWeightRecipe: weightUnitName,
        ingredients: recipeIngredients.map((ri) => ({
          idIngredient: ri.ingredient._id,
          quantityIngredientRecipe: ri.quantity.toString(),
          unitAmountUseIngredient: ri.unitMeasure,
          priceQuantityIngredient: ri.ingredient.price?.price || 0,
          unitMeasure: ri.ingredient.price?.unitMeasure || ri.unitMeasure,
        })),
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
      console.error('Erro ao criar receita:', error);
      const errorMessage =
        error instanceof Error && 'response' in error && error.response
          ? (error.response as { data?: { message?: string } })?.data?.message ||
            'Erro ao criar receita'
          : 'Erro ao criar receita';
      dispatch(
        addNotification({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isLoadingCategories = loadingUserCategories || updatingCategories;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>Nova Receita</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <Stack spacing={3}>
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

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Peso da Receita"
                name="weightRecipe"
                value={formData.weightRecipe}
                onChange={handleWeightChange}
                fullWidth
                required
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

              <FormControl fullWidth required error={!!errors.typeWeightRecipe} sx={{ flex: 1 }}>
                <InputLabel id="weight-type-label">Unidade</InputLabel>
                <Select
                  labelId="weight-type-label"
                  name="typeWeightRecipe"
                  value={formData.typeWeightRecipe}
                  onChange={handleChange}
                  label="Unidade"
                  disabled={loadingUnitMeasures}
                >
                  {loadingUnitMeasures ? (
                    <MenuItem value="" disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Carregando unidades...
                    </MenuItem>
                  ) : (
                    unitMeasures.map((unit) => (
                      <MenuItem key={unit._id} value={unit._id}>
                        {unit.name} ({unit.acronym})
                      </MenuItem>
                    ))
                  )}
                  {!loadingUnitMeasures && unitMeasures.length === 0 && (
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

            {formData.weightRecipe && formData.typeWeightRecipe && (
              <Box sx={{ mt: -2, mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Peso total:{' '}
                  <strong>
                    {formData.weightRecipe}{' '}
                    {unitMeasures
                      .find((u) => u._id === formData.typeWeightRecipe)
                      ?.name.toLowerCase()}
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
                🥘 Ingredientes da Receita (Opcional)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Adicione os ingredientes que serão utilizados nesta receita para calcular custos
                automaticamente
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
                  <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                    ✓ {recipeIngredients.length} ingrediente(s) adicionado(s)
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

            {/* Seção de Informações Financeiras */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                💰 Informações Financeiras (Opcional)
              </Typography>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Preço de Venda"
                  name="sellingPrice"
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
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="Ex: 25,00"
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
                  label="Preço de Custo"
                  name="costPrice"
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
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  placeholder="Ex: 15,00"
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
                  label="Lucro"
                  name="profit"
                  value={formData.profit !== undefined ? formData.profit.toFixed(2) : ''}
                  type="number"
                  fullWidth
                  variant="outlined"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                    readOnly: true,
                  }}
                  placeholder="Calculado automaticamente"
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
                    💰 Sugestão: Baseado nos ingredientes adicionados, o custo estimado é R${' '}
                    {recipeIngredients
                      .reduce((total, ingredient) => total + ingredient.totalCost, 0)
                      .toFixed(2)}
                  </Typography>
                </Box>
              )}
            </Box>

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
                <Typography variant="caption" sx={{ mt: 1, color: 'error.main', display: 'block' }}>
                  {errors.image}
                </Typography>
              )}
            </Box>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={submitting}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={uploading || submitting}
          startIcon={submitting ? <CircularProgress size={20} /> : null}
        >
          {submitting ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeModal;
