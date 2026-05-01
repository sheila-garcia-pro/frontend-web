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
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  LocalOffer as CouponIcon,
} from '@mui/icons-material';
import { useCoupons } from '@/hooks/useCoupons';
import { Coupon } from '@/types/coupons';

interface SupplierCouponsModalProps {
  open: boolean;
  onClose: () => void;
  supplierId: string;
  supplierName: string;
}

export const SupplierCouponsModal: React.FC<SupplierCouponsModalProps> = ({
  open,
  onClose,
  supplierId,
  supplierName,
}) => {
  const {
    coupons,
    loading,
    fetchCoupons,
    linkCouponToSupplier,
    unlinkCouponFromSupplier,
    getCouponsBySupplier,
  } = useCoupons();

  const [selectedCouponId, setSelectedCouponId] = useState<string>('');
  const [linkedCoupons, setLinkedCoupons] = useState<Coupon[]>([]);

  // Carregar cupons quando o modal abrir
  useEffect(() => {
    if (open) {
      fetchCoupons({ page: 1, itemPerPage: 100 });
    }
  }, [open, fetchCoupons]);

  // Atualizar lista de cupons vinculados quando o modal abrir ou cupons mudarem
  useEffect(() => {
    if (open && supplierId) {
      const linked = getCouponsBySupplier(supplierId);
      setLinkedCoupons(linked);
    }
  }, [open, supplierId, getCouponsBySupplier, coupons]);

  // Cupons disponíveis para adicionar (não vinculados ainda)
  const availableCoupons = coupons.filter(
    (coupon) => !linkedCoupons.some((linked) => linked._id === coupon._id),
  );

  const handleAddCoupon = async () => {
    if (!selectedCouponId) return;

    try {
      await linkCouponToSupplier(selectedCouponId, supplierId);
      setSelectedCouponId('');

      // Recarregar cupons
      fetchCoupons({ page: 1, itemPerPage: 100 });
    } catch (error) {
      console.error('Erro ao vincular cupom:', error);
    }
  };

  const handleRemoveCoupon = async (couponId: string) => {
    try {
      await unlinkCouponFromSupplier(couponId);

      // Recarregar cupons
      fetchCoupons({ page: 1, itemPerPage: 100 });
    } catch (error) {
      console.error('Erro ao desvincular cupom:', error);
    }
  };

  const handleClose = () => {
    setSelectedCouponId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CouponIcon />
          Cupons de {supplierName}
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* Adicionar novo cupom */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Adicionar Cupom
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Selecione um cupom</InputLabel>
                <Select
                  value={selectedCouponId}
                  onChange={(e) => setSelectedCouponId(e.target.value)}
                  label="Selecione um cupom"
                  disabled={loading || availableCoupons.length === 0}
                >
                  {availableCoupons.map((coupon) => (
                    <MenuItem key={coupon._id} value={coupon._id}>
                      {coupon.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} /> : <AddIcon />}
                onClick={handleAddCoupon}
                disabled={!selectedCouponId || loading}
                sx={{ minWidth: 100 }}
              >
                Adicionar
              </Button>
            </Box>
            {availableCoupons.length === 0 && !loading && (
              <Alert severity="info" sx={{ mt: 1 }}>
                Todos os cupons disponíveis já estão vinculados.
              </Alert>
            )}
          </Box>

          <Divider />

          {/* Lista de cupons vinculados */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Cupons Vinculados ({linkedCoupons.length})
            </Typography>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : linkedCoupons.length === 0 ? (
              <Alert severity="warning">Nenhum cupom vinculado a este fornecedor.</Alert>
            ) : (
              <List dense>
                {linkedCoupons.map((coupon) => (
                  <ListItem
                    key={coupon._id}
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
                            {coupon.name}
                          </Typography>
                          {coupon.active && (
                            <Chip label="Ativo" size="small" color="success" variant="outlined" />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" display="block">
                          {coupon.description}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="remover"
                        onClick={() => handleRemoveCoupon(coupon._id)}
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
        <Button onClick={handleClose} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
