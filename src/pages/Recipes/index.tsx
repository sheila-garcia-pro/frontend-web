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
  Button,
  Grid,
  Collapse,
  IconButton,
  Chip,
  Stack,
  Paper,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Search,
  Restaurant,
  Add,
  FilterList,
  ExpandMore,
  ExpandLess,
  Refresh,
} from '@mui/icons-material';
import RecipeCard from '../../components/ui/RecipeCard';
import RecipeSkeleton from '../../components/ui/SkeletonLoading/RecipeSkeleton';
import RecipeCategoryMenu from '../../components/ui/RecipeCategoryMenuConsolidated';
import RecipeModal from '../../components/ui/RecipeModal';
import RecipesStats from '../../components/ui/RecipesStats';
import RecipeDeleteModal from '../../components/ui/RecipeDeleteModal';

// Hooks
import { useRecipesFilters, usePagination } from '../../hooks/useRecipesFilters';
import { useRecipesPage } from '../../hooks/useRecipesPage';
import { useDevice } from '@hooks/useDevice';
import { useRecipePDF } from '@hooks/useRecipePDF';
import useNotification from '../../hooks/useNotification';

// RBAC
import { SimpleIfPermission as IfPermission } from '@/components/security';
import { Recipe } from '../../types/recipes';

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
  const { isMobile, isTablet } = useDevice();
  const { downloadPDF, isGenerating } = useRecipePDF();
  const { showError, showSuccess } = useNotification();

  // Estado para controle de filtros colapsáveis em mobile
  const [filtersOpen, setFiltersOpen] = React.useState(!isMobile);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [selectedRecipe, setSelectedRecipe] = React.useState<Recipe | null>(null);

  // Usar o hook personalizado para gerenciar todo o estado
  const {
    // Estados
    loading,
    receitas,
    searchInput,
    currentPage,
    selectedCategory,
    sortOption,
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

  const handleOpenDeleteModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedRecipe(null);
  };

  const handleRecipeDeleted = () => {
    handleForceRefreshList();
  };

  const handleGeneratePdf = async (recipe: Recipe) => {
    try {
      await downloadPDF(recipe._id);
      showSuccess('PDF gerado com sucesso!', { duration: 3000 });
    } catch (error) {
      showError('Erro ao gerar o PDF da receita.', { duration: 4000 });
    }
  };

  const searchFilteredRecipes = React.useMemo(() => {
    if (!debouncedSearchTerm) {
      return receitas;
    }

    const term = debouncedSearchTerm.toLowerCase();
    return receitas.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(term) || recipe.category.toLowerCase().includes(term),
    );
  }, [receitas, debouncedSearchTerm]);

  const categoryChips = React.useMemo(() => {
    const counts = new Map<string, number>();

    searchFilteredRecipes.forEach((recipe) => {
      const category = recipe.category?.trim();
      if (!category) return;

      counts.set(category, (counts.get(category) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort(([left], [right]) => left.localeCompare(right, 'pt-BR', { sensitivity: 'base' }))
      .map(([category, count]) => ({ category, count }));
  }, [searchFilteredRecipes]);

  // Renderização dos skeleton loaders durante o carregamento
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
        bgcolor: 'background.default',
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
            mb: { xs: 3, md: 4 },
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.12,
              )}, ${alpha(theme.palette.primary.main, 0.03)})`,
            display: 'grid',
            gap: { xs: 2, md: 3 },
            gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
            alignItems: { md: 'center' },
          }}
        >
          <Box>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              component="h1"
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Receitas disponiveis
            </Typography>
            <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
              Explore nossas receitas para criar pratos incriveis
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="flex-end"
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <Tooltip title="Atualizar lista">
              <IconButton
                onClick={handleRefreshList}
                color="primary"
                aria-label="atualizar lista"
                sx={{
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            <RecipeCategoryMenu onCategoryUpdated={handleForceRefreshList} />

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
                  minHeight: 44,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {isMobile ? 'Nova' : 'Nova Receita'}
              </Button>
            </IfPermission>
          </Stack>
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

              <Button
                variant="contained"
                size="small"
                startIcon={<FilterList />}
                endIcon={filtersOpen ? <ExpandLess /> : <ExpandMore />}
                onClick={() => setFiltersOpen(!filtersOpen)}
                sx={{ borderRadius: 2 }}
              >
                {filtersOpen ? 'Ocultar' : 'Mostrar'}
              </Button>
            </Box>
          )}

          {/* Seção de filtros colapsável */}
          <Collapse in={filtersOpen || !isMobile}>
            <Paper
              variant="outlined"
              sx={{
                display: 'grid',
                gap: 2,
                p: { xs: 2, md: 3 },
                borderRadius: 2,
              }}
            >
              {/* Busca e Ordenação */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 220px' },
                  gap: 2,
                }}
              >
                <TextField
                  placeholder={isMobile ? 'Buscar...' : 'Buscar receitas por nome ou categoria'}
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
              {/* Categorias em pills */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Categorias
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: { xs: 'nowrap', md: 'wrap' },
                    overflowX: { xs: 'auto', md: 'visible' },
                    pb: { xs: 1, md: 0 },
                  }}
                >
                  <Chip
                    label={`Todas (${searchFilteredRecipes.length})`}
                    color={selectedCategory ? 'default' : 'primary'}
                    variant={selectedCategory ? 'outlined' : 'filled'}
                    onClick={() => handleCategoryToggle('')}
                    sx={{
                      borderRadius: 999,
                      fontWeight: 500,
                    }}
                  />
                  {categoryChips.map((item) => (
                    <Chip
                      key={item.category}
                      label={`${item.category} (${item.count})`}
                      color={selectedCategory === item.category ? 'primary' : 'default'}
                      variant={selectedCategory === item.category ? 'filled' : 'outlined'}
                      onClick={() => handleCategoryToggle(item.category)}
                      sx={{
                        borderRadius: 999,
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Paper>
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
                  recipe={recipe}
                  onDelete={handleOpenDeleteModal}
                  onPdf={handleGeneratePdf}
                  isPdfGenerating={isGenerating}
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
        <RecipeDeleteModal
          open={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          recipe={selectedRecipe}
          onRecipeDeleted={handleRecipeDeleted}
        />
      </Container>
    </Box>
  );
};

export default RecipesPage;
