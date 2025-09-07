import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Alert,
  Stack,
} from '@mui/material';
import { Close, ExpandMore } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {
  UserNutritionalTable,
  CreateUserNutritionalTableRequest,
} from '../../../types/nutritionalTable';

interface UserNutritionalTableModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateUserNutritionalTableRequest) => Promise<void>;
  table?: UserNutritionalTable | null;
  loading?: boolean;
}

const UserNutritionalTableModal: React.FC<UserNutritionalTableModalProps> = ({
  open,
  onClose,
  onSave,
  table,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CreateUserNutritionalTableRequest>({
    tableName: '', // Será preenchido automaticamente com a description
    description: '',
    carbohydrateG: '',
    energyKcal: '',
    proteinG: '',
    totalFatsG: '',
    totalSugarG: '',
    addSugarG: '',
    saturatedFatsG: '',
    transFatsG: '',
    dietaryFiberG: '',
    sodiumMG: '',
    monounsaturatedG: '',
    polyunsaturatedG: '',
    cholesterolMG: '',
    calciumMG: '',
    magnesiumMG: '',
    phosphorusMG: '',
    ironMG: '',
    potassiumMG: '',
    copperMG: '',
    zincMG: '',
    retinolMCG: '',
    raeMCG: '',
    vitaminDMCG: '',
    thiamineMG: '',
    riboflavinMG: '',
    niacinMG: '',
    vitaminB6PiridoxinaMG: '',
    vitaminB12MG: '',
    vitaminCMCG: '',
    lipidsG: '',
    iodinG: '',
    manganeseMG: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (table) {
      setFormData({
        tableName: table.description || '', // tableName = description
        description: table.description || '',
        carbohydrateG: table.carbohydrateG || '',
        energyKcal: table.energyKcal || '',
        proteinG: table.proteinG || '',
        totalFatsG: table.totalFatsG || '',
        totalSugarG: table.totalSugarG || '',
        addSugarG: table.addSugarG || '',
        saturatedFatsG: table.saturatedFatsG || '',
        transFatsG: table.transFatsG || '',
        dietaryFiberG: table.dietaryFiberG || '',
        sodiumMG: table.sodiumMG || '',
        monounsaturatedG: table.monounsaturatedG || '',
        polyunsaturatedG: table.polyunsaturatedG || '',
        cholesterolMG: table.cholesterolMG || '',
        calciumMG: table.calciumMG || '',
        magnesiumMG: table.magnesiumMG || '',
        phosphorusMG: table.phosphorusMG || '',
        ironMG: table.ironMG || '',
        potassiumMG: table.potassiumMG || '',
        copperMG: table.copperMG || '',
        zincMG: table.zincMG || '',
        retinolMCG: table.retinolMCG || '',
        raeMCG: table.raeMCG || '',
        vitaminDMCG: table.vitaminDMCG || '',
        thiamineMG: table.thiamineMG || '',
        riboflavinMG: table.riboflavinMG || '',
        niacinMG: table.niacinMG || '',
        vitaminB6PiridoxinaMG: table.vitaminB6PiridoxinaMG || '',
        vitaminB12MG: table.vitaminB12MG || '',
        vitaminCMCG: table.vitaminCMCG || '',
        lipidsG: table.lipidsG || '',
        iodinG: table.iodinG || '',
        manganeseMG: table.manganeseMG || '',
      });
    } else {
      // Reset form for new table
      setFormData({
        tableName: '', // Será preenchido automaticamente
        description: '',
        carbohydrateG: '',
        energyKcal: '',
        proteinG: '',
        totalFatsG: '',
        totalSugarG: '',
        addSugarG: '',
        saturatedFatsG: '',
        transFatsG: '',
        dietaryFiberG: '',
        sodiumMG: '',
        monounsaturatedG: '',
        polyunsaturatedG: '',
        cholesterolMG: '',
        calciumMG: '',
        magnesiumMG: '',
        phosphorusMG: '',
        ironMG: '',
        potassiumMG: '',
        copperMG: '',
        zincMG: '',
        retinolMCG: '',
        raeMCG: '',
        vitaminDMCG: '',
        thiamineMG: '',
        riboflavinMG: '',
        niacinMG: '',
        vitaminB6PiridoxinaMG: '',
        vitaminB12MG: '',
        vitaminCMCG: '',
        lipidsG: '',
        iodinG: '',
        manganeseMG: '',
      });
    }
    setErrors({});
  }, [table, open]);

  const handleChange = (field: keyof CreateUserNutritionalTableRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    // Validate numeric fields
    const numericFields = [
      'carbohydrateG',
      'energyKcal',
      'proteinG',
      'totalFatsG',
      'totalSugarG',
      'addSugarG',
      'saturatedFatsG',
      'transFatsG',
      'dietaryFiberG',
      'sodiumMG',
      'monounsaturatedG',
      'polyunsaturatedG',
      'cholesterolMG',
      'calciumMG',
      'magnesiumMG',
      'phosphorusMG',
      'ironMG',
      'potassiumMG',
      'copperMG',
      'zincMG',
      'retinolMCG',
      'raeMCG',
      'vitaminDMCG',
      'thiamineMG',
      'riboflavinMG',
      'niacinMG',
      'vitaminB6PiridoxinaMG',
      'vitaminB12MG',
      'vitaminCMCG',
      'lipidsG',
      'iodinG',
      'manganeseMG',
    ];

    numericFields.forEach((field) => {
      const value = formData[field as keyof CreateUserNutritionalTableRequest];
      if (value && value.trim() !== '') {
        const numValue = parseFloat(value.replace(',', '.'));
        if (isNaN(numValue) || numValue < 0) {
          newErrors[field] = 'Valor deve ser um número válido e não negativo';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // Set tableName equal to description
      const dataToSave = {
        ...formData,
        tableName: formData.description.trim(),
      };
      await onSave(dataToSave);
      onClose();
    } catch (error) {
      console.error('Error saving nutritional table:', error);
    }
  };

  const nutritionalFields = [
    { key: 'carbohydrateG' as const, label: 'Carboidratos (g)', category: 'macronutrients' },
    { key: 'energyKcal' as const, label: 'Energia (kcal)', category: 'macronutrients' },
    { key: 'proteinG' as const, label: 'Proteínas (g)', category: 'macronutrients' },
    { key: 'totalFatsG' as const, label: 'Gorduras Totais (g)', category: 'macronutrients' },
    { key: 'totalSugarG' as const, label: 'Açúcares Totais (g)', category: 'macronutrients' },
    { key: 'addSugarG' as const, label: 'Açúcar Adicionado (g)', category: 'macronutrients' },
    { key: 'saturatedFatsG' as const, label: 'Gorduras Saturadas (g)', category: 'fats' },
    { key: 'transFatsG' as const, label: 'Gorduras Trans (g)', category: 'fats' },
    { key: 'monounsaturatedG' as const, label: 'Gorduras Monoinsaturadas (g)', category: 'fats' },
    { key: 'polyunsaturatedG' as const, label: 'Gorduras Polinsaturadas (g)', category: 'fats' },
    { key: 'dietaryFiberG' as const, label: 'Fibras Alimentares (g)', category: 'other' },
    { key: 'sodiumMG' as const, label: 'Sódio (mg)', category: 'minerals' },
    { key: 'cholesterolMG' as const, label: 'Colesterol (mg)', category: 'other' },
    { key: 'calciumMG' as const, label: 'Cálcio (mg)', category: 'minerals' },
    { key: 'magnesiumMG' as const, label: 'Magnésio (mg)', category: 'minerals' },
    { key: 'phosphorusMG' as const, label: 'Fósforo (mg)', category: 'minerals' },
    { key: 'ironMG' as const, label: 'Ferro (mg)', category: 'minerals' },
    { key: 'potassiumMG' as const, label: 'Potássio (mg)', category: 'minerals' },
    { key: 'copperMG' as const, label: 'Cobre (mg)', category: 'minerals' },
    { key: 'zincMG' as const, label: 'Zinco (mg)', category: 'minerals' },
    { key: 'manganeseMG' as const, label: 'Manganês (mg)', category: 'minerals' },
    { key: 'retinolMCG' as const, label: 'Retinol (mcg)', category: 'vitamins' },
    { key: 'raeMCG' as const, label: 'RAE (mcg)', category: 'vitamins' },
    { key: 'vitaminDMCG' as const, label: 'Vitamina D (mcg)', category: 'vitamins' },
    { key: 'thiamineMG' as const, label: 'Tiamina (mg)', category: 'vitamins' },
    { key: 'riboflavinMG' as const, label: 'Riboflavina (mg)', category: 'vitamins' },
    { key: 'niacinMG' as const, label: 'Niacina (mg)', category: 'vitamins' },
    { key: 'vitaminB6PiridoxinaMG' as const, label: 'Vitamina B6 (mg)', category: 'vitamins' },
    { key: 'vitaminB12MG' as const, label: 'Vitamina B12 (mg)', category: 'vitamins' },
    { key: 'vitaminCMCG' as const, label: 'Vitamina C (mcg)', category: 'vitamins' },
    { key: 'lipidsG' as const, label: 'Lipídios (g)', category: 'other' },
    { key: 'iodinG' as const, label: 'Iodo (g)', category: 'minerals' },
  ];

  const groupedFields = {
    macronutrients: nutritionalFields.filter((f) => f.category === 'macronutrients'),
    fats: nutritionalFields.filter((f) => f.category === 'fats'),
    minerals: nutritionalFields.filter((f) => f.category === 'minerals'),
    vitamins: nutritionalFields.filter((f) => f.category === 'vitamins'),
    other: nutritionalFields.filter((f) => f.category === 'other'),
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
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}
      >
        <Typography variant="h6">
          {table ? 'Editar Tabela Nutricional' : 'Nova Tabela Nutricional'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: 3, py: 2 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Crie sua própria tabela nutricional personalizada. Forneça uma descrição clara do
            alimento/ingrediente e preencha apenas os campos nutricionais que possuir informações.
            Todos os valores devem ser referentes a 100g do alimento.
          </Typography>
        </Alert>

        {/* Basic Information */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            Informações Básicas
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Descrição *"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              error={!!errors.description}
              helperText={errors.description}
              placeholder="Digite a descrição da sua tabela (ex: Aipo cozido, Tomate orgânico, etc.)"
              multiline
              rows={2}
            />
          </Stack>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Nutritional Information */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Informações Nutricionais (por 100g)
        </Typography>

        {/* Macronutrients */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Macronutrientes Principais
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {groupedFields.macronutrients.map((field) => (
                <Box key={field.key} sx={{ minWidth: 200, flex: 1 }}>
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    error={!!errors[field.key]}
                    helperText={errors[field.key]}
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    size="small"
                    sx={{
                      '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
                        {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      '& input[type="number"]': {
                        MozAppearance: 'textfield',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Fats */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Gorduras
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {groupedFields.fats.map((field) => (
                <Box key={field.key} sx={{ minWidth: 200, flex: 1 }}>
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    error={!!errors[field.key]}
                    helperText={errors[field.key]}
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    size="small"
                    sx={{
                      '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
                        {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      '& input[type="number"]': {
                        MozAppearance: 'textfield',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Minerals */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Minerais
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {groupedFields.minerals.map((field) => (
                <Box key={field.key} sx={{ minWidth: 200, flex: 1 }}>
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    error={!!errors[field.key]}
                    helperText={errors[field.key]}
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    size="small"
                    sx={{
                      '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
                        {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      '& input[type="number"]': {
                        MozAppearance: 'textfield',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Vitamins */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Vitaminas
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {groupedFields.vitamins.map((field) => (
                <Box key={field.key} sx={{ minWidth: 200, flex: 1 }}>
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    error={!!errors[field.key]}
                    helperText={errors[field.key]}
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    size="small"
                    sx={{
                      '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
                        {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      '& input[type="number"]': {
                        MozAppearance: 'textfield',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Other */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Outros Nutrientes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {groupedFields.other.map((field) => (
                <Box key={field.key} sx={{ minWidth: 200, flex: 1 }}>
                  <TextField
                    fullWidth
                    label={field.label}
                    value={formData[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    error={!!errors[field.key]}
                    helperText={errors[field.key]}
                    type="number"
                    inputProps={{ step: '0.01', min: '0' }}
                    size="small"
                    sx={{
                      '& input[type="number"]::-webkit-outer-spin-button, & input[type="number"]::-webkit-inner-spin-button':
                        {
                          WebkitAppearance: 'none',
                          margin: 0,
                        },
                      '& input[type="number"]': {
                        MozAppearance: 'textfield',
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Salvando...' : table ? 'Atualizar' : 'Criar Tabela'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserNutritionalTableModal;
