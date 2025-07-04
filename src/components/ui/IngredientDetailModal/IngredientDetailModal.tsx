import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Avatar,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Slider,
  Paper,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
} from '@mui/material';
import { Close, AttachMoney, Scale, Restaurant, Info, History, Biotech } from '@mui/icons-material';
import { Ingredient } from '../../../types/ingredients';
import { IngredientPriceHistory, RecipeIngredient } from '../../../types/recipeIngredients';
import { getCachedIngredientPriceHistory } from '../../../services/api/ingredients';
import { getNutritionalTable } from '../../../services/api/nutritionalTable';
import { NutritionalTable } from '../../../types/nutritionalTable';
import { getCachedUnitMeasures } from '../../../services/api/unitMeasure';
import { UnitMeasure } from '../../../types/unitMeasure';

interface IngredientDetailModalProps {
  open: boolean;
  onClose: () => void;
  ingredient: Ingredient | null;
  existingData?: RecipeIngredient; // Dados existentes para edição
  onConfirm: (data: {
    quantity: number;
    unitMeasure: string;
    correctionFactor: number;
    purchasePrice: number;
    purchaseQuantity: number;
    purchaseUnit: string;
  }) => void;
}

const IngredientDetailModal: React.FC<IngredientDetailModalProps> = ({
  open,
  onClose,
  ingredient,
  existingData,
  onConfirm,
}) => {
  // Estados do modal
  const [quantity, setQuantity] = useState('');
  const [unitMeasure, setUnitMeasure] = useState('Gramas');
  const [correctionFactor, setCorrectionFactor] = useState(1.0);
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseQuantity, setPurchaseQuantity] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('Quilogramas');

  // Estados para histórico de preços e tabela nutricional
  const [priceHistory, setPriceHistory] = useState<IngredientPriceHistory[]>([]);
  const [nutritionalTables, setNutritionalTables] = useState<NutritionalTable[]>([]);
  const [selectedTable, setSelectedTable] = useState<NutritionalTable | null>(null);
  const [loadingPriceHistory, setLoadingPriceHistory] = useState(false);
  const [loadingNutritional, setLoadingNutritional] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Função para carregar histórico de preços
  const loadPriceHistory = useCallback(async (ingredientId: string) => {
    setLoadingPriceHistory(true);
    try {
      const history = await getCachedIngredientPriceHistory(ingredientId);
      setPriceHistory(history);
    } catch (error) {
      console.error('Erro ao carregar histórico de preços:', error);
    } finally {
      setLoadingPriceHistory(false);
    }
  }, []);

  // Função para carregar tabela nutricional
  const loadNutritionalTables = useCallback(async (ingredientName: string) => {
    setLoadingNutritional(true);
    try {
      const tables = await getNutritionalTable(ingredientName);
      setNutritionalTables(tables);
      if (tables.length > 0) {
        setSelectedTable(tables[0]);
      }
    } catch (error) {
      console.error('Erro ao carregar tabela nutricional:', error);
    } finally {
      setLoadingNutritional(false);
    }
  }, []);

  // Função para carregar unidades de medida
  const loadUnitMeasures = useCallback(async () => {
    setLoadingUnits(true);
    try {
      const data = await getCachedUnitMeasures();
      setUnitMeasures(data || []);
    } catch (error) {
      console.error('Erro ao carregar unidades de medida:', error);
    } finally {
      setLoadingUnits(false);
    }
  }, []);

  // Resetar campos quando o ingrediente mudar ou quando houver dados existentes
  useEffect(() => {
    if (ingredient) {
      // Carregar unidades de medida
      loadUnitMeasures();

      // Se há dados existentes (modo edição), usar esses dados
      if (existingData) {
        setQuantity(existingData.quantity.toString());
        setUnitMeasure(existingData.unitMeasure);
        setCorrectionFactor(existingData.correctionFactor || 1.0);
        // Para preço, usar dados do ingrediente ou calcular baseado no custo total
        if (ingredient.price) {
          setPurchasePrice(ingredient.price.price.toString());
          setPurchaseQuantity(ingredient.price.quantity.toString());
          setPurchaseUnit(ingredient.price.unitMeasure);
        } else {
          // Se não há preço no ingrediente, tentar calcular baseado no custo total
          setPurchasePrice((existingData.totalCost / existingData.quantity).toFixed(2));
          setPurchaseQuantity('1');
          setPurchaseUnit(existingData.unitMeasure);
        }
      } else {
        // Modo adicionar - campos vazios
        setQuantity('');
        setUnitMeasure('Gramas');
        setCorrectionFactor(1.0);
        setPurchasePrice(ingredient.price?.price?.toString() || '');
        setPurchaseQuantity(ingredient.price?.quantity?.toString() || '');
        setPurchaseUnit(ingredient.price?.unitMeasure || 'Quilogramas');
      }

      // Carregar dados adicionais
      loadPriceHistory(ingredient._id);
      loadNutritionalTables(ingredient.name);
    }
  }, [ingredient, existingData, loadPriceHistory, loadNutritionalTables, loadUnitMeasures]);

  // Calcular custo estimado
  const calculateEstimatedCost = () => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(purchasePrice) || 0;
    const purchaseQty = parseFloat(purchaseQuantity) || 1;

    if (qty === 0 || price === 0 || purchaseQty === 0) return 0;

    const pricePerUnit = price / purchaseQty;
    return pricePerUnit * qty * correctionFactor;
  };

  // Manipular confirmação
  const handleConfirm = () => {
    const qty = parseFloat(quantity);
    const price = parseFloat(purchasePrice);
    const purchaseQty = parseFloat(purchaseQuantity);

    if (!qty || qty <= 0) {
      alert('Quantidade deve ser maior que zero');
      return;
    }

    if (!price || price <= 0) {
      alert('Preço deve ser maior que zero');
      return;
    }

    if (!purchaseQty || purchaseQty <= 0) {
      alert('Quantidade de compra deve ser maior que zero');
      return;
    }

    onConfirm({
      quantity: qty,
      unitMeasure,
      correctionFactor,
      purchasePrice: price,
      purchaseQuantity: purchaseQty,
      purchaseUnit,
    });

    onClose();
  };

  // Manipular mudança do fator de correção
  const handleCorrectionFactorChange = (event: Event, newValue: number | number[]) => {
    setCorrectionFactor(newValue as number);
  };

  // Manipular mudança de aba
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (!ingredient) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={ingredient.image} alt={ingredient.name} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {ingredient.name}
              </Typography>
              <Chip label={ingredient.category} size="small" color="primary" variant="outlined" />
            </Box>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Abas para navegar entre seções */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            <Tab label="Configuração" icon={<Restaurant />} iconPosition="start" />
            <Tab label="Histórico de Preços" icon={<History />} iconPosition="start" />
            <Tab label="Informações Nutricionais" icon={<Biotech />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Conteúdo da aba Configuração */}
        {currentTab === 0 && (
          <Grid container spacing={3}>
            {/* Quantidade de Uso */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Restaurant color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Quantidade de Uso
                    </Typography>
                    <Chip
                      icon={<Info />}
                      label="Quantidade necessária na receita"
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                      label="Quantidade"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      fullWidth
                      inputProps={{ min: 0, step: 0.1 }}
                      sx={{ flex: 1 }}
                    />
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>Unidade</InputLabel>
                      <Select
                        value={unitMeasure}
                        label="Unidade"
                        onChange={(e) => setUnitMeasure(e.target.value)}
                      >
                        {loadingUnits ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                            Carregando unidades...
                          </MenuItem>
                        ) : (
                          unitMeasures.map((unit) => (
                            <MenuItem key={unit._id} value={unit.name}>
                              {unit.name} ({unit.acronym})
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Fator de Correção */}
            <Grid size={{ xs: 12 }}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Scale color="secondary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Fator de Correção
                    </Typography>
                    <Chip
                      icon={<Info />}
                      label="Ajuste para perdas e desperdício"
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>

                  <Box sx={{ px: 2 }}>
                    <Typography gutterBottom>
                      Peso Bruto: {correctionFactor.toFixed(2)} | Peso Líquido:{' '}
                      {(1 / correctionFactor).toFixed(2)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      gutterBottom
                      display="block"
                    >
                      ({(correctionFactor * 100).toFixed(0)}% -{' '}
                      {((1 / correctionFactor) * 100).toFixed(0)}%)
                    </Typography>

                    <Slider
                      value={correctionFactor}
                      onChange={handleCorrectionFactorChange}
                      min={0.1}
                      max={2.0}
                      step={0.01}
                      marks={[
                        { value: 0.5, label: '0.5' },
                        { value: 1.0, label: '1.0' },
                        { value: 1.5, label: '1.5' },
                        { value: 2.0, label: '2.0' },
                      ]}
                      sx={{ mt: 2 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Preço de Compra */}
            <Grid size={{ xs: 12 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <AttachMoney color="success" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Preço de Compra
                    </Typography>
                    <Chip
                      icon={<Info />}
                      label="Valor pago por quantidade"
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Preço"
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                        }}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        label="Quantidade"
                        type="number"
                        value={purchaseQuantity}
                        onChange={(e) => setPurchaseQuantity(e.target.value)}
                        fullWidth
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl fullWidth>
                        <InputLabel>Unidade de Compra</InputLabel>
                        <Select
                          value={purchaseUnit}
                          label="Unidade de Compra"
                          onChange={(e) => setPurchaseUnit(e.target.value)}
                          disabled={loadingUnits}
                        >
                          {loadingUnits ? (
                            <MenuItem disabled>
                              <CircularProgress size={20} />
                              Carregando unidades...
                            </MenuItem>
                          ) : (
                            unitMeasures.map((unit) => (
                              <MenuItem key={unit._id} value={unit.name}>
                                {unit.name} ({unit.acronym})
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Resumo de Custos */}
            {quantity && purchasePrice && purchaseQuantity && (
              <Grid size={{ xs: 12 }}>
                <Paper
                  sx={{
                    p: 3,
                    bgcolor: 'primary.light',
                    border: '1px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography
                    variant="h6"
                    color="primary.dark"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    💰 Resumo de Custos
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="primary.dark">
                        Quantidade necessária:
                      </Typography>
                      <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 700 }}>
                        {quantity} {unitMeasure}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="body2" color="primary.dark">
                        Custo com fator de correção:
                      </Typography>
                      <Typography variant="h6" color="primary.dark" sx={{ fontWeight: 700 }}>
                        R$ {calculateEstimatedCost().toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Conteúdo da aba Histórico de Preços */}
        {currentTab === 1 && (
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <History color="primary" />
              Histórico de Preços
            </Typography>

            {loadingPriceHistory ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : priceHistory.length > 0 ? (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Data</TableCell>
                      <TableCell>Preço</TableCell>
                      <TableCell>Quantidade</TableCell>
                      <TableCell>Unidade</TableCell>
                      <TableCell>Preço por Unidade</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceHistory.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell>{formatDate(price.date)}</TableCell>
                        <TableCell>R$ {price.price.toFixed(2)}</TableCell>
                        <TableCell>{price.quantity}</TableCell>
                        <TableCell>{price.unitMeasure}</TableCell>
                        <TableCell>R$ {(price.price / price.quantity).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum histórico de preços encontrado para este ingrediente.
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* Conteúdo da aba Informações Nutricionais */}
        {currentTab === 2 && (
          <Box>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Biotech color="primary" />
              Informações Nutricionais
            </Typography>

            {loadingNutritional ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : nutritionalTables.length > 0 ? (
              <>
                <Box sx={{ mt: 2, mb: 3 }}>
                  <FormControl fullWidth>
                    <InputLabel>Tabela Nutricional</InputLabel>
                    <Select
                      value={selectedTable?.description || ''}
                      label="Tabela Nutricional"
                      onChange={(e) => {
                        const table = nutritionalTables.find(
                          (t) => t.description === e.target.value,
                        );
                        setSelectedTable(table || null);
                      }}
                    >
                      {nutritionalTables.map((table) => (
                        <MenuItem key={table.description} value={table.description}>
                          {table.description} ({table.tableName})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {selectedTable && (
                  <Paper elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <Info color="primary" />
                      Informações Nutricionais (por 100g)
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: { xs: 1.5, sm: 2 },
                        mt: 2,
                      }}
                    >
                      {[
                        {
                          label: 'Valor Energético',
                          value: selectedTable.energyKcal,
                          unit: 'kcal',
                        },
                        {
                          label: 'Carboidratos',
                          value: selectedTable.carbohydrateG,
                          unit: 'g',
                        },
                        {
                          label: 'Açúcares Totais',
                          value: selectedTable.totalSugarG || '0',
                          unit: 'g',
                        },
                        {
                          label: 'Açúcares Adicionados',
                          value: selectedTable.addSugarG || '0',
                          unit: 'g',
                        },
                        {
                          label: 'Proteínas',
                          value: selectedTable.proteinG,
                          unit: 'g',
                        },
                        {
                          label: 'Gorduras Totais',
                          value: selectedTable.totalFatsG,
                          unit: 'g',
                        },
                        {
                          label: 'Gorduras Saturadas',
                          value: selectedTable.saturatedFatsG || '0',
                          unit: 'g',
                        },
                        {
                          label: 'Gorduras Trans',
                          value: selectedTable.transFatsG || '0',
                          unit: 'g',
                        },
                        {
                          label: 'Fibra Alimentar',
                          value: selectedTable.dietaryFiberG,
                          unit: 'g',
                        },
                        {
                          label: 'Sódio',
                          value: selectedTable.sodiumMG,
                          unit: 'mg',
                        },
                        {
                          label: 'Cálcio',
                          value: selectedTable.calciumMG,
                          unit: 'mg',
                        },
                        {
                          label: 'Ferro',
                          value: selectedTable.ironMG,
                          unit: 'mg',
                        },
                      ].map((item) => (
                        <Box
                          key={item.label}
                          sx={{
                            flex: {
                              xs: '1 0 100%',
                              sm: '1 0 calc(50% - 8px)',
                              md: '1 0 calc(25% - 12px)',
                            },
                            p: 1.5,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            bgcolor: 'background.default',
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" display="block">
                            {item.label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {item.value} {item.unit}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                )}
              </>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma informação nutricional encontrada para este ingrediente.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" size="large">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          size="large"
          disabled={!quantity || !purchasePrice || !purchaseQuantity}
          sx={{ minWidth: 120 }}
        >
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default IngredientDetailModal;
