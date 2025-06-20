import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { getUserRecipeCategories, RecipeCategory } from '../../../services/api/recipeCategories';
import RecipeCategoryCreateModal from './RecipeCategoryCreateModal';
import RecipeCategoryEditModal from './RecipeCategoryEditModal';
import RecipeCategoryDeleteModal from './RecipeCategoryDeleteModal';

interface RecipeCategoryMenuProps {
  onCategoryUpdated?: () => void;
}

const RecipeCategoryMenu: React.FC<RecipeCategoryMenuProps> = ({ onCategoryUpdated }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [categories, setCategories] = useState<RecipeCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | null>(null);

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

  return (
    <>
      <Tooltip title="Gerenciar categorias">
        <IconButton
          onClick={handleClick}
          color="primary"
          aria-label="gerenciar categorias"
          sx={{ borderRadius: 2 }}
        >
          <CategoryIcon />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 8,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            minWidth: 250,
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
        <MenuItem onClick={handleCreateCategory}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nova Categoria</ListItemText>
        </MenuItem>

        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <Box key={category.id}>
              <MenuItem disabled sx={{ pl: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  {category.name}
                </Typography>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category);
                    }}
                    sx={{ color: 'text.secondary' }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category);
                    }}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              </MenuItem>
            </Box>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              Nenhuma categoria encontrada
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Modais */}
      <RecipeCategoryCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCategoryCreated={handleCategoryOperation}
      />

      <RecipeCategoryEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        category={selectedCategory}
        onCategoryUpdated={handleCategoryOperation}
      />

      <RecipeCategoryDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        category={selectedCategory}
        onCategoryDeleted={handleCategoryOperation}
      />
    </>
  );
};

export default RecipeCategoryMenu;
