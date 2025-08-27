import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Close, Edit, Delete, Add } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { UserNutritionalTable } from '../../../types/nutritionalTable';

interface UserNutritionalTablesManagerProps {
  open: boolean;
  onClose: () => void;
  tables: UserNutritionalTable[];
  loading: boolean;
  onCreateNew: () => void;
  onEdit: (table: UserNutritionalTable) => void;
  onDelete: (tableId: string) => Promise<void>;
}

const UserNutritionalTablesManager: React.FC<UserNutritionalTablesManagerProps> = ({
  open,
  onClose,
  tables,
  loading,
  onCreateNew,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (tableId: string) => {
    if (!tableId) return;

    setDeletingId(tableId);
    try {
      await onDelete(tableId);
    } catch (error) {
      console.error('Error deleting table:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const getNutritionalSummary = (table: UserNutritionalTable) => {
    const values = [];
    if (table.energyKcal) values.push(`${table.energyKcal} kcal`);
    if (table.carbohydrateG) values.push(`${table.carbohydrateG}g carbs`);
    if (table.proteinG) values.push(`${table.proteinG}g prot`);
    if (table.totalFatsG) values.push(`${table.totalFatsG}g gord`);

    return values.slice(0, 3); // Show max 3 values
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Typography variant="h6">Minhas Tabelas Nutricionais</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 0, py: 2 }}>
        <Box sx={{ px: 3, mb: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Gerencie suas tabelas nutricionais personalizadas. Você pode criar, editar e excluir
              suas próprias tabelas.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreateNew}
            fullWidth
            sx={{ mb: 2 }}
          >
            Criar Nova Tabela Nutricional
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {tables.length === 0 ? (
              <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  Você ainda não possui tabelas nutricionais personalizadas.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Clique em "Criar Nova Tabela Nutricional" para começar.
                </Typography>
              </Box>
            ) : (
              <List sx={{ px: 2 }}>
                {tables.map((table, index) => {
                  const summary = getNutritionalSummary(table);

                  return (
                    <React.Fragment key={table.id || `table-${index}`}>
                      <ListItem
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: 'background.default',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {table.tableName}
                              </Typography>
                              <Chip
                                label="Personalizada"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {table.description}
                              </Typography>
                              {summary.length > 0 && (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {summary.map((value, idx) => (
                                    <Chip
                                      key={idx}
                                      label={value}
                                      size="small"
                                      variant="filled"
                                      sx={{
                                        fontSize: '0.7rem',
                                        height: 20,
                                        bgcolor: 'primary.light',
                                        color: 'primary.contrastText',
                                      }}
                                    />
                                  ))}
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              edge="end"
                              onClick={() => onEdit(table)}
                              size="small"
                              sx={{ color: 'primary.main' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              edge="end"
                              onClick={() => handleDelete(table.id!)}
                              disabled={deletingId === table.id}
                              size="small"
                              sx={{ color: 'error.main' }}
                            >
                              {deletingId === table.id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <Delete fontSize="small" />
                              )}
                            </IconButton>
                          </Box>
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < tables.length - 1 && <Divider sx={{ my: 0.5 }} />}
                    </React.Fragment>
                  );
                })}
              </List>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserNutritionalTablesManager;
