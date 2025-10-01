import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Pagination,
  Container,
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
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Search, Add, Refresh, Edit, Delete } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { getUserUnitsAmountUse } from '../../services/api/unitsAmountUse';
import { UnitAmountUse } from '../../types/unitAmountUse';
import UnitAmountUseCreateModal from '../../components/ui/UnitAmountUseMenu/UnitAmountUseCreateModal';
import UnitAmountUseEditModal from '../../components/ui/UnitAmountUseMenu/UnitAmountUseEditModal';
import UnitAmountUseDeleteModal from '../../components/ui/UnitAmountUseMenu/UnitAmountUseDeleteModal';

const UnitsAmountUsePage: React.FC = () => {
  const [units, setUnits] = useState<UnitAmountUse[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<UnitAmountUse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitAmountUse | null>(null);

  const dispatch = useDispatch();
  const itemsPerPage = 10;

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const unitsData = await getUserUnitsAmountUse();
      setUnits(unitsData);
      setFilteredUnits(unitsData);
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
      dispatch(
        addNotification({
          message: 'Erro ao carregar unidades de medida.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  // Filtrar unidades com base no termo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUnits(units);
    } else {
      const filtered = units.filter(
        (unit) =>
          unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.unitMeasure.toLowerCase().includes(searchTerm.toLowerCase()) ||
          unit.quantity.toString().includes(searchTerm),
      );
      setFilteredUnits(filtered);
    }
    setPage(1);
  }, [searchTerm, units]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleCreateUnit = () => {
    setCreateModalOpen(true);
  };

  const handleEditUnit = (unit: UnitAmountUse) => {
    setSelectedUnit(unit);
    setEditModalOpen(true);
  };

  const handleDeleteUnit = (unit: UnitAmountUse) => {
    setSelectedUnit(unit);
    setDeleteModalOpen(true);
  };

  const handleRefresh = () => {
    loadUnits();
  };

  const handleUnitOperation = () => {
    loadUnits();
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedUnit(null);
  };

  // Calcular itens da página atual
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredUnits.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
          Unidades de Medida
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie suas unidades de medida personalizadas
        </Typography>
      </Box>

      {/* Estatísticas */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {units.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unidades Cadastradas
              </Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {filteredUnits.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm ? 'Resultados da Busca' : 'Total Disponível'}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Barra de ações */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Buscar unidades..."
          value={searchTerm}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ minWidth: 250, flex: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleCreateUnit}
          sx={{ textTransform: 'none' }}
        >
          Nova Unidade
        </Button>
        <Tooltip title="Recarregar">
          <IconButton onClick={handleRefresh} disabled={loading}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Conteúdo principal */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredUnits.length === 0 ? (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          {searchTerm
            ? 'Nenhuma unidade de medida encontrada com os critérios de busca.'
            : 'Nenhuma unidade de medida cadastrada ainda. Clique em "Nova Unidade" para começar.'}
        </Alert>
      ) : (
        <>
          {/* Tabela */}
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unidade de Medida</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((unit) => (
                  <TableRow key={unit.id} hover>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {unit.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{unit.quantity}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{unit.unitMeasure}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEditUnit(unit)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteUnit(unit)}
                            sx={{ color: 'error.main' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Paginação */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Modais */}
      <UnitAmountUseCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onUnitCreated={handleUnitOperation}
      />

      <UnitAmountUseEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        unit={selectedUnit}
        onUnitUpdated={handleUnitOperation}
      />

      <UnitAmountUseDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        unit={selectedUnit}
        onUnitDeleted={handleUnitOperation}
      />
    </Container>
  );
};

export default UnitsAmountUsePage;
