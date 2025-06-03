import React, { ElementType, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
  Button,
  Chip,
} from '@mui/material';
import { Search, Add, Category } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

// Componentes
import {
  IngredientCard,
  IngredientSkeleton,
  IngredientModal,
  CategoryModal,
  IngredientDetailsModal,
} from '../../components/ui';

// Serviços e Redux
import {
  fetchIngredientsRequest,
  deleteIngredientRequest,
} from '../../store/slices/ingredientsSlice';
import { fetchCategoriesRequest } from '../../store/slices/categoriesSlice';
import { RootState } from '../../store';

// Hooks
import { useDebounce } from '../../hooks/useDebounce';

// Interface para as opções de ordenação
interface SortOption {
  value: string;
  label: string;
}

// Componente da página de ingredientes
const IngredientsPage: React.FC = () => {
  const { t } = useTranslation();

  // Estados locais
  const [sortOption, setSortOption] = useState('name_asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState<'used' | 'all'>('all');
  const ITEMS_PER_PAGE = 12;

  // Redux
  const dispatch = useDispatch();
  const { items: allIngredients, loading: ingredientsLoading } = useSelector(
    (state: RootState) => state.ingredients,
  );

  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories,
  );

  // Aplicar debounce ao termo de busca
  const debouncedSearchTerm = useDebounce(searchInput, 300);
  // Opções de ordenação
  const sortOptions: SortOption[] = [
    { value: 'name_asc', label: t('ingredients.sortOptions.nameAsc') },
    { value: 'name_desc', label: t('ingredients.sortOptions.nameDesc') },
  ];

  // Carregar dados iniciais
  useEffect(() => {
    dispatch(
      fetchCategoriesRequest({
        page: 1,
        itemPerPage: 100,
      }),
    );

    dispatch(
      fetchIngredientsRequest({
        page: 1,
        itemPerPage: 1000,
      }),
    );
  }, [dispatch]);

  // Filtragem dos ingredientes
  const filteredAndSortedIngredients = useMemo(() => {
    let filtered = [...allIngredients];

    // Aplicar filtro de busca
    if (debouncedSearchTerm) {
      filtered = filtered.filter((ingredient) =>
        ingredient.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      );
    }

    // Aplicar filtro de categorias selecionadas
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((ingredient) => selectedCategories.includes(ingredient.category));
    }

    // Aplicar filtro de tab (utilizado/geral)
    if (currentTab === 'used') {
      // Futuramente implementar lógica de ingredientes utilizados
      filtered = [];
    }

    // Aplicar ordenação
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name_desc':
          return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
        case 'name_asc':
        default:
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
    });

    return filtered;
  }, [allIngredients, debouncedSearchTerm, selectedCategories, currentTab, sortOption]);

  // Paginação
  const totalFilteredItems = filteredAndSortedIngredients.length;
  const totalPages = Math.ceil(totalFilteredItems / ITEMS_PER_PAGE);
  const paginatedIngredients = filteredAndSortedIngredients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Manipuladores de eventos
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
    setCurrentPage(1);
  };

  const handleCategoryToggle = (categoryName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((cat) => cat !== categoryName)
        : [...prev, categoryName],
    );
    setCurrentPage(1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'used' | 'all') => {
    setCurrentTab(newValue);
    setCurrentPage(1);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);
  const handleOpenCategoryModal = () => setCategoryModalOpen(true);
  const handleCloseCategoryModal = () => setCategoryModalOpen(false);

  const handleViewDetails = (id: string) => {
    setSelectedIngredientId(id);
    setDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedIngredientId(null);
  };

  const handleDeleteIngredient = (id: string) => {
    dispatch(deleteIngredientRequest(id));
  };

  // Renderização do esqueleto de carregamento
  const renderSkeletons = () => {
    return Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <Grid
        item
        key={`skeleton-${index}`}
        xs={12}
        sm={6}
        md={4}
        lg={3}
        component={'div' as ElementType}
      >
        <IngredientSkeleton />
      </Grid>
    ));
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Cabeçalho com título e botões */}
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
            {' '}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
              {t('ingredients.title')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('ingredients.subtitle')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Category />}
              onClick={handleOpenCategoryModal}
              sx={{
                borderRadius: 3,
                px: 2,
              }}
            >
              {t('ingredients.newCategory')}
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenModal}
              sx={{
                borderRadius: 3,
                px: 3,
              }}
            >
              {t('ingredients.newIngredient')}
            </Button>
          </Box>
        </Box>

        {/* Filtros */}
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
              placeholder={t('ingredients.filters.searchPlaceholder')}
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

          {/* Chips de categorias */}
          {!categoriesLoading && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              {categories.map((category) => (
                <Chip
                  key={category._id}
                  label={category.name}
                  onClick={() => handleCategoryToggle(category.name)}
                  color={selectedCategories.includes(category.name) ? 'primary' : 'default'}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Tabs Utilizados/Geral */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          {' '}
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label={t('ingredients.filters.tabsLabel')}
          >
            <Tab label={t('ingredients.filters.used')} value="used" />
            <Tab label={t('ingredients.filters.all')} value="all" />
          </Tabs>
        </Box>

        {/* Contagem de resultados */}
        {!ingredientsLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('ingredients.results.showing', {
              count: paginatedIngredients.length,
              total: totalFilteredItems,
              categories: selectedCategories.length,
            })}
          </Typography>
        )}

        {/* Lista de ingredientes */}
        <Grid container spacing={3}>
          {ingredientsLoading ? (
            renderSkeletons()
          ) : paginatedIngredients.length > 0 ? (
            paginatedIngredients.map((ingredient) => (
              <Grid
                item
                key={ingredient._id}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                component={'div' as ElementType}
              >
                <IngredientCard
                  ingredient={ingredient}
                  onViewDetails={handleViewDetails}
                  onDelete={handleDeleteIngredient}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12} component={'div' as ElementType}>
              {' '}
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  {t('ingredients.messages.notFound')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('ingredients.messages.tryFilters')}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Paginação */}
        {!ingredientsLoading && totalPages > 1 && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              size="large"
            />
          </Box>
        )}
      </Box>

      {/* Modal para adicionar ingrediente */}
      <IngredientModal open={modalOpen} onClose={handleCloseModal} />

      {/* Modal para adicionar categoria */}
      <CategoryModal open={categoryModalOpen} onClose={handleCloseCategoryModal} />

      {/* Modal de detalhes do ingrediente */}
      <IngredientDetailsModal
        open={detailsModalOpen}
        onClose={handleCloseDetails}
        ingredientId={selectedIngredientId}
      />
    </Container>
  );
};

export default IngredientsPage;
