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
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        gap: 1.5,
        mb: 2,
        p: { xs: 1.5, sm: 2 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Informações de contagem */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          {hasActiveFilters ? (
            <>
              Mostrando {startItem}-{endItem} de {filteredCount} receitas filtradas
              {totalRecipes !== filteredCount && <> (de {totalRecipes} total)</>}
            </>
          ) : (
            <>
              Mostrando {startItem}-{endItem} de {totalRecipes} receitas
            </>
          )}
        </Typography>

        {hasActiveFilters && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {selectedCategory && (
              <Chip
                label={`Categoria: ${selectedCategory}`}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
            {searchTerm && (
              <Chip label={`Busca: ${searchTerm}`} size="small" variant="outlined" />
            )}
          </Box>
        )}
      </Box>

      {totalPages > 1 && (
        <Typography variant="body2" color="text.secondary">
          Pagina {currentPage} de {totalPages}
        </Typography>
      )}
    </Box>
  );
};

export default RecipesStats;
