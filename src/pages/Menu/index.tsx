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
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  MenuBook,
  Restaurant,
  MoreVert,
  Groups,
  FoodBank,
  Visibility,
  PictureAsPdf,
  Download,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addNotification } from '../../store/slices/uiSlice';
import { getUserMenus, deleteMenu } from '../../services/api/menu';
import { MenuListItem, MenusResponse } from '../../types/menu';
import MenuModal from '../../components/ui/MenuModal/index';
import MenuDeleteModal from '../../components/ui/MenuDeleteModal/index';
import { MenuActions } from '../../components/pdf';
import { useMenuPDF } from '../../hooks/useMenuPDF';
import { usePDFModal } from '../../hooks/usePDFModal';
import { PDFModal } from '../../components/pdf';

// RBAC
import { SimpleIfPermission as IfPermission } from '@/components/security';

const MenuPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Hooks para PDF
  const { isGenerating, downloadPDF, previewPDF, convertMenuToPDFData } = useMenuPDF();
  const { isModalOpen, pdfUrl, openModal, closeModal } = usePDFModal();

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

  // Estados do menu de ações
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuActionId, setMenuActionId] = useState<string | null>(null);

  // Função para carregar cardápios
  const loadMenus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserMenus({
        page: currentPage,
        itemPerPage: 12,
        search: searchTerm || undefined,
      });

      // Simulação: adicionar dados de porções (remover quando a API fornecer esses dados)
      const menusWithPortions = response.data.map((menu) => ({
        ...menu,
        totalPortions: Math.floor(Math.random() * 20) + 5, // Entre 5 e 24 porções
      }));

      setMenus(menusWithPortions);
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

  const handleMenuAction = (event: React.MouseEvent<HTMLElement>, menuId: string) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setMenuActionId(menuId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuActionId(null);
  };

  const handleMenuActionClick = (
    action: 'view' | 'edit' | 'delete' | 'preview' | 'download',
    menu: MenuListItem,
  ) => {
    handleCloseMenu();

    switch (action) {
      case 'view':
        handleViewMenu(menu);
        break;
      case 'edit':
        handleEditMenu(menu);
        break;
      case 'delete':
        handleDeleteMenu(menu);
        break;
      case 'preview':
        handlePreviewPDF(menu);
        break;
      case 'download':
        handleDownloadPDF(menu);
        break;
    }
  };

  // Handlers para PDF
  const handlePreviewPDF = async (menu: MenuListItem) => {
    try {
      const pdfData = await convertMenuToPDFData(menu);
      const url = await previewPDF(pdfData);
      openModal(url);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao gerar visualização do PDF',
          type: 'error',
          duration: 4000,
        }),
      );
    }
  };

  const handleDownloadPDF = async (menu: MenuListItem) => {
    try {
      const pdfData = await convertMenuToPDFData(menu);
      await downloadPDF(pdfData);
      dispatch(
        addNotification({
          message: 'PDF baixado com sucesso!',
          type: 'success',
          duration: 3000,
        }),
      );
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao baixar PDF',
          type: 'error',
          duration: 4000,
        }),
      );
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 1,
            }}
          >
            Cardápios
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            Gerencie seus cardápios e organize suas receitas
          </Typography>
          {!loading && total > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Chip
                label={`${total} cardápio${total !== 1 ? 's' : ''}`}
                size="small"
                color="primary"
                variant="outlined"
              />
              {searchTerm && (
                <Chip
                  label={`${menus.length} resultado${menus.length !== 1 ? 's' : ''}`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        <IfPermission permission="create_menu">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleCreateMenu}
            sx={{
              borderRadius: 3,
              px: 3,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: (theme) => theme.shadows[4],
              '&:hover': {
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
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
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: (theme) => theme.shadows[2],
              },
              '&.Mui-focused': {
                boxShadow: (theme) => theme.shadows[4],
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: 2,
                },
              },
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
        <Card
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: '2px dashed',
            borderColor: 'grey.300',
          }}
        >
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: 'primary.50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
              mx: 'auto',
            }}
          >
            <MenuBook sx={{ fontSize: 56, color: 'primary.main' }} />
          </Box>

          <Typography variant="h5" color="text.primary" gutterBottom sx={{ fontWeight: 600 }}>
            {searchTerm ? 'Nenhum cardápio encontrado' : 'Nenhum cardápio criado ainda'}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}
          >
            {searchTerm
              ? `Não encontramos cardápios com o termo "${searchTerm}". Tente ajustar os termos de busca ou criar um novo cardápio.`
              : 'Crie seu primeiro cardápio para começar a organizar suas receitas e facilitar o planejamento das suas refeições.'}
          </Typography>

          <IfPermission permission="create_menu">
            {!searchTerm && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Add />}
                onClick={handleCreateMenu}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: (theme) => theme.shadows[4],
                  '&:hover': {
                    boxShadow: (theme) => theme.shadows[8],
                  },
                }}
              >
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
                    position: 'relative',
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'grey.200',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[12],
                      borderColor: 'primary.main',
                    },
                  }}
                  onClick={() => handleViewMenu(menu)}
                >
                  {/* Menu de ações */}
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuAction(e, menu._id)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      '&:hover': {
                        bgcolor: 'grey.100',
                      },
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>

                  <CardContent sx={{ flexGrow: 1, p: 3, textAlign: 'center' }}>
                    {/* Ícone do cardápio */}
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 3,
                        bgcolor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        mx: 'auto',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      <Restaurant sx={{ fontSize: 32, color: 'white' }} />
                    </Box>

                    {/* Nome do cardápio */}
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        color: 'text.primary',
                        lineHeight: 1.3,
                      }}
                    >
                      {menu.name}
                    </Typography>

                    {/* Descrição se houver */}
                    {menu.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.875rem',
                        }}
                      >
                        {menu.description}
                      </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Estatísticas do cardápio */}
                    <Box
                      sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 0.5,
                          }}
                        >
                          <FoodBank sx={{ fontSize: 16, color: 'primary.main', mr: 0.5 }} />
                          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {menu.totalItems}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Items
                        </Typography>
                      </Box>

                      {menu.totalPortions && (
                        <>
                          <Box sx={{ width: '1px', height: 24, bgcolor: 'divider' }} />
                          <Box sx={{ textAlign: 'center' }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mb: 0.5,
                              }}
                            >
                              <Groups sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                              <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: 'success.main' }}
                              >
                                {menu.totalPortions}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              Porções
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Menu de ações */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 160,
                borderRadius: 2,
                boxShadow: (theme) => theme.shadows[8],
              },
            }}
          >
            {(() => {
              const menu = menus.find((m) => m._id === menuActionId);
              if (!menu) return null;

              return [
                <MenuItem
                  key="view"
                  onClick={() => handleMenuActionClick('view', menu)}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <Visibility fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Visualizar" />
                </MenuItem>,

                <MenuItem
                  key="preview-pdf"
                  onClick={() => handleMenuActionClick('preview', menu)}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <PictureAsPdf fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Visualizar PDF" />
                </MenuItem>,

                <MenuItem
                  key="download-pdf"
                  onClick={() => handleMenuActionClick('download', menu)}
                  sx={{ py: 1 }}
                >
                  <ListItemIcon>
                    <Download fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Baixar PDF" />
                </MenuItem>,

                <Divider key="divider-1" />,

                <IfPermission key="edit-permission" permission="update_menu">
                  <MenuItem onClick={() => handleMenuActionClick('edit', menu)} sx={{ py: 1 }}>
                    <ListItemIcon>
                      <Edit fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Editar" />
                  </MenuItem>
                </IfPermission>,

                <IfPermission key="delete-permission" permission="delete_menu">
                  <>
                    <Divider />
                    <MenuItem
                      onClick={() => handleMenuActionClick('delete', menu)}
                      sx={{ py: 1, color: 'error.main' }}
                    >
                      <ListItemIcon>
                        <Delete fontSize="small" color="error" />
                      </ListItemIcon>
                      <ListItemText primary="Excluir" />
                    </MenuItem>
                  </>
                </IfPermission>,
              ];
            })()}
          </Menu>

          {/* Paginação e informações */}
          <Box sx={{ mt: 4 }}>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                      fontWeight: 500,
                    },
                    '& .Mui-selected': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    },
                  }}
                />
              </Box>
            )}

            {/* Informações de resultados */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? (
                  <>
                    Exibindo <strong>{menus.length}</strong> de <strong>{total}</strong> cardápio
                    {total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                    {searchTerm && (
                      <>
                        {' '}
                        para "<em>{searchTerm}</em>"
                      </>
                    )}
                  </>
                ) : (
                  <>
                    Exibindo <strong>{menus.length}</strong> de <strong>{total}</strong> cardápio
                    {total !== 1 ? 's' : ''}
                  </>
                )}
              </Typography>
            </Box>
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

      <PDFModal
        isOpen={isModalOpen}
        pdfUrl={pdfUrl}
        onClose={closeModal}
        title={selectedMenu?.name || 'Cardápio'}
      />
    </Container>
  );
};

export default MenuPage;
