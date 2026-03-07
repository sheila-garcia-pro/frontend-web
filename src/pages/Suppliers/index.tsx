import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Container,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { Search, Add, Edit, Delete, Visibility, Refresh } from '@mui/icons-material';
import * as supplierAPI from '@/services/api/suppliers';

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';

// Components
import { SupplierModal, SupplierDetailsModal } from '@/components/ui';

// Types
import { Supplier, CreateSupplierParams, UpdateSupplierParams } from '@/types/suppliers';

const SuppliersPage: React.FC = () => {
  // Estados para filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<boolean | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOption, setSortOption] = useState('name-asc');
  const itemsPerPage = 10;

  // Estados para modais
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

  // Hook customizado
  const {
    suppliers,
    categories,
    loading,
    error,
    paginationData,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    availableCategories,
    loadCategories,
  } = useSuppliers();

  // Buscar fornecedores com filtros
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        await searchSuppliers({
          page: currentPage,
          itemPerPage: itemsPerPage,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          name: searchTerm,
          sort: sortOption,
          active: activeFilter !== 'all' ? activeFilter : undefined,
        });
      } catch (error) {
        // Erro já tratado no hook
      }
    };

    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedCategory, searchTerm, sortOption, activeFilter]);

  // Handlers para criação/edição
  const handleOpenModal = (supplier?: Supplier) => {
    setSelectedSupplier(supplier || null);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSupplier(null);
  };

  const handleSaveSupplier = async (data: CreateSupplierParams) => {
    try {
      if (selectedSupplier) {
        // Editar
        const updateData: UpdateSupplierParams = {
          _id: selectedSupplier._id,
          ...data,
        };
        await updateSupplier(updateData);
      } else {
        // Criar
        await createSupplier(data);
      }
      handleCloseModal();

      // Recarregar lista
      searchSuppliers({
        page: currentPage,
        itemPerPage: itemsPerPage,
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        name: searchTerm,
        sort: sortOption,
        active: activeFilter !== 'all' ? activeFilter : undefined,
      });
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  // Handlers para detalhes
  const handleOpenDetails = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedSupplier(null);
  };

  // Handlers para exclusão
  const handleOpenDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSupplierToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (supplierToDelete) {
      try {
        await deleteSupplier(supplierToDelete._id);
        handleCloseDeleteDialog();

        // Ajustar página se necessário
        const newPage = suppliers.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        setCurrentPage(newPage);

        // Recarregar lista
        searchSuppliers({
          page: newPage,
          itemPerPage: itemsPerPage,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          name: searchTerm,
          sort: sortOption,
          active: activeFilter !== 'all' ? activeFilter : undefined,
        });
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  // Handler para limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setActiveFilter('all');
    setCurrentPage(1);
    setSortOption('name-asc');
  };

  // Handler para criar nova categoria
  const handleCreateCategory = async (categoryName: string): Promise<string> => {
    try {
      await supplierAPI.createSupplierCategory({ name: categoryName });

      // Recarregar lista de categorias
      await loadCategories();

      // Retornar o nome da categoria criada
      return categoryName;
    } catch (error) {
      // Propagar o erro para o modal tratar
      throw error;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fornecedores
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie seus fornecedores por categoria
        </Typography>
      </Box>

      {/* Filtros e Ações */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
          {/* Linha 1: Busca e Botão Adicionar */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenModal()}
              sx={{ minWidth: 200 }}
            >
              Novo Fornecedor
            </Button>
          </Stack>

          {/* Linha 2: Filtros */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as string | 'all');
                  setCurrentPage(1);
                }}
                label="Categoria"
              >
                <MenuItem value="all">Todas as Categorias</MenuItem>
                {availableCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true');
                  setCurrentPage(1);
                }}
                label="Status"
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="true">Ativos</MenuItem>
                <MenuItem value="false">Inativos</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                label="Ordenar por"
              >
                <MenuItem value="name-asc">Nome (A-Z)</MenuItem>
                <MenuItem value="name-desc">Nome (Z-A)</MenuItem>
                <MenuItem value="category-asc">Categoria (A-Z)</MenuItem>
                <MenuItem value="category-desc">Categoria (Z-A)</MenuItem>
              </Select>
            </FormControl>

            <Button variant="outlined" startIcon={<Refresh />} onClick={handleClearFilters}>
              Limpar Filtros
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Contador de Resultados */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {paginationData.total}{' '}
          {paginationData.total === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados'}
        </Typography>
      </Box>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum fornecedor encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map((supplier) => (
                <TableRow key={supplier._id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {supplier.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{supplier.category}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={supplier.active ? 'Ativo' : 'Inativo'}
                      size="small"
                      color={supplier.active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{supplier.phone}</Typography>
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
                      {supplier.address}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Ver detalhes">
                        <IconButton size="small" onClick={() => handleOpenDetails(supplier)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleOpenModal(supplier)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleOpenDeleteDialog(supplier)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      {paginationData.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={paginationData.totalPages}
            page={paginationData.currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Modal de Criação/Edição */}
      <SupplierModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSupplier}
        supplier={selectedSupplier}
        loading={loading}
        categories={categories}
        onCreateCategory={handleCreateCategory}
      />

      {/* Modal de Detalhes */}
      <SupplierDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        supplier={selectedSupplier}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o fornecedor <strong>{supplierToDelete?.name}</strong>?
            Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default SuppliersPage;
