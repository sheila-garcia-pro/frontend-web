import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Refresh,
  LocalOffer as CouponIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { useCoupons } from '@/hooks/useCoupons';
import { useSuppliers } from '@/hooks/useSuppliers';
import { useDevice } from '@/hooks/useDevice';
import { CouponModal, CouponDetailsModal } from '@/components/ui';
import { Coupon, CreateCouponParams, UpdateCouponParams } from '@/types/coupons';

const CouponsPage: React.FC = () => {
  // Estados de filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<string | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('name-asc');
  const itemsPerPage = 10;

  // Estados de modais
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  // Hooks
  const {
    coupons,
    loading,
    paginationData,
    fetchCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    hasSupplier,
  } = useCoupons();
  const { suppliers } = useSuppliers();
  const { isMobile } = useDevice();

  // Carregar cupons ao montar e quando filtros mudarem
  useEffect(() => {
    const loadCoupons = async () => {
      fetchCoupons({
        page: currentPage,
        itemPerPage: itemsPerPage,
        name: searchTerm || undefined,
        supplierId: selectedSupplier !== 'all' ? selectedSupplier : undefined,
        sort: sortOption,
      });
    };

    loadCoupons();
  }, [currentPage, searchTerm, selectedSupplier, sortOption, fetchCoupons]);

  // Handlers de modal
  const handleOpenModal = (coupon?: Coupon) => {
    setSelectedCoupon(coupon || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCoupon(null);
  };

  const handleSaveCoupon = async (data: CreateCouponParams) => {
    try {
      if (selectedCoupon) {
        // Editar cupom existente
        const updateData: UpdateCouponParams = {
          ...data,
        };
        updateCoupon(selectedCoupon._id, updateData);
      } else {
        // Criar novo cupom
        createCoupon(data);
      }
      handleCloseModal();

      // Recarregar lista após 1 segundo
      setTimeout(() => {
        fetchCoupons({
          page: currentPage,
          itemPerPage: itemsPerPage,
          name: searchTerm || undefined,
          supplierId: selectedSupplier !== 'all' ? selectedSupplier : undefined,
          sort: sortOption,
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar cupom:', error);
    }
  };

  const handleOpenDetails = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedCoupon(null);
  };

  const handleOpenDeleteDialog = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;

    try {
      deleteCoupon(couponToDelete._id);
      handleCloseDeleteDialog();

      // Ajustar página se necessário
      const newPage = coupons.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      setCurrentPage(newPage);

      // Recarregar lista após 1 segundo
      setTimeout(() => {
        fetchCoupons({
          page: newPage,
          itemPerPage: itemsPerPage,
          name: searchTerm || undefined,
          supplierId: selectedSupplier !== 'all' ? selectedSupplier : undefined,
          sort: sortOption,
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao deletar cupom:', error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSupplier('all');
    setSortOption('name-asc');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchCoupons({
      page: currentPage,
      itemPerPage: itemsPerPage,
      name: searchTerm || undefined,
      supplierId: selectedSupplier !== 'all' ? selectedSupplier : undefined,
      sort: sortOption,
    });
  };

  // Obter nome do fornecedor
  const getSupplierName = (coupon: Coupon): string => {
    if (hasSupplier(coupon)) {
      return coupon.supplier.name;
    }
    return 'Sem fornecedor';
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CouponIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Cupons
        </Typography>
      </Box>

      {/* Filtros e Busca */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' },
            flexWrap: 'wrap',
          }}
        >
          {/* Campo de busca */}
          <TextField
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' }, minWidth: 200 }}
          />

          {/* Filtro de Fornecedor */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Fornecedor</InputLabel>
            <Select
              value={selectedSupplier}
              onChange={(e) => {
                setSelectedSupplier(e.target.value as string);
                setCurrentPage(1);
              }}
              label="Fornecedor"
            >
              <MenuItem value="all">Todos</MenuItem>
              {suppliers.map((supplier) => (
                <MenuItem key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Ordenação */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              label="Ordenar por"
            >
              <MenuItem value="name-asc">Nome (A-Z)</MenuItem>
              <MenuItem value="name-desc">Nome (Z-A)</MenuItem>
              <MenuItem value="recent">Mais recentes</MenuItem>
              <MenuItem value="oldest">Mais antigos</MenuItem>
            </Select>
          </FormControl>

          {/* Botões de ação */}
          <Box sx={{ display: 'flex', gap: 1, ml: { md: 'auto' } }}>
            <Tooltip title="Limpar filtros">
              <IconButton onClick={handleClearFilters} color="default">
                <Delete />
              </IconButton>
            </Tooltip>
            <Tooltip title="Atualizar">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenModal()}>
              Adicionar Cupom
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Tabela Desktop/Tablet */}
      {!isMobile && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell>Fornecedor</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Nenhum cupom encontrado
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon._id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CouponIcon fontSize="small" color="primary" />
                        {coupon.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 300,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {coupon.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {hasSupplier(coupon) ? (
                        <Chip
                          icon={<StoreIcon />}
                          label={coupon.supplier.name}
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Sem fornecedor
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                        <Tooltip title="Visualizar">
                          <IconButton size="small" onClick={() => handleOpenDetails(coupon)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenModal(coupon)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(coupon)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cards Mobile */}
      {isMobile && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            <Paper sx={{ p: 2 }}>
              <Typography align="center">Carregando...</Typography>
            </Paper>
          ) : coupons.length === 0 ? (
            <Paper sx={{ p: 2 }}>
              <Typography align="center">Nenhum cupom encontrado</Typography>
            </Paper>
          ) : (
            coupons.map((coupon) => (
              <Card key={coupon._id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CouponIcon color="primary" />
                    <Typography variant="h6">{coupon.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {coupon.description}
                  </Typography>
                  {hasSupplier(coupon) && (
                    <Chip
                      icon={<StoreIcon />}
                      label={coupon.supplier.name}
                      size="small"
                      variant="outlined"
                      sx={{ mt: 1 }}
                    />
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<Visibility />}
                    onClick={() => handleOpenDetails(coupon)}
                  >
                    Ver
                  </Button>
                  <Button size="small" startIcon={<Edit />} onClick={() => handleOpenModal(coupon)}>
                    Editar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleOpenDeleteDialog(coupon)}
                  >
                    Excluir
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      )}

      {/* Paginação */}
      {!loading && coupons.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={paginationData.totalPages}
            page={paginationData.currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Modais */}
      <CouponModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveCoupon}
        coupon={selectedCoupon}
        loading={loading}
      />

      <CouponDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        coupon={selectedCoupon}
        onEdit={() => {
          handleCloseDetails();
          handleOpenModal(selectedCoupon!);
        }}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o cupom "{couponToDelete?.name}"? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} color="error" disabled={loading}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CouponsPage;
