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
  Straighten as UnitIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { getUserUnitsAmountUse } from '../../../services/api/unitsAmountUse';
import { UnitAmountUse } from '../../../types/unitAmountUse';

// Imports temporariamente comentados para testes
// import UnitAmountUseCreateModal from './UnitAmountUseCreateModal';
// import UnitAmountUseEditModal from './UnitAmountUseEditModal';
// import UnitAmountUseDeleteModal from './UnitAmountUseDeleteModal';

interface UnitAmountUseMenuProps {
  onUnitsUpdated?: () => void;
}

const UnitAmountUseMenu: React.FC<UnitAmountUseMenuProps> = ({ onUnitsUpdated }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [units, setUnits] = useState<UnitAmountUse[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<UnitAmountUse | null>(null);

  const dispatch = useDispatch();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    loadUnits();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const loadUnits = async () => {
    setLoading(true);
    try {
      const unitsData = await getUserUnitsAmountUse();
      setUnits(unitsData);
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
  };

  const handleCreateUnit = () => {
    setCreateModalOpen(true);
    handleClose();
  };

  const handleEditUnit = (unit: UnitAmountUse) => {
    setSelectedUnit(unit);
    setEditModalOpen(true);
    handleClose();
  };

  const handleDeleteUnit = (unit: UnitAmountUse) => {
    setSelectedUnit(unit);
    setDeleteModalOpen(true);
    handleClose();
  };

  const handleUnitOperation = () => {
    loadUnits();
    if (onUnitsUpdated) {
      onUnitsUpdated();
    }
  };

  return (
    <>
      <Tooltip title="Gerenciar unidades de medida">
        <IconButton
          onClick={handleClick}
          color="primary"
          aria-label="gerenciar unidades de medida"
          sx={{ borderRadius: 2 }}
        >
          <UnitIcon />
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
            minWidth: 300,
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
        <MenuItem onClick={handleCreateUnit}>
          <ListItemIcon>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Nova Unidade de Medida</ListItemText>
        </MenuItem>

        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={20} />
          </Box>
        ) : units.length > 0 ? (
          units.map((unit) => (
            <Box key={unit.id}>
              <MenuItem disabled sx={{ pl: 1 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                    {unit.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {unit.quantity} {unit.unitMeasure}
                  </Typography>
                </Box>
                <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditUnit(unit);
                    }}
                    sx={{ color: 'text.secondary' }}
                  >
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUnit(unit);
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
              Nenhuma unidade de medida encontrada
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Modais temporariamente comentados */}
      {/*
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
      */}
    </>
  );
};

export default UnitAmountUseMenu;
