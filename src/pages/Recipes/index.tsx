import React, { ElementType, useState, useEffect, FC } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container,
  Divider,
  Chip,
} from '@mui/material';
import { Search, Restaurant } from '@mui/icons-material';
import { useDispatch } from 'react-redux';

// Componentes
import RecipeCard from '@components/ui/RecipeCard';
import RecipeSkeleton from '@components/ui/SkeletonLoading/RecipeSkeleton';

// Serviços e Redux
import { fetchReceitas } from '@services/dataService';
import { addNotification } from '@store/slices/uiSlice';

// Interface para as opções de ordenação
interface SortOption {
  value: string;
  label: string;
  sortFn: (a: any, b: any) => number;
}

// Componente da página de receitas
const RecipesPage: FC = () => {
  // Estados
  const [loading, setLoading] = useState(true);
  const [receitas, setReceitas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>('');
  const [sortOption, setSortOption] = useState('name_asc');
  
  // Redux
  const dispatch = useDispatch();
  
  // Configurações de paginação
  const itemsPerPage = 8;
  
  // Efeito para carregar os dados
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Carregar receitas simulando requisição à API
        const data = await fetchReceitas();
        
        // Atualizar estado com os dados recebidos
        setReceitas(data);
        
        // Notificação de sucesso
        dispatch(addNotification({
          message: 'Receitas carregadas com sucesso!',
          type: 'success',
          duration: 4000, // 4 segundos
        }));
      } catch (error) {
        console.error('Erro ao carregar receitas:', error);
        
        // Notificação de erro
        dispatch(addNotification({
          message: 'Erro ao carregar receitas.',
          type: 'error',
          duration: 5000, // 5 segundos
        }));
        
        // Definir array vazio para evitar erros
        setReceitas([]);
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
      value: 'servings_asc', 
      label: 'Porções (menor-maior)', 
      sortFn: (a, b) => a.servings - b.servings 
    },
    { 
      value: 'servings_desc', 
      label: 'Porções (maior-menor)', 
      sortFn: (a, b) => b.servings - a.servings 
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
  
  const handleTypeChange = (event: SelectChangeEvent) => {
    setSelectedType(event.target.value);
    setCurrentPage(1); // Reset da página ao mudar o tipo
  };
  
  const handleSortChange = (event: SelectChangeEvent) => {
    setSortOption(event.target.value);
  };
  
  // Obter tipos de pratos únicos para o filtro
  const dishTypes = receitas.length > 0 
    ? ['', ...Array.from(new Set(receitas.map(recipe => recipe.dishType)))]
    : [''];
  
  // Filtragem das receitas
  let filteredRecipes = [...receitas];
  
  // Aplicar filtro de busca (por nome ou tipo)
  if (searchTerm) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.dishType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  // Aplicar filtro de tipo
  if (selectedType) {
    filteredRecipes = filteredRecipes.filter(recipe => 
      recipe.dishType === selectedType
    );
  }
  
  // Aplicar ordenação
  const currentSortOption = sortOptions.find(option => option.value === sortOption);
  if (currentSortOption) {
    filteredRecipes.sort(currentSortOption.sortFn);
  }
  
  // Paginação
  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecipes = filteredRecipes.slice(startIndex, startIndex + itemsPerPage);
  
  // Renderização dos skeleton loaders durante o carregamento
  const renderSkeletons = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <Grid item key={`skeleton-${index}`} xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
        <RecipeSkeleton />
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
            Receitas disponíveis
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Explore nossas receitas para criar pratos incríveis
          </Typography>
        </Box>
        
        {/* Filtros */}
        <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { md: 'center' }, gap: 2 }}>
          <TextField
            placeholder="Buscar por nome ou tipo de prato..."
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
          
          <Box sx={{ display: 'flex', gap: 2, width: { xs: '100%', md: 'auto' } }}>
            <FormControl sx={{ minWidth: 150, flexGrow: { xs: 1, md: 0 } }}>
              <Select
                value={selectedType}
                onChange={handleTypeChange}
                displayEmpty
                size="small"
                sx={{ borderRadius: 3 }}
                renderValue={(selected) => selected ? selected : "Todos os tipos"}
              >
                <MenuItem value="">Todos os tipos</MenuItem>
                {dishTypes.filter(Boolean).map(type => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl sx={{ minWidth: 150, flexGrow: { xs: 1, md: 0 } }}>
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
        </Box>
        
        {/* Filtros ativos */}
        {selectedType && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip 
              icon={<Restaurant fontSize="small" />}
              label={`Tipo: ${selectedType}`}
              onDelete={() => setSelectedType('')}
              color="primary"
              variant="outlined"
              sx={{ borderRadius: 3 }}
            />
          </Box>
        )}
        
        {/* Contagem de resultados */}
        {!loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Mostrando {paginatedRecipes.length} de {filteredRecipes.length} receitas
          </Typography>
        )}
        
        {/* Lista de receitas */}
        <Grid container spacing={3}>
          {loading ? (
            renderSkeletons()
          ) : paginatedRecipes.length > 0 ? (
            paginatedRecipes.map(recipe => (
              <Grid item key={recipe.id} xs={12} sm={6} md={4} lg={3} component={'div' as ElementType}>
                <RecipeCard
                  id={recipe.id}
                  name={recipe.name}
                  image={recipe.image}
                  dishType={recipe.dishType}
                  servings={recipe.servings}
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
                <Typography variant="h6">Nenhuma receita encontrada</Typography>
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

export default RecipesPage; 