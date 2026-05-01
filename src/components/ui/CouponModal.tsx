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
import { Coupon, CreateCouponParams } from '@/types/coupons';
import { useSuppliers } from '@/hooks/useSuppliers';

interface CouponModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateCouponParams) => void;
  coupon?: Coupon | null;
  loading?: boolean;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  open,
  onClose,
  onSave,
  coupon,
  loading = false,
}) => {
  const { suppliers, searchSuppliers, loading: loadingSuppliers } = useSuppliers();

  const [formData, setFormData] = useState<CreateCouponParams>({
    name: '',
    description: '',
    supplierId: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Buscar fornecedores ao abrir o modal
  useEffect(() => {
    if (open) {
      searchSuppliers({
        page: 1,
        itemPerPage: 100, // Buscar muitos fornecedores para o select
        active: true, // Apenas fornecedores ativos
      });
    }
  }, [open, searchSuppliers]);

  // Preencher formulário ao editar
  useEffect(() => {
    if (coupon) {
      setFormData({
        name: coupon.name,
        description: coupon.description,
        supplierId: coupon.supplier && '_id' in coupon.supplier ? coupon.supplier._id : undefined,
      });
    } else {
      // Reset ao criar novo
      setFormData({
        name: '',
        description: '',
        supplierId: undefined,
      });
    }
    setErrors({});
  }, [coupon, open]);

  const handleChange = (field: keyof CreateCouponParams, value: string | undefined) => {
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

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      onSave(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{coupon ? 'Editar Cupom' : 'Novo Cupom'}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Nome do Cupom"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            required
            disabled={loading}
            placeholder="Ex: DESCONTO10"
          />

          <TextField
            label="Descrição"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
            disabled={loading}
            multiline
            rows={3}
            placeholder="Descreva os detalhes e condições do cupom..."
          />

          <FormControl fullWidth>
            <InputLabel>Fornecedor (Opcional)</InputLabel>
            <Select
              value={formData.supplierId || ''}
              onChange={(e) => handleChange('supplierId', e.target.value || undefined)}
              label="Fornecedor (Opcional)"
              disabled={loading || loadingSuppliers}
            >
              <MenuItem value="">
                <em>Nenhum fornecedor</em>
              </MenuItem>
              {loadingSuppliers ? (
                <MenuItem disabled>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    Carregando fornecedores...
                  </Box>
                </MenuItem>
              ) : suppliers.length === 0 ? (
                <MenuItem disabled>
                  <em>Nenhum fornecedor disponível</em>
                </MenuItem>
              ) : (
                [...suppliers]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((supplier) => (
                    <MenuItem key={supplier._id} value={supplier._id}>
                      {supplier.name} - {supplier.category}
                    </MenuItem>
                  ))
              )}
            </Select>
          </FormControl>
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
          {coupon ? 'Salvar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
