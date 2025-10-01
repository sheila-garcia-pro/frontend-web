import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  InputAdornment,
  Button,
  IconButton,
  Divider,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import useFinancialCalculations from '../../../hooks/useFinancialCalculations';
import { RecipeIngredient } from '../../../types/recipeIngredients';
import { DirectCost, IndirectCost, FinancialData } from '../../../types/financial';

interface EnhancedFinancialSectionProps {
  recipeIngredients: RecipeIngredient[];
  initialFinancialData?: Partial<FinancialData>;
  onFinancialDataChange?: (data: Partial<FinancialData>) => void;
  totalYield?: number;
}

const EnhancedFinancialSectionComponent: React.FC<EnhancedFinancialSectionProps> = ({
  recipeIngredients = [],
  initialFinancialData,
  onFinancialDataChange,
  totalYield = 1,
}) => {
  const [financialData, setFinancialData] = useState<Partial<FinancialData>>({
    totalSalePrice: 0,
    unitSalePrice: 0,
    monthlyRevenue: 10000, // valor padrão
    totalYield: totalYield,
    unitYield: 1,
    directCosts: [],
    indirectCosts: [],
    ...initialFinancialData,
  });

  const { calculations, updateFinancialData } = useFinancialCalculations(
    recipeIngredients,
    financialData as FinancialData,
  );

  // Sincronizar dados quando houver mudanças
  useEffect(() => {
    updateFinancialData(financialData as FinancialData);
    onFinancialDataChange?.(financialData);
  }, [financialData, updateFinancialData, onFinancialDataChange]);

  const ingredientsCost = recipeIngredients.reduce(
    (total, ingredient) => total + (ingredient.totalCost || 0),
    0,
  );

  const handleDirectCostAdd = () => {
    setFinancialData((prev) => ({
      ...prev,
      directCosts: [
        ...(prev.directCosts || []),
        {
          id: Date.now().toString(),
          name: '',
          value: 0,
          isPercentage: false,
          description: '',
        },
      ],
    }));
  };

  const handleDirectCostChange = (index: number, field: keyof DirectCost, value: any) => {
    setFinancialData((prev) => ({
      ...prev,
      directCosts:
        prev.directCosts?.map((cost, i) => (i === index ? { ...cost, [field]: value } : cost)) ||
        [],
    }));
  };

  const handleDirectCostRemove = (index: number) => {
    setFinancialData((prev) => ({
      ...prev,
      directCosts: prev.directCosts?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleIndirectCostAdd = () => {
    setFinancialData((prev) => ({
      ...prev,
      indirectCosts: [
        ...(prev.indirectCosts || []),
        {
          id: Date.now().toString(),
          name: '',
          monthlyValue: 0,
          description: '',
        },
      ],
    }));
  };

  const handleIndirectCostChange = (index: number, field: keyof IndirectCost, value: any) => {
    setFinancialData((prev) => ({
      ...prev,
      indirectCosts:
        prev.indirectCosts?.map((cost, i) => (i === index ? { ...cost, [field]: value } : cost)) ||
        [],
    }));
  };

  const handleIndirectCostRemove = (index: number) => {
    setFinancialData((prev) => ({
      ...prev,
      indirectCosts: prev.indirectCosts?.filter((_, i) => i !== index) || [],
    }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  return (
    <Box sx={{ mt: 4, width: '100%', overflow: 'hidden' }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontWeight: 600,
          color: 'primary.main',
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        💰 Informações Financeiras
        <Chip label="Opcional" size="small" color="primary" variant="outlined" />
      </Typography>

      {/* Configurações Básicas */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          📊 Configurações Básicas
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Preço de Venda Total"
              type="number"
              fullWidth
              value={financialData.totalSalePrice || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFinancialData((prev) => ({
                  ...prev,
                  totalSalePrice: value,
                  unitSalePrice: totalYield > 0 ? value / totalYield : 0,
                }));
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label="Faturamento Mensal Estimado"
              type="number"
              fullWidth
              value={financialData.monthlyRevenue || ''}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFinancialData((prev) => ({
                  ...prev,
                  monthlyRevenue: value,
                }));
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">R$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Usado para calcular custos indiretos proporcionais"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Dashboard Principal de Indicadores */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          📈 Resumo Financeiro
        </Typography>

        <Grid container spacing={2}>
          {/* Primeira linha - Indicadores principais */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#ffebee',
                borderRadius: 2,
                border: '1px solid #ffcdd2',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 600, color: '#c62828', letterSpacing: 1, fontSize: '0.7rem' }}
              >
                Custo Total
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#d32f2f', my: 0.5 }}>
                {formatCurrency(calculations.totalCost)}
              </Typography>
              <Chip
                size="small"
                label={`${formatPercentage(calculations.ingredientsCostPercentage)} ingredientes`}
                sx={{ fontSize: '0.6rem', backgroundColor: '#ffcdd2', height: '20px' }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#e8f5e8',
                borderRadius: 2,
                border: '1px solid #c8e6c9',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 600, color: '#2e7d32', letterSpacing: 1, fontSize: '0.7rem' }}
              >
                Preço de Venda
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32', my: 0.5 }}>
                {formatCurrency(financialData.totalSalePrice || 0)}
              </Typography>
              <Chip
                size="small"
                label={`Margem: ${formatPercentage(calculations.profitMargin)}`}
                sx={{ fontSize: '0.6rem', backgroundColor: '#c8e6c9', height: '20px' }}
              />
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#e3f2fd',
                borderRadius: 2,
                border: '1px solid #bbdefb',
                height: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="overline"
                sx={{ fontWeight: 600, color: '#1976d2', letterSpacing: 1, fontSize: '0.7rem' }}
              >
                Lucro Estimado
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', my: 0.5 }}>
                {formatCurrency(calculations.totalProfit)}
              </Typography>
              <Chip
                size="small"
                label={`Markup: ${calculations.markup.toFixed(1)}x`}
                sx={{ fontSize: '0.6rem', backgroundColor: '#bbdefb', height: '20px' }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* CMV Destacado */}
        <Box sx={{ mt: 2 }}>
          <Paper
            sx={{
              p: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              CMV - Custo da Mercadoria Vendida
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
              {formatPercentage(calculations.cmv)}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, mt: 0.5, display: 'block' }}>
              Percentual do custo em relação ao preço de venda
            </Typography>
          </Paper>
        </Box>
      </Paper>

      {/* Detalhamento por Componentes */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          🔍 Detalhamento de Custos
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#fff3e0',
                borderRadius: 1,
                border: '1px solid #ffcc02',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#ef6c00' }}>
                INGREDIENTES
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ef6c00', my: 0.5 }}>
                {formatCurrency(ingredientsCost)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#bf5600' }}>
                {formatPercentage(calculations.ingredientsCostPercentage)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#f3e5f5',
                borderRadius: 1,
                border: '1px solid #ce93d8',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#7b1fa2' }}>
                CUSTOS DIRETOS
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#7b1fa2', my: 0.5 }}>
                {formatCurrency(calculations.totalDirectCosts)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#4a148c' }}>
                {formatPercentage(calculations.directCostsPercentage)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#fce4ec',
                borderRadius: 1,
                border: '1px solid #f8bbd9',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#c2185b' }}>
                CUSTOS INDIRETOS
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#c2185b', my: 0.5 }}>
                {formatCurrency(calculations.indirectCostsTotal)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#880e4f' }}>
                {formatPercentage(calculations.indirectCostsPercentage)}
              </Typography>
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box
              sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: '#f1f8e9',
                borderRadius: 1,
                border: '1px solid #aed581',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                CUSTO UNITÁRIO
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2e7d32', my: 0.5 }}>
                {formatCurrency(calculations.unitCost)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#1b5e20' }}>
                Por unidade
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Custos Diretos */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            📦 Custos Diretos
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleDirectCostAdd}
            variant="contained"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Adicionar Custo
          </Button>
        </Box>

        {financialData.directCosts?.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Nenhum custo direto adicionado. Clique em "Adicionar Custo" para incluir custos como
              embalagens, taxas, etc.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {financialData.directCosts?.map((cost, index) => (
              <Grid size={{ xs: 12 }} key={cost.id || index}>
                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        label="Nome do Custo"
                        value={cost.name}
                        onChange={(e) => handleDirectCostChange(index, 'name', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Ex: Embalagem, Taxa de entrega"
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <TextField
                        label="Valor"
                        type="number"
                        value={cost.value}
                        onChange={(e) =>
                          handleDirectCostChange(index, 'value', parseFloat(e.target.value) || 0)
                        }
                        size="small"
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              {cost.isPercentage ? '%' : 'R$'}
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 3, sm: 2 }}>
                      <Button
                        variant={cost.isPercentage ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() =>
                          handleDirectCostChange(index, 'isPercentage', !cost.isPercentage)
                        }
                        fullWidth
                        sx={{ minWidth: 60 }}
                      >
                        {cost.isPercentage ? '%' : 'R$'}
                      </Button>
                    </Grid>
                    <Grid size={{ xs: 3, sm: 1 }}>
                      <IconButton
                        onClick={() => handleDirectCostRemove(index)}
                        size="small"
                        color="error"
                        sx={{
                          bgcolor: 'error.light',
                          '&:hover': { bgcolor: 'error.main', color: 'white' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Custos Indiretos */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            🏢 Custos Indiretos
          </Typography>
          <Button
            startIcon={<AddIcon />}
            onClick={handleIndirectCostAdd}
            variant="contained"
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Adicionar Custo
          </Button>
        </Box>

        {financialData.indirectCosts?.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              bgcolor: 'background.default',
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Nenhum custo indireto adicionado. Inclua despesas fixas como aluguel, luz, salários,
              etc.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {financialData.indirectCosts?.map((cost, index) => (
              <Grid size={{ xs: 12 }} key={cost.id || index}>
                <Paper sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField
                        label="Nome da Despesa"
                        value={cost.name}
                        onChange={(e) => handleIndirectCostChange(index, 'name', e.target.value)}
                        size="small"
                        fullWidth
                        placeholder="Ex: Aluguel, Energia, Salários"
                      />
                    </Grid>
                    <Grid size={{ xs: 9, sm: 4 }}>
                      <TextField
                        label="Valor Mensal"
                        type="number"
                        value={cost.monthlyValue}
                        onChange={(e) =>
                          handleIndirectCostChange(
                            index,
                            'monthlyValue',
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        size="small"
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 3, sm: 1 }}>
                      <IconButton
                        onClick={() => handleIndirectCostRemove(index)}
                        size="small"
                        color="error"
                        sx={{
                          bgcolor: 'error.light',
                          '&:hover': { bgcolor: 'error.main', color: 'white' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Explicação sobre custos indiretos */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="info.contrastText">
            💡 <strong>Dica:</strong> Os custos indiretos são rateados proporcionalmente baseados no
            faturamento mensal estimado. Quanto maior o faturamento, menor será o impacto percentual
            destes custos na receita.
          </Typography>
        </Box>
      </Paper>

      {/* Resumo Final */}
      <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              💡 <strong>Custo estimado dos ingredientes:</strong> {formatCurrency(ingredientsCost)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Baseado nos ingredientes adicionados à receita
            </Typography>
          </Box>
          <Tooltip title="Os cálculos são baseados nos ingredientes da receita e nas configurações financeiras definidas">
            <IconButton size="small" sx={{ color: 'primary.main' }}>
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    </Box>
  );
};

// Exportar com React.memo para otimização
const EnhancedFinancialSection = React.memo(EnhancedFinancialSectionComponent);

export default EnhancedFinancialSection;
