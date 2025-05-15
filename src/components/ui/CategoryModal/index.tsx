import React, { useState, ElementType } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  CircularProgress,
  Typography,
  Grid,
  Box
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { createCategoryRequest } from '../../../store/slices/categoriesSlice';
import { RootState } from '../../../store';
import { CreateCategoryParams } from '../../../types/ingredients';

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ open, onClose }) => {
  // Redux
  const dispatch = useDispatch();
  const { loading: categoryLoading } = useSelector((state: RootState) => state.categories);
  
  // Estado local do formulário
  const [formData, setFormData] = useState<CreateCategoryParams>({
    name: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // Manipuladores de eventos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro quando o usuário começa a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const validate = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      dispatch(createCategoryRequest(formData));
      // Fechar o modal apenas após o sucesso (implementado na saga)
      onClose();
      // Resetar o formulário
      setFormData({
        name: ''
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
          Nova Categoria
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} component={'div' as ElementType}>
              <TextField
                label="Nome da Categoria"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                variant="outlined"
                error={!!errors.name}
                helperText={errors.name}
                autoFocus
                disabled={categoryLoading}
                placeholder="Ex: Laticínios, Vegetais, Carnes, etc."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={categoryLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={categoryLoading}
          startIcon={categoryLoading ? <CircularProgress size={20} /> : null}
        >
          {categoryLoading ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryModal; 