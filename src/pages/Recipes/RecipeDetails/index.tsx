import React, { FC, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../../store/slices/uiSlice';
import { Recipe } from '../../../types/recipes';
import { getCachedRecipeById, getFreshRecipeById } from '../../../services/api/recipes';
import { getCachedIngredientById } from '../../../services/api/ingredients';
import { useDevice } from '../../../hooks/useDevice';
import RecipeEditModal from '../../../components/ui/RecipeEditModal/RecipeEditModal';
import RecipeDeleteModal from '../../../components/ui/RecipeDeleteModal';
import { RecipeIngredientsCard } from '../../../components/ui';
import RecipeFinancialCard from '../../../components/ui/RecipeFinancialCard';
import {
  RecipeIngredient,
  convertAPIIngredientsToRecipeIngredients,
} from '../../../types/recipeIngredients';
import RecipeStepsCard from '../../../components/ui/RecipeStepsCard';
import NutritionalInfoSection from '../../../components/ui/NutritionalInfoSection';
import RecipeSaveManager from '../../../components/ui/RecipeSaveManager';
import RecipeAvatar from '../../../components/ui/RecipeAvatar';

const RecipeDetailsPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Verificar se a receita foi recém-criada
  const justCreated = location.state?.justCreated || false;

  // Hook de responsividade
  const { isMobile, isTablet, isDesktop } = useDevice();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeSteps, setRecipeSteps] = useState<string[]>([]);

  // Log dos ingredientes para debug
  useEffect(() => {
    if (recipe?.ingredients && recipe.ingredients.length > 0) {
    }
  }, [recipe?.ingredients]);

  // Carregar passos da receita
  useEffect(() => {
    if (recipe?.modePreparation && recipe.modePreparation.length > 0) {
      setRecipeSteps(recipe.modePreparation);
    } else {
      setRecipeSteps([]);
    }
  }, [recipe?.modePreparation]);

  // Carregar ingredientes da receita
  useEffect(() => {
    const loadRecipeIngredients = async () => {
      if (recipe?.ingredients && recipe.ingredients.length > 0) {
        console.log('🔄 [Recipe Details] Convertendo ingredientes da API:', recipe.ingredients);
        try {
          const convertedIngredients = await convertAPIIngredientsToRecipeIngredients(
            recipe.ingredients,
            getCachedIngredientById,
          );
          console.log('✅ [Recipe Details] Ingredientes convertidos:', convertedIngredients);
          setRecipeIngredients(convertedIngredients);
        } catch (error) {
          console.error('❌ [Recipe Details] Erro ao converter ingredientes:', error);
          setRecipeIngredients([]);
        }
      } else {
        console.log('ℹ️ [Recipe Details] Nenhum ingrediente encontrado na receita');
        setRecipeIngredients([]);
      }
    };

    loadRecipeIngredients();
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
        console.log('🔄 [Recipe Details] Carregando receita com ID:', id);
        console.log('🔄 [Recipe Details] Receita recém-criada?:', justCreated);

        // Usar getFreshRecipeById para receitas recém-criadas para evitar problemas de cache
        const foundRecipe = justCreated
          ? await getFreshRecipeById(id)
          : await getCachedRecipeById(id);

        console.log('✅ [Recipe Details] Receita carregada:', {
          id: foundRecipe._id,
          name: foundRecipe.name,
          ingredientsCount: foundRecipe.ingredients?.length || 0,
          ingredients: foundRecipe.ingredients,
        });

        // Garantir que ingredients seja sempre um array
        if (!foundRecipe.ingredients) {
          foundRecipe.ingredients = [];
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
  }, [id, navigate, dispatch, justCreated]);

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
    setEditModalOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };
  const handleRecipeUpdated = async (updatedRecipe: Recipe) => {
    // Atualizar o estado local imediatamente para feedback visual rápido
    setRecipe(updatedRecipe);
    setRefreshing(true);

    // Fazer nova chamada à API para garantir dados mais recentes
    // Usar o ID original como fallback caso o updatedRecipe._id seja undefined
    const recipeIdToUse = updatedRecipe._id || recipe?._id || id;

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
      const refreshedRecipe = await getFreshRecipeById(recipeIdToUse);
      setRecipe(refreshedRecipe); // Navegar de volta para a lista com estado para forçar reload
      navigate('/recipes', {
        state: {
          reloadList: true,
          editedRecipeName: updatedRecipe.name,
        },
      });
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

    // Mostrar total dos ingredientes no log para debug
    const total = ingredients.reduce((sum, item) => sum + item.totalCost, 0);
  };

  // Função para atualizar passos da receita
  const handleStepsUpdate = (steps: string[]) => {
    setRecipeSteps(steps);
  };

  // Função para quando a receita for salva com sucesso
  const handleRecipeSaved = (updatedRecipe: Recipe) => {
    handleRecipeUpdated(updatedRecipe);
  };

  // Função para quando houver erro no salvamento
  const handleSaveError = (error: string) => {
    console.error('❌ Erro ao salvar receita:', error);
    dispatch(
      addNotification({
        message: `Erro ao salvar receita: ${error}`,
        type: 'error',
        duration: 5000,
      }),
    );
  };

  if (loading) {
    return (
      <Box
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflow: 'hidden',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
          '& *': {
            maxWidth: '100%',
          },
        }}
      >
        <Container
          maxWidth={isMobile ? 'sm' : isTablet ? 'lg' : 'xl'}
          sx={{
            px: { xs: 1, sm: 2, md: 3 },
            width: '100%',
            maxWidth: '100%',
          }}
        >
          {/* Header Skeleton */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
            <Skeleton
              variant="circular"
              width={isMobile ? 40 : 44}
              height={isMobile ? 40 : 44}
              sx={{ mr: { xs: 1, sm: 2 } }}
            />
            <Skeleton variant="text" width={isMobile ? 150 : 250} height={isMobile ? 32 : 40} />
          </Box>

          {/* Card único skeleton */}
          <Card sx={{ borderRadius: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 } }}>
            <CardContent sx={{ p: 0 }}>
              {/* Imagem circular skeleton */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  pt: { xs: 3, sm: 4 },
                  pb: { xs: 1.5, sm: 2 },
                  bgcolor: 'grey.50',
                }}
              >
                <Skeleton
                  variant="circular"
                  width={isMobile ? 80 : isTablet ? 100 : 120}
                  height={isMobile ? 80 : isTablet ? 100 : 120}
                />
              </Box>

              <Box sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 1 } }}>
                {/* Título skeleton */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Skeleton
                    variant="text"
                    width="60%"
                    height={isMobile ? 40 : 50}
                    sx={{ mx: 'auto' }}
                  />
                  <Skeleton
                    variant="text"
                    width="40%"
                    height={isMobile ? 24 : 30}
                    sx={{ mx: 'auto' }}
                  />
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
                <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                    <Skeleton variant="text" width="100%" height={100} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Skeleton variant="text" width="60%" height={30} sx={{ mb: 2 }} />
                    <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
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
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        bgcolor: 'background.default',
        minHeight: '100vh',
        overflow: 'hidden',
        overflowX: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        '& *': {
          maxWidth: '100%',
        },
      }}
    >
      <Container
        maxWidth={isMobile ? 'sm' : isTablet ? 'lg' : 'xl'}
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {/* Header com botão voltar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: { xs: 2, sm: 3 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <Tooltip title="Voltar para receitas">
            <IconButton
              onClick={handleGoBack}
              sx={{
                bgcolor: 'background.paper',
                boxShadow: 1,
                minWidth: { xs: 40, sm: 44 },
                minHeight: { xs: 40, sm: 44 },
                '&:hover': {
                  bgcolor: 'action.hover',
                  boxShadow: 2,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <ArrowBack sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </IconButton>
          </Tooltip>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component="h1"
            sx={{
              fontWeight: 600,
              flex: 1,
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {isMobile ? 'Receita' : 'Detalhes da Receita'}
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
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: { xs: 2, sm: 3 },
            overflow: 'hidden',
            mb: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <CardContent
            sx={{
              p: { xs: 1, sm: 2, md: 3 },
              '&:last-child': { pb: { xs: 1, sm: 2, md: 3 } },
            }}
          >
            {/* Avatar circular no topo */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                pt: { xs: 3, sm: 4 },
                pb: { xs: 1.5, sm: 2 },
                bgcolor: 'grey.50',
              }}
            >
              <Box
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  borderRadius: '50%',
                  border: '4px solid',
                  borderColor: 'primary.main',
                  boxShadow: { xs: 1, sm: 2 },
                  overflow: 'hidden',
                }}
              >
                <RecipeAvatar
                  image={recipe.image}
                  name={recipe.name}
                  size={isMobile ? 80 : isTablet ? 100 : 120}
                  borderRadius={50}
                />
              </Box>
            </Box>

            {/* Conteúdo principal */}
            <Box sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 1 } }}>
              {/* Título e ações */}
              <Box sx={{ position: 'relative', mb: { xs: 1.5, sm: 2 } }}>
                {/* Botões de ação no canto superior direito */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: -12, sm: -16 },
                    right: { xs: -12, sm: -16 },
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    gap: { xs: 0.5, sm: 1 },
                    zIndex: 1,
                  }}
                >
                  <Tooltip title="Editar">
                    <IconButton
                      onClick={handleEditClick}
                      color="primary"
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        minWidth: { xs: 36, sm: 40 },
                        minHeight: { xs: 36, sm: 40 },
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Edit sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Excluir">
                    <IconButton
                      onClick={handleDeleteClick}
                      color="error"
                      size={isMobile ? 'small' : 'medium'}
                      sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        minWidth: { xs: 36, sm: 40 },
                        minHeight: { xs: 36, sm: 40 },
                        '&:hover': {
                          boxShadow: 2,
                          transform: 'scale(1.05)',
                        },
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <Delete sx={{ fontSize: { xs: 18, sm: 20 } }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Título centralizado */}
                <Box sx={{ textAlign: 'center' }}>
                  <Typography
                    variant={isMobile ? 'h5' : isTablet ? 'h4' : 'h4'}
                    component="h2"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      mb: { xs: 2, sm: 3 },
                      fontSize: {
                        xs: '1.5rem',
                        sm: '1.75rem',
                        md: '2rem',
                      },
                      lineHeight: 1.2,
                      wordBreak: 'break-word',
                    }}
                  >
                    {recipe.name}
                  </Typography>
                </Box>
              </Box>

              {/* Categoria e chips informativos centralizados */}
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: { xs: 0.5, sm: 1 },
                  mb: { xs: 2, sm: 3 },
                  justifyContent: 'center',
                  px: { xs: 1, sm: 0 },
                  width: '100%',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              >
                <Chip
                  icon={<Restaurant sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  label={recipe.category}
                  color="primary"
                  variant="filled"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    maxWidth: { xs: '30%', sm: 'none' },
                  }}
                />
                <Chip
                  icon={<AccessTime sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  label={recipe.preparationTime}
                  color="secondary"
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    maxWidth: { xs: '30%', sm: 'none' },
                  }}
                />
                <Chip
                  icon={<Scale sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  label={`${recipe.weightRecipe} ${recipe.typeWeightRecipe}`}
                  color="info"
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    maxWidth: { xs: '30%', sm: 'none' },
                  }}
                />
                <Chip
                  icon={<People sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  label={`${recipe.yieldRecipe} ${recipe.typeYield}`}
                  color="success"
                  variant="outlined"
                  size={isMobile ? 'small' : 'medium'}
                  sx={{
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    height: { xs: 28, sm: 32 },
                    maxWidth: { xs: '30%', sm: 'none' },
                  }}
                />
              </Box>

              <Divider sx={{ my: { xs: 2, sm: 3 } }} />

              {/* Layout responsivo para o resto do conteúdo */}
              <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%', overflow: 'hidden' }}>
                {/* Coluna da esquerda - Descrição */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Typography
                      variant={isMobile ? 'subtitle1' : 'h6'}
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        mb: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      }}
                    >
                      Descrição
                    </Typography>
                    <Box
                      sx={{
                        maxHeight: { xs: 120, sm: 150, md: 200 },
                        overflow: 'auto',
                        pr: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: { xs: 1, sm: 1 },
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: 'background.paper',
                        '&::-webkit-scrollbar': {
                          width: { xs: '4px', sm: '6px' },
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
                        variant={isMobile ? 'body2' : 'body1'}
                        color="text.secondary"
                        sx={{
                          lineHeight: { xs: 1.5, sm: 1.6 },
                          textAlign: 'justify',
                          wordWrap: 'break-word',
                          wordBreak: 'break-word',
                          overflowWrap: 'break-word',
                          hyphens: 'auto',
                          fontSize: { xs: '0.875rem', sm: '1rem' },
                        }}
                      >
                        {recipe.descripition}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                {/* Coluna da direita - Informações nutricionais */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Typography
                      variant={isMobile ? 'subtitle1' : 'h6'}
                      gutterBottom
                      sx={{
                        fontWeight: 600,
                        mb: { xs: 1.5, sm: 2 },
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                      }}
                    >
                      Informações Nutricionais
                    </Typography>
                    <Grid
                      container
                      spacing={{ xs: 1.5, sm: 2 }}
                      sx={{ width: '100%', overflow: 'hidden' }}
                    >
                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            bgcolor: 'success.light',
                            borderRadius: { xs: 1.5, sm: 2 },
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'success.main',
                            minHeight: { xs: 70, sm: 80 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <People
                            sx={{
                              fontSize: { xs: 24, sm: 28, md: 32 },
                              color: 'success.dark',
                              mb: 0.5,
                            }}
                          />
                          <Typography
                            variant={isMobile ? 'subtitle1' : 'h6'}
                            color="success.dark"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: '1rem', sm: '1.125rem' },
                            }}
                          >
                            {recipe.yieldRecipe}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="success.dark"
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            }}
                          >
                            {recipe.typeYield}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 6 }}>
                        <Box
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            bgcolor: 'secondary.light',
                            borderRadius: { xs: 1.5, sm: 2 },
                            textAlign: 'center',
                            border: '1px solid',
                            borderColor: 'secondary.main',
                            minHeight: { xs: 70, sm: 80 },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Scale
                            sx={{
                              fontSize: { xs: 24, sm: 28, md: 32 },
                              color: 'secondary.dark',
                              mb: 0.5,
                            }}
                          />
                          <Typography
                            variant={isMobile ? 'subtitle1' : 'h6'}
                            color="secondary.dark"
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: '1rem', sm: '1.125rem' },
                            }}
                          >
                            {recipe.weightRecipe}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="secondary.dark"
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            }}
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
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1.5, sm: 2 },
                  mt: { xs: 2, sm: 3 },
                  flexDirection: { xs: 'column', sm: 'row' },
                  width: '100%',
                  maxWidth: '100%',
                  px: { xs: 1, sm: 0 },
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Edit sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                  onClick={handleEditClick}
                  size={isMobile ? 'large' : 'medium'}
                  fullWidth={isMobile}
                  sx={{
                    minHeight: { xs: 48, sm: 42 },
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    fontWeight: 600,
                  }}
                >
                  {isMobile ? 'Editar' : 'Editar Receita'}
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                  onClick={handleDeleteClick}
                  size={isMobile ? 'large' : 'medium'}
                  fullWidth={isMobile}
                  sx={{
                    minHeight: { xs: 48, sm: 42 },
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    fontWeight: 600,
                  }}
                >
                  Excluir
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Card de Ingredientes da Receita */}
        <Box
          sx={{
            mt: { xs: 2, sm: 3 },
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <RecipeIngredientsCard
            recipeId={recipe._id}
            initialIngredients={recipeIngredients}
            onIngredientsUpdate={handleIngredientsUpdate}
          />
        </Box>

        {/* Card de Passos da Receita */}
        <Box
          sx={{
            mt: { xs: 2, sm: 3 },
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <RecipeStepsCard
            recipeId={recipe._id}
            initialSteps={recipeSteps}
            onStepsUpdate={handleStepsUpdate}
          />
        </Box>

        {/* Card de Análise Financeira */}
        <Box
          sx={{
            mt: { xs: 2, sm: 3 },
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <RecipeFinancialCard
            recipeId={recipe._id}
            recipeIngredients={recipeIngredients}
            totalYield={parseFloat(recipe.yieldRecipe) || 1}
            unitYield={1}
            onFinancialDataChange={(data) => {
              // Aqui você pode implementar a lógica para salvar os dados financeiros
            }}
          />
        </Box>

        {/* Card de Informações Nutricionais */}
        {recipeIngredients.length > 0 && (
          <Box
            sx={{
              mt: { xs: 2, sm: 3 },
              width: '100%',
              overflow: 'hidden',
            }}
          >
            <Card sx={{ borderRadius: { xs: 2, sm: 3 } }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant={isMobile ? 'subtitle1' : 'h6'}
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  🍎 Rótulo Nutricional
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: { xs: 2, sm: 3 },
                    fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  }}
                >
                  Informações nutricionais calculadas baseadas nos ingredientes desta receita
                </Typography>

                <NutritionalInfoSection recipe={recipe} recipeIngredients={recipeIngredients} />
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Botão Salvar */}
        <Box
          sx={{
            mt: { xs: 2, sm: 3 },
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 1, sm: 0 },
            width: '100%',
            overflow: 'hidden',
          }}
        >
          <RecipeSaveManager
            recipe={recipe}
            recipeIngredients={recipeIngredients}
            recipeSteps={recipeSteps}
            onSaveComplete={handleRecipeSaved}
            onError={handleSaveError}
          />
        </Box>

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
