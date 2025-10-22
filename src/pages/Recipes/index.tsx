import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Collapse,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { Search, Restaurant, Add, FilterList, ExpandMore, ExpandLess } from '@mui/icons-material';
import RecipeCard from '../../components/ui/RecipeCard';
import RecipeSkeleton from '../../components/ui/SkeletonLoading/RecipeSkeleton';
import RecipeCategoryMenu from '../../components/ui/RecipeCategoryMenuConsolidated';
import RecipeModal from '../../components/ui/RecipeModal';
import RecipesStats from '../../components/ui/RecipesStats';

// Hooks
import { useRecipesFilters, usePagination } from '../../hooks/useRecipesFilters';
import { useRecipesPage } from '../../hooks/useRecipesPage';
import { useDevice } from '@hooks/useDevice';

// RBAC
import { SimpleIfPermission as IfPermission } from '@/components/security';

// Interface para as opções de ordenação
interface SortOption {
  value: string;
  label: string;
}

// Componente da página de receitas
//
// Sistema de atualização da lista:
// - Após criar uma receita: usa handleForceRefreshList (limpa cache)
// - Após editar uma receita: navega de volta com state.reloadList = true
// - Após excluir uma receita: navega de volta com state.reloadList = true
// - Refresh manual: usa handleRefreshList (com cache)
const RecipesPage: FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet, isDesktop } = useDevice();

  // Estado para controle de filtros colapsáveis em mobile
  const [filtersOpen, setFiltersOpen] = React.useState(!isMobile);

  // Usar o hook personalizado para gerenciar todo o estado
  const {
    // Estados
    loading,
    receitas,
    searchInput,
    currentPage,
    selectedCategory,
    sortOption,
    totalPages,
    isModalOpen,
    debouncedSearchTerm,
    itemsPerPage,

    // Handlers
    handleSearchChange,
    handleCategoryToggle,
    handleSortChange,
    handlePageChange,
    handleRefreshList,
    handleForceRefreshList,
    handleOpenModal,
    handleCloseModal,
    handleRecipeCreated,
  } = useRecipesPage();

  // Opções de ordenação
  const sortOptions: SortOption[] = [
    { value: 'name_asc', label: 'Nome (A-Z)' },
    { value: 'name_desc', label: 'Nome (Z-A)' },
    { value: 'category_asc', label: 'Categoria (A-Z)' },
    { value: 'category_desc', label: 'Categoria (Z-A)' },
    { value: 'preparationTime_asc', label: 'Tempo Preparo (Menor-Maior)' },
    { value: 'preparationTime_desc', label: 'Tempo Preparo (Maior-Menor)' },
  ];

  // Aplicar filtros e ordenação usando o hook personalizado
  const { filteredAndSortedRecipes, totalFilteredItems } = useRecipesFilters(receitas, {
    searchTerm: debouncedSearchTerm,
    category: selectedCategory,
    sortOption,
  });

  // Aplicar paginação usando o hook personalizado
  const { paginatedItems: paginatedRecipes, totalPages: totalFilteredPages } = usePagination(
    filteredAndSortedRecipes,
    currentPage,
    itemsPerPage,
  );

  // Handler para navegar para criação de receita
  const handleCreateRecipe = () => {
    navigate('/recipes/create');
  };

  // Obter tipos de pratos únicos para o filtro
  const dishTypes =
    receitas.length > 0
      ? ['', ...Array.from(new Set(receitas.map((recipe) => recipe.category)))]
      : [''];

  // Manipuladores de eventos
  const handleTypeChange = (event: SelectChangeEvent) => {
    handleCategoryToggle(event.target.value);
  }; // Renderização dos skeleton loaders durante o carregamento
  const renderSkeletons = () => {
    return Array.from({ length: itemsPerPage }).map((_, index) => (
      <Grid key={`skeleton-${index}`} size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 3 }}>
        <RecipeSkeleton />
      </Grid>
    ));
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 }, // Padding responsivo
        minHeight: '100vh',
      }}
    >
      <Container
        maxWidth={isMobile ? 'sm' : isTablet ? 'lg' : 'xl'} // Container adaptativo
        sx={{
          px: { xs: 1, sm: 2, md: 3 }, // Padding horizontal responsivo
        }}
      >
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
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              component="h1"
              gutterBottom
              sx={{ fontWeight: 500 }}
            >
              Receitas disponíveis
            </Typography>
            <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
              Explore nossas receitas para criar pratos incríveis
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <RecipeCategoryMenu onCategoryUpdated={handleForceRefreshList} />

            {/* Botão para adicionar nova receita */}
            <IfPermission permission="create_user_recipe">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleCreateRecipe}
                fullWidth={isMobile}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  minHeight: 44, // Touch-friendly
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {isMobile ? 'Nova' : 'Nova Receita'}
              </Button>
            </IfPermission>
          </Box>
        </Box>
        {/* Filtros e Busca - Mobile First */}
        <Box sx={{ mb: 4 }}>
          {/* Header dos filtros com botão de toggle em mobile */}
          {isMobile && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Filtros e Busca
              </Typography>

              <IconButton
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-label={filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                <FilterList />
                {filtersOpen ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          )}

          {/* Seção de filtros colapsável */}
          <Collapse in={filtersOpen || !isMobile}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: { xs: 2, md: 0 },
                bgcolor: { xs: 'background.paper', md: 'transparent' },
                borderRadius: { xs: 1, md: 0 },
                border: { xs: '1px solid', md: 'none' },
                borderColor: { xs: 'divider', md: 'transparent' },
              }}
            >
              {/* Busca e Ordenação */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                }}
              >
                <TextField
                  placeholder={isMobile ? 'Buscar...' : 'Buscar receitas...'}
                  variant="outlined"
                  fullWidth
                  value={searchInput}
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
                      minHeight: { xs: 44, sm: 56 },
                    },
                  }}
                />

                <FormControl sx={{ minWidth: { xs: '100%', md: 200 } }}>
                  <Select
                    value={sortOption}
                    onChange={handleSortChange}
                    displayEmpty
                    size={isMobile ? 'medium' : 'small'}
                    sx={{
                      borderRadius: 3,
                      minHeight: { xs: 44, sm: 40 },
                    }}
                  >
                    {sortOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Filtro por categoria e resultados */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  alignItems: { md: 'center' },
                }}
              >
                <FormControl sx={{ minWidth: { xs: '100%', md: 250 } }}>
                  <Select
                    value={selectedCategory}
                    onChange={handleTypeChange}
                    displayEmpty
                    size={isMobile ? 'medium' : 'small'}
                    startAdornment={
                      <InputAdornment position="start">
                        <Restaurant />
                      </InputAdornment>
                    }
                    sx={{
                      borderRadius: 3,
                      minHeight: { xs: 44, sm: 40 },
                    }}
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

                <Typography variant="body2" color="text.secondary">
                  {loading ? 'Carregando...' : `${totalFilteredItems} receita(s)`}
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>

        {/* Estatísticas da lista */}
        <RecipesStats
          totalRecipes={receitas.length}
          filteredCount={totalFilteredItems}
          currentPage={currentPage}
          totalPages={totalFilteredPages}
          itemsPerPage={itemsPerPage}
          selectedCategory={selectedCategory}
          searchTerm={debouncedSearchTerm}
        />

        {/* Grid de Receitas - Mobile First */}
        <Grid container spacing={{ xs: 2, sm: 2, md: 3 }} sx={{ mb: 4 }}>
          {loading ? (
            // Skeleton durante carregamento
            renderSkeletons()
          ) : paginatedRecipes.length > 0 ? ( // Receitas encontradas
            paginatedRecipes.map((recipe) => (
              <Grid
                key={recipe._id}
                size={{
                  xs: 12, // Mobile: 1 coluna
                  sm: 6, // Tablet pequeno: 2 colunas
                  md: 4, // Tablet: 3 colunas
                  lg: 3, // Desktop: 4 colunas
                  xl: isMobile ? 12 : isTablet ? 4 : 3, // Adaptativo baseado no dispositivo
                }}
              >
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
                  {searchInput || selectedCategory
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando sua primeira receita'}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        {/* Paginação - Touch Friendly */}
        {!loading && totalFilteredItems > itemsPerPage && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
              px: { xs: 1, sm: 0 }, // Padding em mobile para evitar toque nas bordas
            }}
          >
            <Pagination
              count={totalFilteredPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? 'medium' : 'large'} // Tamanho menor em mobile
              showFirstButton={!isMobile} // Ocultar botões extras em mobile
              showLastButton={!isMobile}
              siblingCount={isMobile ? 0 : 1} // Menos botões em mobile
              boundaryCount={isMobile ? 1 : 2}
              sx={{
                '& .MuiPaginationItem-root': {
                  minWidth: { xs: 44, sm: 48 }, // Tamanho touch-friendly
                  height: { xs: 44, sm: 48 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
              }}
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
