import React, { ElementType, useEffect, useState } from 'react';
import { Box, Typography, Button, Divider, Container, Paper, Grid } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

// Componentes
import Carousel from '@components/ui/Carousel';
import IngredientCard from '@components/ui/IngredientCard';
import RecipeCard from '@components/ui/RecipeCard';
import IngredientSkeleton from '@components/ui/SkeletonLoading/IngredientSkeleton';
import RecipeSkeleton from '@components/ui/SkeletonLoading/RecipeSkeleton';
import CarouselSkeleton from '@components/ui/SkeletonLoading/CarouselSkeleton';
import Logo from '@components/common/Logo';
import IngredientDetailsModal from '@components/ui/IngredientDetailsModal';

// Serviços e Redux
import { fetchHomeData } from '@services/dataService';
import { addNotification } from '@store/slices/uiSlice';
import { RootState } from '@store/index';
import useNotification from '@hooks/useNotification';
import { fetchIngredientsRequest } from '@store/slices/ingredientsSlice';
import { useTranslation } from 'react-i18next';

// Componente da página inicial
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: ingredients } = useSelector((state: RootState) => state.ingredients);
  const notification = useNotification();
  const { t } = useTranslation();

  // Estados
  const [loading, setLoading] = useState(true);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [receitas, setReceitas] = useState<any[]>([]);

  // Manipuladores de eventos
  const handleViewDetails = (id: string) => {
    setSelectedIngredientId(id);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedIngredientId(null);
  };

  // Efeito para carregar os dados
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Carregar apenas as receitas, ingredientes virão do Redux
        const response = await fetchHomeData();
        setReceitas(response.receitas);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData(); // Carregar ingredientes apenas se ainda não existirem no estado
    if (ingredients.length === 0) {
      dispatch(
        fetchIngredientsRequest({
          page: 1,
          itemPerPage: 12, // Aumentando a quantidade de itens para ter mais para navegar
          category: undefined,
          search: undefined,
        }),
      );
    }
  }, [dispatch, ingredients.length]);

  // Função para navegar para diferentes seções
  const handleNavigate = (path: string, feature: string) => {
    navigate(path);

    // Se for uma feature em desenvolvimento, mostrar notificação informativa
    if (feature) {
      notification.showInfo(`Bem-vindo à seção "${feature}"`, {
        category: 'navigation', // Agrupar notificações de navegação
        priority: 'low', // Baixa prioridade
      });
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Título de boas-vindas */}
        <Box
          sx={{
            textAlign: 'center',
            mb: 6,
            p: 3,
            borderRadius: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Logo variant="with-text" size="large" showText={false} sx={{ mb: 2 }} />
          </Box>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: '800px', mx: 'auto', mb: 2 }}
          >
            {' '}
            {t('welcome')}
          </Typography>
        </Box>
        {/* Seção de Ingredientes */}
        <Box
          sx={{
            my: 6,
            bgcolor: (theme) => theme.palette.background.paper,
            borderRadius: 4,
            p: { xs: 2, md: 4 },
            boxShadow: (theme) => `0 2px 12px ${theme.palette.primary.main}10`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span role="img" aria-label="ingredients">
                🥦
              </span>{' '}
              {t('ingredients.title')}
            </Typography>

            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/ingredients"
              sx={{
                borderRadius: 6,
                px: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            >
              {' '}
              {t('ingredients.viewAll')}
            </Button>
          </Box>

          {loading ? (
            <CarouselSkeleton
              SkeletonComponent={IngredientSkeleton}
              count={6}
              itemsPerRow={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }}
            />
          ) : (
            <>
              {' '}
              {ingredients.length > 0 ? (
                <Grid container spacing={3}>
                  <Carousel
                    itemsPerPage={{
                      xs: 1,
                      sm: 2,
                      md: 3,
                      lg: 4,
                      xl: 5,
                    }}
                  >
                    {ingredients.map((ingredient) => (
                      <Box
                        key={ingredient._id}
                        sx={{
                          height: '100%',
                          px: 1.5,
                        }}
                      >
                        <IngredientCard ingredient={ingredient} onViewDetails={handleViewDetails} />
                      </Box>
                    ))}
                  </Carousel>
                </Grid>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: (theme) => theme.palette.background.default,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    {' '}
                    {t('ingredients.messages.notFound')}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
        <Divider sx={{ my: 5 }} /> {/* Seção de Receitas */}
        <Box
          sx={{
            my: 6,
            bgcolor: (theme) => theme.palette.background.paper,
            borderRadius: 4,
            p: { xs: 2, md: 4 },
            boxShadow: (theme) => `0 2px 12px ${theme.palette.primary.main}10`,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 4,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              sx={{
                fontWeight: 500,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span role="img" aria-label="recipes">
                🍽️
              </span>{' '}
              {t('menu.recipes')}
            </Typography>

            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/recipes"
              sx={{
                borderRadius: 6,
                px: 3,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            >
              Ver todas as receitas
            </Button>
          </Box>

          {loading ? (
            <CarouselSkeleton
              SkeletonComponent={RecipeSkeleton}
              count={4}
              itemsPerRow={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
            />
          ) : (
            <>
              {' '}
              {receitas.length > 0 ? (
                <Grid container spacing={3}>
                  <Carousel itemsPerPage={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}>
                    {receitas.map((recipe) => (
                      <Box
                        key={recipe.id}
                        sx={{
                          height: '100%',
                          p: 1,
                        }}
                      >
                        <RecipeCard
                          id={recipe.id}
                          name={recipe.name}
                          image={recipe.image}
                          dishType={recipe.dishType}
                          servings={recipe.servings}
                        />
                      </Box>
                    ))}
                  </Carousel>
                </Grid>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: (theme) => theme.palette.background.default,
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma receita encontrada. Tente novamente mais tarde.
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Modal de detalhes do ingrediente */}
      <IngredientDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        ingredientId={selectedIngredientId}
      />
    </Container>
  );
};

export default HomePage;
