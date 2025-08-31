import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Pagination,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search, Add, Edit, Delete, MenuBook, Restaurant, MoreVert } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNotification } from '../../store/slices/uiSlice';
import { getUserMenus, deleteMenu } from '../../services/api/menu';
import { MenuListItem, MenusResponse } from '../../types/menu';
import MenuModal from '../../components/ui/MenuModal/index';
import MenuDeleteModal from '../../components/ui/MenuDeleteModal/index';

// RBAC
import { SimpleIfPermission as IfPermission } from '@/components/security';

const MenuPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Estados da página
  const [menus, setMenus] = useState<MenuListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Estados dos modais
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuListItem | null>(null);
  const [editMode, setEditMode] = useState(false);

  // Função para carregar cardápios
  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserMenus({
        page: currentPage,
        itemPerPage: 12,
        search: searchTerm || undefined,
      });

      setMenus(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao carregar cardápios:', error);
      dispatch(
        addNotification({
          message: 'Erro ao carregar cardápios. Tente novamente.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, dispatch]);

  // Carregar dados iniciais
  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset para primeira página ao buscar
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleViewMenu = (menu: MenuListItem) => {
    navigate(`/menu/${menu._id}`);
  };

  const handleCreateMenu = () => {
    setSelectedMenu(null);
    setEditMode(false);
    setMenuModalOpen(true);
  };

  const handleEditMenu = (menu: MenuListItem) => {
    setSelectedMenu(menu);
    setEditMode(true);
    setMenuModalOpen(true);
  };

  const handleDeleteMenu = (menu: MenuListItem) => {
    setSelectedMenu(menu);
    setDeleteModalOpen(true);
  };

  const handleMenuSaved = () => {
    setMenuModalOpen(false);
    setSelectedMenu(null);
    setEditMode(false);
    loadMenus(); // Recarregar lista
  };

  const handleMenuDeleted = () => {
    setDeleteModalOpen(false);
    setSelectedMenu(null);
    loadMenus(); // Recarregar lista
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box
        sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
            Cardápios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie seus cardápios e organize suas receitas
          </Typography>
        </Box>

        <IfPermission permission="create_menu">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreateMenu}
            sx={{ borderRadius: 3, px: 3 }}
          >
            Novo cardápio
          </Button>
        </IfPermission>
      </Box>

      {/* Barra de busca */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Digite aqui o nome do cardápio..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />
      </Box>

      {/* Lista de cardápios */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : menus.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <MenuBook sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm ? 'Nenhum cardápio encontrado' : 'Nenhum cardápio criado ainda'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Crie seu primeiro cardápio para começar a organizar suas receitas'}
          </Typography>
          <IfPermission permission="create_menu">
            {!searchTerm && (
              <Button variant="contained" startIcon={<Add />} onClick={handleCreateMenu}>
                Criar primeiro cardápio
              </Button>
            )}
          </IfPermission>
        </Card>
      ) : (
        <>
          {/* Grid de cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {menus.map((menu) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={menu._id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                  onClick={() => handleViewMenu(menu)}
                >
                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    {/* Ícone do cardápio */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: 2,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        mx: 'auto',
                      }}
                    >
                      <Restaurant sx={{ fontSize: 40, color: 'white' }} />
                    </Box>

                    {/* Nome do cardápio */}
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        textAlign: 'center',
                        mb: 1,
                      }}
                    >
                      {menu.name}
                    </Typography>

                    {/* Informações do cardápio */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Chip
                        label={`${menu.totalItems} items`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                    <IfPermission permission="update_menu">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMenu(menu);
                        }}
                        color="primary"
                        size="small"
                      >
                        <Edit />
                      </IconButton>
                    </IfPermission>

                    <IfPermission permission="delete_menu">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMenu(menu);
                        }}
                        color="error"
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </IfPermission>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Paginação */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}

          {/* Informações de resultados */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Exibindo {menus.length} de {total} cardápios
            </Typography>
          </Box>
        </>
      )}

      {/* Modais */}
      <MenuModal
        open={menuModalOpen}
        onClose={() => setMenuModalOpen(false)}
        onMenuSaved={handleMenuSaved}
        menu={selectedMenu}
        editMode={editMode}
      />

      <MenuDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onMenuDeleted={handleMenuDeleted}
        menu={selectedMenu}
      />
    </Container>
  );
};

export default MenuPage;
