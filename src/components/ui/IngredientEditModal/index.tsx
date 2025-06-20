import React, { useState, useEffect, useRef } from 'react';
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
  Box,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateIngredientRequest,
  updatePriceMeasureRequest,
  fetchIngredientsRequest,
} from '../../../store/slices/ingredientsSlice';
import { RootState } from '../../../store';
import { CreateIngredientParams, Ingredient } from '../../../types/ingredients';
import { UnitMeasure } from '../../../types/unitMeasure';
import { getUnitMeasures } from '../../../services/api/unitMeasure';

import { useTranslation } from 'react-i18next';

interface IngredientEditModalProps {
  open: boolean;
  onClose: () => void;
  ingredient: Ingredient;
  onEditSuccess?: () => void;
}

const IngredientEditModal: React.FC<IngredientEditModalProps> = ({
  open,
  onClose,
  ingredient,
  onEditSuccess,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items: categories } = useSelector((state: RootState) => state.categories);
  const { loading: ingredientLoading } = useSelector((state: RootState) => state.ingredients);
  const [formData, setFormData] = useState<Partial<CreateIngredientParams>>({
    name: ingredient.name,
    category: ingredient.category,
    image: ingredient.image,
    price: ingredient.price || {
      price: 0,
      quantity: 0,
      unitMeasure: 'Quilogramas',
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // Resetar formulário quando o modal fecha ou o ingrediente muda
  useEffect(() => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      image: ingredient.image,
      price: ingredient.price || {
        price: 0,
        quantity: 0,
        unitMeasure: 'Quilogramas',
      },
    });
    setErrors({});
  }, [open, ingredient]);

  // Buscar unidades de medida quando o modal abrir
  useEffect(() => {
    const fetchUnitMeasures = async () => {
      if (!open) return;

      setLoadingUnitMeasures(true);
      try {
        const units = await getUnitMeasures();
        setUnitMeasures(units);
      } catch (error) {
        console.error('Erro ao buscar unidades de medida:', error);
      } finally {
        setLoadingUnitMeasures(false);
      }
    };

    fetchUnitMeasures();
  }, [open]);

  useEffect(() => {
    if (isSubmitted && !ingredientLoading) {
      if (onEditSuccess) {
        onEditSuccess();
      }
      onClose();
      setIsSubmitted(false);
    }
  }, [isSubmitted, ingredientLoading, onClose, onEditSuccess]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name.startsWith('price.')) {
      const priceField = name.split('.')[1];
      setFormData((prev) => {
        const currentPrice = prev.price || { price: 0, quantity: 0, unitMeasure: 'Quilogramas' };
        return {
          ...prev,
          price: {
            ...currentPrice,
            [priceField]: priceField === 'unitMeasure' ? value : parseFloat(value) || 0,
          },
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setFormData((prev) => ({ ...prev, category: event.target.value }));
    setErrors((prev) => ({ ...prev, category: '' }));
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'ingredients');

      const token = localStorage.getItem(
        import.meta.env.VITE_TOKEN_KEY || '@sheila-garcia-pro-token',
      );

      const response = await fetch('https://sgpro-api.squareweb.app/v1/upload/image', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
        setErrors((prev) => ({ ...prev, image: '' }));
      } else {
        const errorMessage = data.message
          ? Array.isArray(data.message)
            ? data.message[0]
            : data.message
          : 'Erro ao fazer upload da imagem';
        setErrors((prev) => ({ ...prev, image: errorMessage }));
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setErrors((prev) => ({ ...prev, image: 'Erro ao fazer upload da imagem' }));
    } finally {
      setUploading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (formData.name !== undefined && !formData.name.trim()) {
      newErrors.name = t('ingredients.validation.nameRequired');
      isValid = false;
    }

    if (formData.category !== undefined && !formData.category) {
      newErrors.category = t('ingredients.validation.categoryRequired');
      isValid = false;
    }

    if (formData.price) {
      if (Number(formData.price.price) < 0) {
        newErrors['price.price'] = t('ingredients.validation.priceNotNegative');
        isValid = false;
      }
      if (Number(formData.price.quantity) < 0) {
        newErrors['price.quantity'] = t('ingredients.validation.quantityNotNegative');
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };
  const handleSubmit = async () => {
    if (validate()) {
      setIsSubmitted(true);

      try {
        const changedFields = Object.entries(formData).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            if (key === 'price') {
              if (!ingredient.price || JSON.stringify(value) !== JSON.stringify(ingredient.price)) {
                // Se o preço foi alterado, usa o endpoint específico de preço
                dispatch(
                  updatePriceMeasureRequest({
                    id: ingredient._id,
                    params: value as { price: number; quantity: number; unitMeasure: string },
                  }),
                );
              }
            } else if (value !== ingredient[key as keyof Ingredient]) {
              (acc as Record<string, unknown>)[key] = value;
            }
          }
          return acc;
        }, {} as Partial<CreateIngredientParams>);

        if (Object.keys(changedFields).length > 0) {
          dispatch(
            updateIngredientRequest({
              id: ingredient._id,
              params: changedFields,
            }),
          );
        }

        // Aguarda o patch ser concluído
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Atualiza a lista após 3 segundos
        dispatch(
          fetchIngredientsRequest({
            page: 1,
            itemPerPage: 1000,
          }),
        );

        // Fecha o modal apenas após garantir que tudo foi concluído
        if (onEditSuccess) {
          onEditSuccess();
        }
        onClose();
        setIsSubmitted(false);
      } catch (error) {
        console.error('Erro ao atualizar ingrediente:', error);
        setIsSubmitted(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('ingredients.actions.edit')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label={t('ingredients.form.name')}
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
            required
          />

          <FormControl fullWidth required error={!!errors.category}>
            <InputLabel id="category-label">{t('ingredients.form.category')}</InputLabel>
            <Select
              labelId="category-label"
              label={t('ingredients.form.category')}
              name="category"
              value={formData.category}
              onChange={handleCategoryChange}
              disabled={categories.length === 0}
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.paper',
            }}
          >
            {' '}
            <Typography variant="subtitle1" gutterBottom>
              {t('ingredients.form.priceInfo')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label={t('ingredients.form.price')}
                name="price.price"
                type="number"
                value={formData.price?.price || 0}
                onChange={handleChange}
                error={!!errors['price.price']}
                helperText={errors['price.price']}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />
              <TextField
                fullWidth
                label={t('ingredients.form.quantity')}
                name="price.quantity"
                type="number"
                value={formData.price?.quantity || 0}
                onChange={handleChange}
                error={!!errors['price.quantity']}
                helperText={errors['price.quantity']}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />{' '}
              <TextField
                fullWidth
                label={t('ingredients.form.unitMeasure')}
                name="price.unitMeasure"
                value={formData.price?.unitMeasure || ''}
                onChange={handleChange}
                error={!!errors['price.unitMeasure']}
                helperText={errors['price.unitMeasure']}
                select
                disabled={loadingUnitMeasures}
              >
                {loadingUnitMeasures ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} />
                    Carregando...
                  </MenuItem>
                ) : (
                  unitMeasures.map((unit) => (
                    <MenuItem key={unit._id} value={unit.name}>
                      {unit.name} ({unit.acronym})
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Box>
          </Box>

          {/* Campo de upload de imagem */}
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            ref={fileInputRef}
          />
          <Box
            sx={{
              width: '100%',
              height: 150,
              border: '2px dashed',
              borderColor: errors.image ? 'error.main' : 'divider',
              borderRadius: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              '&:hover': {
                borderColor: 'primary.main',
                backgroundColor: 'primary.lighter',
              },
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? (
              <CircularProgress size={24} />
            ) : formData.image ? (
              <Box
                component="img"
                src={formData.image}
                alt="Preview"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Typography color="textSecondary">{t('ingredients.form.clickToUpload')}</Typography>
            )}
          </Box>
          {errors.image && (
            <Typography color="error" variant="caption">
              {errors.image}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          {t('common.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={ingredientLoading}>
          {t('common.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientEditModal;
