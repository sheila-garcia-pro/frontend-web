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
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preparationTimeValue, setPreparationTimeValue] = useState<Dayjs | null>(null);

  const [userCategories, setUserCategories] = useState<RecipeCategory[]>([]);
  const [yields, setYields] = useState<YieldItem[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);

  const [loadingUserCategories, setLoadingUserCategories] = useState(false);
  const [loadingYields, setLoadingYields] = useState(false);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);

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

    if (!formData.sku.trim()) {
      newErrors.sku = 'O SKU é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'A categoria é obrigatória';
    }

    if (!formData.image) {
      newErrors.image = 'A imagem é obrigatória';
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

    if (!formData.descripition.trim()) {
      newErrors.descripition = 'A descrição é obrigatória';
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

  const isLoadingCategories = loadingUserCategories;

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

            <TextField
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              error={!!errors.sku}
              helperText={errors.sku}
            />

            <FormControl fullWidth required error={!!errors.category}>
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                label="Categoria"
                disabled={isLoadingCategories}
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
                sx={{ flex: 1 }}
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
              label="Descrição"
              name="descripition"
              value={formData.descripition}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              multiline
              rows={4}
              error={!!errors.descripition}
              helperText={errors.descripition}
              placeholder="Descreva os detalhes da receita..."
            />

            <FormControl fullWidth error={!!errors.image}>
              <Button
                variant="outlined"
                component="label"
                disabled={uploading}
                startIcon={uploading ? <CircularProgress size={20} /> : null}
                sx={{ py: 1.5 }}
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
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Arquivo selecionado: {selectedFile.name}
                </Typography>
              )}
              {formData.image && (
                <Typography variant="caption" sx={{ mt: 1, color: 'success.main' }}>
                  ✓ Upload realizado com sucesso!
                </Typography>
              )}
              {errors.image && <FormHelperText error>{errors.image}</FormHelperText>}
            </FormControl>
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
