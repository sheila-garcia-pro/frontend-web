import React, { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Skeleton,
  CircularProgress,
} from '@mui/material';
import { ArrowBack, Share, Edit, Delete, InfoOutlined } from '@mui/icons-material';
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
  const dispatch = useDispatch();

  // Hook de responsividade
  const { isMobile, isTablet } = useDevice();
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
        try {
          const convertedIngredients = await convertAPIIngredientsToRecipeIngredients(
            recipe.ingredients,
            getCachedIngredientById,
          );
          setRecipeIngredients(convertedIngredients);
        } catch (error) {
          console.error('❌ Erro ao converter ingredientes:', error);
          setRecipeIngredients([]);
        }
      } else {
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
        const foundRecipe = await getCachedRecipeById(id);

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
        {/* Card principal - Receita */}
        <Card
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: { xs: 1, sm: 2 },
            border: '1px solid',
            borderColor: 'divider',
            mb: { xs: 2, sm: 3 },
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: { xs: 2, sm: 3 },
                flexWrap: 'wrap',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant={isMobile ? 'subtitle1' : 'h6'}
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                >
                  Receita
                </Typography>
                <Tooltip title="Informacoes da receita">
                  <InfoOutlined fontSize="small" sx={{ color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Tooltip title="Compartilhar">
                  <IconButton
                    onClick={handleShare}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Editar">
                  <IconButton
                    onClick={handleEditClick}
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton
                    onClick={handleDeleteClick}
                    color="error"
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <Grid container spacing={{ xs: 2, sm: 3 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: { xs: 180, sm: 220 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    p: { xs: 2, sm: 3 },
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: 120, sm: 140, md: 160 },
                      height: { xs: 120, sm: 140, md: 160 },
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <RecipeAvatar
                      image={recipe.image}
                      name={recipe.name}
                      size={isMobile ? 120 : isTablet ? 140 : 160}
                      borderRadius={50}
                    />
                  </Box>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Nome da receita
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 2,
                        py: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {recipe.name}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Categoria
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 2,
                        py: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {recipe.category}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Rendimento
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 2,
                        py: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {recipe.yieldRecipe} {recipe.typeYield}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Peso da receita
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 2,
                        py: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {recipe.weightRecipe} {recipe.typeWeightRecipe}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" color="text.secondary">
                      Tempo de preparo
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 2,
                        py: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {recipe.preparationTime}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary">
                      Descricao
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.5,
                        px: 2,
                        py: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        minHeight: { xs: 72, sm: 96 },
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {recipe.descripition}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
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
            <Card
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                boxShadow: { xs: 1, sm: 2 },
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography
                  variant={isMobile ? 'subtitle1' : 'h6'}
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: { xs: 1.5, sm: 2 },
                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                  }}
                >
                  Rotulo Nutricional
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
