import { useMemo } from 'react';
import { Ingredient } from '../types/ingredients';

// Tipos para os filtros
export interface IngredientsFilters {
  searchTerm: string;
  category: string;
  sortOption: string;
  currentTab: 'used' | 'all';
}

// Tipos para ordenação
export type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'category_asc'
  | 'category_desc'
  | 'price_asc'
  | 'price_desc';

// Função de ordenação reutilizável
const sortIngredients = (ingredients: Ingredient[], sortOption: string): Ingredient[] => {
  return [...ingredients].sort((a, b) => {
    switch (sortOption) {
      case 'name_desc':
        return b.name.localeCompare(a.name, 'pt-BR', { sensitivity: 'base' });
      case 'name_asc':
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
      case 'category_asc':
        return a.category.localeCompare(b.category, 'pt-BR', { sensitivity: 'base' });
      case 'category_desc':
        return b.category.localeCompare(a.category, 'pt-BR', { sensitivity: 'base' });
      case 'price_asc':
        return (a.price?.price || 0) - (b.price?.price || 0);
      case 'price_desc':
        return (b.price?.price || 0) - (a.price?.price || 0);
      default:
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    }
  });
};

// Função de filtro reutilizável
const filterIngredients = (
  ingredients: Ingredient[],
  filters: IngredientsFilters,
): Ingredient[] => {
  return ingredients.filter((ingredient) => {
    // Filtro por busca (nome do ingrediente)
    const matchesSearch = filters.searchTerm
      ? ingredient.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      : true;

    // Filtro por categoria
    const matchesCategory = filters.category ? ingredient.category === filters.category : true;

    // Filtro por tab (futuramente implementar lógica de ingredientes utilizados)
    const matchesTab = filters.currentTab === 'all' ? true : false; // Por enquanto, 'used' retorna vazio

    return matchesSearch && matchesCategory && matchesTab;
  });
};

// Hook personalizado para filtros e ordenação de ingredientes
export const useIngredientsFilters = (
  allIngredients: Ingredient[],
  filters: IngredientsFilters,
) => {
  const filteredAndSortedIngredients = useMemo(() => {
    // Primeiro aplica os filtros
    const filtered = filterIngredients(allIngredients, filters);

    // Depois aplica a ordenação
    return sortIngredients(filtered, filters.sortOption);
  }, [allIngredients, filters]);

  return {
    filteredAndSortedIngredients,
    totalFilteredItems: filteredAndSortedIngredients.length,
  };
};

// Hook para paginação
export const usePagination = <T>(items: T[], currentPage: number, itemsPerPage: number) => {
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  return {
    paginatedItems,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
};
