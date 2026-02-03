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
  Divider,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Store as StoreIcon } from '@mui/icons-material';
import { useSuppliers } from '@/hooks/useSuppliers';
import { Supplier, SUPPLIER_GROUP_LABELS } from '@/types/suppliers';

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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StoreIcon />
          Fornecedores de {ingredientName}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Adicionar novo fornecedor */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Adicionar Fornecedor
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
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
                      {supplier.name} ({SUPPLIER_GROUP_LABELS[supplier.group]})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
                onClick={handleAddSupplier}
                disabled={!selectedSupplierId || loading}
                sx={{ minWidth: 100 }}
              >
                Adicionar
              </Button>
            </Box>
            {availableSuppliers.length === 0 && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Todos os fornecedores disponíveis já estão vinculados.
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Lista de fornecedores vinculados */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Fornecedores Vinculados ({linkedSuppliers.length})
            </Typography>
            {linkedSuppliers.length === 0 ? (
              <Alert severity="warning">Nenhum fornecedor vinculado a este ingrediente.</Alert>
            ) : (
              <List dense>
                {linkedSuppliers.map((supplier) => (
                  <ListItem
                    key={supplier._id}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {supplier.name}
                          </Typography>
                          <Chip
                            label={SUPPLIER_GROUP_LABELS[supplier.group]}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
