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
  Stack,
  Box,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateIngredientRequest } from '../../../store/slices/ingredientsSlice';
import { RootState } from '../../../store';
import { CreateIngredientParams, Ingredient } from '../../../types/ingredients';
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
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories,
  );
  const { loading: ingredientLoading } = useSelector((state: RootState) => state.ingredients);
  const [formData, setFormData] = useState<Partial<CreateIngredientParams>>({
    name: ingredient.name,
    category: ingredient.category,
    image: ingredient.image,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset form when modal closes or ingredient changes
  useEffect(() => {
    setFormData({
      name: ingredient.name,
      category: ingredient.category,
      image: ingredient.image,
    });
    setErrors({});
  }, [open, ingredient]);

  // Reset form when modal closes or ingredient changes
  useEffect(() => {
    if (open) {
      setFormData({
        name: ingredient.name,
        category: ingredient.category,
        image: ingredient.image,
      });
      setErrors({});
    }
  }, [open, ingredient]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        process.env.REACT_APP_TOKEN_KEY || '@sheila-garcia-pro-token',
      );

      const response = await fetch('https://sgpro-api.squareweb.app/v1/update/image', {
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
          : t('ingredients.form.uploadError');
        setErrors((prev) => ({ ...prev, image: errorMessage }));
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setErrors((prev) => ({ ...prev, image: t('ingredients.form.uploadError') }));
    } finally {
      setUploading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    if (formData.name !== undefined && !formData.name.trim()) {
      newErrors.name = t('ingredients.form.required');
      isValid = false;
    }

    if (formData.category !== undefined && !formData.category) {
      newErrors.category = t('ingredients.form.required');
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validate()) {
      setIsSubmitted(true);
      const changedFields = Object.entries(formData).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== ingredient[key as keyof Ingredient]) {
          (acc as any)[key] = value; // Adicione o casting para any
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
      } else {
        onClose();
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
            placeholder={t('ingredients.form.namePlaceholder')}
          />

          <FormControl fullWidth error={!!errors.category}>
            <InputLabel>{t('ingredients.form.category')}</InputLabel>
            <Select
              value={formData.category}
              onChange={handleCategoryChange}
              label={t('ingredients.form.category')}
            >
              {categories.map((category) => (
                <MenuItem key={category.name} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {errors.category && (
              <Typography variant="caption" color="error">
                {errors.category}
              </Typography>
            )}
          </FormControl>

          <Box>
            <input
              accept="image/*"
              type="file"
              id="ingredient-image"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            <label htmlFor="ingredient-image">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                disabled={uploading}
                sx={{ mb: 1 }}
              >
                {uploading ? 'Fazendo upload...' : 'Escolher imagem'}
              </Button>
            </label>
            {formData.image && (
              <Box
                sx={{
                  width: '100%',
                  height: 100,
                  borderRadius: 1,
                  overflow: 'hidden',
                  mt: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.04)', // Fundo neutro para melhor visualização
                }}
              >
                <img
                  src={formData.image}
                  alt="Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </Box>
            )}
            {errors.image && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                {errors.image}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={ingredientLoading || uploading}>
          {t('ingredients.actions.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={ingredientLoading || uploading}
          startIcon={ingredientLoading ? <CircularProgress size={20} /> : undefined}
        >
          {t('ingredients.actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientEditModal;
