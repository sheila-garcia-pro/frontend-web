import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

/**
 * Hook personalizado para detectar mudanças nos ingredientes após operações CRUD
 * e executar callbacks apropriados
 */
export const useIngredientsSync = (
  onIngredientCreated?: () => void,
  onIngredientUpdated?: () => void,
  onIngredientDeleted?: () => void,
) => {
  const { items, loading, error } = useSelector((state: RootState) => state.ingredients);
  const previousItemsCount = useRef(items.length);
  const wasLoading = useRef(loading);

  useEffect(() => {
    // Detecta quando o loading terminou (operação finalizada)
    if (wasLoading.current && !loading && !error) {
      const currentItemsCount = items.length;
      const previousCount = previousItemsCount.current;

      // Ingrediente foi criado (número de itens aumentou)
      if (currentItemsCount > previousCount && onIngredientCreated) {
        onIngredientCreated();
      }

      // Ingrediente foi deletado (número de itens diminuiu)
      else if (currentItemsCount < previousCount && onIngredientDeleted) {
        onIngredientDeleted();
      }

      // Ingrediente foi atualizado (número de itens igual mas operação foi realizada)
      else if (currentItemsCount === previousCount && onIngredientUpdated) {
        onIngredientUpdated();
      }

      // Atualiza a referência para a próxima comparação
      previousItemsCount.current = currentItemsCount;
    }

    // Atualiza o estado do loading para próxima comparação
    wasLoading.current = loading;
  }, [items.length, loading, error, onIngredientCreated, onIngredientUpdated, onIngredientDeleted]);

  return {
    items,
    loading,
    error,
    totalItems: items.length,
  };
};
