import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Divider,
  IconButton,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Close,
  Search,
  Add,
  Delete,
  Restaurant,
  Calculate,
  AttachMoney,
  AccountBalance,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import {
  createMenu,
  updateMenu,
  getMenuById,
  getRecipesIngredients,
} from '../../../services/api/menu';
import { getUnitMeasures } from '../../../services/api/unitMeasure';
import {
  MenuListItem,
  CreateMenuParams,
  MenuItem as MenuItemType,
  MenuDetails,
} from '../../../types/menu';
import { Recipe } from '../../../types/recipes';
import { Ingredient } from '../../../types/ingredients';
import { UnitMeasure } from '../../../types/unitMeasure';
import {
  calculateMenuFinancials,
  formatCurrency,
  formatPercentage,
  MenuFinancialData,
} from '../../../utils/menuCalculations';

interface MenuModalProps {
  open: boolean;
  onClose: () => void;
  onMenuSaved: () => void;
  menu?: MenuListItem | null;
  editMode?: boolean;
}

interface SearchResult {
  _id: string;
  name: string;
  category: string;
  type: 'recipe' | 'ingredient';
}

const MenuModal: React.FC<MenuModalProps> = ({
  open,
  onClose,
  onMenuSaved,
  menu,
  editMode = false,
}) => {
  const dispatch = useDispatch();

  // Estados do formulário
  const [formData, setFormData] = useState<CreateMenuParams>({
    name: '',
    description: '',
    menuItems: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  // Estados para busca de receitas e ingredientes
  const [itemSearch, setItemSearch] = useState('');
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [allFoundItems, setAllFoundItems] = useState<SearchResult[]>([]); // Cache de todos os itens encontrados
  const [loadingItems, setLoadingItems] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Indica se o usuário está digitando
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Estados para unidades de medida
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // Estados financeiros (calculados)
  const [financialData, setFinancialData] = useState<MenuFinancialData>({
    totalCost: 0,
    unitCost: 0,
    sellPrice: 0,
    profitMargin: 0,
    markup: 0,
    itemsCost: 0,
    directCosts: 0,
    indirectCosts: 0,
  });

  // Estados para custos detalhados
  const [directCosts, setDirectCosts] = useState<
    Array<{
      id: string;
      name: string;
      value: number;
      isPercentage?: boolean;
    }>
  >([]);

  const [indirectCosts, setIndirectCosts] = useState<
    Array<{
      id: string;
      name: string;
      value: number;
      monthlyRevenue?: number;
    }>
  >([]);

  // Estados para preço de venda
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);

  // Carregar dados iniciais
  useEffect(() => {
    if (open) {
      loadRecipesAndIngredients();
      loadUnitMeasures();
      if (editMode && menu) {
        loadMenuDetails(menu._id);
      } else {
        resetForm();
      }
    }

    // Cleanup function para limpar timeout ao desmontar
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [open, editMode, menu]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      yield: undefined,
      yieldUnit: '',
      menuItems: [],
    });
    setErrors({});
    setItemSearch('');
    setFilteredResults([]);
    setAllFoundItems([]); // Limpar cache de itens
    setIsTyping(false); // Resetar estado de digitação
    setDirectCosts([]);
    setIndirectCosts([]);
    setSellPrice(0);
    setMonthlyRevenue(0);

    // Limpar timeout de busca
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }

    setFinancialData({
      totalCost: 0,
      unitCost: 0,
      sellPrice: 0,
      profitMargin: 0,
      markup: 0,
      itemsCost: 0,
      directCosts: 0,
      indirectCosts: 0,
    });
  };

  const loadMenuDetails = async (menuId: string) => {
    try {
      setLoading(true);
      const menuDetails = await getMenuById(menuId);
      setFormData({
        name: menuDetails.name,
        description: menuDetails.description || '',
        yield: menuDetails.yield,
        yieldUnit: menuDetails.yieldUnit || '',
        menuItems: menuDetails.menuItems,
      });

      // Carregar os dados dos itens existentes no menu para o cache
      if (menuDetails.menuItems && menuDetails.menuItems.length > 0) {
        const itemIds = menuDetails.menuItems.map((item) => item.idItem);
        await loadItemsForCache(itemIds);
      }

      // Carregar custos detalhados se disponíveis
      if (menuDetails.directCosts) {
        setDirectCosts(menuDetails.directCosts);
      }
      if (menuDetails.indirectCosts) {
        setIndirectCosts(menuDetails.indirectCosts);
      }
      if (menuDetails.sellPrice) {
        setSellPrice(menuDetails.sellPrice);
      }

      if (menuDetails.totalCost !== undefined) {
        const calculated = calculateMenuFinancials({
          totalItems: menuDetails.menuItems.length,
          itemsCost: menuDetails.totalCost || 0,
          directCostsPercentage: 0,
          indirectCostsPercentage: 0,
          sellPrice: menuDetails.sellPrice || 0,
        });
        setFinancialData(calculated);
      }
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar detalhes do cardápio.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para carregar dados dos itens para o cache
  const loadItemsForCache = async (itemIds: string[]) => {
    try {
      // Fazer uma busca genérica para tentar carregar os dados dos itens
      const response = await getRecipesIngredients({
        name: '', // Busca vazia para obter mais itens
        page: 1,
        itemPerPage: 50, // Aumentar o limite para tentar pegar os itens existentes
      });

      if (response.data && Array.isArray(response.data)) {
        const results = response.data.map((item) => ({
          ...item,
          type: item.type as 'recipe' | 'ingredient',
        }));

        // Filtrar apenas os itens que estão no menu
        const menuItems = results.filter((item) => itemIds.includes(item._id));
        setAllFoundItems(menuItems);
      }
    } catch (error) {
      // Error logging removed
    }
  };

  const loadRecipesAndIngredients = async () => {
    // Não precisamos mais carregar itens iniciais,
    // pois a busca será feita dinamicamente via API
  };

  const loadUnitMeasures = async () => {
    try {
      setLoadingUnits(true);
      const units = await getUnitMeasures();
      setUnitMeasures(units);
    } catch (error) {
      // Error logging removed
    } finally {
      setLoadingUnits(false);
    }
  };

  // Função otimizada para buscar itens com base no termo de busca
  const searchItems = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setFilteredResults([]);
        return;
      }

      try {
        setLoadingItems(true);

        // Usar apenas a nova API unificada
        const response = await getRecipesIngredients({
          name: searchTerm,
          page: 1,
          itemPerPage: 15, // Limitado para melhor performance
        });

        // Vamos ver o que cada item tem
        if (response.data && Array.isArray(response.data)) {
          const results = response.data.map((item) => {
            // Determinar o ID correto - acessar propriedades com segurança
            const itemAny = item as any;
            const itemId = item._id || item.id || itemAny.idItem || itemAny.idReceita || itemAny.idIngrediente || itemAny.itemId;

            return {
              _id: itemId,
              name: item.name,
              category: item.category,
              type: (item.type || 'ingredient') as 'recipe' | 'ingredient',
            };
          });
          
          setFilteredResults(results);

          // Adicionar os novos resultados ao cache, evitando duplicatas
          setAllFoundItems((prev) => {
            const existing = prev.map((item) => item._id);
            const newItems = results.filter((item) => item._id && !existing.includes(item._id));
            return [...prev, ...newItems];
          });
        } else {
          setFilteredResults([]);
        }
      } catch (error) {
        setFilteredResults([]);
        dispatch(
          addNotification({
            message: 'Erro ao buscar itens. Tente novamente.',
            type: 'error',
            duration: 3000,
          }),
        );
      } finally {
        setLoadingItems(false);
        setIsTyping(false); // Garantir que o estado de digitação seja limpo
      }
    },
    [dispatch],
  ); // Dependências do useCallback

  // Handler otimizado para mudança no campo de busca com debounce inteligente
  const handleSearchChange = useCallback(
    (value: string) => {
      setItemSearch(value);
      setIsTyping(true); // Usuário começou a digitar

      // Limpar timeout anterior
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Se o campo estiver vazio, limpar resultados imediatamente
      if (!value.trim()) {
        setFilteredResults([]);
        setLoadingItems(false);
        setIsTyping(false);
        return;
      }

      // Configurar novo timeout para busca - só busca quando o usuário para de digitar
      const timeout = setTimeout(() => {
        setIsTyping(false); // Usuário parou de digitar
        searchItems(value);
      }, 500); // 500ms para garantir que o usuário parou de digitar

      setSearchTimeout(timeout);
    },
    [searchItems, searchTimeout],
  );

  // Recalcular dados financeiros quando os itens do menu ou custos mudarem
  useEffect(() => {
    if (formData.menuItems.length > 0) {
      // Custo base dos itens (estimado)
      const itemsCost = formData.menuItems.length * 2.5;

      // Calcular custos diretos
      let totalDirectCosts = 0;
      directCosts.forEach((cost) => {
        if (cost.isPercentage) {
          totalDirectCosts += (sellPrice * cost.value) / 100;
        } else {
          totalDirectCosts += cost.value;
        }
      });

      // Calcular custos indiretos (rateio)
      let totalIndirectCosts = 0;
      if (monthlyRevenue > 0) {
        indirectCosts.forEach((cost) => {
          const costPercentage = cost.value / monthlyRevenue;
          totalIndirectCosts += sellPrice * costPercentage;
        });
      }

      const totalCost = itemsCost + totalDirectCosts + totalIndirectCosts;
      const unitCost =
        (formData.yield || formData.menuItems.length) > 0
          ? totalCost / (formData.yield || formData.menuItems.length)
          : 0;

      let profitMargin = 0;
      let markup = 0;

      if (sellPrice > 0 && totalCost > 0) {
        profitMargin = ((sellPrice - totalCost) / sellPrice) * 100;
        markup = ((sellPrice - totalCost) / totalCost) * 100;
      }

      setFinancialData({
        totalCost,
        unitCost,
        sellPrice,
        profitMargin,
        markup,
        itemsCost,
        directCosts: totalDirectCosts,
        indirectCosts: totalIndirectCosts,
      });
    } else {
      setFinancialData({
        totalCost: 0,
        unitCost: 0,
        sellPrice: 0,
        profitMargin: 0,
        markup: 0,
        itemsCost: 0,
        directCosts: 0,
        indirectCosts: 0,
      });
    }
  }, [formData.menuItems, formData.yield, directCosts, indirectCosts, sellPrice, monthlyRevenue]);

  const handleInputChange = (field: keyof CreateMenuParams, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddItem = (item: SearchResult) => {
    // Validar se o item tem um ID válido
    if (!item._id) {
      dispatch(
        addNotification({
          message: 'Erro: Item sem identificador válido. Tente novamente.',
          type: 'error',
          duration: 3000,
        }),
      );
      return;
    }

    const existingItem = formData.menuItems.find((menuItem) => menuItem.idItem === item._id);

    if (existingItem) {
      dispatch(
        addNotification({
          message: `Este ${item.type === 'recipe' ? 'receita' : 'ingrediente'} já foi adicionado ao cardápio.`,
          type: 'warning',
          duration: 3000,
        }),
      );
      return;
    }

    // Adicionar item ao cache se ainda não estiver lá
    setAllFoundItems((prev) => {
      const exists = prev.some((cached) => cached._id === item._id);
      if (!exists) {
        return [...prev, item];
      }
      return prev;
    });

    const newItem: MenuItemType = {
      idItem: item._id,
      quantityUsed: '1',
      unitMesaure: unitMeasures[0]?.name || 'Porções',
    };

    setFormData((prev) => ({
      ...prev,
      menuItems: [...prev.menuItems, newItem],
    }));
    setItemSearch('');
    setFilteredResults([]);
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.filter((_, i) => i !== index),
    }));
  };

  const handleItemChange = (index: number, field: keyof MenuItemType, value: string) => {
    setFormData((prev) => ({
      ...prev,
      menuItems: prev.menuItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  // Funções para gerenciar custos diretos
  const handleAddDirectCost = () => {
    const newCost = {
      id: Date.now().toString(),
      name: '',
      value: 0,
      isPercentage: false,
    };
    setDirectCosts((prev) => [...prev, newCost]);
  };

  const handleUpdateDirectCost = (id: string, field: string, value: any) => {
    setDirectCosts((prev) =>
      prev.map((cost) => (cost.id === id ? { ...cost, [field]: value } : cost)),
    );
  };

  const handleRemoveDirectCost = (id: string) => {
    setDirectCosts((prev) => prev.filter((cost) => cost.id !== id));
  };

  // Funções para gerenciar custos indiretos
  const handleAddIndirectCost = () => {
    const newCost = {
      id: Date.now().toString(),
      name: '',
      value: 0,
      monthlyRevenue: monthlyRevenue,
    };
    setIndirectCosts((prev) => [...prev, newCost]);
  };

  const handleUpdateIndirectCost = (id: string, field: string, value: any) => {
    setIndirectCosts((prev) =>
      prev.map((cost) => (cost.id === id ? { ...cost, [field]: value } : cost)),
    );
  };

  const handleRemoveIndirectCost = (id: string) => {
    setIndirectCosts((prev) => prev.filter((cost) => cost.id !== id));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do cardápio é obrigatório';
    }

    if (formData.menuItems.length === 0) {
      newErrors.menuItems = 'Adicione pelo menos uma receita ou ingrediente ao cardápio';
    }

    // Validar rendimento
    if (formData.yield && formData.yield <= 0) {
      newErrors.yield = 'Rendimento deve ser maior que zero';
    }

    // Validar itens do menu
    formData.menuItems.forEach((item, index) => {
      if (!item.quantityUsed || parseFloat(item.quantityUsed) <= 0) {
        newErrors[`quantity_${index}`] = 'Quantidade deve ser maior que zero';
      }
    });

    // Validar custos diretos
    directCosts.forEach((cost, index) => {
      if (!cost.name.trim()) {
        newErrors[`directCost_name_${index}`] = 'Nome do custo é obrigatório';
      }
      if (cost.value < 0) {
        newErrors[`directCost_value_${index}`] = 'Valor deve ser maior ou igual a zero';
      }
    });

    // Validar custos indiretos
    indirectCosts.forEach((cost, index) => {
      if (!cost.name.trim()) {
        newErrors[`indirectCost_name_${index}`] = 'Nome do custo é obrigatório';
      }
      if (cost.value < 0) {
        newErrors[`indirectCost_value_${index}`] = 'Valor deve ser maior ou igual a zero';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Preparar payload com dados financeiros
      const menuPayload = {
        ...formData,
        sellPrice,
        directCosts,
        indirectCosts,
      };

      if (editMode && menu) {
        await updateMenu(menu._id, menuPayload);
        dispatch(
          addNotification({
            message: 'Cardápio atualizado com sucesso!',
            type: 'success',
            duration: 4000,
          }),
        );
      } else {
        await createMenu(menuPayload);
        dispatch(
          addNotification({
            message: 'Cardápio criado com sucesso!',
            type: 'success',
            duration: 4000,
          }),
        );
      }
      onMenuSaved();
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao salvar cardápio. Tente novamente.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const getItemName = (itemId: string): string => {
    // Primeiro procurar no cache de todos os itens encontrados
    const item = allFoundItems.find((item) => item._id === itemId);
    if (item) {
      return item.name;
    }

    // Como fallback, procurar nos resultados filtrados atuais
    const filteredItem = filteredResults.find((item) => item._id === itemId);
    if (filteredItem) {
      return filteredItem.name;
    }

    return 'Item não encontrado';
  };

  const getItemType = (itemId: string): 'recipe' | 'ingredient' | 'unknown' => {
    // Primeiro procurar no cache de todos os itens encontrados
    const item = allFoundItems.find((item) => item._id === itemId);
    if (item) {
      return item.type;
    }

    // Como fallback, procurar nos resultados filtrados atuais
    const filteredItem = filteredResults.find((item) => item._id === itemId);
    if (filteredItem) {
      return filteredItem.type;
    }

    return 'unknown';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh', // Reduzir um pouco para dar mais espaço
          height: 'auto',
          margin: '12px', // Adicionar margem para melhor visualização
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Restaurant color="primary" />
            <Box>
              <Typography variant="h5" component="h2">
                {editMode ? 'Editar Cardápio' : 'Novo Cardápio'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {editMode
                  ? 'Faça as alterações necessárias no seu cardápio'
                  : 'Crie um novo cardápio adicionando receitas e ingredientes'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent
        sx={{
          overflow: 'auto',
          maxHeight: 'calc(90vh - 140px)', // Ajustar para dar mais espaço
          padding: '12px 20px', // Reduzir padding
        }}
      >
        {loading && editMode ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Informações básicas */}
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Informações Básicas
                </Typography>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Nome do cardápio"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      disabled={loading}
                      placeholder="Ex: Menu Executivo, Cardápio de Sobremesas..."
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Descrição"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={loading}
                      placeholder="Descreva seu cardápio..."
                    />
                  </Grid>

                  {/* Campos de rendimento */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Rendimento"
                      value={formData.yield || ''}
                      onChange={(e) => handleInputChange('yield', e.target.value)}
                      disabled={loading}
                      placeholder="Ex: 4, 10, 20..."
                      InputProps={{
                        inputProps: { min: 0, step: 1 },
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth disabled={loading}>
                      <InputLabel>Medida do Rendimento</InputLabel>
                      <Select
                        value={formData.yieldUnit || ''}
                        onChange={(e) => handleInputChange('yieldUnit', e.target.value)}
                        label="Medida do Rendimento"
                      >
                        <MenuItem value="Porções">Porções</MenuItem>
                        <MenuItem value="Pessoas">Pessoas</MenuItem>
                        <MenuItem value="Unidades">Unidades</MenuItem>
                        <MenuItem value="Gramas">Gramas</MenuItem>
                        <MenuItem value="Quilos">Quilos</MenuItem>
                        <MenuItem value="Litros">Litros</MenuItem>
                        <MenuItem value="Mililitros">Mililitros</MenuItem>
                        <MenuItem value="Fatias">Fatias</MenuItem>
                        <MenuItem value="Pedaços">Pedaços</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Itens do cardápio */}
            <Card variant="outlined">
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Restaurant />
                  Itens do Cardápio
                </Typography>

                {errors.menuItems && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.menuItems}
                  </Alert>
                )}

                {/* Busca de receitas e ingredientes */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder={'Digite aqui o nome da receita ou ingrediente...'}
                    value={itemSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    disabled={loading}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {loadingItems ? (
                            <CircularProgress size={20} />
                          ) : isTyping ? (
                            <Search sx={{ color: 'warning.main' }} />
                          ) : (
                            <Search />
                          )}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'background.paper',
                      },
                    }}
                  />

                  {/* Lista de resultados filtrados */}
                  {itemSearch && filteredResults.length > 0 && (
                    <Box
                      sx={{
                        mt: 1,
                        maxHeight: 200,
                        overflow: 'auto',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      {filteredResults.slice(0, 5).map((item, index) => (
                        <Box
                          key={item._id || `item-${index}`}
                          component="button"
                          sx={{
                            width: '100%',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            border: 'none',
                            bgcolor: 'transparent',
                            cursor: 'pointer',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-child': {
                              borderBottom: 'none',
                            },
                            '&:focus': {
                              outline: '2px solid',
                              outlineColor: 'primary.main',
                              outlineOffset: '-2px',
                            },
                          }}
                          onClick={() => handleAddItem(item)}
                        >
                          <Add color="primary" />
                          <Box sx={{ flexGrow: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, color: 'text.primary' }}
                              >
                                {item.name}
                              </Typography>
                              <Chip
                                label={item.type === 'recipe' ? 'Receita' : 'Ingrediente'}
                                size="small"
                                color={item.type === 'recipe' ? 'primary' : 'secondary'}
                                variant="outlined"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {item.category}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {/* Mensagem quando não há resultados */}
                  {itemSearch && filteredResults.length === 0 && (
                    <Box
                      sx={{
                        mt: 1,
                        p: 3,
                        textAlign: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        Nenhum resultado encontrado para "{itemSearch}"
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tente usar palavras-chave diferentes ou verifique a ortografia
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Lista de itens adicionados */}
                {formData.menuItems.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {formData.menuItems.map((item, index) => {
                      const itemType = getItemType(item.idItem);
                      return (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 500, color: 'text.primary' }}
                                >
                                  {getItemName(item.idItem)}
                                </Typography>
                                <Chip
                                  label={itemType === 'recipe' ? 'Receita' : 'Ingrediente'}
                                  size="small"
                                  color={itemType === 'recipe' ? 'primary' : 'secondary'}
                                  variant="outlined"
                                />
                              </Box>

                              <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 6 }}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Quantidade"
                                    type="number"
                                    value={item.quantityUsed}
                                    onChange={(e) =>
                                      handleItemChange(index, 'quantityUsed', e.target.value)
                                    }
                                    error={!!errors[`quantity_${index}`]}
                                    helperText={errors[`quantity_${index}`]}
                                    disabled={loading}
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
                                </Grid>

                                <Grid size={{ xs: 6 }}>
                                  <FormControl fullWidth size="small">
                                    <Select
                                      value={item.unitMesaure}
                                      onChange={(e) =>
                                        handleItemChange(index, 'unitMesaure', e.target.value)
                                      }
                                      disabled={loading || loadingUnits}
                                    >
                                      {unitMeasures.map((unit) => (
                                        <MenuItem key={unit._id} value={unit.name}>
                                          {unit.name}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                              </Grid>
                            </Box>

                            <IconButton
                              onClick={() => handleRemoveItem(index)}
                              color="error"
                              disabled={loading}
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Restaurant sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      Nenhum item adicionado ainda
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Use a busca acima para encontrar e adicionar receitas ou ingredientes ao seu
                      cardápio
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Informações financeiras */}
            {formData.menuItems.length > 0 && (
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Calculate />
                    Financeiro
                  </Typography>

                  {/* Campos de entrada financeira */}
                  <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Preço de Venda Total"
                          type="number"
                          value={sellPrice}
                          onChange={(e) => setSellPrice(Number(e.target.value))}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            inputProps: { min: 0, step: 0.01 },
                          }}
                          disabled={loading}
                        />
                      </Grid>

                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Faturamento Médio Mensal"
                          type="number"
                          value={monthlyRevenue}
                          onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                            inputProps: { min: 0, step: 0.01 },
                          }}
                          disabled={loading}
                          helperText="Usado para calcular custos indiretos"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Custos Diretos */}
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <AttachMoney />
                        Custos Diretos
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddDirectCost}
                        startIcon={<Add />}
                        disabled={loading}
                      >
                        Adicionar
                      </Button>
                    </Box>

                    {directCosts.map((cost) => (
                      <Box
                        key={cost.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: 'background.default',
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nome do custo"
                              value={cost.name}
                              onChange={(e) =>
                                handleUpdateDirectCost(cost.id, 'name', e.target.value)
                              }
                              disabled={loading}
                            />
                          </Grid>

                          <Grid size={{ xs: 8, sm: 3 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Valor"
                              type="number"
                              value={cost.value}
                              onChange={(e) =>
                                handleUpdateDirectCost(cost.id, 'value', Number(e.target.value))
                              }
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    {cost.isPercentage ? '%' : 'R$'}
                                  </InputAdornment>
                                ),
                                inputProps: { min: 0, step: cost.isPercentage ? 0.1 : 0.01 },
                              }}
                              disabled={loading}
                            />
                          </Grid>

                          <Grid size={{ xs: 4, sm: 3 }}>
                            <FormControl fullWidth size="small">
                              <Select
                                value={cost.isPercentage ? 'percentage' : 'fixed'}
                                onChange={(e) =>
                                  handleUpdateDirectCost(
                                    cost.id,
                                    'isPercentage',
                                    e.target.value === 'percentage',
                                  )
                                }
                                disabled={loading}
                              >
                                <MenuItem value="fixed">Valor Fixo</MenuItem>
                                <MenuItem value="percentage">Percentual</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 2 }}>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveDirectCost(cost.id)}
                              disabled={loading}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>

                  {/* Custos Indiretos */}
                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <AccountBalance />
                        Custos Indiretos (Rateio)
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleAddIndirectCost}
                        startIcon={<Add />}
                        disabled={loading}
                      >
                        Adicionar
                      </Button>
                    </Box>

                    {indirectCosts.map((cost) => (
                      <Box
                        key={cost.id}
                        sx={{
                          p: 2,
                          mb: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: 'background.default',
                        }}
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid size={{ xs: 12, sm: 5 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Nome do custo"
                              value={cost.name}
                              onChange={(e) =>
                                handleUpdateIndirectCost(cost.id, 'name', e.target.value)
                              }
                              disabled={loading}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 5 }}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Valor Mensal"
                              type="number"
                              value={cost.value}
                              onChange={(e) =>
                                handleUpdateIndirectCost(cost.id, 'value', Number(e.target.value))
                              }
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">R$</InputAdornment>
                                ),
                                inputProps: { min: 0, step: 0.01 },
                              }}
                              disabled={loading}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 2 }}>
                            <IconButton
                              color="error"
                              onClick={() => handleRemoveIndirectCost(cost.id)}
                              disabled={loading}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>

                  {/* Resumo financeiro simplificado */}
                  <Box
                    sx={{
                      mt: 2,
                      p: { xs: 1, sm: 2 },
                      bgcolor: 'background.default',
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        mb: 1.5,
                        textAlign: 'center',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      }}
                    >
                      Resumo Financeiro
                    </Typography>

                    <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                      {/* Layout otimizado para todas as telas */}
                      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.5 }, // Padding responsivo
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            minHeight: { xs: '60px', sm: '70px' }, // Altura mínima responsiva
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mb: 0.5,
                              lineHeight: 1.2,
                              fontSize: '0.75rem',
                              fontWeight: 500,
                            }}
                          >
                            Custo Total
                          </Typography>
                          <Typography
                            variant="h6"
                            color="error.main"
                            fontWeight="600"
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word',
                            }}
                          >
                            {formatCurrency(financialData.totalCost)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Box
                          sx={{
                            p: 1.5,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            minHeight: { xs: '60px', sm: '70px' },
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mb: 0.5,
                              lineHeight: 1.2,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              fontWeight: 500,
                            }}
                          >
                            Custo Unitário
                          </Typography>
                          <Typography
                            variant="h6"
                            color="warning.main"
                            fontWeight="600"
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word',
                            }}
                          >
                            {formatCurrency(financialData.unitCost)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            minHeight: { xs: '60px', sm: '70px' },
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mb: 0.5,
                              lineHeight: 1.2,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              fontWeight: 500,
                            }}
                          >
                            Preço de Venda
                          </Typography>
                          <Typography
                            variant="h6"
                            color="success.main"
                            fontWeight="600"
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word',
                            }}
                          >
                            {formatCurrency(sellPrice)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                        <Box
                          sx={{
                            p: { xs: 1, sm: 1.5 },
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            minHeight: { xs: '60px', sm: '70px' },
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              mb: 0.5,
                              lineHeight: 1.2,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              fontWeight: 500,
                            }}
                          >
                            Margem de Lucro
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="600"
                            color={financialData.profitMargin >= 0 ? 'primary.main' : 'error.main'}
                            sx={{
                              fontSize: { xs: '1rem', sm: '1.1rem' },
                              lineHeight: 1.2,
                              wordBreak: 'break-word',
                            }}
                          >
                            {formatPercentage(financialData.profitMargin)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ gap: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading
            ? editMode
              ? 'Salvando...'
              : 'Criando...'
            : editMode
              ? 'Salvar Alterações'
              : 'Criar Cardápio'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MenuModal;
