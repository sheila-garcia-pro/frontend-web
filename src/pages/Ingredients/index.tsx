import React, { useState } from 'react';
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
  Card,
  CardContent,
  CardActions,
  Grid,
  Collapse,
  Stack,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Search,
  Add,
  Refresh,
  FilterList,
  ExpandMore,
  ExpandLess,
  Visibility,
  Edit,
  Category,
  MonetizationOn,
  Inventory,
  Store,
} from '@mui/icons-material';

// Componentes
import {
  IngredientSkeleton,
  IngredientModal,
  CategoryModal,
  IngredientDetailsModal,
  IngredientAvatarDisplay,
  IngredientsStats,
  IngredientSuppliersModal,
} from '../../components/ui';

// Hooks
import { useIngredientsPage } from '../../hooks/useIngredientsPage';
import { useDevice } from '@hooks/useDevice';

// RBAC
import { SimpleIfPermission as IfPermission } from '@/components/security';
import { useTranslation } from 'react-i18next';

// Interface para as opções de ordenação
interface SortOption {
  value: string;
  label: string;
}

// Componente da página de ingredientes - Mobile First
const IngredientsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isMobile, isTablet, isDesktop } = useDevice();

  // Estado para controle de filtros colapsáveis em mobile
  const [filtersOpen, setFiltersOpen] = useState(!isMobile);

  // Estado para modal de fornecedores
  const [suppliersModalOpen, setSuppliersModalOpen] = useState(false);
  const [selectedIngredientForSuppliers, setSelectedIngredientForSuppliers] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

  // Handlers para modal de fornecedores
  const handleOpenSuppliersModal = (ingredientId: string, ingredientName: string) => {
    setSelectedIngredientForSuppliers({ id: ingredientId, name: ingredientName });
    setSuppliersModalOpen(true);
  };

  const handleCloseSuppliersModal = () => {
    setSuppliersModalOpen(false);
    setSelectedIngredientForSuppliers(null);
  };

  // Opções de ordenação
  const sortOptions: SortOption[] = [
    { value: 'name_asc', label: 'Nome (A-Z)' },
    { value: 'name_desc', label: 'Nome (Z-A)' },
    { value: 'category_asc', label: 'Categoria (A-Z)' },
    { value: 'category_desc', label: 'Categoria (Z-A)' },
    { value: 'price_asc', label: 'Preço (Menor-Maior)' },
    { value: 'price_desc', label: 'Preço (Maior-Menor)' },
  ];

  // Os dados já vêm paginados do backend através do hook
  const paginatedIngredients = allIngredients;

  // Renderização de skeletons para tabela
  const renderTableSkeletons = () => {
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
        <TableCell>
          <IngredientSkeleton />
        </TableCell>
      </TableRow>
    ));
  };

  // Renderização de skeletons para cards (mobile)
  const renderCardSkeletons = () => {
    const skeletonCount = itemsPerPage;
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <Grid key={`card-skeleton-${index}`} size={{ xs: 12, sm: 6 }}>
        <Card sx={{ height: 180 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <IngredientSkeleton />
            </Box>
            <IngredientSkeleton />
            <IngredientSkeleton />
          </CardContent>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Container
        maxWidth={isMobile ? 'sm' : isTablet ? 'lg' : 'xl'}
        sx={{
          px: { xs: 1, sm: 2, md: 3 },
        }}
      >
        {/* Cabeçalho com título e botões - Mobile First */}
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
              {t('ingredients.title')}
            </Typography>
            <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
              {t('ingredients.subtitle')}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="flex-end"
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <Tooltip title={t('common.refresh') || 'Atualizar lista'}>
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

            <IfPermission permission="create_user_ingredient">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={handleOpenModal}
                fullWidth={isMobile}
                sx={{
                  borderRadius: 3,
                  px: 3,
                  minHeight: 44,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                {isMobile ? t('ingredients.new') || 'Novo' : t('ingredients.newIngredient')}
              </Button>
            </IfPermission>
          </Stack>
        </Box>

        {/* Filtros - Mobile First */}
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
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                bgcolor: 'background.paper',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                }}
              >
                <TextField
                  placeholder={isMobile ? 'Buscar...' : t('ingredients.filters.searchPlaceholder')}
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
                    maxWidth: { md: '55%' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      minHeight: { xs: 44, sm: 52 },
                      bgcolor: 'background.paper',
                    },
                  }}
                />

                <FormControl sx={{ minWidth: { xs: '100%', md: 220 } }}>
                  <Select
                    value={sortOption}
                    onChange={handleSortChange}
                    displayEmpty
                    size={isMobile ? 'medium' : 'small'}
                    sx={{
                      borderRadius: 3,
                      minHeight: { xs: 44, sm: 40 },
                      bgcolor: 'background.paper',
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
                      variant={selectedCategory === category.name ? 'filled' : 'outlined'}
                      sx={{
                        borderRadius: 2,
                        minHeight: { xs: 36, sm: 32 },
                        fontSize: { xs: '0.875rem', sm: '0.8125rem' },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Collapse>
        </Box>

        {/* Tabs Utilizados/Geral */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="abas de ingredientes"
            variant="scrollable"
            sx={{
              minHeight: 0,
              '& .MuiTabs-indicator': { display: 'none' },
              '& .MuiTab-root': {
                textTransform: 'none',
                minHeight: 36,
                px: 2,
                borderRadius: 999,
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
                mr: 1,
              },
              '& .MuiTab-root.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderColor: 'primary.main',
              },
            }}
          >
            <Tab label={t('ingredients.filters.used')} value="used" />
            <Tab label={t('ingredients.filters.all')} value="all" />
          </Tabs>
        </Box>

        {/* Estatísticas da lista */}
        <IngredientsStats
          totalIngredients={total}
          filteredCount={total}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          selectedCategory={selectedCategory}
          searchTerm={debouncedSearchTerm}
        />

        {/* Lista de ingredientes - Responsiva */}
        {isMobile ? (
          /* Layout em Cards para Mobile */
          <Box sx={{ mb: 3 }}>
            {ingredientsLoading ? (
              renderCardSkeletons()
            ) : paginatedIngredients.length > 0 ? (
              <Stack spacing={2}>
                {paginatedIngredients.map((ingredient) => (
                  <Card
                    key={ingredient._id}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 0,
                      transition: 'box-shadow 0.2s ease-in-out',
                      '&:hover': {
                        boxShadow: 2,
                      },
                    }}
                    onClick={() => handleViewDetails(ingredient._id)}
                  >
                    <CardContent sx={{ p: 2 }}>
                      {/* Header do card com avatar e nome */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <IngredientAvatarDisplay
                          src={ingredient?.image}
                          name={ingredient?.name || 'Ingrediente'}
                          size={32}
                          variant="rounded"
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="h6"
                            component="h3"
                            noWrap
                            sx={{
                              fontWeight: 600,
                              fontSize: '1rem',
                            }}
                          >
                            {ingredient?.name || 'Ingrediente sem nome'}
                          </Typography>
                          <Chip
                            label={ingredient?.category || 'Categoria'}
                            size="small"
                            sx={{
                              mt: 0.5,
                              fontSize: '0.75rem',
                              height: 24,
                            }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      {/* Informações do ingrediente */}
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MonetizationOn
                            sx={{
                              fontSize: 16,
                              color: 'success.main',
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            R$ {ingredient?.price?.price?.toFixed(2) || '0,00'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Inventory
                            sx={{
                              fontSize: 16,
                              color: 'primary.main',
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {ingredient?.price?.quantity || 0}{' '}
                            {ingredient?.price?.unitMeasure || 'un'}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>

                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(ingredient._id);
                        }}
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Detalhes
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Store />}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenSuppliersModal(ingredient._id, ingredient.name);
                        }}
                        sx={{ fontSize: '0.75rem' }}
                        color="primary"
                      >
                        Fornecedores
                      </Button>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Category sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhum ingrediente encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tente ajustar os filtros de busca
                </Typography>
              </Paper>
            )}
          </Box>
        ) : (
          /* Layout em Tabela para Desktop/Tablet */
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('ingredients.fields.name')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('ingredients.fields.category')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{t('ingredients.fields.price')}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {t('ingredients.fields.quantity')}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Ações
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ingredientsLoading ? (
                  renderTableSkeletons()
                ) : paginatedIngredients.length > 0 ? (
                  paginatedIngredients.map((ingredient) => (
                    <TableRow
                      key={ingredient._id}
                      hover
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell onClick={() => handleViewDetails(ingredient._id)}>
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
                      <TableCell onClick={() => handleViewDetails(ingredient._id)}>
                        <Chip
                          label={ingredient.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell
                        onClick={() => handleViewDetails(ingredient._id)}
                      >{`R$ ${ingredient.price?.price?.toFixed(2) ?? '0.00'}`}</TableCell>
                      <TableCell onClick={() => handleViewDetails(ingredient._id)}>
                        {`${ingredient.price?.quantity ?? '0'} ${ingredient.price?.unitMeasure ?? 'Quilograma'}`}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Detalhes">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(ingredient._id);
                              }}
                              color="primary"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Gerenciar fornecedores">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenSuppliersModal(ingredient._id, ingredient.name);
                              }}
                              color="primary"
                            >
                              <Store fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
        )}

        {/* Paginação - Touch Friendly */}
        {!ingredientsLoading && totalPages > 1 && (
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'center',
              px: { xs: 1, sm: 0 },
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              size={isMobile ? 'medium' : 'large'}
              showFirstButton={!isMobile}
              showLastButton={!isMobile}
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={isMobile ? 1 : 2}
              sx={{
                '& .MuiPaginationItem-root': {
                  minWidth: { xs: 44, sm: 48 },
                  height: { xs: 44, sm: 48 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                },
              }}
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

        {/* Modal de fornecedores do ingrediente */}
        {selectedIngredientForSuppliers && (
          <IngredientSuppliersModal
            open={suppliersModalOpen}
            onClose={handleCloseSuppliersModal}
            ingredientId={selectedIngredientForSuppliers.id}
            ingredientName={selectedIngredientForSuppliers.name}
          />
        )}
      </Container>
    </Box>
  );
};

export default IngredientsPage;
