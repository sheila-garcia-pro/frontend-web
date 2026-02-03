import React, { useState, useMemo } from 'react';
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

// Hooks
import { useSuppliers } from '@/hooks/useSuppliers';

// Components
import { SupplierModal, SupplierDetailsModal } from '@/components/ui';

// Types
import {
  Supplier,
  SupplierGroup,
  SUPPLIER_GROUP_LABELS,
  CreateSupplierParams,
  UpdateSupplierParams,
} from '@/types/suppliers';

const SuppliersPage: React.FC = () => {
  // Estados para filtros e paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<SupplierGroup | 'all'>('all');
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
    loading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    searchSuppliers,
    availableGroups,
  } = useSuppliers();

  // Buscar fornecedores com filtros
  const { data: suppliers, total } = useMemo(() => {
    return searchSuppliers({
      page: currentPage,
      itemPerPage: itemsPerPage,
      group: selectedGroup,
      name: searchTerm,
      sort: sortOption,
    });
  }, [searchSuppliers, currentPage, selectedGroup, searchTerm, sortOption]);

  const totalPages = Math.ceil(total / itemsPerPage);

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
      await deleteSupplier(supplierToDelete._id);
      handleCloseDeleteDialog();
      // Ajustar página se necessário
      if (suppliers.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  // Handler para limpar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGroup('all');
    setCurrentPage(1);
    setSortOption('name-asc');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Fornecedores
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gerencie seus fornecedores por grupo (açougue, hortifruti, mercado, etc.)
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
              <InputLabel>Grupo</InputLabel>
              <Select
                value={selectedGroup}
                onChange={(e) => {
                  setSelectedGroup(e.target.value as SupplierGroup | 'all');
                  setCurrentPage(1);
                }}
                label="Grupo"
              >
                <MenuItem value="all">Todos os Grupos</MenuItem>
                {Object.entries(SUPPLIER_GROUP_LABELS).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
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
                <MenuItem value="group-asc">Grupo (A-Z)</MenuItem>
                <MenuItem value="group-desc">Grupo (Z-A)</MenuItem>
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
          {total} {total === 1 ? 'fornecedor encontrado' : 'fornecedores encontrados'}
        </Typography>
      </Box>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Grupo</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell>Endereço</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
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
                    <Chip
                      label={SUPPLIER_GROUP_LABELS[supplier.group]}
                      size="small"
                      color="primary"
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
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
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
