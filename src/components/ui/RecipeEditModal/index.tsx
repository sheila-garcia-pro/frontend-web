import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import { Close, Save, Cancel } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { Recipe, CreateRecipeParams } from '../../../types/recipes';
import { updateRecipe } from '../../../services/api/recipes';

interface RecipeEditModalProps {
  open: boolean;
  onClose: () => void;
  recipe: Recipe | null;
  onRecipeUpdated: (updatedRecipe: Recipe) => void;
}

const RecipeEditModal: React.FC<RecipeEditModalProps> = ({
  open,
  onClose,
  recipe,
  onRecipeUpdated,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
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

  // Preencher o formulário quando a receita for carregada
  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        sku: recipe.sku,
        category: recipe.category,
        image: recipe.image,
        yieldRecipe: recipe.yieldRecipe,
        typeYield: recipe.typeYield,
        preparationTime: recipe.preparationTime,
        weightRecipe: recipe.weightRecipe,
        typeWeightRecipe: recipe.typeWeightRecipe,
        descripition: recipe.descripition,
      });
    }
  }, [recipe]);
  const handleInputChange =
    (field: keyof CreateRecipeParams) =>
    (
      event:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
        | React.ChangeEvent<{ value: unknown }>,
    ) => {
      const value = event.target.value as string;
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSubmit = async () => {
    if (!recipe) return;

    // Validação básica
    if (!formData.name.trim()) {
      dispatch(
        addNotification({
          message: 'Nome da receita é obrigatório!',
          type: 'error',
          duration: 4000,
        }),
      );
      return;
    }

    setLoading(true);
    try {
      const updatedRecipe = await updateRecipe(recipe._id, formData);

      dispatch(
        addNotification({
          message: 'Receita atualizada com sucesso!',
          type: 'success',
          duration: 4000,
        }),
      );

      onRecipeUpdated(updatedRecipe);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar receita:', error);
      dispatch(
        addNotification({
          message: 'Erro ao atualizar receita. Tente novamente.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const categories = [
    'Entradas',
    'Pratos Principais',
    'Sobremesas',
    'Bebidas',
    'Petiscos',
    'Saladas',
    'Sopas',
    'Outros',
  ];

  const yieldTypes = ['Porções', 'Pessoas', 'Unidades', 'Fatias'];

  const weightTypes = ['Quilogramas', 'Gramas', 'Litros', 'Mililitros'];

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Editar Receita
          </Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Nome */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Nome da Receita"
              value={formData.name}
              onChange={handleInputChange('name')}
              required
              disabled={loading}
            />
          </Grid>

          {/* SKU */}
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="SKU"
              value={formData.sku}
              onChange={handleInputChange('sku')}
              disabled={loading}
            />
          </Grid>

          {/* Categoria */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={formData.category}
                onChange={handleInputChange('category')}
                label="Categoria"
                disabled={loading}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Tempo de Preparo */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tempo de Preparo"
              value={formData.preparationTime}
              onChange={handleInputChange('preparationTime')}
              placeholder="Ex: 1 hora, 30 minutos"
              disabled={loading}
            />
          </Grid>

          {/* Rendimento */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Rendimento"
              value={formData.yieldRecipe}
              onChange={handleInputChange('yieldRecipe')}
              disabled={loading}
            />
          </Grid>

          {/* Tipo de Rendimento */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Tipo de Rendimento</InputLabel>
              <Select
                value={formData.typeYield}
                onChange={handleInputChange('typeYield')}
                label="Tipo de Rendimento"
                disabled={loading}
              >
                {yieldTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Peso */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Peso"
              value={formData.weightRecipe}
              onChange={handleInputChange('weightRecipe')}
              disabled={loading}
            />
          </Grid>

          {/* Tipo de Peso */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Unidade de Peso</InputLabel>
              <Select
                value={formData.typeWeightRecipe}
                onChange={handleInputChange('typeWeightRecipe')}
                label="Unidade de Peso"
                disabled={loading}
              >
                {weightTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* URL da Imagem */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL da Imagem"
              value={formData.image}
              onChange={handleInputChange('image')}
              placeholder="https://exemplo.com/imagem.jpg"
              disabled={loading}
            />
          </Grid>

          {/* Descrição */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Descrição"
              value={formData.descripition}
              onChange={handleInputChange('descripition')}
              multiline
              rows={4}
              placeholder="Descreva a receita..."
              disabled={loading}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading} startIcon={<Cancel />} variant="outlined">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          startIcon={<Save />}
          variant="contained"
          color="primary"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RecipeEditModal;
