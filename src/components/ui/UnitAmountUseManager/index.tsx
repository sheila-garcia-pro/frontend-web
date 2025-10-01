import React, { useState, useEffect, useCallback } from 'react';
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
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Search, Add, Refresh, Edit, Delete, Straighten } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { getUserUnitsAmountUse } from '../../../services/api/unitsAmountUse';
import { UnitAmountUse } from '../../../types/unitAmountUse';
import UnitAmountUseCreateModal from '../UnitAmountUseMenu/UnitAmountUseCreateModal';
import UnitAmountUseEditModal from '../UnitAmountUseMenu/UnitAmountUseEditModal';
import UnitAmountUseDeleteModal from '../UnitAmountUseMenu/UnitAmountUseDeleteModal';

interface UnitAmountUseManagerProps {
  onUnitSelected?: (unit: UnitAmountUse) => void;
  compact?: boolean;
}

const UnitAmountUseManager: React.FC<UnitAmountUseManagerProps> = ({
  onUnitSelected,
  compact = false,
}) => {
  const [units, setUnits] = useState<UnitAmountUse[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<UnitAmountUse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitAmountUse | null>(null);

  const dispatch = useDispatch();

  const loadUnits = useCallback(async () => {
    setLoading(true);
    try {
      const unitsData = await getUserUnitsAmountUse();
      setUnits(unitsData);
      setFilteredUnits(unitsData);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      dispatch(
        addNotification({
          message: 'Erro ao carregar unidades de medida',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  useEffect(() => {
    const filtered = units.filter(
      (unit) =>
        unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.quantity.toString().includes(searchTerm) ||
        unit.unitMeasure.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUnits(filtered);
  }, [units, searchTerm]);

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

  const handleUnitCreated = () => {
    loadUnits();
    setCreateModalOpen(false);
  };

  const handleUnitUpdated = () => {
    loadUnits();
    setEditModalOpen(false);
    setSelectedUnit(null);
  };

  const handleUnitDeleted = () => {
    loadUnits();
    setDeleteModalOpen(false);
    setSelectedUnit(null);
  };

  const handleCloseModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedUnit(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card elevation={compact ? 1 : 3}>
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Straighten color="primary" />
            <Typography variant={compact ? 'h6' : 'h5'} sx={{ fontWeight: 600 }}>
              Minhas Unidades de Medida
            </Typography>
            <Chip label={units.length} size="small" color="primary" variant="outlined" />
          </Box>

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Buscar unidades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size={compact ? 'small' : 'medium'}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1, minWidth: 200 }}
            />
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleCreateUnit}
              size={compact ? 'small' : 'medium'}
            >
              Nova Unidade
            </Button>
            <IconButton onClick={loadUnits} color="primary" size={compact ? 'small' : 'medium'}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {filteredUnits.length === 0 ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            {searchTerm
              ? `Nenhuma unidade encontrada para "${searchTerm}"`
              : 'Nenhuma unidade de medida cadastrada. Clique em "Nova Unidade" para criar.'}
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table size={compact ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Quantidade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unidade</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Descrição Completa</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUnits.map((unit) => (
                  <TableRow
                    key={unit.id}
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      cursor: onUnitSelected ? 'pointer' : 'default',
                    }}
                    onClick={() => onUnitSelected?.(unit)}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{unit.name}</TableCell>
                    <TableCell>{unit.quantity}</TableCell>
                    <TableCell>
                      <Chip
                        label={unit.unitMeasure}
                        size="small"
                        variant="outlined"
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>
                      {unit.name} ({unit.quantity} {unit.unitMeasure})
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <Tooltip title="Editar unidade">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditUnit(unit);
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir unidade">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUnit(unit);
                            }}
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
        )}

        {/* Estatísticas */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption" color="text.secondary">
            Total: {units.length} unidades
          </Typography>
          {searchTerm && (
            <Typography variant="caption" color="text.secondary">
              Filtradas: {filteredUnits.length}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Modais */}
      <UnitAmountUseCreateModal
        open={createModalOpen}
        onClose={handleCloseModals}
        onUnitCreated={handleUnitCreated}
      />

      <UnitAmountUseEditModal
        open={editModalOpen}
        onClose={handleCloseModals}
        unit={selectedUnit}
        onUnitUpdated={handleUnitUpdated}
      />

      <UnitAmountUseDeleteModal
        open={deleteModalOpen}
        onClose={handleCloseModals}
        unit={selectedUnit}
        onUnitDeleted={handleUnitDeleted}
      />
    </Card>
  );
};

export default UnitAmountUseManager;
