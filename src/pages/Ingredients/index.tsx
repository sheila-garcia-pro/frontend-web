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
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useDispatch } from 'react-redux';

// Componentes
import IngredientCard from '@components/ui/IngredientCard';
import IngredientSkeleton from '@components/ui/SkeletonLoading/IngredientSkeleton';

// Serviços e Redux
import { fetchIngredientes } from '@services/dataService';
import { addNotification } from '@store/slices/uiSlice';

// Interface para as opções de ordenação
interface SortOption {
  value: string;
  label: string;
  sortFn: (a: any, b: any) => number;
}

// Componente da página de ingredientes
const IngredientsPage: React.FC = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [ingredientes, setIngredientes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tabValue, setTabValue] = useState(0);
  const [sortOption, setSortOption] = useState('name_asc');
  
  // Redux
  const dispatch = useDispatch();
  
  // Configurações de paginação
  const itemsPerPage = 12;
  
  // Efeito para carregar os dados
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Carregar ingredientes simulando requisição à API
        const data = await fetchIngredientes();
        
        // Atualizar estado com os dados recebidos
        setIngredientes(data);
        
        // Notificação de sucesso
        dispatch(addNotification({
          message: 'Ingredientes carregados com sucesso!',
          type: 'success',
          duration: 4000, // 4 segundos
        }));
      } catch (error) {
        console.error('Erro ao carregar ingredientes:', error);
        
        // Notificação de erro
        dispatch(addNotification({
          message: 'Erro ao carregar ingredientes.',
          type: 'error',
          duration: 5000, // 5 segundos
        }));
        
        // Definir array vazio para evitar erros
        setIngredientes([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [dispatch]);
  
  // Opções de ordenação
  const sortOptions: SortOption[] = [
    { 
      value: 'name_asc', 
      label: 'Nome (A-Z)', 
      sortFn: (a, b) => a.name.localeCompare(b.name) 
    },
    { 
      value: 'name_desc', 
      label: 'Nome (Z-A)', 
      sortFn: (a, b) => b.name.localeCompare(a.name) 
    },
    { 
      value: 'price_asc', 
      label: 'Preço (menor-maior)', 
      sortFn: (a, b) => parseFloat(a.price) - parseFloat(b.price) 
    },
    { 
      value: 'price_desc', 
      label: 'Preço (maior-menor)', 
      sortFn: (a, b) => parseFloat(b.price) - parseFloat(a.price) 
    },
    { 
      value: 'recipes_asc', 
      label: 'Receitas (menor-maior)', 
      sortFn: (a, b) => a.recipesCount - b.recipesCount 
    },
    { 
      value: 'recipes_desc', 
      label: 'Receitas (maior-menor)', 
      sortFn: (a, b) => b.recipesCount - a.recipesCount 
    },
  ];
  
  // Manipuladores de eventos
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset da página ao buscar
  };
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1); // Reset da página ao mudar a aba
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };
  
  // Filtragem dos ingredientes
  let filteredIngredients = [...ingredientes];
  
  // Aplicar filtro de busca
  if (searchTerm) {
    filteredIngredients = filteredIngredients.filter(ingredient => 
      ingredient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Aplicar filtro de tab (simulação - na implementação real pode usar categorias)
  if (tabValue === 1) {
    // Filtrar para mostrar apenas ingredientes com preço acima de 25
    filteredIngredients = filteredIngredients.filter(ingredient => 
      parseFloat(ingredient.price) > 25
    );
  } else if (tabValue === 2) {
    // Filtrar para mostrar apenas ingredientes com muitas receitas (> 10)
    filteredIngredients = filteredIngredients.filter(ingredient => 
      ingredient.recipesCount > 10
    );
  }
  
  // Aplicar ordenação
  const currentSortOption = sortOptions.find(option => option.value === sortOption);
  if (currentSortOption) {
    filteredIngredients.sort(currentSortOption.sortFn);
  }
  
  // Paginação
  const totalPages = Math.ceil(filteredIngredients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedIngredients = filteredIngredients.slice(startIndex, startIndex + itemsPerPage);
  
  // Renderização dos skeleton loaders durante o carregamento
  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <Grid item key={`skeleton-${index}`} xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
        <IngredientSkeleton />
      </Grid>
    ));
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Título */}
        <Box sx={{ 
          mb: 5,
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          background: (theme) => 
            `linear-gradient(135deg, ${theme.palette.primary.light}20, ${theme.palette.primary.main}10)`,
        }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 500 }}>
            Ingredientes disponíveis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Encontre todos os ingredientes para suas receitas favoritas
          </Typography>
        </Box>
        
        {/* Filtros */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2 }}>
          <TextField
            placeholder="Buscar ingredientes..."
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
        
        {/* Tabs */}
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Todos" />
            <Tab label="Premium" />
            <Tab label="Populares" />
          </Tabs>
        </Box>
        
        {/* Contagem de resultados */}
        {!loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando {paginatedIngredients.length} de {filteredIngredients.length} ingredientes
          </Typography>
        )}
        
        {/* Lista de ingredientes */}
        <Grid container spacing={3}>
          {loading ? (
            renderSkeletons()
          ) : paginatedIngredients.length > 0 ? (
            paginatedIngredients.map(ingredient => (
              <Grid item key={ingredient.id} xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
                <IngredientCard
                  id={ingredient.id}
                  name={ingredient.name}
                  image={ingredient.image}
                  price={ingredient.price}
                  recipesCount={ingredient.recipesCount}
                />
              </Grid>
            ))
          ) : (
            <Grid item xs={12} component={'div' as ElementType}>
              <Box sx={{ 
                p: 5, 
                textAlign: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
                my: 4
              }}>
                <Typography variant="h6">Nenhum ingrediente encontrado</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tente ajustar seus filtros de busca ou tente novamente mais tarde
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
        
        {/* Paginação */}
        {!loading && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination 
              count={totalPages} 
              page={currentPage} 
              onChange={handlePageChange} 
              color="primary" 
              showFirstButton 
              showLastButton 
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default IngredientsPage; 