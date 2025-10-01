import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { updateUnitAmountUse } from '../../../services/api/unitsAmountUse';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import { UnitAmountUse } from '../../../types/unitAmountUse';
import { UnitMeasure } from '../../../types/unitMeasure';

interface UnitAmountUseEditModalProps {
  open: boolean;
  onClose: () => void;
  unit: UnitAmountUse | null;
  onUnitUpdated?: () => void;
}

const UnitAmountUseEditModal: React.FC<UnitAmountUseEditModalProps> = ({
  open,
  onClose,
  unit,
  onUnitUpdated,
}) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('');
  const [loading, setLoading] = useState(false);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    quantity: '',
    unitMeasure: '',
  });

  const dispatch = useDispatch();

  // Carregar unidades de medida quando o modal abrir
  useEffect(() => {
    if (open) {
      loadUnitMeasures();
    }
  }, [open]);

  const loadUnitMeasures = async () => {
    try {
      setLoadingUnitMeasures(true);
      const units = await getUnitMeasures();
      setUnitMeasures(units);
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
      dispatch(
        addNotification({
          message: 'Erro ao carregar unidades de medida',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingUnitMeasures(false);
    }
  };

  useEffect(() => {
    if (unit) {
      setName(unit.name);
      setQuantity(unit.quantity);
      setUnitMeasure(unit.unitMeasure);
    }
  }, [unit]);

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
    if (!validate() || !unit) return;

    setLoading(true);
    try {
      await updateUnitAmountUse(unit.id, {
        name: name.trim(),
        quantity: quantity.trim(),
        unitMeasure: unitMeasure.trim(),
      });

      dispatch(
        addNotification({
          message: `Unidade de medida "${name.trim()}" atualizada com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      if (onUnitUpdated) {
        onUnitUpdated();
      }

      handleClose();
    } catch (error: unknown) {
      console.error('Erro ao atualizar unidade de medida:', error);

      dispatch(
        addNotification({
          message: 'Erro ao atualizar unidade de medida.',
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
    setUnitMeasures([]);
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
          Editar Unidade de Medida
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

            <FormControl sx={{ flex: 1 }} required error={!!errors.unitMeasure} disabled={loading}>
              <InputLabel id="unit-measure-label">Unidade de Medida</InputLabel>
              <Select
                labelId="unit-measure-label"
                value={unitMeasure}
                onChange={(e) => handleChange('unitMeasure', e.target.value)}
                label="Unidade de Medida"
                disabled={loading || loadingUnitMeasures}
              >
                {loadingUnitMeasures ? (
                  <MenuItem value="" disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Carregando...
                  </MenuItem>
                ) : (
                  unitMeasures.map((unit) => (
                    <MenuItem key={unit._id} value={unit.name}>
                      {unit.name} ({unit.acronym})
                    </MenuItem>
                  ))
                )}
                {!loadingUnitMeasures && unitMeasures.length === 0 && (
                  <MenuItem value="" disabled>
                    Nenhuma unidade disponível
                  </MenuItem>
                )}
              </Select>
              {errors.unitMeasure && <FormHelperText error>{errors.unitMeasure}</FormHelperText>}
            </FormControl>
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
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnitAmountUseEditModal;
