import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  CircularProgress,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { getUserRecipeCategories, RecipeCategory } from '../../../services/api/recipeCategories';
import api from '../../../services/api';

interface RecipeCategoryMenuProps {
  onCategoryUpdated?: () => void;
}

const RecipeCategoryMenu: React.FC<RecipeCategoryMenuProps> = ({ onCategoryUpdated }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [loading, setLoading] = useState(false);

  // Estados dos modais
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | null>(null);

  // Estados dos formulários
  const [createName, setCreateName] = useState('');
  const [editName, setEditName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [editError, setEditError] = useState('');

  const dispatch = useDispatch();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    loadCategories();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const categoriesData = await getUserRecipeCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      dispatch(
        addNotification({
          message: 'Erro ao carregar categorias de receitas.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = () => {
    setCreateModalOpen(true);
    handleClose();
  };

  const handleEditCategory = (category: RecipeCategory) => {
    setSelectedCategory(category);
    setEditName(category.name);
    setEditModalOpen(true);
    handleClose();
  };

  const handleDeleteCategory = (category: RecipeCategory) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
    handleClose();
  };

  const handleCategoryOperation = () => {
    loadCategories();
    if (onCategoryUpdated) {
      onCategoryUpdated();
    }
  };

  // Handlers do modal de criação
  const handleCreateSubmit = async () => {
    if (!createName.trim()) {
      setCreateError('O nome da categoria é obrigatório');
      return;
    }

    setCreateLoading(true);
    try {
      await api.post('/v1/users/me/category-recipe', { name: createName.trim() });

      dispatch(
        addNotification({
          message: `Categoria "${createName.trim()}" criada com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      handleCategoryOperation();
      setCreateModalOpen(false);
      setCreateName('');
      setCreateError('');
    } catch (error: unknown) {
      console.error('Erro ao criar categoria:', error);
      dispatch(
        addNotification({
          message: 'Erro ao criar categoria.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateClose = () => {
    setCreateModalOpen(false);
    setCreateName('');
    setCreateError('');
  };

  // Handlers do modal de edição
  const handleEditSubmit = async () => {
    if (!editName.trim() || !selectedCategory) {
      setEditError('O nome da categoria é obrigatório');
      return;
    }

    setEditLoading(true);
    try {
      await api.patch(`/v1/users/me/category-recipe/${selectedCategory.id}`, {
        name: editName.trim(),
      });

      dispatch(
        addNotification({
          message: `Categoria atualizada para "${editName.trim()}" com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      handleCategoryOperation();
      setEditModalOpen(false);
      setEditName('');
      setEditError('');
      setSelectedCategory(null);
    } catch (error: unknown) {
      console.error('Erro ao atualizar categoria:', error);
      dispatch(
        addNotification({
          message: 'Erro ao atualizar categoria.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditName('');
    setEditError('');
    setSelectedCategory(null);
  };

  // Handlers do modal de exclusão
  const handleDeleteSubmit = async () => {
    if (!selectedCategory) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/v1/users/me/category-recipe/${selectedCategory.id}`);

      dispatch(
        addNotification({
          message: `Categoria "${selectedCategory.name}" excluída com sucesso!`,
          type: 'success',
          duration: 4000,
        }),
      );

      handleCategoryOperation();
      setDeleteModalOpen(false);
      setSelectedCategory(null);
    } catch (error: unknown) {
      console.error('Erro ao excluir categoria:', error);
      dispatch(
        addNotification({
          message: 'Erro ao excluir categoria.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteClose = () => {
    setDeleteModalOpen(false);
    setSelectedCategory(null);
  };
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<CategoryIcon />}
        onClick={handleClick}
        sx={{ borderRadius: 3, px: 3 }}
      >
        Categorias
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            minWidth: 280,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {' '}
        <MenuItem onClick={handleCreateCategory}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nova Categoria</ListItemText>
        </MenuItem>
        {categories.length > 0 && [
          <Divider key="divider" />,
          <Box key="header" sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              CATEGORIAS EXISTENTES
            </Typography>
          </Box>,
        ]}{' '}
        <Divider /> {/* Container com scroll para as categorias */}
        <Box
          sx={{
            maxHeight: 300,
            overflowY: 'auto',
            position: 'relative',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,.1)',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,.3)',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,.5)',
              },
            },
            // Gradiente sutil no final para indicar scroll
            '&::after':
              categories.length > 4
                ? {
                    content: '""',
                    position: 'sticky',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '20px',
                    background: 'linear-gradient(transparent, rgba(255,255,255,0.9))',
                    pointerEvents: 'none',
                  }
                : {},
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={20} />
            </Box>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <Box key={category.id}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      fontWeight: 500,
                      flexGrow: 1,
                      mr: 1,
                    }}
                  >
                    {category.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Editar categoria">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCategory(category);
                        }}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.light',
                            color: 'primary.contrastText',
                          },
                        }}
                      >
                        <EditIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir categoria">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category);
                        }}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'error.light',
                            color: 'error.contrastText',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {category !== categories[categories.length - 1] && <Divider />}
              </Box>
            ))
          ) : (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhuma categoria encontrada
              </Typography>
            </Box>
          )}
        </Box>
      </Menu>

      {/* Modal de Criação */}
      <Dialog
        open={createModalOpen}
        onClose={handleCreateClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
            Nova Categoria
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ py: 1 }}>
            <TextField
              label="Nome da Categoria"
              value={createName}
              onChange={(e) => {
                setCreateName(e.target.value);
                if (createError) setCreateError('');
              }}
              fullWidth
              required
              variant="outlined"
              error={!!createError}
              helperText={createError}
              autoFocus
              disabled={createLoading}
              placeholder="Ex: Sobremesas, Pratos principais, Bebidas..."
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCreateClose} color="inherit" disabled={createLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            color="primary"
            disabled={createLoading || !createName.trim()}
            startIcon={createLoading ? <CircularProgress size={20} /> : null}
          >
            {createLoading ? 'Criando...' : 'Criar Categoria'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog
        open={editModalOpen}
        onClose={handleEditClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
            Editar Categoria
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ py: 1 }}>
            <TextField
              label="Nome da Categoria"
              value={editName}
              onChange={(e) => {
                setEditName(e.target.value);
                if (editError) setEditError('');
              }}
              fullWidth
              required
              variant="outlined"
              error={!!editError}
              helperText={editError}
              autoFocus
              disabled={editLoading}
              placeholder="Ex: Sobremesas, Pratos principais, Bebidas..."
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleEditClose} color="inherit" disabled={editLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            color="primary"
            disabled={editLoading || !editName.trim() || editName.trim() === selectedCategory?.name}
            startIcon={editLoading ? <CircularProgress size={20} /> : null}
          >
            {editLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog
        open={deleteModalOpen}
        onClose={handleDeleteClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 5,
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" />
            <Typography variant="h5" component="div" sx={{ fontWeight: 500 }}>
              Confirmar Exclusão
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box sx={{ py: 1 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              Esta ação não pode ser desfeita!
            </Alert>

            <Typography variant="body1" sx={{ mb: 2 }}>
              Tem certeza que deseja excluir a categoria{' '}
              <strong>&ldquo;{selectedCategory?.name}&rdquo;</strong>?
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Receitas que usam esta categoria não serão excluídas, mas perderão a referência à
              categoria.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDeleteClose} color="inherit" disabled={deleteLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleDeleteSubmit}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? 'Excluindo...' : 'Excluir Categoria'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RecipeCategoryMenu;
