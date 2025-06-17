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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useTranslation } from 'react-i18next';
import { CreateRecipeParams } from '../../../types/recipes';
import { addNotification } from '../../../store/slices/uiSlice';
import { createRecipe } from '../../../services/api/recipes';
import api from '../../../services/api';

interface RecipeModalProps {
  open: boolean;
  onClose: () => void;
  onRecipeCreated?: () => void;
}

interface Category {
  _id: string;
  name: string;
}

interface Yield {
  _id: string;
  name: string;
  description?: string;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ open, onClose, onRecipeCreated }) => {
  const { t } = useTranslation();
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

  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [yields, setYields] = useState<Yield[]>([]);

  const [loadingUserCategories, setLoadingUserCategories] = useState(false);
  const [loadingYields, setLoadingYields] = useState(false);

  const loadUserCategories = useCallback(async () => {
    try {
      setLoadingUserCategories(true);
      const response = await api.get<Category[]>('/v1/users/me/category-recipe');
      setUserCategories(response.data || []);
      console.log('Categorias do usuário carregadas:', response.data);
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
      const response = await api.get<Yield[]>('/v1/yields-recipes');
      setYields(response.data || []);
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

  useEffect(() => {
    if (open) {
      loadUserCategories();
      loadYields();
    }
  }, [open, loadUserCategories, loadYields]);

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
    }
  }, [open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>,
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) {
        setErrors((prev) => ({ ...prev, [name]: '' }));
      }
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
      } catch (error: any) {
        console.error('Erro no upload:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao fazer upload da imagem';
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

  console.log(userCategories, 'userCategories');
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
      await createRecipe(formData);

      dispatch(
        addNotification({
          message: 'Receita criada com sucesso!',
          type: 'success',
          duration: 4000,
        }),
      );

      onRecipeCreated?.();
      onClose();
    } catch (error: any) {
      console.error('Erro ao criar receita:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar receita';
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
                onChange={handleChange}
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
                    <MenuItem key={category._id} value={category._id}>
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

            <FormControl fullWidth required error={!!errors.yieldRecipe}>
              <InputLabel id="yield-label">Rendimento</InputLabel>
              <Select
                labelId="yield-label"
                name="yieldRecipe"
                value={formData.yieldRecipe}
                onChange={handleChange}
                label="Rendimento"
                disabled={loadingYields}
              >
                {loadingYields ? (
                  <MenuItem value="" disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Carregando rendimentos...
                  </MenuItem>
                ) : (
                  yields.map((yieldItem) => (
                    <MenuItem key={yieldItem._id} value={yieldItem._id}>
                      <Box>
                        <Typography variant="body2">{yieldItem.name}</Typography>
                        {yieldItem.description && (
                          <Typography variant="caption" color="text.secondary">
                            {yieldItem.description}
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))
                )}
                {!loadingYields && yields.length === 0 && (
                  <MenuItem value="" disabled>
                    Nenhum rendimento disponível
                  </MenuItem>
                )}
              </Select>
              {errors.yieldRecipe && <FormHelperText error>{errors.yieldRecipe}</FormHelperText>}
            </FormControl>

            <TextField
              label="Tipo de Rendimento"
              name="typeYield"
              value={formData.typeYield}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              error={!!errors.typeYield}
              helperText={errors.typeYield}
              placeholder="Ex: porções, pessoas, unidades"
            />

            <TextField
              label="Tempo de Preparação"
              name="preparationTime"
              value={formData.preparationTime}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              error={!!errors.preparationTime}
              helperText={errors.preparationTime}
              placeholder="Ex: 30 minutos, 1 hora"
            />

            <TextField
              label="Peso da Receita"
              name="weightRecipe"
              type="number"
              value={formData.weightRecipe}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              error={!!errors.weightRecipe}
              helperText={errors.weightRecipe}
              InputProps={{
                inputProps: { min: 0, step: 0.01 },
              }}
            />

            <TextField
              label="Tipo de Peso"
              name="typeWeightRecipe"
              value={formData.typeWeightRecipe}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              error={!!errors.typeWeightRecipe}
              helperText={errors.typeWeightRecipe}
              placeholder="Ex: kg, g, litros, ml"
            />

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
