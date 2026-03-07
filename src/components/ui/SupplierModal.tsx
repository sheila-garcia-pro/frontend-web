import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  FormControlLabel,
  Switch,
  IconButton,
  Collapse,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { Supplier, CreateSupplierParams, SupplierCategory } from '@/types/suppliers';

interface SupplierModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateSupplierParams) => Promise<void>;
  supplier?: Supplier | null;
  loading?: boolean;
  categories: SupplierCategory[];
  onCreateCategory: (categoryName: string) => Promise<string>; // Retorna o nome da categoria criada
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  onClose,
  onSave,
  supplier,
  loading = false,
  categories,
  onCreateCategory,
}) => {
  const [formData, setFormData] = useState<CreateSupplierParams>({
    name: '',
    category: categories.length > 0 ? categories[0].name : 'Geral',
    address: '',
    phone: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Preencher formulário ao editar
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        category: supplier.category,
        address: supplier.address,
        phone: supplier.phone,
        active: supplier.active,
      });
    } else {
      // Reset ao criar novo
      setFormData({
        name: '',
        category: categories.length > 0 ? categories[0].name : 'Geral',
        address: '',
        phone: '',
        active: true,
      });
    }
    setErrors({});

    // Limpar estados de nova categoria
    setShowNewCategory(false);
    setNewCategoryName('');
    setCategoryError('');
  }, [supplier, open, categories]);

  const handleChange = (field: keyof CreateSupplierParams, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao editar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Categoria é obrigatória';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('Nome da categoria é obrigatório');
      return;
    }

    setCreatingCategory(true);
    setCategoryError('');

    try {
      const createdCategoryName = await onCreateCategory(newCategoryName.trim());

      // Selecionar a categoria recém-criada imediatamente
      setFormData((prev) => ({ ...prev, category: createdCategoryName }));

      // Resetar e fechar o formulário de nova categoria
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (error: any) {
      setCategoryError(error.response?.data?.message || 'Erro ao criar categoria');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nome do Fornecedor"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            disabled={loading}
          />

          <Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <FormControl fullWidth required>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  label="Categoria"
                  disabled={loading || showNewCategory}
                >
                  {categories.length === 0 ? (
                    <MenuItem value="Geral">Geral</MenuItem>
                  ) : (
                    categories.map((cat) => (
                      <MenuItem key={cat._id} value={cat.name}>
                        {cat.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              <IconButton
                color="primary"
                onClick={() => setShowNewCategory(!showNewCategory)}
                disabled={loading}
                sx={{ mt: 1 }}
              >
                {showNewCategory ? <CloseIcon /> : <AddIcon />}
              </IconButton>
            </Box>

            <Collapse in={showNewCategory}>
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <TextField
                  label="Nome da Nova Categoria"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setCategoryError('');
                  }}
                  error={!!categoryError}
                  helperText={categoryError}
                  fullWidth
                  size="small"
                  disabled={creatingCategory}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateCategory();
                    }
                  }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || creatingCategory}
                    startIcon={creatingCategory ? <CircularProgress size={16} /> : <AddIcon />}
                  >
                    Criar Categoria
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryName('');
                      setCategoryError('');
                    }}
                    disabled={creatingCategory}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Box>
            </Collapse>
          </Box>

          <TextField
            label="Endereço"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            fullWidth
            required
            disabled={loading}
          />

          <TextField
            label="Telefone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone}
            fullWidth
            required
            disabled={loading}
            placeholder="(00) 00000-0000"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => handleChange('active', e.target.checked)}
                disabled={loading}
              />
            }
            label="Fornecedor Ativo"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {supplier ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
