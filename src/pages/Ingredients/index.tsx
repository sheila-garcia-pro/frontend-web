import React, { ElementType, useState, useEffect } from 'react';
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
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { Search, Add, Category } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

// Componentes
import { IngredientCard, IngredientSkeleton, IngredientModal, CategoryModal } from '../../components/ui';

// Serviços e Redux
import { 
  fetchIngredientsRequest, 
  setSearchFilter, 
  setCategoryFilter, 
  setPage 
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
  // Estados locais
  const [sortOption, setSortOption] = useState('name_asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  
  // Redux
  const dispatch = useDispatch();
  const { 
    items: ingredients, 
    loading: ingredientsLoading, 
    total, 
    page, 
    itemPerPage,
    filter
  } = useSelector((state: RootState) => state.ingredients);
  
  const { items: categories, loading: categoriesLoading } = useSelector(
    (state: RootState) => state.categories
  );
  
  // Aplicar debounce ao termo de busca para evitar múltiplas requisições durante digitação
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  
  // Efeito para atualizar o filtro de busca quando o termo debounced mudar
  useEffect(() => {
    if (debouncedSearchTerm !== filter.search) {
      dispatch(setSearchFilter(debouncedSearchTerm));
    }
  }, [debouncedSearchTerm, dispatch, filter.search]);
  
  // Efeito para carregar os dados quando os filtros mudarem
  useEffect(() => {
    // Evita múltiplas requisições desnecessárias
    if (!ingredientsLoading) {
      dispatch(
        fetchIngredientsRequest({ 
          page, 
          itemPerPage, 
          category: filter.category || undefined,
          search: filter.search || undefined
        })
      );
    }
  }, [dispatch, page, itemPerPage, filter.category, filter.search, ingredientsLoading]);
  
  // Efeito para carregar categorias apenas uma vez na montagem
  useEffect(() => {
    // Carregar categorias para o filtro
    dispatch(fetchCategoriesRequest({ page: 1, itemPerPage: 100 }));
  }, [dispatch]);
  
  // Opções de ordenação
  const sortOptions: SortOption[] = [
    { value: 'name_asc', label: 'Nome (A-Z)' },
    { value: 'name_desc', label: 'Nome (Z-A)' },
    { value: 'recent', label: 'Mais recentes' },
    { value: 'oldest', label: 'Mais antigos' },
  ];
  
  // Manipuladores de eventos
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPage(value));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | null) => {
    dispatch(setCategoryFilter(newValue));
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };
  
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const handleOpenCategoryModal = () => {
    setCategoryModalOpen(true);
  };
  
  const handleCloseCategoryModal = () => {
    setCategoryModalOpen(false);
  };
  
  // Cálculo do total de páginas
  const totalPages = Math.ceil(total / itemPerPage);
  
  // Renderização dos skeleton loaders durante o carregamento
  const renderSkeletons = () => {
    return Array.from({ length: itemPerPage }).map((_, index) => (
      <Grid item key={`skeleton-${index}`} xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
        <IngredientSkeleton />
      </Grid>
    ));
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Cabeçalho com título e botão de adicionar */}
        <Box sx={{ 
          mb: 5,
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          background: (theme) => 
            `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
              Ingredientes disponíveis
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Encontre todos os ingredientes para suas receitas favoritas
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
                px: 2
              }}
            >
              Nova Categoria
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenModal}
              sx={{ 
                borderRadius: 3,
                px: 3
              }}
            >
              Novo Ingrediente
            </Button>
          </Box>
        </Box>
        
        {/* Filtros */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2 }}>
          <TextField
            placeholder="Buscar ingredientes..."
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
              }
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
              {sortOptions.map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        {/* Tabs de Categorias */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
          {categoriesLoading ? (
            <Box sx={{ display: 'flex', p: 2, justifyContent: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Tabs 
              value={filter.category}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Todos" value={null} />
              {categories.map(category => (
                <Tab key={category._id} label={category.name} value={category._id} />
              ))}
            </Tabs>
          )}
        </Box>
        
        {/* Contagem de resultados */}
        {!ingredientsLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando {ingredients.length} de {total} ingredientes
          </Typography>
        )}
        
        {/* Lista de ingredientes */}
        <Grid container spacing={3}>
          {ingredientsLoading ? (
            renderSkeletons()
          ) : ingredients.length > 0 ? (
            ingredients.map(ingredient => (
              <Grid item key={ingredient._id} xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
                <IngredientCard ingredient={ingredient} />
              </Grid>
            ))
          ) : (
            <Grid item xs={12} component={'div' as ElementType}>
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum ingrediente encontrado
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tente mudar os filtros ou adicionar novos ingredientes
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
              page={page} 
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
    </Container>
  );
};

export default IngredientsPage; 