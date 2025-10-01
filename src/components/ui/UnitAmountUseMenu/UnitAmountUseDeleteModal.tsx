import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { deleteUnitAmountUse } from '../../../services/api/unitsAmountUse';
import { UnitAmountUse } from '../../../types/unitAmountUse';

interface UnitAmountUseDeleteModalProps {
  open: boolean;
  onClose: () => void;
  unit: UnitAmountUse | null;
  onUnitDeleted?: () => void;
}

const UnitAmountUseDeleteModal: React.FC<UnitAmountUseDeleteModalProps> = ({
  open,
  onClose,
  unit,
  onUnitDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = async () => {
    if (!unit) return;

    setLoading(true);
    try {
      await deleteUnitAmountUse(unit.id);

      dispatch(
        addNotification({
          message: `Unidade de medida "${unit.name}" excluída com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      if (onUnitDeleted) {
        onUnitDeleted();
      }

      onClose();
    } catch (error: unknown) {
      console.error('Erro ao excluir unidade de medida:', error);

      dispatch(
        addNotification({
          message: 'Erro ao excluir unidade de medida.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
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
          Excluir Unidade de Medida
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Esta ação não pode ser desfeita!
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            Você tem certeza que deseja excluir a unidade de medida abaixo?
          </Typography>

          {unit && (
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.default',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
                {unit.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {unit.quantity} {unit.unitMeasure}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Excluindo...' : 'Excluir'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnitAmountUseDeleteModal;
