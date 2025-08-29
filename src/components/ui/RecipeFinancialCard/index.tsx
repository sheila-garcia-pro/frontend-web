import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
} from '@mui/material';
import {
  AttachMoney,
  Assessment,
  TrendingUp,
  Restaurant,
  AddCircleOutline,
  Settings,
  Add,
  Delete,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useFinancialCalculations } from '../../../hooks/useFinancialCalculations';
import type { RecipeIngredient } from '../../../types/recipeIngredients';
import type { DirectCost, IndirectCost, FinancialChartData } from '../../../types/financial';

interface RecipeFinancialCardProps {
  recipeId: string;
  recipeIngredients: RecipeIngredient[];
  totalYield: number;
  unitYield: number;
  onFinancialDataChange?: (data: any) => void;
}

interface DirectCostDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (cost: Omit<DirectCost, 'id'>) => void;
  title: string;
}

interface IndirectCostDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (cost: Omit<IndirectCost, 'id'>) => void;
}

const DirectCostDialog: React.FC<DirectCostDialogProps> = ({ open, onClose, onAdd, title }) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [isPercentage, setIsPercentage] = useState(false);
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (name && value) {
      onAdd({
        name,
        value: parseFloat(value),
        isPercentage,
        description,
      });
      setName('');
      setValue('');
      setIsPercentage(false);
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome do custo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label={isPercentage ? 'Porcentagem (%)' : 'Valor (R$)'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="number"
            fullWidth
            required
            InputProps={{
              startAdornment: isPercentage ? '%' : 'R$',
            }}
          />
          <FormControlLabel
            control={
              <Switch checked={isPercentage} onChange={(e) => setIsPercentage(e.target.checked)} />
            }
            label="Valor em porcentagem do preço de venda"
          />
          <TextField
            label="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleAdd} variant="contained">
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const IndirectCostDialog: React.FC<IndirectCostDialogProps> = ({ open, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [monthlyValue, setMonthlyValue] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (name && monthlyValue) {
      onAdd({
        name,
        monthlyValue: parseFloat(monthlyValue),
        description,
      });
      setName('');
      setMonthlyValue('');
      setDescription('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar Custo Indireto</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Nome do custo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Valor mensal (R$)"
            value={monthlyValue}
            onChange={(e) => setMonthlyValue(e.target.value)}
            type="number"
            fullWidth
            required
          />
          <TextField
            label="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleAdd} variant="contained">
          Adicionar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const RecipeFinancialCard: React.FC<RecipeFinancialCardProps> = ({
  recipeId,
  recipeIngredients,
  totalYield,
  unitYield,
  onFinancialDataChange,
}) => {
  const {
    financialData,
    calculations,
    viewType,
    setViewType,
    chartData,
    updateFinancialData,
    addDirectCost,
    addIndirectCost,
    removeDirectCost,
    removeIndirectCost,
    calculateSalePriceFromMargin,
    calculateSalePriceFromMarkup,
  } = useFinancialCalculations(recipeIngredients, {
    totalYield,
    unitYield,
  });

  const [tabValue, setTabValue] = useState(0);
  const [directCostDialogOpen, setDirectCostDialogOpen] = useState(false);
  const [indirectCostDialogOpen, setIndirectCostDialogOpen] = useState(false);

  // Funções auxiliares para formatação melhorada
  const formatCurrency = (value: number) => {
    const numValue = value || 0;
    if (!isValidValue(numValue)) return 'R$0,00';
    // Formatação manual para controle total do espaçamento
    const formatted = numValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$${formatted}`;
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    const numValue = value || 0;
    if (!isValidValue(numValue)) return '0,00';
    return numValue.toFixed(decimals).replace('.', ',');
  };

  const formatPercentage = (value: number) => {
    const numValue = value || 0;
    if (!isValidValue(numValue)) return '0,0%';
    return `${numValue.toFixed(1).replace('.', ',')}%`;
  };

  const formatMarkup = (value: number) => {
    const numValue = value || 1;
    if (!isValidValue(numValue)) return '1,0x';
    return `${numValue.toFixed(1).replace('.', ',')}x`;
  };

  const isValidValue = (value: number): boolean => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  };

  // Variáveis derivadas do cálculo
  const currentCost =
    viewType === 'total' ? calculations?.totalCost || 0 : calculations?.unitCost || 0;
  const currentSalePrice =
    viewType === 'total' ? financialData?.totalSalePrice || 0 : financialData?.unitSalePrice || 0;
  const unitCost = calculations?.unitCost || 0;
  const netMargin = calculations?.profitMargin || 0;
  const sellingPrice = currentSalePrice || 0;
  const unitProfit =
    isValidValue(sellingPrice) && isValidValue(unitCost) ? sellingPrice - unitCost : 0;

  // Handlers para mudanças nos preços
  const handleSalePriceChange = (field: 'totalSalePrice' | 'unitSalePrice', value: string) => {
    const numericValue = parseFloat(value.replace(',', '.')) || 0;
    if (updateFinancialData) {
      updateFinancialData({
        [field]: numericValue,
      });
    }
  };

  const handleMarginChange = (newMargin: number) => {
    if (calculateSalePriceFromMargin) {
      const newPrice = calculateSalePriceFromMargin(newMargin);
      handleSalePriceChange(
        viewType === 'total' ? 'totalSalePrice' : 'unitSalePrice',
        newPrice.toString(),
      );
    }
  };

  const handleMarkupChange = (newMarkup: number) => {
    if (calculateSalePriceFromMarkup) {
      const newPrice = calculateSalePriceFromMarkup(newMarkup);
      handleSalePriceChange(
        viewType === 'total' ? 'totalSalePrice' : 'unitSalePrice',
        newPrice.toString(),
      );
    }
  };

  // Notificar mudanças para o componente pai
  useEffect(() => {
    if (onFinancialDataChange) {
      onFinancialDataChange({
        calculations,
        viewType,
        calculateSalePriceFromMarkup,
        updateFinancialData,
        financialData,
        onFinancialDataChange,
      });
    }
  }, [
    calculations,
    viewType,
    calculateSalePriceFromMarkup,
    updateFinancialData,
    financialData,
    onFinancialDataChange,
  ]);

  // Custom tooltip para o gráfico
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as FinancialChartData;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {data.label}
          </Typography>
          <Typography variant="body2">Valor: {formatCurrency(data.value)}</Typography>
          <Typography variant="body2">{formatPercentage(data.percentage)}</Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Card elevation={2} sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AttachMoney sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Análise Financeira
          </Typography>
        </Box>

        {/* Tabs para Total vs Unitário */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={viewType === 'total' ? 0 : 1}
            onChange={(_, newValue) => setViewType(newValue === 0 ? 'total' : 'unit')}
          >
            <Tab
              label={`Custo Total (${totalYield} ${totalYield > 1 ? 'unidades' : 'unidade'})`}
              icon={<Assessment />}
            />
            <Tab label="Custo Unitário" icon={<TrendingUp />} />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Seção esquerda - Resumo Total */}
          <Box sx={{ flex: 1, minWidth: 300, width: { xs: '100%', md: '48%' } }}>
            {/* Resumo Total */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#4a5568' }}>
              Resumo {viewType === 'total' ? 'Total' : 'Unitário'}
            </Typography>

            {/* Cards Custo e Preço de Venda */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'stretch' }}>
              {/* Card Custo Total */}
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: '2px solid #e53e3e',
                    borderRadius: 3,
                    bgcolor: '#fed7d7',
                    textAlign: 'center',
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#c53030',
                        mr: 0.3,
                      }}
                    >
                      R$
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: '#c53030',
                        fontSize: '1.3rem',
                        lineHeight: 1,
                      }}
                    >
                      {formatNumber(currentCost || 0)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#c53030',
                      fontSize: '0.75rem',
                      lineHeight: 1,
                    }}
                  >
                    {viewType === 'total' ? 'Custo Total' : 'Custo Unitário'}
                  </Typography>
                </Box>
              </Box>

              {/* Card Preço de Venda */}
              <Box sx={{ flex: 1 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: '2px solid #38a169',
                    borderRadius: 3,
                    bgcolor: '#c6f6d5',
                    textAlign: 'center',
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '1.3rem',
                        fontWeight: 700,
                        color: '#38a169',
                        mr: 0.3,
                      }}
                    >
                      R$
                    </Typography>
                    <TextField
                      value={currentSalePrice ? formatNumber(currentSalePrice) : ''}
                      onChange={(e) =>
                        handleSalePriceChange(
                          viewType === 'total' ? 'totalSalePrice' : 'unitSalePrice',
                          e.target.value,
                        )
                      }
                      variant="standard"
                      placeholder="33,33"
                      sx={{
                        '& .MuiInputBase-root': {
                          justifyContent: 'center',
                        },
                      }}
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          display: 'flex',
                          justifyContent: 'center',
                          '& input': {
                            textAlign: 'center',
                            padding: 0,
                            minWidth: '60px',
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            color: '#38a169',
                            lineHeight: 1,
                            '&::placeholder': {
                              color: '#38a169',
                              opacity: 0.7,
                            },
                          },
                        },
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: '#38a169',
                      fontSize: '0.75rem',
                      lineHeight: 1,
                    }}
                  >
                    Preço de Venda
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Indicadores CMV, Margem, Markup */}
            <Box sx={{ display: 'flex', gap: 3, mb: 3 }}>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#c53030',
                    fontSize: '1.3rem',
                  }}
                >
                  {formatPercentage(calculations?.cmv || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.75rem' }}>
                  CMV
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#d69e2e',
                    fontSize: '1.3rem',
                  }}
                >
                  {formatPercentage(calculations?.profitMargin || 0)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.75rem' }}>
                  Margem
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: '#3182ce',
                    fontSize: '1.3rem',
                  }}
                >
                  {formatMarkup(calculations?.markup || 1)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#4a5568', fontSize: '0.75rem' }}>
                  Markup
                </Typography>
              </Box>
            </Box>

            {/* Ajustar Preço */}
            <Typography
              variant="h6"
              gutterBottom
              sx={{ fontWeight: 600, color: '#4a5568', fontSize: '1rem' }}
            >
              Ajustar Preço
            </Typography>

            {/* Margem de Lucro Slider */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" gutterBottom sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                Margem de Lucro: {formatPercentage(calculations?.profitMargin || 0)}
              </Typography>
              <Slider
                value={
                  isValidValue(calculations?.profitMargin)
                    ? Math.min(Math.max(calculations.profitMargin, 0), 80)
                    : 0
                }
                onChange={(_, value) => handleMarginChange(value as number)}
                min={0}
                max={80}
                step={0.5}
                marks={[
                  { value: 10, label: '10%' },
                  { value: 30, label: '30%' },
                  { value: 50, label: '50%' },
                  { value: 70, label: '70%' },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value.toFixed(1)}%`}
                sx={{
                  '& .MuiSlider-thumb': {
                    bgcolor: '#38a169',
                  },
                  '& .MuiSlider-track': {
                    bgcolor: '#38a169',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Seção direita - Composição de Custos */}
          <Box sx={{ flex: 1, minWidth: 300, width: { xs: '100%', md: '48%' } }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#4a5568' }}>
              Composição de Custos
            </Typography>

            {/* Gráfico de Pizza */}
            <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', mb: 2 }}>
              {chartData && chartData.length > 0 ? (
                <PieChart width={300} height={300}>
                  <Pie
                    data={chartData}
                    cx={150}
                    cy={150}
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="label"
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  />
                </PieChart>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">Dados não disponíveis</Typography>
                </Box>
              )}
            </Box>

            {/* Lista de Custos */}
            <Box sx={{ mt: 2 }}>
              {chartData && chartData.length > 0 ? (
                chartData.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: '#f7fafc' },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: item.color,
                          borderRadius: '50%',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                        {item.label}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                        {formatCurrency(item.value)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {formatPercentage(item.percentage)}
                      </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Box sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                  <Typography variant="body2">Nenhum dado de custo disponível</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        {/* Seção de Análise Detalhada com Tabs */}
        <Box sx={{ mt: 4 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
              <Tab
                label="Ingredientes"
                icon={<Restaurant />}
                sx={{
                  minHeight: 60,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              />
              <Tab
                label="Custos Diretos"
                icon={<AddCircleOutline />}
                sx={{
                  minHeight: 60,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
              />
              <Tab
                label="Custos Indiretos"
                icon={<Settings />}
                sx={{
                  minHeight: 60,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                }}
                disabled={viewType === 'unit'}
              />
            </Tabs>
          </Box>

          {/* Conteúdo das Tabs */}
          <Box sx={{ mt: 3 }}>
            {/* Tab 1: Ingredientes */}
            {tabValue === 0 && (
              <Box>
                <Box>
                  <TableContainer component={Paper} elevation={1}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f7fafc' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Ingrediente</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Quantidade
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            Custo Unit.
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 600 }}>
                            {viewType === 'total' ? 'Custo Total' : 'Custo Unitário'}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recipeIngredients?.map((ingredient, index) => {
                          const currentCostValue =
                            viewType === 'total'
                              ? ingredient.totalCost
                              : ingredient.totalCost / totalYield;

                          return (
                            <TableRow
                              key={ingredient.ingredient._id || index}
                              sx={{ '&:hover': { bgcolor: '#f7fafc' } }}
                            >
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {ingredient.ingredient.name}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {formatNumber(ingredient.quantity)}{' '}
                                  {ingredient.unitMeasure || 'un'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {formatCurrency(ingredient.ingredient.price?.price || 0)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(currentCostValue)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        <TableRow sx={{ bgcolor: '#edf2f7' }}>
                          <TableCell colSpan={3}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              Total Ingredientes
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#c53030' }}>
                              {formatCurrency(calculations.totalIngredientsCost)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>
            )}

            {/* Tab 2: Custos Diretos */}
            {tabValue === 1 && (
              <Box>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Custos Diretos Adicionais
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setDirectCostDialogOpen(true)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                      }}
                    >
                      Adicionar Custo
                    </Button>
                  </Box>

                  {(viewType === 'total'
                    ? financialData.totalDirectCosts
                    : financialData.unitDirectCosts
                  ).length > 0 ? (
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f7fafc' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Valor
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                              Ações
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(viewType === 'total'
                            ? financialData.totalDirectCosts
                            : financialData.unitDirectCosts
                          ).map((cost) => (
                            <TableRow key={cost.id} sx={{ '&:hover': { bgcolor: '#f7fafc' } }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {cost.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {cost.description || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {cost.isPercentage
                                    ? `${formatNumber(cost.value)}%`
                                    : formatCurrency(cost.value)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => removeDirectCost(cost.id, viewType === 'total')}
                                  sx={{ color: '#c53030' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 4,
                        color: 'text.secondary',
                      }}
                    >
                      <Typography variant="body1">Nenhum custo direto adicionado ainda.</Typography>
                      <Typography variant="body2">
                        Clique em "Adicionar Custo" para incluir custos como embalagem, mão de obra
                        direta, etc.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            {/* Tab 3: Custos Indiretos */}
            {tabValue === 2 && viewType === 'total' && (
              <Box>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Custos Indiretos (Rateio)
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setIndirectCostDialogOpen(true)}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 2,
                      }}
                    >
                      Adicionar Custo
                    </Button>
                  </Box>

                  {financialData.indirectCosts.length > 0 ? (
                    <TableContainer component={Paper} elevation={1}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f7fafc' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Descrição</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                              Valor
                            </TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>
                              Ações
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {financialData.indirectCosts.map((cost) => (
                            <TableRow key={cost.id} sx={{ '&:hover': { bgcolor: '#f7fafc' } }}>
                              <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {cost.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {cost.description || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {formatCurrency(cost.monthlyValue)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={() => removeIndirectCost(cost.id)}
                                  sx={{ color: '#c53030' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Box
                      sx={{
                        textAlign: 'center',
                        py: 4,
                        color: 'text.secondary',
                      }}
                    >
                      <Typography variant="body1">
                        Nenhum custo indireto adicionado ainda.
                      </Typography>
                      <Typography variant="body2">
                        Clique em "Adicionar Custo" para incluir custos como aluguel, energia, etc.
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>

      {/* Dialogs */}
      <DirectCostDialog
        open={directCostDialogOpen}
        onClose={() => setDirectCostDialogOpen(false)}
        onAdd={(cost) => addDirectCost(cost, viewType === 'total')}
        title="Adicionar Custo Direto"
      />

      <IndirectCostDialog
        open={indirectCostDialogOpen}
        onClose={() => setIndirectCostDialogOpen(false)}
        onAdd={(cost) => addIndirectCost(cost)}
      />
    </Card>
  );
};

export default RecipeFinancialCard;
