import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from '@mui/material';
import { Add as AddIcon, Close as CloseIcon } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { createUnitAmountUse } from '../../../services/api/unitsAmountUse';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import { UnitMeasure } from '../../../types/unitMeasure';

interface QuickUnitAmountUseAddProps {
  onUnitAdded?: (unitId: string, unitName: string, quantity: string, unitMeasure: string) => void;
}

const QuickUnitAmountUseAdd: React.FC<QuickUnitAmountUseAddProps> = ({ onUnitAdded }) => {
  const [modalOpen, setModalOpen] = useState(false);
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
    if (modalOpen) {
      loadUnitMeasures();
    }
  }, [modalOpen]);

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

  const handleOpenModal = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setName('');
    setQuantity('');
    setUnitMeasure('');
    setUnitMeasures([]);
    setErrors({ name: '', quantity: '', unitMeasure: '' });
  }, []);

  const handleChange = useCallback(
    (field: string, value: string) => {
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
    },
    [errors],
  );

  const validate = useCallback((): boolean => {
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
  }, [name, quantity, unitMeasure]);

  const handleSubmit = useCallback(async () => {
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

      // Chama o callback com os dados da nova unidade
      if (onUnitAdded) {
        // Usa um ID temporário já que a API não retorna o ID
        const unitId = `temp-${Date.now()}`;
        onUnitAdded(unitId, name.trim(), quantity.trim(), unitMeasure.trim());
      }

      handleCloseModal();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error && 'response' in error && error.response
          ? (error.response as { data?: { message?: string } })?.data?.message ||
            'Erro ao criar unidade de medida'
          : 'Erro ao criar unidade de medida';

      dispatch(
        addNotification({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [name, quantity, unitMeasure, dispatch, onUnitAdded, handleCloseModal, validate]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  return (
    <>
      <Button
        variant="text"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleOpenModal}
        size="small"
        sx={{
          textTransform: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
          borderRadius: 1.5,
          px: 2,
          py: 1,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'primary.light',
            color: 'primary.contrastText',
          },
        }}
      >
        Nova Unidade
      </Button>

      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 3,
            backgroundColor: 'background.paper',
          },
        }}
        TransitionProps={{
          timeout: 300,
        }}
      >
        <DialogTitle sx={{ pb: 1, position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 600,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AddIcon />
              Nova Unidade de Medida
            </Typography>
            <IconButton
              onClick={handleCloseModal}
              disabled={loading}
              sx={{
                color: 'text.secondary',
                '&:hover': { color: 'text.primary' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Nome da Unidade"
              value={name}
              onChange={(e) => handleChange('name', e.target.value)}
              onKeyPress={handleKeyPress}
              fullWidth
              required
              variant="outlined"
              error={!!errors.name}
              helperText={errors.name || 'Ex: Xícara de chá, Colher de sopa, Litro...'}
              disabled={loading}
              autoFocus
              sx={{ mb: 2 }}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Quantidade"
              value={quantity}
              onChange={(e) => handleChange('quantity', e.target.value)}
              onKeyPress={handleKeyPress}
              required
              variant="outlined"
              error={!!errors.quantity}
              helperText={errors.quantity || 'Ex: 1, 250, 0.5...'}
              disabled={loading}
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
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={handleCloseModal}
            variant="text"
            color="inherit"
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={loading || !name.trim() || !quantity.trim() || !unitMeasure.trim()}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {loading ? 'Criando...' : 'Criar Unidade'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default QuickUnitAmountUseAdd;
