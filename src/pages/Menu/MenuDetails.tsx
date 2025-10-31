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
  PictureAsPdf,
  Download,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { getMenuById, deleteMenu } from '../../services/api/menu';
import { getRecipes } from '../../services/api/recipes';
import { MenuDetails } from '../../types/menu';
import { Recipe } from '../../types/recipes';
import MenuModal from '../../components/ui/MenuModal/index';
import MenuDeleteModal from '../../components/ui/MenuDeleteModal/index';
import { useMenuPDF } from '../../hooks/useMenuPDF';
import { usePDFModal } from '../../hooks/usePDFModal';
import { PDFModal } from '../../components/pdf';
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
    totalCost: 5.27,
    unitCost: 2.64,
    sellPrice: 15.5,
    profitMargin: 66.5,
    markup: 194.0,
    itemsCost: 5.27,
    directCosts: 0,
    indirectCosts: 0,
  });

  // Estados dos modais
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Hooks para PDF
  const { isGenerating, downloadPDF, previewPDF, convertMenuToPDFData } = useMenuPDF();
  const { isModalOpen, pdfUrl, openModal, closeModal } = usePDFModal();

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

    // Debug: log do menu para verificar dados
    console.log('Menu data:', menu);

    // Por ora, usando valores simulados - idealmente viriam da API ou cálculo real dos itens
    const itemsCost = menu.totalCost || 5.27; // Custo real dos ingredientes/receitas
    const sellPrice = menu.sellPrice || 15.5; // Preço de venda padrão

    console.log('itemsCost:', itemsCost, 'sellPrice:', sellPrice);

    const calculated = calculateMenuFinancials({
      totalItems: menu.menuItems?.length || 2,
      itemsCost: itemsCost,
      directCostsPercentage: 0, // Percentual dos custos diretos
      indirectCostsPercentage: 0, // Percentual dos custos indiretos
      sellPrice: sellPrice,
    });

    console.log('Calculated financial data:', calculated);

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

  // Handlers para PDF
  const handlePreviewPDF = async () => {
    if (!menu) return;

    try {
      const pdfData = await convertMenuToPDFData(menu);
      const url = await previewPDF(pdfData);
      openModal(url);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao gerar visualização do PDF',
          type: 'error',
          duration: 4000,
        }),
      );
    }
  };

  const handleDownloadPDF = async () => {
    if (!menu) return;

    try {
      const pdfData = await convertMenuToPDFData(menu);
      await downloadPDF(pdfData);
      dispatch(
        addNotification({
          message: 'PDF baixado com sucesso!',
          type: 'success',
          duration: 3000,
        }),
      );
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao baixar PDF',
          type: 'error',
          duration: 4000,
        }),
      );
    }
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
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack} color="primary">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
              {menu.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {menu.description || 'Sem descrição'}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 1, sm: 2 },
            flexShrink: 0,
            flexWrap: { xs: 'wrap', lg: 'nowrap' },
            width: { xs: '100%', sm: 'auto' },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={handlePreviewPDF}
            disabled={isGenerating}
            size="small"
            sx={{
              borderRadius: 3,
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              minWidth: { xs: 'auto', sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            {isGenerating ? 'Gerando...' : 'Ver PDF'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            size="small"
            sx={{
              borderRadius: 3,
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              minWidth: { xs: 'auto', sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            {isGenerating ? 'Gerando...' : 'Baixar'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={handleEdit}
            size="small"
            sx={{
              borderRadius: 3,
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              minWidth: { xs: 'auto', sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
            size="small"
            sx={{
              borderRadius: 3,
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              minWidth: { xs: 'auto', sm: 'auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
            }}
          >
            Excluir
          </Button>
        </Box>
      </Box>

      {/* Layout responsivo - Financeiro primeiro em mobile */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 3, md: 4 } }}>
        {/* Seção Financeira - Aparece primeiro em mobile */}
        <Card
          sx={{
            order: { xs: 1, lg: 2 },
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[2],
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
                color: 'primary.main',
                mb: 3,
              }}
            >
              <Calculate />
              Resumo Financeiro
            </Typography>

            {/* Grid dos indicadores principais */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {/* Custo Total */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.15)' : 'error.light',
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#ff7961' : 'error.contrastText',
                    border: (theme) =>
                      theme.palette.mode === 'dark' ? '1px solid rgba(244, 67, 54, 0.3)' : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    CUSTO TOTAL
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatCurrency(financialData.totalCost) || 'R$ 0,00'}
                  </Typography>
                </Box>
              </Grid>

              {/* Custo Unitário */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'warning.light',
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#ffb74d' : 'warning.contrastText',
                    border: (theme) =>
                      theme.palette.mode === 'dark' ? '1px solid rgba(255, 152, 0, 0.3)' : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    CUSTO UNIT.
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatCurrency(financialData.unitCost) || 'R$ 0,00'}
                  </Typography>
                </Box>
              </Grid>

              {/* Preço de Venda */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.15)' : 'success.light',
                    color: (theme) =>
                      theme.palette.mode === 'dark' ? '#81c784' : 'success.contrastText',
                    border: (theme) =>
                      theme.palette.mode === 'dark' ? '1px solid rgba(76, 175, 80, 0.3)' : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    PREÇO VENDA
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatCurrency(financialData.sellPrice) || 'R$ 0,00'}
                  </Typography>
                </Box>
              </Grid>

              {/* Margem de Lucro */}
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (theme) => {
                      const isProfit = financialData.profitMargin >= 0;
                      if (theme.palette.mode === 'dark') {
                        return isProfit ? 'rgba(63, 81, 181, 0.15)' : 'rgba(244, 67, 54, 0.15)';
                      }
                      return isProfit ? 'primary.light' : 'error.light';
                    },
                    color: (theme) => {
                      const isProfit = financialData.profitMargin >= 0;
                      if (theme.palette.mode === 'dark') {
                        return isProfit ? '#7986cb' : '#ff7961';
                      }
                      return isProfit ? 'primary.contrastText' : 'error.contrastText';
                    },
                    border: (theme) =>
                      theme.palette.mode === 'dark'
                        ? `1px solid ${
                            financialData.profitMargin >= 0
                              ? 'rgba(63, 81, 181, 0.3)'
                              : 'rgba(244, 67, 54, 0.3)'
                          }`
                        : 'none',
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    MARGEM
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {formatPercentage(financialData.profitMargin) || '0%'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Detalhamento dos custos */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
                DETALHAMENTO DOS CUSTOS
              </Typography>

              <Grid container spacing={2}>
                {/* Custo dos Itens */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
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
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Custo dos Itens
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(financialData.itemsCost)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Custos Diretos */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
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
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Custos Diretos
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(financialData.directCosts)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Custos Indiretos */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
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
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        Custos Indiretos
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {formatCurrency(financialData.indirectCosts)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Seção de Itens do Cardápio */}
        <Card sx={{ order: { xs: 2, lg: 1 }, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: 3,
                gap: { xs: 2, sm: 0 },
              }}
            >
              <Typography
                variant="h5"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}
              >
                <Restaurant />
                Itens do Cardápio
                <Chip label={filteredItems.length} size="small" color="primary" />
              </Typography>
            </Box>

            {/* Busca */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Digite aqui o nome da receita..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>

            {/* Lista de itens */}
            {filteredItems.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
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
              <Grid container spacing={2}>
                {filteredItems.map((item, index) => {
                  const recipe = getRecipeData(item.idItem);
                  return (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: (theme) => theme.shadows[8],
                          },
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        {/* Imagem da receita */}
                        <Box
                          sx={{
                            width: '100%',
                            height: 120,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundImage: recipe?.image ? `url(${recipe.image})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            mb: 2,
                          }}
                        >
                          {!recipe?.image && <Restaurant sx={{ fontSize: 40, color: 'white' }} />}
                        </Box>

                        {/* Informações da receita */}
                        <Box sx={{ flexGrow: 1, mb: 2 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.2 }}>
                            {recipe?.name || 'Receita não encontrada'}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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

                        {/* Informações financeiras do item */}
                        <Box sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                          <Grid container spacing={1}>
                            <Grid size={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Venda
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="success.main"
                                  sx={{ fontWeight: 600 }}
                                >
                                  R$ 9,65
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Custo
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="error.main"
                                  sx={{ fontWeight: 600 }}
                                >
                                  R$ 7,33
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid size={4}>
                              <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="caption" color="text.secondary">
                                  Lucro
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="primary.main"
                                  sx={{ fontWeight: 600 }}
                                >
                                  R$ 2,32
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>

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

      <PDFModal
        isOpen={isModalOpen}
        pdfUrl={pdfUrl}
        onClose={closeModal}
        title={menu?.name || 'Cardápio'}
      />
    </Container>
  );
};

export default MenuDetailsPage;
