import React from 'react';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Add, Refresh } from '@mui/icons-material';

// Componentes
import {
  IngredientSkeleton,
  IngredientModal,
  CategoryModal,
  IngredientDetailsModal,
  IngredientAvatarDisplay,
  IngredientsStats,
} from '../../components/ui';

// Hooks
import { useIngredientsFilters, usePagination } from '../../hooks/useIngredientsFilters';
import { useIngredientsPage } from '../../hooks/useIngredientsPage';

// RBAC
import { SimpleIfPermission as IfPermission } from '@/components/security';
import { useTranslation } from 'react-i18next';

// Interface para as opções de ordenação
interface SortOption {
  value: string;
  label: string;
}

// Componente da página de ingredientes
const IngredientsPage: React.FC = () => {
  const { t } = useTranslation();

  // Usar o hook personalizado para gerenciar todo o estado
  const {
    // Estados
    searchInput,
    currentPage,
    selectedCategory,
    currentTab,
    sortOption,
    modalOpen,
    categoryModalOpen,
    detailsModalOpen,
    selectedIngredientId,
    debouncedSearchTerm,
    itemsPerPage,

    // Dados dos ingredientes
    allIngredients,
    ingredientsLoading,
    categories,
    categoriesLoading,
    total,
    totalPages,

    // Handlers
    handleSearchChange,
    handleCategoryToggle,
    handleTabChange,
    handleSortChange,
    handlePageChange,
    handleRefreshList,
    handleOpenModal,
    handleCloseModal,
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleViewDetails,
    handleCloseDetails,
  } = useIngredientsPage();

  // Opções de ordenação
  const sortOptions: SortOption[] = [
    { value: 'name_asc', label: 'Nome (A-Z)' },
    { value: 'name_desc', label: 'Nome (Z-A)' },
    { value: 'category_asc', label: 'Categoria (A-Z)' },
    { value: 'category_desc', label: 'Categoria (Z-A)' },
    { value: 'price_asc', label: 'Preço (Menor-Maior)' },
    { value: 'price_desc', label: 'Preço (Maior-Menor)' },
  ];

  // Usar diretamente os dados da API (sem filtros frontend)
  const paginatedIngredients = allIngredients;

  const renderSkeletons = () => {
    const skeletonCount = itemsPerPage;
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
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

            {/* Botão para adicionar novo ingrediente */}
            <IfPermission permission="create_ingredient">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleOpenModal}
                sx={{ borderRadius: 3, px: 3 }}
              >
                {t('ingredients.newIngredient')}
              </Button>
            </IfPermission>
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
                  color={selectedCategory === category.name ? 'primary' : 'default'}
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Tabs Utilizados/Geral */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange} aria-label="abas de ingredientes">
            <Tab label={t('ingredients.filters.used')} value="used" />
            <Tab label={t('ingredients.filters.all')} value="all" />
          </Tabs>
        </Box>

        {/* Estatísticas da lista */}
        <IngredientsStats
          totalIngredients={total}
          filteredCount={allIngredients.length}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          selectedCategory={selectedCategory}
          searchTerm={debouncedSearchTerm}
        />

        {/* Lista de ingredientes */}
        <TableContainer component={Paper} sx={{ mb: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
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
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IngredientAvatarDisplay
                          src={ingredient.image}
                          name={ingredient.name}
                          size={40}
                          variant="rounded"
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
                    <TableCell>{`R$ ${ingredient.price?.price?.toFixed(2) ?? '0.00'}`}</TableCell>
                    <TableCell>
                      {`${ingredient.price?.quantity ?? '0'} ${ingredient.price?.unitMeasure ?? 'Quilograma'}`}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Box sx={{ p: 4 }}>
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
