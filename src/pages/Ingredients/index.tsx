import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Add, Edit, Save, Refresh } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

// Componentes
import {
  IngredientSkeleton,
  IngredientModal,
  CategoryModal,
  IngredientDetailsModal,
} from '../../components/ui';

// Serviços e Redux
import {
  fetchIngredientsRequest,
  deleteIngredientRequest,
  updatePriceMeasureRequest,
} from '../../store/slices/ingredientsSlice';
import { fetchCategoriesRequest } from '../../store/slices/categoriesSlice';
import { RootState } from '../../store';
import { Ingredient } from '../../types/ingredients';

// Hooks
import { useDebounce } from '../../hooks/useDebounce';
import { useTranslation } from 'react-i18next';

// Interface para as opções de ordenação
interface SortOption {
  value: string;
  label: string;
}

// Interface para preços editados
interface EditedPrice {
  price: number;
  quantity: number;
}

interface EditedPrices {
  [key: string]: EditedPrice;
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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [editedPrices, setEditedPrices] = useState<EditedPrices>({});
  const ITEMS_PER_PAGE = 20;

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
    { value: 'name_asc', label: 'Nome (A-Z)' },
    { value: 'name_desc', label: 'Nome (Z-A)' },
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
          return b.name.localeCompare(a.name);
        case 'name_asc':
        default:
          return a.name.localeCompare(b.name);
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
    if (!isEditing) {
      setSelectedIngredientId(id);
      setDetailsModalOpen(true);
    }
  };

  const handleCloseDetails = () => {
    setDetailsModalOpen(false);
    setSelectedIngredientId(null);
  };

  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setSelectedItems([]);
      setEditedPrices({});
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedItems(paginatedIngredients.map((ing) => ing._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handlePriceChange = (id: string, field: 'price' | 'quantity', value: string) => {
    setEditedPrices((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSaveChanges = () => {
    // Quando a API de atualização em massa estiver disponível, implemente aqui
    // Por enquanto, vamos atualizar um por um
    selectedItems.forEach((id) => {
      const changes = editedPrices[id];
      if (changes) {
        const ingredient = allIngredients.find((ing) => ing._id === id);
        if (ingredient) {
          dispatch(
            updatePriceMeasureRequest({
              id,
              params: {
                price: changes.price || ingredient.price?.price || 0,
                quantity: changes.quantity || ingredient.price?.quantity || 0,
                unitMeasure: ingredient.price?.unitMeasure || 'Quilograma',
              },
            }),
          );
        }
      }
    });

    setIsEditing(false);
    setSelectedItems([]);
    setEditedPrices({});
  };
  const handleRefreshList = () => {
    dispatch(
      fetchIngredientsRequest({
        page: currentPage,
        itemPerPage: ITEMS_PER_PAGE,
        search: debouncedSearchTerm,
        category: selectedCategories.length > 0 ? selectedCategories[0] : undefined,
        forceRefresh: true, // Adiciona flag para forçar atualização
      }),
    );
  };

  const renderSkeletons = () => {
    return Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell padding="checkbox">
          <Checkbox disabled />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IngredientSkeleton />
          </Box>
        </TableCell>
        <TableCell>
          <IngredientSkeleton />
        </TableCell>
        <TableCell>
          <IngredientSkeleton />
        </TableCell>
        <TableCell>
          <IngredientSkeleton />
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
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
            <Tooltip title={t('common.refresh') || 'Atualizar lista'}>
              <IconButton
                onClick={handleRefreshList}
                color="primary"
                aria-label="atualizar lista"
                sx={{ borderRadius: 2 }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>

            <Button
              variant={isEditing ? 'outlined' : 'contained'}
              color={isEditing ? 'error' : 'primary'}
              startIcon={isEditing ? <Save /> : <Edit />}
              onClick={handleToggleEdit}
              sx={{ borderRadius: 3, px: 3 }}
            >
              {isEditing ? t('ingredients.actions.cancel') : t('ingredients.actions.edit')}
            </Button>

            {isEditing && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save />}
                onClick={handleSaveChanges}
                sx={{ borderRadius: 3, px: 3 }}
                disabled={selectedItems.length === 0}
              >
                {t('ingredients.actions.save')}
              </Button>
            )}

            {!isEditing && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleOpenModal}
                sx={{ borderRadius: 3, px: 3 }}
              >
                {t('ingredients.newIngredient')}
              </Button>
            )}
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
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="abas de ingredientes">
            <Tab label={t('ingredients.filters.used')} value="used" />
            <Tab label={t('ingredients.filters.all')} value="all" />
          </Tabs>{' '}
        </Box>

        {/* Lista de ingredientes */}
        <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  {isEditing && (
                    <Checkbox
                      checked={selectedItems.length === paginatedIngredients.length}
                      indeterminate={
                        selectedItems.length > 0 &&
                        selectedItems.length < paginatedIngredients.length
                      }
                      onChange={handleSelectAll}
                    />
                  )}
                </TableCell>
                <TableCell>{t('ingredients.fields.name')}</TableCell>
                <TableCell>{t('ingredients.fields.category')}</TableCell>
                <TableCell>{t('ingredients.fields.price')}</TableCell>
                <TableCell>{t('ingredients.fields.quantity')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredientsLoading ? (
                renderSkeletons()
              ) : paginatedIngredients.length > 0 ? (
                paginatedIngredients.map((ingredient) => (
                  <TableRow
                    key={ingredient._id}
                    hover
                    onClick={() => handleViewDetails(ingredient._id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell padding="checkbox">
                      {isEditing && (
                        <Checkbox
                          checked={selectedItems.includes(ingredient._id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectItem(ingredient._id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={ingredient.image}
                          alt={ingredient.name}
                          variant="rounded"
                          sx={{ width: 40, height: 40 }}
                        />
                        <Typography>{ingredient.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ingredient.category}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {isEditing && selectedItems.includes(ingredient._id) ? (
                        <TextField
                          type="number"
                          size="small"
                          value={
                            editedPrices[ingredient._id]?.price ?? ingredient.price?.price ?? ''
                          }
                          onChange={(e) => {
                            e.stopPropagation();
                            handlePriceChange(ingredient._id, 'price', e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                          }}
                          sx={{ width: 120 }}
                        />
                      ) : (
                        `R$ ${ingredient.price?.price?.toFixed(2) ?? '0.00'}`
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing && selectedItems.includes(ingredient._id) ? (
                        <TextField
                          type="number"
                          size="small"
                          value={
                            editedPrices[ingredient._id]?.quantity ??
                            ingredient.price?.quantity ??
                            ''
                          }
                          onChange={(e) => {
                            e.stopPropagation();
                            handlePriceChange(ingredient._id, 'quantity', e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                {ingredient.price?.unitMeasure}
                              </InputAdornment>
                            ),
                          }}
                          sx={{ width: 150 }}
                        />
                      ) : (
                        `${ingredient.price?.quantity ?? '0'} ${ingredient.price?.unitMeasure ?? 'Quilograma'}`
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Box sx={{ p: 4 }}>
                      {' '}
                      <Typography variant="h6" color="text.secondary">
                        {t('ingredients.messages.notFound')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {t('ingredients.messages.tryFilters')}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
    </Box>
  );
};

export default IngredientsPage;
