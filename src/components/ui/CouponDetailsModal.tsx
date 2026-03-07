import React from 'react';
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
} from '@mui/material';
import {
  LocalOffer as CouponIcon,
  Store as StoreIcon,
  Description as DescriptionIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { Coupon } from '@/types/coupons';

interface CouponDetailsModalProps {
  open: boolean;
  onClose: () => void;
  coupon: Coupon | null;
  onEdit?: () => void;
}

export const CouponDetailsModal: React.FC<CouponDetailsModalProps> = ({
  open,
  onClose,
  coupon,
  onEdit,
}) => {
  if (!coupon) return null;

  const hasSupplier =
    coupon.supplier &&
    Object.keys(coupon.supplier).length > 0 &&
    'name' in coupon.supplier &&
    coupon.supplier.name;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 2,
        }}
      >
        <CouponIcon color="primary" />
        Detalhes do Cupom
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Nome do Cupom */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Nome
            </Typography>
            <Typography variant="h6">{coupon.name}</Typography>
          </Box>

          <Divider />

          {/* Descrição */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DescriptionIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Descrição
              </Typography>
            </Box>
            <Typography variant="body1">{coupon.description}</Typography>
          </Box>

          <Divider />

          {/* Fornecedor Vinculado */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <StoreIcon fontSize="small" color="action" />
              <Typography variant="subtitle2" color="text.secondary">
                Fornecedor
              </Typography>
            </Box>

            {hasSupplier ? (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Typography variant="subtitle1" fontWeight="medium">
                  {coupon.supplier.name}
                </Typography>

                {coupon.supplier.category && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CategoryIcon fontSize="small" color="action" />
                    <Chip label={coupon.supplier.category} size="small" />
                  </Box>
                )}

                {coupon.supplier.phone && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2">{coupon.supplier.phone}</Typography>
                  </Box>
                )}

                {coupon.supplier.address && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2">{coupon.supplier.address}</Typography>
                  </Box>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" fontStyle="italic">
                Nenhum fornecedor vinculado
              </Typography>
            )}
          </Box>

          {/* Status */}
          {coupon.active !== undefined && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={coupon.active ? 'Ativo' : 'Inativo'}
                  color={coupon.active ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {onEdit && (
          <Button onClick={onEdit} variant="outlined">
            Editar
          </Button>
        )}
        <Button onClick={onClose} variant="contained">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
