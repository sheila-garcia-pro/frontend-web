import React, { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardMedia,
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
        const foundRecipe = await getCachedRecipeById(id);
        console.log('🔍 Debug - Loaded recipe:', foundRecipe);
        console.log('🔍 Debug - Recipe ID from API:', foundRecipe._id);
        setRecipe(foundRecipe);

        dispatch(
          addNotification({
            message: 'Receita carregada com sucesso!',
            type: 'success',
            duration: 3000,
          }),
        );
      } catch (error: unknown) {
        console.error('Erro ao carregar receita:', error);

        // Verificar se é um erro 404 (receita não encontrada)
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response?: { status?: number } };
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
                message: 'Erro ao carregar detalhes da receita.',
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
      setRecipe(refreshedRecipe);

      dispatch(
        addNotification({
          message: 'Receita atualizada com sucesso!',
          type: 'success',
          duration: 4000,
        }),
      );

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
    navigate('/recipes');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Container maxWidth="lg">
          {/* Header Skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
            <Skeleton variant="text" width={300} height={40} />
          </Box>
          <Grid container spacing={4}>
            {/* Image Skeleton */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
            </Grid>

            {/* Content Skeleton */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="text" width="80%" height={50} />
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="100%" height={100} />
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 16 }} />
                <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 16 }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (!recipe) {
    return null;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="lg">
        {/* Header com botão voltar */}{' '}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Tooltip title="Voltar para receitas">
            <IconButton
              onClick={handleGoBack}
              sx={{
                mr: 2,
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 500, flex: 1 }}>
            Detalhes da Receita
          </Typography>
          {refreshing && (
            <Tooltip title="Atualizando dados...">
              <CircularProgress size={24} sx={{ ml: 2 }} />
            </Tooltip>
          )}
        </Box>
        {/* Conteúdo principal */}
        <Grid container spacing={4}>
          {/* Imagem da receita */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: 3,
                width: '100%',
              }}
            >
              {' '}
              {!imageError ? (
                <CardMedia
                  component="img"
                  image={recipe.image}
                  alt={recipe.name}
                  onError={() => setImageError(true)}
                  sx={{
                    height: { xs: 250, md: 400 },
                    objectFit: 'contain',
                    bgcolor: 'grey.50',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: { xs: 250, md: 400 },
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <ImageNotSupported sx={{ fontSize: 64, mb: 2, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.primary" sx={{ fontWeight: 500 }}>
                    Imagem da Receita
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selecione uma imagem para a receita. Você pode visualizar, alterar ou remover a
                    imagem atual.
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>{' '}
          {/* Informações da receita */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ p: 4 }}>
                {' '}
                {/* Título e ações */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h4"
                      component="h2"
                      gutterBottom
                      sx={{ fontWeight: 600, color: 'primary.main' }}
                    >
                      {recipe.name}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontWeight: 500 }}
                    >
                      SKU: {recipe.sku}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    <Tooltip title="Compartilhar">
                      <IconButton onClick={handleShare} color="primary">
                        <Share />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Favoritar">
                      <IconButton color="primary">
                        <Bookmark />
                      </IconButton>
                    </Tooltip>{' '}
                    <Tooltip title="Editar">
                      <IconButton onClick={handleEditClick} color="primary">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir">
                      <IconButton onClick={handleDeleteClick} color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {/* Categoria e chips informativos */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  <Chip
                    icon={<Restaurant />}
                    label={recipe.category}
                    color="primary"
                    variant="filled"
                    size="medium"
                  />
                  <Chip
                    icon={<AccessTime />}
                    label={recipe.preparationTime}
                    color="secondary"
                    variant="outlined"
                    size="medium"
                  />
                  <Chip
                    icon={<Scale />}
                    label={`${recipe.weightRecipe} ${recipe.typeWeightRecipe}`}
                    color="info"
                    variant="outlined"
                    size="medium"
                  />
                  <Chip
                    icon={<People />}
                    label={`${recipe.yieldRecipe} ${recipe.typeYield}`}
                    color="success"
                    variant="outlined"
                    size="medium"
                  />
                </Box>
                <Divider sx={{ my: 3 }} />
                {/* Descrição */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Descrição
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{
                      lineHeight: 1.7,
                      textAlign: 'justify',
                    }}
                  >
                    {recipe.descripition}
                  </Typography>
                </Box>{' '}
                {/* Informações detalhadas */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Informações Nutricionais
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6 }}>
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: 'success.light',
                          borderRadius: 2,
                          textAlign: 'center',
                          border: '1px solid',
                          borderColor: 'success.main',
                        }}
                      >
                        <People sx={{ fontSize: 40, color: 'success.dark', mb: 1 }} />
                        <Typography variant="h5" color="success.dark" sx={{ fontWeight: 700 }}>
                          {recipe.yieldRecipe}
                        </Typography>
                        <Typography variant="body2" color="success.dark" sx={{ fontWeight: 500 }}>
                          {recipe.typeYield}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: 'secondary.light',
                          borderRadius: 2,
                          textAlign: 'center',
                          border: '1px solid',
                          borderColor: 'secondary.main',
                        }}
                      >
                        <Scale sx={{ fontSize: 40, color: 'secondary.dark', mb: 1 }} />
                        <Typography variant="h5" color="secondary.dark" sx={{ fontWeight: 700 }}>
                          {recipe.weightRecipe}
                        </Typography>
                        <Typography variant="body2" color="secondary.dark" sx={{ fontWeight: 500 }}>
                          {recipe.typeWeightRecipe}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>{' '}
                {/* Botões de ação */}
                <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Edit />}
                    onClick={handleEditClick}
                    fullWidth
                  >
                    Editar Receita
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={handleDeleteClick}
                    fullWidth
                  >
                    Excluir
                  </Button>
                </Box>
              </CardContent>
            </Card>{' '}
          </Grid>
        </Grid>
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
