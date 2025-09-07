import React from 'react';
import { Box, Typography, Chip } from '@mui/material';

interface RecipesStatsProps {
  totalRecipes: number;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  selectedCategory?: string;
  searchTerm?: string;
}

/**
 * Componente para exibir estatísticas das receitas
 */
export const RecipesStats: React.FC<RecipesStatsProps> = ({
  totalRecipes,
  filteredCount,
  currentPage,
  totalPages,
  itemsPerPage,
  selectedCategory,
  searchTerm,
}) => {
  // Calcular range de itens mostrados na página atual
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredCount);

  // Verificar se há filtros ativos
  const hasActiveFilters = Boolean(searchTerm || selectedCategory);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Informações de contagem */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {hasActiveFilters ? (
            <>
              Exibindo {filteredCount} de {totalRecipes} receitas
              {filteredCount > 0 && totalPages > 1 && (
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}
                  (itens {startItem}-{endItem})
                </Typography>
              )}
            </>
          ) : (
            <>
              Total: {totalRecipes} receitas
              {totalRecipes > 0 && totalPages > 1 && (
                <Typography component="span" variant="body2" color="text.secondary">
                  {' '}
                  (itens {startItem}-{endItem})
                </Typography>
              )}
            </>
          )}
        </Typography>

        {/* Informações de paginação */}
        {totalPages > 1 && (
          <Typography variant="body2" color="text.secondary">
            Página {currentPage} de {totalPages}
          </Typography>
        )}
      </Box>

      {/* Filtros ativos */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {searchTerm && (
          <Chip
            label={`Busca: "${searchTerm}"`}
            size="small"
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 2 }}
          />
        )}
        {selectedCategory && (
          <Chip
            label={`Categoria: ${selectedCategory}`}
            size="small"
            variant="outlined"
            color="secondary"
            sx={{ borderRadius: 2 }}
          />
        )}
      </Box>
    </Box>
  );
};

export default RecipesStats;
