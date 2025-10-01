import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { createUnitAmountUse } from '../../../services/api/unitsAmountUse';

interface UnitAmountUseCreateModalProps {
  open: boolean;
  onClose: () => void;
  onUnitCreated?: () => void;
}

const UnitAmountUseCreateModal: React.FC<UnitAmountUseCreateModalProps> = ({
  open,
  onClose,
  onUnitCreated,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    quantity: '',
    unitMeasure: '',
  });

  const dispatch = useDispatch();

  const handleChange = (field: string, value: string) => {
    switch (field) {
      case 'name':
        setName(value);
        break;
      case 'quantity':
        setQuantity(value);
        break;
      case 'unitMeasure':
        setUnitMeasure(value);
        break;
    }

    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors = {
      name: '',
      quantity: '',
      unitMeasure: '',
    };

    if (!name.trim()) {
      newErrors.name = 'O nome é obrigatório';
    }

    if (!quantity.trim()) {
      newErrors.quantity = 'A quantidade é obrigatória';
    }

    if (!unitMeasure.trim()) {
      newErrors.unitMeasure = 'A unidade de medida é obrigatória';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await createUnitAmountUse({
        name: name.trim(),
        quantity: quantity.trim(),
        unitMeasure: unitMeasure.trim(),
      });

      dispatch(
        addNotification({
          message: `Unidade de medida "${name.trim()}" criada com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      if (onUnitCreated) {
        onUnitCreated();
      }

      handleClose();
    } catch (error: unknown) {
      console.error('Erro ao criar unidade de medida:', error);

      dispatch(
        addNotification({
          message: 'Erro ao criar unidade de medida.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setQuantity('');
    setUnitMeasure('');
    setErrors({ name: '', quantity: '', unitMeasure: '' });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 5,
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
          Nova Unidade de Medida
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <TextField
            label="Nome"
            value={name}
            onChange={(e) => handleChange('name', e.target.value)}
            fullWidth
            required
            variant="outlined"
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            placeholder="Ex: Xícara de chá, Colher de sopa, Litro..."
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Quantidade"
              value={quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              required
              variant="outlined"
              error={!!errors.quantity}
              helperText={errors.quantity}
              disabled={loading}
              placeholder="Ex: 1, 250, 0.5..."
              sx={{ flex: 1 }}
            />
            <TextField
              label="Unidade de Medida"
              value={unitMeasure}
              onChange={(e) => handleChange('unitMeasure', e.target.value)}
              required
              variant="outlined"
              error={!!errors.unitMeasure}
              helperText={errors.unitMeasure}
              disabled={loading}
              placeholder="Ex: ml, g, kg, unidades..."
              sx={{ flex: 1 }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !name.trim() || !quantity.trim() || !unitMeasure.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Criando...' : 'Criar Unidade'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnitAmountUseCreateModal;
