import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Warning, Delete } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { deleteMenu } from '../../../services/api/menu';
import { MenuListItem } from '../../../types/menu';

interface MenuDeleteModalProps {
  open: boolean;
  onClose: () => void;
  onMenuDeleted: () => void;
  menu: MenuListItem | null;
}

const MenuDeleteModal: React.FC<MenuDeleteModalProps> = ({
  open,
  onClose,
  onMenuDeleted,
  menu,
}) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!menu) return;

    setLoading(true);
    try {
      await deleteMenu(menu._id);

      dispatch(
        addNotification({
          message: `Cardápio "${menu.name}" excluído com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      onMenuDeleted();
    } catch (error) {
      console.error('Erro ao excluir cardápio:', error);
      dispatch(
        addNotification({
          message: 'Erro ao excluir cardápio. Tente novamente.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!menu) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Warning color="error" />
          <Typography variant="h6" component="h2">
            Confirmar Exclusão
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Esta ação não pode ser desfeita!
        </Alert>

        <Typography variant="body1" gutterBottom>
          Tem certeza que deseja excluir o cardápio:
        </Typography>

        <Box
          sx={{
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300',
            mt: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {menu.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {menu.totalItems} itens
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Todos os dados relacionados a este cardápio serão permanentemente removidos.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Delete />}
        >
          {loading ? 'Excluindo...' : 'Excluir Cardápio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuDeleteModal;
