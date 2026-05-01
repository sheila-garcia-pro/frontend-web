import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add,
  ChevronLeft,
  ChevronRight,
  CloudDownload,
  Restaurant,
  Search,
} from '@mui/icons-material';
import { useDevice } from '@hooks/useDevice';
import useNotification from '@hooks/useNotification';
import publicRecipesMock from '@/mocks/publicRecipes.json';

interface PublicRecipe {
  id: number;
  name: string;
  categoryName: string | null;
  photoUrl: string | null;
  abbreviation: string | null;
  unityQuantity: number | null;
  publicRecipe: boolean;
}

interface PublicRecipesResponse {
  currentPage: number;
  totalPages: number;
  itensPerPage: number;
  totalElements: number;
  hasNext: boolean;
  data: PublicRecipe[];
}

const MAX_CARDS_PER_SECTION = 10;

const PublicRecipesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useDevice();
  const { showInfo } = useNotification();

  const [searchInput, setSearchInput] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());

  // Substitua o arquivo por seus dados reais quando estiver pronto.
  const publicRecipesResponse = publicRecipesMock as PublicRecipesResponse;

  const rawRecipes = publicRecipesResponse?.data ?? [];

  const recipes = React.useMemo(
    () =>
      rawRecipes.map((recipe) => ({
        ...recipe,
        categoryName:
          recipe.categoryName && recipe.categoryName.trim().length > 0
            ? recipe.categoryName.trim()
            : 'Sem categoria',
        photoUrl: '',
      })),
    [rawRecipes],
  );

  const normalizedSearch = searchInput.trim().toLowerCase();

  const searchFilteredRecipes = React.useMemo(() => {
    if (!normalizedSearch) {
      return recipes;
    }

    return recipes.filter((recipe) => recipe.name.toLowerCase().includes(normalizedSearch));
  }, [recipes, normalizedSearch]);

  const categoryChips = React.useMemo(() => {
    const counts = new Map<string, number>();

    searchFilteredRecipes.forEach((recipe) => {
      const category = recipe.categoryName || 'Sem categoria';
      counts.set(category, (counts.get(category) || 0) + 1);
    });

    return Array.from(counts.entries())
      .sort(([left], [right]) => left.localeCompare(right, 'pt-BR', { sensitivity: 'base' }))
      .map(([category, count]) => ({ category, count }));
  }, [searchFilteredRecipes]);

  const filteredRecipes = React.useMemo(() => {
    return searchFilteredRecipes.filter((recipe) => {
      if (!selectedCategory) return true;
      return (recipe.categoryName || 'Sem categoria') === selectedCategory;
    });
  }, [searchFilteredRecipes, selectedCategory]);

  const groupedRecipes = React.useMemo(() => {
    const grouped = new Map<string, PublicRecipe[]>();

    filteredRecipes.forEach((recipe) => {
      const category = recipe.categoryName || 'Sem categoria';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)?.push(recipe);
    });

    return Array.from(grouped.entries()).sort(([left], [right]) =>
      left.localeCompare(right, 'pt-BR', { sensitivity: 'base' }),
    );
  }, [filteredRecipes]);

  const handleToggleSelection = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handlePrimaryAction = () => {
    if (selectedIds.size === 0) {
      showInfo('Selecione ao menos uma receita para continuar.', { duration: 3000 });
      return;
    }

    showInfo('Funcionalidade em desenvolvimento.', { duration: 3000 });
  };

  const handleNavigateToRecipes = () => {
    navigate('/recipes');
  };

  const handleNavigateToCreate = () => {
    navigate('/recipes/create');
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const carouselRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const handleCarouselScroll = (category: string, direction: 'left' | 'right') => {
    const container = carouselRefs.current[category];
    if (!container) return;

    const cardWidth = isMobile ? 200 : 240;
    const gap = 16;
    const offset = cardWidth + gap;

    container.scrollBy({
      left: direction === 'left' ? -offset : offset,
      behavior: 'smooth',
    });
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
        <Paper
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
              Receitas Publicas
            </Typography>
            <Typography variant={isMobile ? 'body2' : 'body1'} color="text.secondary">
              Selecione receitas publicas para baixar ou copiar para sua conta.
            </Typography>
          </Box>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="flex-end"
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={handleNavigateToRecipes}
              fullWidth={isMobile}
              sx={{
                borderRadius: 3,
                px: 3,
                minHeight: 44,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Minhas Receitas
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleNavigateToCreate}
              fullWidth={isMobile}
              sx={{
                borderRadius: 3,
                px: 3,
                minHeight: 44,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Criar nova receita
            </Button>
          </Stack>
        </Paper>

        <Paper
          sx={{
            mb: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            justifyContent: 'space-between',
          }}
        >
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {selectedIds.size} selecionada(s)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Para comecar, selecione algumas receitas publicas para baixar para a sua conta.
            </Typography>
          </Stack>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudDownload />}
            onClick={handlePrimaryAction}
            sx={{
              borderRadius: 3,
              px: 3,
              minHeight: 44,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              width: { xs: '100%', md: 'auto' },
            }}
          >
            Baixar selecionadas
          </Button>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            mb: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            display: 'grid',
            gap: 2,
          }}
        >
          <TextField
            placeholder="Digite aqui o nome da receita..."
            variant="outlined"
            fullWidth
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
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

          <Box
            sx={{
              display: 'flex',
              gap: { xs: 1, sm: 1.5 },
              flexWrap: 'nowrap',
              overflowX: 'auto',
              pb: 1,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': {
                display: 'none',
              },
            }}
          >
            <Chip
              label={`Tudo (${searchFilteredRecipes.length})`}
              color={selectedCategory ? 'default' : 'primary'}
              variant={selectedCategory ? 'outlined' : 'filled'}
              onClick={() => handleSelectCategory('')}
              sx={{ borderRadius: 999, fontWeight: 500 }}
            />
            {categoryChips.map((item) => (
              <Chip
                key={item.category}
                label={`${item.category} (${item.count})`}
                color={selectedCategory === item.category ? 'primary' : 'default'}
                variant={selectedCategory === item.category ? 'filled' : 'outlined'}
                onClick={() => handleSelectCategory(item.category)}
                sx={{ borderRadius: 999, fontWeight: 500 }}
              />
            ))}
          </Box>
        </Paper>

        {groupedRecipes.length === 0 ? (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 3,
              textAlign: 'center',
              borderStyle: 'dashed',
            }}
          >
            <Restaurant sx={{ fontSize: 56, color: 'text.secondary', mb: 1 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhuma receita publica encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Ajuste a busca ou aguarde a importacao do arquivo de receitas.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={3}>
            {groupedRecipes.map(([category, items]) => {
              const visibleItems = items.slice(0, MAX_CARDS_PER_SECTION);
              return (
                <Box key={category}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1.5,
                    }}
                  >
                    <Stack spacing={0.25}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {category} ({items.length})
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Receitas selecionadas: {items.filter((item) => selectedIds.has(item.id)).length}
                      </Typography>
                    </Stack>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleCarouselScroll(category, 'left')}
                        aria-label="voltar carrossel"
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <ChevronLeft fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleCarouselScroll(category, 'right')}
                        aria-label="avancar carrossel"
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <ChevronRight fontSize="small" />
                      </IconButton>
                      <Button
                        variant="text"
                        onClick={() => handleSelectCategory(category)}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                      >
                        Ver todas
                      </Button>
                    </Box>
                  </Box>

                  <Box
                    ref={(node) => {
                      carouselRefs.current[category] = node as HTMLDivElement | null;
                    }}
                    sx={{
                      display: 'flex',
                      gap: 2,
                      overflowX: 'auto',
                      pb: 1,
                      pr: 1,
                      flexWrap: 'nowrap',
                      scrollbarWidth: 'none',
                      '&::-webkit-scrollbar': {
                        display: 'none',
                      },
                    }}
                  >
                    {visibleItems.map((recipe) => {
                      const isSelected = selectedIds.has(recipe.id);
                      const portionLabel =
                        recipe.unityQuantity !== null && recipe.unityQuantity !== undefined
                          ? `${recipe.unityQuantity} ${recipe.abbreviation || ''}`.trim()
                          : 'Sem porcao';

                      return (
                        <Paper
                          key={recipe.id}
                          variant="outlined"
                          sx={{
                            width: { xs: 200, md: 240 },
                            minWidth: { xs: 200, md: 240 },
                            borderRadius: 3,
                            overflow: 'hidden',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            backgroundColor: 'background.paper',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: (theme) => theme.shadows[6],
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              height: 140,
                              background: (theme) =>
                                `linear-gradient(135deg, ${alpha(
                                  theme.palette.primary.main,
                                  0.16,
                                )}, ${alpha(theme.palette.primary.main, 0.04)})`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Restaurant
                              sx={{
                                fontSize: 44,
                                color: 'text.secondary',
                                opacity: 0.7,
                              }}
                            />
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleToggleSelection(recipe.id)}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: 'background.paper',
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            />
                          </Box>
                          <Box sx={{ p: 2 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 600 }}
                              noWrap
                              title={recipe.name}
                            >
                              {recipe.name}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                              <Chip
                                size="small"
                                label={category}
                                color="primary"
                                variant="outlined"
                              />
                              <Chip size="small" label={portionLabel} variant="outlined" />
                            </Stack>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default PublicRecipesPage;
