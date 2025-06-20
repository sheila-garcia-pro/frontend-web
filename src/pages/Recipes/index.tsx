import React, { FC, useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  SelectChangeEvent,
  Button,
  Grid,
} from '@mui/material';
import { Search, Restaurant, Add } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { addNotification } from '../../store/slices/uiSlice';
import RecipeCard from '../../components/ui/RecipeCard';
import RecipeSkeleton from '../../components/ui/SkeletonLoading/RecipeSkeleton';
import RecipeCategoryMenu from '../../components/ui/RecipeCategoryMenuConsolidated';
import { getCachedRecipes, getRecipes } from '../../services/api/recipes';
import { clearCache } from '../../services/api';
import { Recipe } from '../../types/recipes';
import RecipeModal from '../../components/ui/RecipeModal';

// Interface para as opções de ordenação
interface SortOption {
  value: string;
  label: string;
  sortFn: (a: Recipe, b: Recipe) => number;
}

// Componente da página de receitas
//
// Sistema de atualização da lista:
// - Após criar uma receita: usa handleForceRefreshList (limpa cache)
// - Após editar uma receita: navega de volta com state.reloadList = true
// - Após excluir uma receita: navega de volta com state.reloadList = true
// - Refresh manual: usa handleRefreshList (com cache)
const RecipesPage: FC = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [receitas, setReceitas] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortOption, setSortOption] = useState('name_asc');
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Redux e Navigation
  const dispatch = useDispatch();
  const location = useLocation();
  const itemsPerPage = 8;

  // Função para recarregar forçadamente a lista (sem cache - para após exclusões)
  const handleForceRefreshList = useCallback(async () => {
    setLoading(true);
    try {
      // Limpa completamente o cache antes de fazer a nova requisição
      clearCache('/v1/users/me/recipe');

      const response = await getRecipes({
        page: currentPage,
        itemPerPage: itemsPerPage,
        category: selectedType,
        search: searchTerm,
      });

      setReceitas(response.data);
      setTotalPages(response.totalPages);

      console.log('🔄 Lista recarregada com dados frescos da API');
    } catch (error) {
      console.error('Erro ao recarregar receitas:', error);
      dispatch(
        addNotification({
          message: 'Erro ao recarregar lista de receitas.',
          type: 'error',
          duration: 5000,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedType, searchTerm, dispatch]);
  // Efeito para detectar quando chegamos com estado de reload (após exclusão ou edição)
  useEffect(() => {
    const state = location.state as {
      reloadList?: boolean;
      deletedRecipeName?: string;
      editedRecipeName?: string;
    } | null;

    if (state?.reloadList) {
      console.log('🔄 Detectado reload após operação - usando refresh forçado');

      // Força o reload da lista SEM cache
      handleForceRefreshList();

      // Mostra notificação sobre a operação realizada
      if (state.deletedRecipeName) {
        dispatch(
          addNotification({
            message: `Receita "${state.deletedRecipeName}" excluída com sucesso!`,
            type: 'success',
            duration: 4000,
          }),
        );
      } else if (state.editedRecipeName) {
        dispatch(
          addNotification({
            message: `Receita "${state.editedRecipeName}" atualizada com sucesso!`,
            type: 'success',
            duration: 4000,
          }),
        );
      }

      // Limpa o state para evitar reloads desnecessários
      window.history.replaceState({}, document.title);
    }
  }, [location.state, dispatch, handleForceRefreshList]);

  // Efeito para carregar os dados
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      try {
        const response = await getCachedRecipes({
          page: currentPage,
          itemPerPage: itemsPerPage,
          category: selectedType,
          search: searchTerm,
        });

        setReceitas(response.data);
        setTotalPages(response.totalPages);

        dispatch(
          addNotification({
            message: 'Receitas carregadas com sucesso!',
            type: 'success',
            duration: 4000,
          }),
        );
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);

        dispatch(
          addNotification({
            message: 'Erro ao carregar receitas.',
            type: 'error',
            duration: 5000,
          }),
        );

        setReceitas([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, currentPage, selectedType, searchTerm]);

  // Opções de ordenação
  const sortOptions: SortOption[] = [
    {
      value: 'name_asc',
      label: 'Nome (A-Z)',
      sortFn: (a, b) => a.name.localeCompare(b.name),
    },
    {
      value: 'name_desc',
      label: 'Nome (Z-A)',
      sortFn: (a, b) => b.name.localeCompare(a.name),
    },
  ];

  // Manipuladores de eventos
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    setSelectedType(event.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const handleRecipeCreated = () => {
    // Usar refresh forçado (sem cache) após criar uma nova receita
    // Isso garante que a nova receita aparecerá imediatamente na lista
    handleForceRefreshList();
  };

  // Obter tipos de pratos únicos para o filtro
  const dishTypes =
    receitas.length > 0
      ? ['', ...Array.from(new Set(receitas.map((recipe) => recipe.category)))]
      : [''];

  // Filtragem das receitas
  let filteredRecipes = [...receitas];

  // Aplicar filtro de busca (por nome ou tipo)
  if (searchTerm) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }

  // Aplicar filtro de tipo
  if (selectedType) {
    filteredRecipes = filteredRecipes.filter((recipe) => recipe.category === selectedType);
  }

  // Aplicar ordenação
  const currentSortOption = sortOptions.find((option) => option.value === sortOption);
  if (currentSortOption) {
    filteredRecipes.sort(currentSortOption.sortFn);
  }

  // Paginação
  const totalFilteredPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecipes = filteredRecipes.slice(startIndex, startIndex + itemsPerPage); // Renderização dos skeleton loaders durante o carregamento
  const renderSkeletons = () => {
    return Array.from({ length: itemsPerPage }).map((_, index) => (
      <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
        <RecipeSkeleton />
      </Grid>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        {/* Cabeçalho com título e botões - Padronizado igual ao de ingredientes */}
        <Box
          sx={{
            mb: 5,
            p: { xs: 2, md: 3 },
            borderRadius: 2,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
              Receitas disponíveis
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Explore nossas receitas para criar pratos incríveis
            </Typography>
          </Box>{' '}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <RecipeCategoryMenu onCategoryUpdated={handleForceRefreshList} />

            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenModal}
              sx={{ borderRadius: 3, px: 3 }}
            >
              Nova Receita
            </Button>
          </Box>
        </Box>
        {/* Filtros e Busca - Padronizado */}
        <Box
          sx={{
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Linha superior com busca e ordenação */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { md: 'center' },
              gap: 2,
            }}
          >
            <TextField
              placeholder="Buscar receitas..."
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                flexGrow: 1,
                maxWidth: { md: '50%' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                },
              }}
            />

            <FormControl sx={{ minWidth: 200 }}>
              <Select
                value={sortOption}
                onChange={handleSortChange}
                displayEmpty
                size="small"
                sx={{ borderRadius: 3 }}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Filtro por categoria */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 250 }}>
              <Select
                value={selectedType}
                onChange={handleTypeChange}
                displayEmpty
                size="small"
                startAdornment={
                  <InputAdornment position="start">
                    <Restaurant />
                  </InputAdornment>
                }
                sx={{ borderRadius: 3 }}
              >
                <MenuItem value="">
                  <em>Todas as categorias</em>
                </MenuItem>
                {dishTypes.slice(1).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Informações de resultados */}
            <Typography variant="body2" color="text.secondary">
              {loading ? 'Carregando...' : `${filteredRecipes.length} receita(s)`}
            </Typography>
          </Box>
        </Box>{' '}
        {/* Grid de Receitas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {loading ? (
            // Skeleton durante carregamento
            renderSkeletons()
          ) : paginatedRecipes.length > 0 ? ( // Receitas encontradas
            paginatedRecipes.map((recipe) => (
              <Grid key={recipe._id} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
                <RecipeCard
                  id={recipe._id}
                  name={recipe.name}
                  image={recipe.image}
                  category={recipe.category}
                  preparationTime={recipe.preparationTime}
                  descripition={recipe.descripition}
                />
              </Grid>
            ))
          ) : (
            // Nenhuma receita encontrada
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Restaurant sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma receita encontrada
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || selectedType
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando sua primeira receita'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        {/* Paginação */}
        {!loading && filteredRecipes.length > itemsPerPage && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={Math.max(totalFilteredPages, totalPages)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
        {/* Modal de receitas */}
        <RecipeModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onRecipeCreated={handleRecipeCreated}
        />
      </Container>
    </Box>
  );
};

export default RecipesPage;
