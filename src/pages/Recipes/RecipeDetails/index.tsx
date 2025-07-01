import React, { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Skeleton,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack,
  Restaurant,
  AccessTime,
  Scale,
  People,
  Bookmark,
  Share,
  Edit,
  Delete,
  ImageNotSupported,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { Recipe } from '../../../types/recipes';
import { getCachedRecipeById, getFreshRecipeById } from '../../../services/api/recipes';
import RecipeEditModal from '../../../components/ui/RecipeEditModal/RecipeEditModal';
import RecipeDeleteModal from '../../../components/ui/RecipeDeleteModal';
import { RecipeIngredientsCard } from '../../../components/ui';
import { RecipeIngredient } from '../../../types/recipeIngredients';

const RecipeDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);

  // Log dos ingredientes para debug
  useEffect(() => {
    if (recipe?.ingredients && recipe.ingredients.length > 0) {
      console.log('🔍 Debug - Ingredientes da receita:', recipe.ingredients);
    }
  }, [recipe?.ingredients]);

  // Carregar dados da receita
  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) {
        navigate('/recipes');
        return;
      }
      setLoading(true);
      try {
        console.log('🔍 Debug - Loading recipe with ID:', id);
        console.log('🔍 Debug - Making API call to getCachedRecipeById...');
        const foundRecipe = await getCachedRecipeById(id);
        console.log('🔍 Debug - Raw API response:', foundRecipe);
        console.log('🔍 Debug - Recipe structure check:');
        console.log('  - _id:', foundRecipe._id);
        console.log('  - name:', foundRecipe.name);
        console.log('  - ingredients:', foundRecipe.ingredients);
        console.log('  - ingredients length:', foundRecipe.ingredients?.length || 0);

        // Garantir que ingredients seja sempre um array
        if (!foundRecipe.ingredients) {
          foundRecipe.ingredients = [];
          console.log('⚠️ Warning - ingredients field was missing, initialized as empty array');
        }

        setRecipe(foundRecipe);

        dispatch(
          addNotification({
            message: 'Receita carregada com sucesso!',
            type: 'success',
            duration: 3000,
          }),
        );
      } catch (error: unknown) {
        console.error('❌ Erro completo ao carregar receita:', error);
        console.error('❌ Erro detalhado:', {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          stack: error instanceof Error ? error.stack : undefined,
          id,
          timestamp: new Date().toISOString(),
        });

        // Verificar se é um erro 404 (receita não encontrada)
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number; data?: unknown } };
          console.error('❌ Status do erro HTTP:', axiosError.response?.status);
          console.error('❌ Dados do erro HTTP:', axiosError.response?.data);

          if (axiosError.response?.status === 404) {
            dispatch(
              addNotification({
                message: 'Receita não encontrada!',
                type: 'error',
                duration: 5000,
              }),
            );
          } else {
            dispatch(
              addNotification({
                message: `Erro ao carregar detalhes da receita (${axiosError.response?.status || 'desconhecido'}).`,
                type: 'error',
                duration: 5000,
              }),
            );
          }
        } else {
          dispatch(
            addNotification({
              message: 'Erro ao carregar detalhes da receita.',
              type: 'error',
              duration: 5000,
            }),
          );
        }

        navigate('/recipes');
      } finally {
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id, navigate, dispatch]);

  const handleGoBack = () => {
    navigate('/recipes');
  };
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe?.name,
        text: recipe?.descripition,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      dispatch(
        addNotification({
          message: 'Link copiado para a área de transferência!',
          type: 'success',
          duration: 3000,
        }),
      );
    }
  };
  const handleEditClick = () => {
    console.log('🔍 Debug - Opening edit modal for recipe:', recipe);
    console.log('🔍 Debug - Recipe ID:', recipe?._id);
    setEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };
  const handleRecipeUpdated = async (updatedRecipe: Recipe) => {
    // Atualizar o estado local imediatamente para feedback visual rápido
    setRecipe(updatedRecipe);
    setRefreshing(true);

    // Reset do erro de imagem caso a URL tenha mudado
    if (recipe?.image !== updatedRecipe.image) {
      setImageError(false);
    }

    // Fazer nova chamada à API para garantir dados mais recentes
    // Usar o ID original como fallback caso o updatedRecipe._id seja undefined
    const recipeIdToUse = updatedRecipe._id || recipe?._id || id;

    console.log('🔄 Debug - updatedRecipe._id:', updatedRecipe._id);
    console.log('🔄 Debug - original recipe._id:', recipe?._id);
    console.log('🔄 Debug - URL param id:', id);
    console.log('🔄 Debug - Final ID to use:', recipeIdToUse);

    if (!recipeIdToUse) {
      console.error('❌ Nenhum ID disponível para refresh da receita');
      dispatch(
        addNotification({
          message: 'Receita atualizada, mas erro ao recarregar dados.',
          type: 'warning',
          duration: 4000,
        }),
      );
      setRefreshing(false);
      return;
    }

    try {
      console.log('🔄 Debug - Refreshing recipe with ID:', recipeIdToUse);
      const refreshedRecipe = await getFreshRecipeById(recipeIdToUse);
      console.log('🔄 Debug - Refreshed recipe:', refreshedRecipe);
      setRecipe(refreshedRecipe); // Navegar de volta para a lista com estado para forçar reload
      navigate('/recipes', {
        state: {
          reloadList: true,
          editedRecipeName: updatedRecipe.name,
        },
      });

      console.log('🔄 Dados da receita atualizados via API (dados frescos)');
    } catch (error) {
      console.error('Erro ao recarregar dados da receita:', error);

      // Se falhar a recarga, manter os dados do modal mas avisar
      dispatch(
        addNotification({
          message:
            'Receita salva, mas houve erro ao recarregar os dados. Recarregue a página se necessário.',
          type: 'warning',
          duration: 6000,
        }),
      );
    } finally {
      setRefreshing(false);
    }
  };
  const handleRecipeDeleted = () => {
    console.log('🔄 Navegando de volta para /recipes com state de reload');
    navigate('/recipes', {
      state: {
        reloadList: true,
        deletedRecipeName: recipe?.name,
      },
    });
  };

  // Função para atualizar ingredientes da receita
  const handleIngredientsUpdate = (ingredients: RecipeIngredient[]) => {
    setRecipeIngredients(ingredients);
    console.log('🔄 Ingredientes atualizados:', ingredients);

    // Mostrar total dos ingredientes no log para debug
    const total = ingredients.reduce((sum, item) => sum + item.totalCost, 0);
    console.log('💰 Total dos ingredientes: R$', total.toFixed(2));
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Container maxWidth="lg">
          {/* Header Skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width={250} height={40} />
          </Box>

          {/* Card único skeleton */}
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent sx={{ p: 0 }}>
              {/* Imagem circular skeleton */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  pt: 4,
                  pb: 2,
                  bgcolor: 'grey.50',
                }}
              >
                <Skeleton variant="circular" width={120} height={120} />
              </Box>

              <Box sx={{ p: 3, pt: 1 }}>
                {/* Título e SKU skeleton */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Skeleton variant="text" width="60%" height={50} sx={{ mx: 'auto' }} />
                  <Skeleton variant="text" width="40%" height={30} sx={{ mx: 'auto' }} />
                </Box>

                {/* Chips skeleton */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3, justifyContent: 'center' }}>
                  <Skeleton
                    variant="rectangular"
                    width={80}
                    height={24}
                    sx={{ borderRadius: 12 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={100}
                    height={24}
                    sx={{ borderRadius: 12 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={90}
                    height={24}
                    sx={{ borderRadius: 12 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width={85}
                    height={24}
                    sx={{ borderRadius: 12 }}
                  />
                </Box>

                <Skeleton variant="rectangular" width="100%" height={1} sx={{ mb: 3 }} />

                {/* Conteúdo em duas colunas skeleton */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={100} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={80}
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Skeleton
                          variant="rectangular"
                          width="100%"
                          height={80}
                          sx={{ borderRadius: 2 }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>

                {/* Botões skeleton */}
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={36}
                    sx={{ borderRadius: 1 }}
                  />
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={36}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Ingredients Card Skeleton */}
          <Box sx={{ mt: 3 }}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
          </Box>
        </Container>
      </Box>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        {/* Header com botão voltar */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Tooltip title="Voltar para receitas">
            <IconButton
              onClick={handleGoBack}
              sx={{
                mr: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                  boxShadow: 2,
                },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 600, flex: 1, color: 'text.primary' }}
          >
            Detalhes da Receita
          </Typography>
          {refreshing && (
            <Tooltip title="Atualizando dados...">
              <CircularProgress size={24} sx={{ ml: 2 }} />
            </Tooltip>
          )}
        </Box>
        {/* Conteúdo principal - Card único */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: 3,
            overflow: 'hidden',
            mb: 3,
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Imagem circular no topo */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                pt: 4,
                pb: 2,
                bgcolor: 'grey.50',
              }}
            >
              {!imageError ? (
                <Box
                  component="img"
                  src={recipe.image}
                  alt={recipe.name}
                  onError={() => setImageError(true)}
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid',
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'background.paper',
                    border: '4px solid',
                    borderColor: 'primary.main',
                    boxShadow: 2,
                  }}
                >
                  <ImageNotSupported sx={{ fontSize: 48, color: 'text.secondary' }} />
                </Box>
              )}
            </Box>

            {/* Conteúdo principal */}
            <Box sx={{ p: 3, pt: 1 }}>
              {/* Título e ações */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                {/* Botões de ação no canto superior direito */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -16,
                    right: -16,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    zIndex: 1,
                  }}
                >
                  <Tooltip title="Compartilhar">
                    <IconButton
                      onClick={handleShare}
                      color="primary"
                      size="small"
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { boxShadow: 2 },
                      }}
                    >
                      <Share />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Favoritar">
                    <IconButton
                      color="primary"
                      size="small"
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { boxShadow: 2 },
                      }}
                    >
                      <Bookmark />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={handleEditClick}
                      color="primary"
                      size="small"
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { boxShadow: 2 },
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      onClick={handleDeleteClick}
                      color="error"
                      size="small"
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { boxShadow: 2 },
                      }}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Título e SKU centralizados */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}
                  >
                    {recipe.name}
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ fontWeight: 500, mb: 2 }}
                  >
                    SKU: {recipe.sku}
                  </Typography>
                </Box>
              </Box>

              {/* Categoria e chips informativos centralizados */}
              <Box
                sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3, justifyContent: 'center' }}
              >
                <Chip
                  icon={<Restaurant />}
                  label={recipe.category}
                  color="primary"
                  variant="filled"
                  size="small"
                />
                <Chip
                  icon={<AccessTime />}
                  label={recipe.preparationTime}
                  color="secondary"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<Scale />}
                  label={`${recipe.weightRecipe} ${recipe.typeWeightRecipe}`}
                  color="info"
                  variant="outlined"
                  size="small"
                />
                <Chip
                  icon={<People />}
                  label={`${recipe.yieldRecipe} ${recipe.typeYield}`}
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Layout em duas colunas para o resto do conteúdo */}
              <Grid container spacing={3}>
                {/* Coluna da esquerda - Descrição */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      Descrição
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: { xs: 150, md: 200 }, // altura máxima antes de aplicar scroll
                        overflow: 'auto', // rolagem quando necessário
                        pr: 1, // padding para a barra de scroll
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                        bgcolor: 'background.paper',
                        '&::-webkit-scrollbar': {
                          width: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                          background: 'rgba(0,0,0,0.1)',
                          borderRadius: '3px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                          background: 'rgba(0,0,0,0.3)',
                          borderRadius: '3px',
                          '&:hover': {
                            background: 'rgba(0,0,0,0.5)',
                          },
                        },
                      }}
                    >
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.6,
                          textAlign: 'justify',
                          wordWrap: 'break-word',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto',
                        }}
                      >
                        {recipe.descripition}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Coluna da direita - Informações nutricionais */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      Informações Nutricionais
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: 'success.light',
                            borderRadius: 2,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'success.main',
                          }}
                        >
                          <People sx={{ fontSize: 32, color: 'success.dark', mb: 0.5 }} />
                          <Typography variant="h6" color="success.dark" sx={{ fontWeight: 700 }}>
                            {recipe.yieldRecipe}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="success.dark"
                            sx={{ fontWeight: 500 }}
                          >
                            {recipe.typeYield}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: 'secondary.light',
                            borderRadius: 2,
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'secondary.main',
                          }}
                        >
                          <Scale sx={{ fontSize: 32, color: 'secondary.dark', mb: 0.5 }} />
                          <Typography variant="h6" color="secondary.dark" sx={{ fontWeight: 700 }}>
                            {recipe.weightRecipe}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="secondary.dark"
                            sx={{ fontWeight: 500 }}
                          >
                            {recipe.typeWeightRecipe}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Grid>
              </Grid>

              {/* Botões de ação principais */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit />}
                  onClick={handleEditClick}
                  size="medium"
                  fullWidth
                >
                  Editar Receita
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleDeleteClick}
                  size="medium"
                  fullWidth
                >
                  Excluir
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Card de Ingredientes da Receita */}
        <Box sx={{ mt: 3 }}>
          <RecipeIngredientsCard
            recipeId={recipe._id}
            onIngredientsUpdate={handleIngredientsUpdate}
          />
        </Box>
        {/* Debug info para ingredientes da API */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <Card sx={{ mt: 2, borderRadius: 3, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🔍 Debug - Ingredientes da API ({recipe.ingredients.length} ingredientes)
              </Typography>
              <pre style={{ fontSize: '12px', overflowX: 'auto' }}>
                {JSON.stringify(recipe.ingredients, null, 2)}
              </pre>
              {recipeIngredients.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Ingredientes processados ({recipeIngredients.length}):
                  </Typography>
                  <pre style={{ fontSize: '11px', overflowX: 'auto', color: '#2e7d32' }}>
                    {JSON.stringify(
                      recipeIngredients.map((ri) => ({
                        name: ri.ingredient.name,
                        quantity: ri.quantity,
                        unit: ri.unitMeasure,
                        cost: ri.totalCost,
                      })),
                      null,
                      2,
                    )}
                  </pre>
                </Box>
              )}
            </CardContent>
          </Card>
        )}
        {/* Modais */}
        <RecipeEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          recipe={recipe}
          onRecipeUpdated={handleRecipeUpdated}
        />
        <RecipeDeleteModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          recipe={recipe}
          onRecipeDeleted={handleRecipeDeleted}
        />
      </Container>
    </Box>
  );
};

export default RecipeDetailsPage;
