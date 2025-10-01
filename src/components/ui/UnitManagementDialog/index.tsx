import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Settings, Close } from '@mui/icons-material';
import UnitAmountUseManager from '../UnitAmountUseManager';

interface UnitManagementDialogProps {
  open: boolean;
  onClose: () => void;
  onUnitsUpdated?: () => void;
}

const UnitManagementDialog: React.FC<UnitManagementDialogProps> = ({
  open,
  onClose,
  onUnitsUpdated,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: { borderRadius: 3, height: '80vh' },
      }}
    >
      <DialogTitle sx={{ pb: 1, position: 'relative' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Gerenciar Unidades de Medida
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover' },
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <UnitAmountUseManager />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={() => {
            onUnitsUpdated?.();
            onClose();
          }}
          variant="contained"
          color="primary"
        >
          Concluído
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnitManagementDialog;
