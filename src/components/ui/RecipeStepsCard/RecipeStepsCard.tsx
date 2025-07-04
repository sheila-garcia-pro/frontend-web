import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface RecipeStepsCardProps {
  recipeId: string;
  initialSteps?: string[];
  onStepsUpdate?: (steps: string[]) => void;
}

const RecipeStepsCard: React.FC<RecipeStepsCardProps> = ({
  recipeId: _recipeId,
  initialSteps = [],
  onStepsUpdate,
}) => {
  const [steps, setSteps] = useState<string[]>(initialSteps);
  const [newStep, setNewStep] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    setSteps(initialSteps);
  }, [initialSteps]);

  const handleAddStep = () => {
    if (newStep.trim()) {
      const updatedSteps = [...steps, newStep.trim()];
      setSteps(updatedSteps);
      setNewStep('');
      onStepsUpdate?.(updatedSteps);
    }
  };

  const handleEditStep = (index: number) => {
    setEditingIndex(index);
    setEditingText(steps[index]);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingText.trim()) {
      const updatedSteps = [...steps];
      updatedSteps[editingIndex] = editingText.trim();
      setSteps(updatedSteps);
      setEditingIndex(null);
      setEditingText('');
      onStepsUpdate?.(updatedSteps);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText('');
  };

  const handleDeleteStep = (index: number) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
    onStepsUpdate?.(updatedSteps);
  };

  const handleKeyPress = (event: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (event.key === 'Enter') {
      if (action === 'add') {
        handleAddStep();
      } else {
        handleSaveEdit();
      }
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          📝 Modo de Preparo
        </Typography>
        <Chip
          label={`${steps.length} passos`}
          size="small"
          sx={{ ml: 2 }}
          color={steps.length > 0 ? 'success' : 'default'}
        />
      </Box>

      {/* Campo para adicionar novo passo */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          label="Adicionar novo passo"
          value={newStep}
          onChange={(e) => setNewStep(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, 'add')}
          multiline
          rows={2}
          placeholder="Ex: Pré-aqueça o forno a 180°C..."
        />
        <Button
          variant="contained"
          onClick={handleAddStep}
          disabled={!newStep.trim()}
          startIcon={<AddIcon />}
          sx={{ minWidth: 120 }}
        >
          Adicionar
        </Button>
      </Box>

      {/* Lista de passos */}
      {steps.length > 0 ? (
        <List sx={{ bgcolor: 'background.default', borderRadius: 1 }}>
          {steps.map((step, index) => (
            <ListItem key={index} sx={{ py: 1.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <Chip
                      label={index + 1}
                      size="small"
                      color="primary"
                      sx={{ minWidth: 32, height: 24 }}
                    />
                    {editingIndex === index ? (
                      <TextField
                        fullWidth
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, 'edit')}
                        multiline
                        rows={2}
                        size="small"
                        autoFocus
                      />
                    ) : (
                      <Typography variant="body1" sx={{ flex: 1 }}>
                        {step}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction>
                {editingIndex === index ? (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={handleSaveEdit}
                      color="primary"
                      disabled={!editingText.trim()}
                    >
                      <SaveIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleCancelEdit} color="secondary">
                      <CancelIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleEditStep(index)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteStep(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            color: 'text.secondary',
            bgcolor: 'background.default',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Typography variant="body1">Nenhum passo adicionado ainda</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Use o campo acima para adicionar os passos do modo de preparo
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default RecipeStepsCard;
