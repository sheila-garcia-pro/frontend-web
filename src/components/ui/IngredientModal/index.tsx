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
  InputAdornment,
} from '@mui/material';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import { UnitMeasure } from '../../../types/unitMeasure';
import { useDispatch, useSelector } from 'react-redux';
import { createIngredientRequest } from '../../../store/slices/ingredientsSlice';
import { fetchCategoriesRequest } from '../../../store/slices/categoriesSlice';
import { RootState } from '../../../store';
import { CreateIngredientParams } from '../../../types/ingredients';

interface IngredientModalProps {
  open: boolean;
  onClose: () => void;
}

const IngredientModal: React.FC<IngredientModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories,
  );
  const { loading: ingredientLoading } = useSelector((state: RootState) => state.ingredients);
  const [formData, setFormData] = useState<CreateIngredientParams>({
    name: '',
    category: '',
    image: '',
    price: {
      price: '',
      quantity: '',
      unitMeasure: 'Quilograma',
    },
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);

  const loadUnitMeasures = useCallback(async () => {
    try {
      setLoadingUnitMeasures(true);
      const data = await getUnitMeasures();
      setUnitMeasures(data);
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
    } finally {
      setLoadingUnitMeasures(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadUnitMeasures();
    }
  }, [open, loadUnitMeasures]);

  useEffect(() => {
    if (isSubmitted && !ingredientLoading) {
      setFormData({
        name: '',
        category: '',
        image: '',
        price: {
          price: '',
          quantity: '',
          unitMeasure: 'Quilograma',
        },
      });
      setSelectedFile(null);
      setIsSubmitted(false);
      onClose();
    }
  }, [ingredientLoading, isSubmitted, onClose]);

  useEffect(() => {
    if (open) {
      dispatch(
        fetchCategoriesRequest({
          page: 1,
          itemPerPage: 100,
          search: '',
        }),
      );
    }
  }, [open, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent,
  ) => {
    const { name, value } = e.target;
    if (name) {
      if (name.startsWith('price.')) {
        const priceField = name.split('.')[1];
        setFormData((prev) => ({
          ...prev,
          price: {
            ...(prev.price || { price: '', quantity: '', unitMeasure: 'Quilograma' }),
            [priceField]: value,
          },
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }

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

    if (!formData.image) {
      newErrors.image = 'A imagem é obrigatória';
    }

    if (formData.price) {
      const price = parseFloat(formData.price.price as string);
      const quantity = parseFloat(formData.price.quantity as string);

      if (isNaN(price) || price < 0) {
        newErrors['price.price'] = 'O preço deve ser um número positivo';
      }

      if (isNaN(quantity) || quantity <= 0) {
        newErrors['price.quantity'] = 'A quantidade deve ser maior que zero';
      }

      if (!formData.price.unitMeasure) {
        newErrors['price.unitMeasure'] = 'A unidade de medida é obrigatória';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (validate()) {
      if (formData.price) {
        const price = parseFloat(formData.price.price as string);
        const quantity = parseFloat(formData.price.quantity as string);

        const submissionData = {
          ...formData,
          price: {
            ...formData.price,
            price: price,
            quantity: quantity,
          },
        };
        setIsSubmitted(true);
        dispatch(createIngredientRequest(submissionData));
      } else {
        setIsSubmitted(true);
        dispatch(createIngredientRequest(formData));
      }
    }
  };

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
      {' '}
      <DialogTitle>
        <Typography variant="h4" component="div" sx={{ fontWeight: 500 }}>
          Cadastro de Ingrediente
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <Stack spacing={2}>
            <TextField
              label="Nome do Ingrediente"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name}
              autoFocus
              disabled={ingredientLoading}
            />
            <FormControl fullWidth required error={!!errors.category}>
              <InputLabel id="category-label">Categoria</InputLabel>
              <Select
                labelId="category-label"
                name="category"
                value={formData.category}
                onChange={handleChange}
                label="Categoria"
                disabled={categoriesLoading || ingredientLoading}
              >
                {categoriesLoading ? (
                  <MenuItem value="">
                    <CircularProgress size={20} />
                  </MenuItem>
                ) : categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <MenuItem key={category._id} value={category.name}>
                      {category.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">Nenhuma categoria disponível</MenuItem>
                )}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                  {errors.category}
                </Typography>
              )}
            </FormControl>{' '}
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              Preço de Compra
            </Typography>
            <TextField
              fullWidth
              label="Preço"
              name="price.price"
              type="number"
              value={formData.price?.price || ''}
              onChange={handleChange}
              error={!!errors['price.price']}
              helperText={errors['price.price']}
              InputProps={{
                inputProps: { min: 0, step: 0.01 },
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label="Quantidade"
                name="price.quantity"
                type="number"
                value={formData.price?.quantity || ''}
                onChange={handleChange}
                error={!!errors['price.quantity']}
                helperText={errors['price.quantity']}
                InputProps={{
                  inputProps: { min: 0, step: 0.01 },
                }}
              />

              <FormControl fullWidth error={!!errors['price.unitMeasure']}>
                <InputLabel>Medida</InputLabel>
                <Select
                  label="Medida"
                  name="price.unitMeasure"
                  value={formData.price?.unitMeasure || ''}
                  onChange={handleChange}
                  disabled={loadingUnitMeasures}
                >
                  {loadingUnitMeasures ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : unitMeasures.length > 0 ? (
                    unitMeasures.map((unit) => (
                      <MenuItem key={unit._id} value={unit.name}>
                        {unit.name} ({unit.acronym})
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value="">Nenhuma unidade disponível</MenuItem>
                  )}
                </Select>
                {errors['price.unitMeasure'] && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors['price.unitMeasure']}
                  </Typography>
                )}
              </FormControl>
            </Box>
            <FormControl fullWidth error={!!errors.image}>
              <Button
                variant="outlined"
                component="label"
                disabled={uploading || ingredientLoading}
                startIcon={uploading ? <CircularProgress size={20} /> : null}
              >
                {uploading ? 'Enviando...' : 'Escolher Imagem'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading || ingredientLoading}
                />
              </Button>
              {selectedFile && (
                <Typography variant="caption" sx={{ mt: 1 }}>
                  Arquivo selecionado: {selectedFile.name}
                </Typography>
              )}
              {formData.image && (
                <Typography variant="caption" sx={{ mt: 1, color: 'success.main' }}>
                  Upload realizado com sucesso!
                </Typography>
              )}
              {errors.image && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.image}
                </Typography>
              )}
            </FormControl>
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={ingredientLoading || uploading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={ingredientLoading || uploading}
          startIcon={ingredientLoading ? <CircularProgress size={20} /> : null}
        >
          {ingredientLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientModal;
