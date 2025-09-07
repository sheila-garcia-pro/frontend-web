import { useMemo } from 'react';
import { Recipe } from '../types/recipes';

// Tipos para os filtros
export interface RecipesFilters {
  searchTerm?: string;
  category?: string;
  sortOption: string;
}

// Tipos para ordenação
export type SortOption =
  | 'name_asc'
  | 'name_desc'
  | 'category_asc'
  | 'category_desc'
  | 'preparationTime_asc'
  | 'preparationTime_desc';

// Função de ordenação reutilizável
const sortRecipes = (recipes: Recipe[], sortOption: string): Recipe[] => {
  return [...recipes].sort((a, b) => {
    switch (sortOption) {
      case 'name_desc':
        return b.name.localeCompare(a.name, 'pt-BR', { sensitivity: 'base' });
      case 'name_asc':
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
      case 'category_asc':
        return a.category.localeCompare(b.category, 'pt-BR', { sensitivity: 'base' });
      case 'category_desc':
        return b.category.localeCompare(a.category, 'pt-BR', { sensitivity: 'base' });
      case 'preparationTime_asc':
        return parseInt(a.preparationTime || '0') - parseInt(b.preparationTime || '0');
      case 'preparationTime_desc':
        return parseInt(b.preparationTime || '0') - parseInt(a.preparationTime || '0');
      default:
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
    }
  });
};

// Função de filtro reutilizável
const filterRecipes = (recipes: Recipe[], filters: RecipesFilters): Recipe[] => {
  return recipes.filter((recipe) => {
    // Filtro por busca (nome da receita ou categoria)
    const matchesSearch = filters.searchTerm
      ? recipe.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        recipe.category.toLowerCase().includes(filters.searchTerm.toLowerCase())
      : true;

    // Filtro por categoria
    const matchesCategory = filters.category ? recipe.category === filters.category : true;

    return matchesSearch && matchesCategory;
  });
};

// Hook personalizado para filtros e ordenação de receitas
export const useRecipesFilters = (allRecipes: Recipe[], filters: RecipesFilters) => {
  const filteredAndSortedRecipes = useMemo(() => {
    // Primeiro aplica os filtros
    const filtered = filterRecipes(allRecipes, filters);

    // Depois aplica a ordenação
    return sortRecipes(filtered, filters.sortOption);
  }, [allRecipes, filters]);

  return {
    filteredAndSortedRecipes,
    totalFilteredItems: filteredAndSortedRecipes.length,
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
