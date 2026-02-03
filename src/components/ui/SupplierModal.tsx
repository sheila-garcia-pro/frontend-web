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
} from '@mui/material';
import {
  Supplier,
  CreateSupplierParams,
  SupplierGroup,
  SUPPLIER_GROUP_LABELS,
} from '@/types/suppliers';

interface SupplierModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateSupplierParams) => Promise<void>;
  supplier?: Supplier | null;
  loading?: boolean;
}

const SUPPLIER_GROUPS: SupplierGroup[] = [
  'açougue',
  'hortifruti',
  'mercado',
  'adega',
  'padaria',
  'laticínios',
  'pescado',
  'outros',
];

export const SupplierModal: React.FC<SupplierModalProps> = ({
  open,
  onClose,
  onSave,
  supplier,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateSupplierParams>({
    name: '',
    group: 'mercado',
    address: '',
    phone: '',
    comments: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preencher formulário ao editar
  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        group: supplier.group,
        address: supplier.address,
        phone: supplier.phone,
        comments: supplier.comments || '',
      });
    } else {
      // Reset ao criar novo
      setFormData({
        name: '',
        group: 'mercado',
        address: '',
        phone: '',
        comments: '',
      });
    }
    setErrors({});
  }, [supplier, open]);

  const handleChange = (field: keyof CreateSupplierParams, value: string) => {
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

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

          <FormControl fullWidth required>
            <InputLabel>Grupo</InputLabel>
            <Select
              value={formData.group}
              onChange={(e) => handleChange('group', e.target.value as SupplierGroup)}
              label="Grupo"
              disabled={loading}
            >
              {SUPPLIER_GROUPS.map((group) => (
                <MenuItem key={group} value={group}>
                  {SUPPLIER_GROUP_LABELS[group]}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

          <TextField
            label="Comentários"
            value={formData.comments}
            onChange={(e) => handleChange('comments', e.target.value)}
            fullWidth
            multiline
            rows={4}
            disabled={loading}
            placeholder="Informações adicionais sobre o fornecedor..."
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
