import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Store as StoreIcon } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { Close as CloseIcon } from '@mui/icons-material';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Supplier } from '@/types/suppliers';

interface IngredientSuppliersModalProps {
  open: boolean;
  onClose: () => void;
  ingredientId: string;
  ingredientName: string;
}

export const IngredientSuppliersModal: React.FC<IngredientSuppliersModalProps> = ({
  open,
  onClose,
  ingredientId,
  ingredientName,
}) => {
  const theme = useTheme();
  const {
    suppliers,
    loading,
    linkIngredientToSupplier,
    unlinkIngredientFromSupplier,
    getSuppliersByIngredient,
  } = useSuppliers();

  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [linkedSuppliers, setLinkedSuppliers] = useState<Supplier[]>([]);

  // Atualizar lista de fornecedores vinculados quando o modal abrir ou suppliers mudar
  useEffect(() => {
    if (open && ingredientId) {
      const linked = getSuppliersByIngredient(ingredientId);
      setLinkedSuppliers(linked);
    }
  }, [open, ingredientId, getSuppliersByIngredient, suppliers]);

  // Fornecedores disponíveis para adicionar (não vinculados ainda)
  const availableSuppliers = suppliers.filter(
    (supplier) => !linkedSuppliers.some((linked) => linked._id === supplier._id),
  );

  const handleAddSupplier = async () => {
    if (!selectedSupplierId) return;

    try {
      await linkIngredientToSupplier(selectedSupplierId, ingredientId);
      setSelectedSupplierId('');

      // Atualizar lista local
      const updated = getSuppliersByIngredient(ingredientId);
      setLinkedSuppliers(updated);
    } catch (error) {
      console.error('Erro ao vincular fornecedor:', error);
    }
  };

  const handleRemoveSupplier = async (supplierId: string) => {
    try {
      await unlinkIngredientFromSupplier(supplierId, ingredientId);

      // Atualizar lista local
      const updated = getSuppliersByIngredient(ingredientId);
      setLinkedSuppliers(updated);
    } catch (error) {
      console.error('Erro ao desvincular fornecedor:', error);
    }
  };

  const handleClose = () => {
    setSelectedSupplierId('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StoreIcon />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Fornecedores
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {ingredientName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} aria-label="fechar">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Adicionar fornecedor
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Selecione um fornecedor</InputLabel>
                <Select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  label="Selecione um fornecedor"
                  disabled={loading || availableSuppliers.length === 0}
                >
                  {availableSuppliers.map((supplier) => (
                    <MenuItem key={supplier._id} value={supplier._id}>
                      {supplier.name} ({supplier.category})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
                onClick={handleAddSupplier}
                disabled={!selectedSupplierId || loading}
                sx={{ minWidth: 120, borderRadius: 2 }}
              >
                Adicionar
              </Button>
            </Stack>
            {availableSuppliers.length === 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Todos os fornecedores disponiveis ja estao vinculados.
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Fornecedores vinculados ({linkedSuppliers.length})
            </Typography>
            {linkedSuppliers.length === 0 ? (
              <Alert severity="warning">Nenhum fornecedor vinculado a este ingrediente.</Alert>
            ) : (
              <List dense sx={{ mt: 1 }}>
                {linkedSuppliers.map((supplier) => (
                  <ListItem
                    key={supplier._id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1.5,
                      mb: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {supplier.name}
                          </Typography>
                          <Chip
                            label={supplier.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            {supplier.phone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {supplier.address}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="remover"
                        onClick={() => handleRemoveSupplier(supplier._id)}
                        disabled={loading}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} variant="outlined" color="inherit">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
