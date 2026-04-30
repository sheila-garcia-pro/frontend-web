import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Search,
  Restaurant,
  Calculate,
  TrendingUp,
  AttachMoney,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { getMenuById, deleteMenu } from '../../services/api/menu';
import { getRecipes } from '../../services/api/recipes';
import { MenuDetails } from '../../types/menu';
import { Recipe } from '../../types/recipes';
import MenuModal from '../../components/ui/MenuModal/index';
import MenuDeleteModal from '../../components/ui/MenuDeleteModal/index';
import {
  calculateMenuFinancials,
  formatCurrency,
  formatPercentage,
  validateCalculations,
  MenuFinancialData,
} from '../../utils/menuCalculations';

const MenuDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Estados
  const [menu, setMenu] = useState<MenuDetails | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  // Estados dos modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Função para carregar dados
  const loadMenuDetails = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const [menuData, recipesData] = await Promise.all([
        getMenuById(id),
        getRecipes({ page: 1, itemPerPage: 1000 }),
      ]);

      setMenu(menuData);
      setRecipes(recipesData.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes do cardápio:', error);
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

  // Calcular dados financeiros
  const calculateFinancialData = () => {
    if (!menu) {
      return;
    }

    // Por ora, usando valores simulados - idealmente viriam da API ou cálculo real dos itens
    const itemsCost = menu.totalCost || 5.27; // Custo real dos ingredientes/receitas

    const calculated = calculateMenuFinancials({
      totalItems: menu.menuItems.length || 2,
      itemsCost: itemsCost,
      directCostsPercentage: 0, // Percentual dos custos diretos
      indirectCostsPercentage: 0, // Percentual dos custos indiretos
      sellPrice: menu.sellPrice || 0,
    });

    setFinancialData(calculated);

    // Validar os cálculos e exibir erros se houver
    const errors = validateCalculations(calculated);
    if (errors.length > 0) {
      console.warn('Inconsistências encontradas nos cálculos:', errors);
      errors.forEach((error) => {
        dispatch(
          addNotification({
            message: `Cálculo: ${error}`,
            type: 'warning',
            duration: 8000,
          }),
        );
      });
    }
  };

  useEffect(() => {
    loadMenuDetails();
  }, [id]);

  useEffect(() => {
    if (menu) {
      calculateFinancialData();
    }
  }, [menu]);

  // Função para obter dados da receita
  const getRecipeData = (recipeId: string) => {
    return recipes.find((r) => r._id === recipeId);
  };

  // Filtrar itens baseado na busca
  const filteredItems =
    menu?.menuItems.filter((item) => {
      const recipe = getRecipeData(item.idItem);
      return !searchTerm || recipe?.name.toLowerCase().includes(searchTerm.toLowerCase());
    }) || [];

  // Handlers
  const handleEdit = () => {
    setEditModalOpen(true);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const handleMenuSaved = () => {
    setEditModalOpen(false);
    loadMenuDetails();
  };

  const handleMenuDeleted = () => {
    setDeleteModalOpen(false);
    navigate('/menu');
  };

  const handleBack = () => {
    navigate('/menu');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      </Container>
    );
  }

  if (!menu) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">Cardápio não encontrado.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          mb: { xs: 3, sm: 4 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 3 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={handleBack}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: 0,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 600, mb: 0.5 }}
            >
              {menu.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {menu.description || 'Sem descrição'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={handleEdit}
            sx={{ borderRadius: 2, px: 2.5, textTransform: 'none', fontWeight: 600 }}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            sx={{ borderRadius: 2, px: 2.5, textTransform: 'none', fontWeight: 600 }}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Coluna principal - Lista de itens */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: { xs: 1, sm: 2 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: { xs: 2, sm: 3 },
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Itens
                  </Typography>
                  <Chip label={filteredItems.length} size="small" color="primary" />
                </Box>
              </Box>

              {/* Busca */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Digite aqui o nome da receita"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: 'background.default',
                    },
                  }}
                />
              </Box>

              {/* Lista de itens */}
              {filteredItems.length === 0 ? (
                <Box
                  sx={{
                    textAlign: 'center',
                    py: 4,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                  }}
                >
                  <Restaurant sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {searchTerm ? 'Nenhum item encontrado' : 'Nenhum item no cardápio'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchTerm
                      ? 'Tente ajustar os termos de busca'
                      : 'Edite o cardápio para adicionar itens'}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredItems.map((item, index) => {
                    const recipe = getRecipeData(item.idItem);
                    return (
                      <Paper
                        key={index}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          display: 'flex',
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: { xs: 2, sm: 3 },
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: 0,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        {/* Imagem da receita */}
                        <Box
                          sx={{
                            width: { xs: 64, sm: 80 },
                            height: { xs: 64, sm: 80 },
                            borderRadius: 2,
                            bgcolor: 'background.default',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: recipe?.image ? `url(${recipe.image})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        >
                          {!recipe?.image && (
                            <Restaurant sx={{ fontSize: 28, color: 'text.secondary' }} />
                          )}
                        </Box>

                        {/* Informações da receita */}
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {recipe?.name || 'Receita não encontrada'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                              label={`${item.quantityUsed} ${item.unitMesaure}`}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                            {recipe && (
                              <Chip label={recipe.category} size="small" variant="outlined" />
                            )}
                          </Box>
                        </Box>

                        {/* Informações de preço */}
                        <Box
                          sx={{
                            textAlign: 'right',
                            minWidth: 120,
                            alignSelf: { xs: 'flex-start', sm: 'center' },
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Venda
                          </Typography>
                          <Typography variant="h6" color="success.main" sx={{ fontWeight: 600 }}>
                            R$ 9,65
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Custo
                          </Typography>
                          <Typography variant="body2" color="error.main" sx={{ fontWeight: 600 }}>
                            R$ 7,33
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem' }}
                          >
                            Lucro
                          </Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            R$ 7,33
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Coluna lateral - Financeiro */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              position: { xs: 'static', lg: 'sticky' },
              top: { lg: 24 },
              borderRadius: { xs: 2, sm: 3 },
              boxShadow: { xs: 1, sm: 2 },
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Calculate />
                Financeiro
              </Typography>

              <Divider sx={{ my: 2 }} />

              {/* Custo total */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    CUSTO TOTAL
                  </Typography>
                </Box>
                <Typography variant="h4" color="error.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(financialData.totalCost)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Custo unitário */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    CUSTO UNITÁRIO
                  </Typography>
                </Box>
                <Typography variant="h4" color="warning.main" sx={{ fontWeight: 600 }}>
                  {formatCurrency(financialData.unitCost)}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Seção de custos detalhados */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                  CUSTOS DETALHADOS
                </Typography>

                {/* Custo dos itens */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: 'primary.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Restaurant fontSize="small" sx={{ color: 'primary.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        CUSTO DOS ITENS
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`${((financialData.itemsCost / (financialData.totalCost || 1)) * 100).toFixed(1)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(financialData.itemsCost)}
                  </Typography>
                </Box>

                {/* Custos diretos */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: 'warning.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AttachMoney fontSize="small" sx={{ color: 'warning.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        CUSTOS DIRETOS
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`${((financialData.directCosts / (financialData.totalCost || 1)) * 100).toFixed(1)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(financialData.directCosts)}
                  </Typography>
                </Box>

                {/* Custos indiretos */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: 'info.light',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <TrendingUp fontSize="small" sx={{ color: 'info.main' }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        CUSTOS INDIRETOS
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`${((financialData.indirectCosts / (financialData.totalCost || 1)) * 100).toFixed(1)}%`}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {formatCurrency(financialData.indirectCosts)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Preço de venda e margem */}
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    PREÇO DE VENDA
                  </Typography>
                  <Typography variant="h4" color="success.main" sx={{ fontWeight: 600 }}>
                    {formatCurrency(financialData.sellPrice)}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    MARGEM DE LUCRO:
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h4"
                      color={financialData.profitMargin >= 0 ? 'primary.main' : 'error.main'}
                      sx={{ fontWeight: 600 }}
                    >
                      {formatPercentage(financialData.profitMargin)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      MARKUP: {formatPercentage(financialData.markup)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Modais */}
      <MenuModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onMenuSaved={handleMenuSaved}
        menu={
          menu
            ? {
                _id: menu._id,
                name: menu.name,
                totalItems: menu.totalItems || menu.menuItems.length,
              }
            : null
        }
        editMode={true}
      />

      <MenuDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onMenuDeleted={handleMenuDeleted}
        menu={
          menu
            ? {
                _id: menu._id,
                name: menu.name,
                totalItems: menu.totalItems || menu.menuItems.length,
              }
            : null
        }
      />
    </Container>
  );
};

export default MenuDetailsPage;
