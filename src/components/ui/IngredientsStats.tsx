import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface IngredientsStatsProps {
  totalIngredients: number;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  selectedCategory?: string;
  searchTerm?: string;
}

export const IngredientsStats: React.FC<IngredientsStatsProps> = ({
  totalIngredients,
  filteredCount,
  currentPage,
  totalPages,
  itemsPerPage,
  selectedCategory,
  searchTerm,
}) => {
  const { t } = useTranslation();

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredCount);

  const hasFilters = Boolean(selectedCategory || searchTerm);

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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Typography variant="body2" color="text.secondary">
          {hasFilters ? (
            <>
              Mostrando {startItem}-{endItem} de {filteredCount} ingredientes filtrados
              {totalIngredients !== filteredCount && <> (de {totalIngredients} total)</>}
            </>
          ) : (
            <>
              Mostrando {startItem}-{endItem} de {totalIngredients} ingredientes
            </>
          )}
        </Typography>

        {hasFilters && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {selectedCategory && (
              <Chip
                label={`Categoria: ${selectedCategory}`}
                size="small"
                variant="outlined"
                color="primary"
              />
            )}
            {searchTerm && (
              <Chip
                label={`Busca: ${searchTerm}`}
                size="small"
                variant="outlined"
                color="default"
              />
            )}
          </Box>
        )}
      </Box>

      {totalPages > 1 && (
        <Typography variant="body2" color="text.secondary">
          Página {currentPage} de {totalPages}
        </Typography>
      )}
    </Box>
  );
};
