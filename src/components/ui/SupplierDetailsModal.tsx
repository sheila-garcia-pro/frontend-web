import React, { useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Store, LocationOn, Phone, Comment, CalendarToday, Kitchen } from '@mui/icons-material';
import { Supplier, SUPPLIER_GROUP_LABELS } from '@/types/suppliers';
import { Ingredient } from '@/types/ingredients';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface SupplierDetailsModalProps {
  open: boolean;
  onClose: () => void;
  supplier: Supplier | null;
}

export const SupplierDetailsModal: React.FC<SupplierDetailsModalProps> = ({
  open,
  onClose,
  supplier,
}) => {
  // Buscar ingredientes vinculados do Redux store
  const allIngredients = useSelector((state: RootState) => state.ingredients.items);

  // Filtrar ingredientes vinculados a este fornecedor
  const linkedIngredients = useMemo(() => {
    if (!supplier || !supplier.ingredients) return [];
    return allIngredients.filter((ingredient: Ingredient) =>
      supplier.ingredients?.includes(ingredient._id),
    );
  }, [supplier, allIngredients]);

  if (!supplier) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store />
          Detalhes do Fornecedor
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {/* Nome */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Nome
            </Typography>
            <Typography variant="h6">{supplier.name}</Typography>
          </Box>

          <Divider />

          {/* Grupo */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Grupo
            </Typography>
            <Chip
              label={SUPPLIER_GROUP_LABELS[supplier.group]}
              color="primary"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>

          <Divider />

          {/* Endereço */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Endereço
              </Typography>
            </Box>
            <Typography variant="body1">{supplier.address}</Typography>
          </Box>

          <Divider />

          {/* Telefone */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Phone fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Telefone
              </Typography>
            </Box>
            <Typography variant="body1">{supplier.phone}</Typography>
          </Box>

          {/* Comentários */}
          {supplier.comments && (
            <>
              <Divider />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Comment fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Comentários
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {supplier.comments}
                </Typography>
              </Box>
            </>
          )}

          {/* Ingredientes Vinculados */}
          <Divider />
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Kitchen fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                Ingredientes Vinculados ({linkedIngredients.length})
              </Typography>
            </Box>
            {linkedIngredients.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nenhum ingrediente vinculado a este fornecedor.
              </Typography>
            ) : (
              <List dense disablePadding>
                {linkedIngredients.map((ingredient) => (
                  <ListItem
                    key={ingredient._id}
                    sx={{
                      px: 0,
                      py: 0.5,
                    }}
                  >
                    <ListItemText
                      primary={<Typography variant="body2">• {ingredient.name}</Typography>}
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {ingredient.category}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          {/* Datas */}
          {(supplier.createdAt || supplier.updatedAt) && (
            <>
              <Divider />
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    Informações de Data
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {supplier.createdAt && (
                    <Typography variant="caption" color="text.secondary">
                      Criado em: {formatDate(supplier.createdAt)}
                    </Typography>
                  )}
                  {supplier.updatedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Atualizado em: {formatDate(supplier.updatedAt)}
                    </Typography>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
