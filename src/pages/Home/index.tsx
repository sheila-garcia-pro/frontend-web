import React, { ElementType, useEffect, useState } from 'react';
import { Box, Typography, Button, Divider, Container, Grid, Paper } from '@mui/material';
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

// Componente da página inicial
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: ingredients } = useSelector((state: RootState) => state.ingredients);
  const notification = useNotification();

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

    loadData();

    // Carregar ingredientes apenas se ainda não existirem no estado
    if (ingredients.length === 0) {
      dispatch(
        fetchIngredientsRequest({
          page: 1,
          itemPerPage: 6,
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
            DO FOGO AO AÇUCAR
          </Typography>
        </Box>

        {/* Seção de Ingredientes */}
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
            🥦 Ingredientes
          </Typography>

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
                <Carousel itemsPerPage={{ xs: 1, sm: 2, md: 3, lg: 4, xl: 6 }}>
                  {ingredients.map((ingredient) => (
                    <IngredientCard
                      key={ingredient._id}
                      ingredient={ingredient}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </Carousel>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum ingrediente encontrado. Tente novamente mais tarde.
                  </Typography>
                </Box>
              )}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  component={RouterLink}
                  to="/ingredients"
                  sx={{ borderRadius: 6, px: 3 }}
                >
                  Ver todos os ingredientes
                </Button>
              </Box>
            </>
          )}
        </Box>

        <Divider sx={{ my: 5 }} />

        {/* Seção de Receitas */}
        <Box sx={{ my: 6 }}>
          <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 500 }}>
            🍽️ Receitas
          </Typography>

          {loading ? (
            <CarouselSkeleton
              SkeletonComponent={RecipeSkeleton}
              count={4}
              itemsPerRow={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
            />
          ) : (
            <>
              {receitas.length > 0 ? (
                <Carousel itemsPerPage={{ xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}>
                  {receitas.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      id={recipe.id}
                      name={recipe.name}
                      image={recipe.image}
                      dishType={recipe.dishType}
                      servings={recipe.servings}
                    />
                  ))}
                </Carousel>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhuma receita encontrada. Tente novamente mais tarde.
                  </Typography>
                </Box>
              )}

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  component={RouterLink}
                  to="/recipes"
                  sx={{ borderRadius: 6, px: 3 }}
                >
                  Ver todas as receitas
                </Button>
              </Box>
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
