import React, { useState, useEffect, ElementType } from 'react';
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
  Grid,
  Box
} from '@mui/material';
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
  // Redux
  const dispatch = useDispatch();
  const { items: categories, loading: categoriesLoading } = useSelector((state: RootState) => state.categories);
  const { loading: ingredientLoading } = useSelector((state: RootState) => state.ingredients);
  
  // Estado local do formulário
  const [formData, setFormData] = useState<CreateIngredientParams>({
    name: '',
    categoryId: '',
    image: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Carregar categorias quando o modal for aberto
  useEffect(() => {
    if (open && categories.length === 0) {
      dispatch(fetchCategoriesRequest({ page: 1, itemPerPage: 100 }));
    }
  }, [open, categories.length, dispatch]);
  
  // Manipuladores de eventos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Limpar erro quando o usuário começa a digitar
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };
  
  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    if (!formData.categoryId) {
      newErrors.categoryId = 'A categoria é obrigatória';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'A URL da imagem é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      dispatch(createIngredientRequest(formData));
      // Fechar o modal apenas após o sucesso (implementado na saga)
      onClose();
      // Resetar o formulário
      setFormData({
        name: '',
        categoryId: '',
        image: ''
      });
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
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
          Novo Ingrediente
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} component={'div' as ElementType}>
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
            </Grid>
            
            <Grid item xs={12} component={'div' as ElementType}>
              <FormControl fullWidth required error={!!errors.categoryId}>
                <InputLabel id="category-label">Categoria</InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange as (event: SelectChangeEvent<string>, child: React.ReactNode) => void}
                  label="Categoria"
                  disabled={categoriesLoading || ingredientLoading}
                >
                  {categoriesLoading ? (
                    <MenuItem value="">
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    categories.map(category => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
                {errors.categoryId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1 }}>
                    {errors.categoryId}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} component={'div' as ElementType}>
              <TextField
                label="URL da Imagem"
                name="image"
                value={formData.image}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                error={!!errors.image}
                helperText={errors.image}
                disabled={ingredientLoading}
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={ingredientLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={ingredientLoading}
          startIcon={ingredientLoading ? <CircularProgress size={20} /> : null}
        >
          {ingredientLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientModal; 