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
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import { UnitMeasure } from '../../../types/unitMeasure';
import { useDispatch, useSelector } from 'react-redux';
import { createIngredientRequest } from '../../../store/slices/ingredientsSlice';
import { fetchCategoriesRequest } from '../../../store/slices/categoriesSlice';
import { RootState } from '../../../store';
import { CreateIngredientParams } from '../../../types/ingredients';
import { useTranslation } from 'react-i18next';
import { useDevice } from '../../../hooks/useDevice';
import ImageUploadComponent from '../ImageUploadImproved';
import { calculatePricePerPortion } from '../../../utils/unitConversion';

interface IngredientModalProps {
  open: boolean;
  onClose: () => void;
}

const IngredientModal: React.FC<IngredientModalProps> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // Hook de responsividade
  const { isMobile, isTablet, isDesktop } = useDevice();
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories,
  );
  const { loading: ingredientLoading } = useSelector((state: RootState) => state.ingredients);

  // Estados locais
  const [formData, setFormData] = useState<CreateIngredientParams>({
    name: '',
    category: '',
    image: '',
    correctionFactor: 1.0,
    price: {
      price: '',
      quantity: '',
      unitMeasure: 'Quilogramas', // Corrigido para bater com as opções disponíveis
    },
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Novo estado para controlar o loading de 3 segundos
  const [processingMessage, setProcessingMessage] = useState(''); // Mensagem durante o processamento
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);

  const loadUnitMeasures = useCallback(async () => {
    try {
      setLoadingUnitMeasures(true);
      const data = await getUnitMeasures();
      setUnitMeasures(data);
    } catch (error) {
      // Erro ao carregar unidades de medida
    } finally {
      setLoadingUnitMeasures(false);
    }
  }, []);
  useEffect(() => {
    if (open) {
      loadUnitMeasures();
    }
  }, [open, loadUnitMeasures]);

  // Reset form when modal is opened or closed
  useEffect(() => {
    if (!open) {
      // Reset form when modal is closed
      setFormData({
        name: '',
        category: '',
        image: '',
        correctionFactor: 1.0,
        price: {
          price: '',
          quantity: '',
          unitMeasure: 'Quilogramas',
        },
      });
      setErrors({});
      setIsSubmitted(false);
    }
  }, [open]);

  useEffect(() => {
    if (isSubmitted && !ingredientLoading && !isProcessing) {
      setFormData({
        name: '',
        category: '',
        image: '',
        correctionFactor: 1.0,
        price: {
          price: '',
          quantity: '',
          unitMeasure: 'Quilogramas',
        },
      });
      setIsSubmitted(false);
      setErrors({});
      onClose();
    }
  }, [ingredientLoading, isSubmitted, onClose, isProcessing]);

  // Efeito para controlar o estado de processamento após criar ingrediente
  useEffect(() => {
    if (isSubmitted && ingredientLoading) {
      setIsProcessing(true);
      setProcessingMessage('Salvando ingrediente...');
    }

    // Quando terminar de carregar (sucesso ou erro)
    if (isSubmitted && !ingredientLoading && isProcessing) {
      // Fecha imediatamente pois o delay de 3s já é aplicado na saga
      setIsProcessing(false);
      setProcessingMessage('');
    }
  }, [ingredientLoading, isSubmitted, isProcessing]);

  useEffect(() => {
    if (open) {
      dispatch(
        fetchCategoriesRequest({
          page: 1,
          itemPerPage: 100,
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
            price: prev.price?.price || '',
            quantity: prev.price?.quantity || '',
            unitMeasure: prev.price?.unitMeasure || 'Quilogramas',
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

  const handleImageChange = (imageUrl: string | null) => {
    setFormData((prev) => ({ ...prev, image: imageUrl || '' }));

    // Limpar erro de imagem se houver
    if (errors.image && imageUrl) {
      setErrors((prev) => ({ ...prev, image: '' }));
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

    // Imagem não é mais obrigatória
    // if (!formData.image) {
    //   newErrors.image = 'A imagem é obrigatória';
    // }

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
      maxWidth={isMobile ? false : 'sm'}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        elevation: isMobile ? 0 : 5,
        sx: {
          borderRadius: isMobile ? 0 : 2,
          width: isMobile ? '100vw' : isTablet ? '90vw' : undefined,
          height: isMobile ? '100vh' : isTablet ? '90vh' : undefined,
          maxHeight: isMobile ? '100vh' : isTablet ? '90vh' : undefined,
          margin: isMobile ? 0 : 'auto',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isMobile ? '1px solid' : 'none',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant={isMobile ? 'h6' : 'h5'}
          component="h2"
          sx={{
            fontWeight: 600,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
          }}
        >
          {t('ingredients.newIngredient')}
        </Typography>
        {isMobile && (
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent
        dividers={!isMobile}
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1, sm: 2 },
          overflow: 'auto',
          maxHeight: isMobile ? 'calc(100vh - 140px)' : isTablet ? 'calc(90vh - 140px)' : undefined,
          // Scroll personalizado
          '&::-webkit-scrollbar': {
            width: isMobile ? '4px' : '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          },
        }}
      >
        {/* Overlay de processamento */}
        {isProcessing && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              borderRadius: 2,
            }}
          >
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>
              Processando criação...
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Salvando ingrediente e atualizando lista (3 segundos)
            </Typography>
          </Box>
        )}

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
            </FormControl>

            <TextField
              label="Fator de Correção"
              name="correctionFactor"
              type="number"
              value={formData.correctionFactor || 1.0}
              onChange={handleChange}
              fullWidth
              InputProps={{
                inputProps: { min: 0.1, max: 3.0, step: 0.01 },
              }}
              helperText="Fator para ajuste de perdas e desperdício (padrão: 1.0)"
              disabled={ingredientLoading}
              sx={{
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
              sx={{
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
                sx={{
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

            <ImageUploadComponent
              value={formData.image || null}
              onChange={handleImageChange}
              disabled={ingredientLoading}
              label="Imagem do Ingrediente"
              required={false}
              error={errors.image}
              helperText="Faça upload de uma imagem para identificar o ingrediente (opcional)"
              type="ingredients"
              placeholder="Clique para selecionar uma imagem do ingrediente"
              ingredientName={formData.name.trim() || 'Ingrediente'}
            />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          borderTop: isMobile ? 'none' : '1px solid',
          borderColor: 'divider',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 1 },
          '& .MuiButton-root': {
            minHeight: { xs: 48, sm: 42 },
            fontSize: { xs: '1rem', sm: '0.875rem' },
          },
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          disabled={ingredientLoading || isProcessing}
          size={isMobile ? 'large' : 'medium'}
          fullWidth={isMobile}
          sx={{
            order: { xs: 2, sm: 1 },
          }}
        >
          {t('ingredients.actions.cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={ingredientLoading || isProcessing}
          startIcon={
            ingredientLoading || isProcessing ? (
              <CircularProgress size={20} sx={{ color: 'inherit' }} />
            ) : null
          }
          size={isMobile ? 'large' : 'medium'}
          fullWidth={isMobile}
          sx={{
            order: { xs: 1, sm: 2 },
          }}
        >
          {isProcessing
            ? processingMessage || 'Processando...'
            : ingredientLoading
              ? 'Salvando...'
              : t('ingredients.actions.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientModal;
