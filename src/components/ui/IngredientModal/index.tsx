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
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories,
  );
  const { loading: ingredientLoading } = useSelector((state: RootState) => state.ingredients); // Estado local do formulário
  const [formData, setFormData] = useState<CreateIngredientParams>({
    name: '',
    category: '',
    image: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Apenas fecha o modal quando o loading terminar após um submit
  useEffect(() => {
    if (isSubmitted && !ingredientLoading) {
      setFormData({ name: '', category: '', image: '' });
      setSelectedFile(null);
      setIsSubmitted(false);
      onClose();
    }
  }, [ingredientLoading, isSubmitted, onClose]);

  // Carregar categorias quando o modal for aberto
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

  // Manipuladores de eventos
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | SelectChangeEvent,
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Limpar erro quando o usuário começa a digitar
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

        const response = await fetch('https://sgpro-api.squareweb.app/v1/update/image', {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        console.log('Resposta da API:', { status: response.status, data });
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (validate()) {
      setIsSubmitted(true);
      dispatch(createIngredientRequest(formData));
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
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
          Novo Ingrediente
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Stack spacing={3}>
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
