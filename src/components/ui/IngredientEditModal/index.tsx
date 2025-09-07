import React, { useState, useEffect } from 'react';
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
import ImageUploadComponent from '../ImageUploadImproved';
import { calculatePricePerPortion } from '../../../utils/unitConversion';

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
    correctionFactor: ingredient.correctionFactor || 1.0,
    price: ingredient.price || {
      price: 0,
      quantity: 0,
      unitMeasure: 'Quilogramas',
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);
  // Resetar formulário quando o modal fecha ou o ingrediente muda
  useEffect(() => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      image: ingredient.image,
      correctionFactor: ingredient.correctionFactor || 1.0,
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

  const handleImageChange = (imageUrl: string | null) => {
    setFormData((prev) => ({ ...prev, image: imageUrl || undefined }));

    // Limpar erro de imagem se houver
    if (errors.image && imageUrl) {
      setErrors((prev) => ({ ...prev, image: '' }));
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

          <TextField
            fullWidth
            label="Fator de Correção"
            name="correctionFactor"
            type="number"
            value={formData.correctionFactor || 1.0}
            onChange={handleChange}
            InputProps={{
              inputProps: { min: 0.1, max: 3.0, step: 0.01 },
            }}
            helperText="Fator para ajuste de perdas e desperdício (padrão: 1.0)"
          />

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
            {/* Campo calculado para mostrar preço por porção */}
            {formData.price?.price && formData.price?.quantity && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'secondary.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'secondary.200',
                }}
              >
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Preço por porção (100g):
                </Typography>
                <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 600 }}>
                  R${' '}
                  {calculatePricePerPortion(
                    parseFloat(formData.price.price.toString()),
                    parseFloat(formData.price.quantity.toString()),
                    formData.price.unitMeasure,
                  ).toFixed(2)}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Campo de upload de imagem */}
          <ImageUploadComponent
            value={formData.image || null}
            onChange={handleImageChange}
            disabled={ingredientLoading}
            label="Imagem do Ingrediente"
            error={errors.image}
            helperText="Faça upload de uma imagem para identificar o ingrediente (opcional)"
            type="ingredients"
            placeholder="Clique para selecionar uma imagem do ingrediente"
            ingredientName={formData.name?.trim() || ingredient.name || 'Ingrediente'}
          />
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
