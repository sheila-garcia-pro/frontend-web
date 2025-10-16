import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { addNotification } from '../../store/slices/uiSlice';
import { getUserRecipeCategories, RecipeCategory } from '../../services/api/recipeCategories';
import { getYieldsRecipes } from '../../services/api/yields';
import { getUnitMeasures } from '../../services/api/unitMeasure';
import { getUserUnitsAmountUse } from '../../services/api/unitsAmountUse';
import { UnitMeasure } from '../../types/unitMeasure';
import { UnitAmountUse } from '../../types/unitAmountUse';

/**
 * Interface para rendimentos
 */
interface YieldItem {
  _id: string;
  name: string;
  description?: string;
}

/**
 * Hook para gerenciar dados externos necessários para o formulário
 *
 * Seguindo o princípio Single Responsibility:
 * - Carrega apenas dados externos (categorias, rendimentos, unidades)
 * - Gerencia estados de loading separadamente
 * - Fornece métodos para recarregar dados
 */
export const useRecipeExternalData = () => {
  const dispatch = useDispatch();

  // Estados dos dados
  const [userCategories, setUserCategories] = useState<RecipeCategory[]>([]);
  const [yields, setYields] = useState<YieldItem[]>([]);
  const [unitMeasures, setUnitMeasures] = useState<UnitMeasure[]>([]);
  const [userUnitsAmountUse, setUserUnitsAmountUse] = useState<UnitAmountUse[]>([]);

  // Estados de loading
  const [loadingUserCategories, setLoadingUserCategories] = useState(false);
  const [loadingYields, setLoadingYields] = useState(false);
  const [loadingUnitMeasures, setLoadingUnitMeasures] = useState(false);
  const [loadingUserUnits, setLoadingUserUnits] = useState(false);
  const [updatingCategories, setUpdatingCategories] = useState(false);

  /**
   * Carregar categorias do usuário
   */
  const loadUserCategories = useCallback(async () => {
    try {
      setLoadingUserCategories(true);
      const categories = await getUserRecipeCategories();
      setUserCategories(categories);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar categorias do usuário',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingUserCategories(false);
    }
  }, [dispatch]);

  /**
   * Carregar tipos de rendimento
   */
  const loadYields = useCallback(async () => {
    try {
      setLoadingYields(true);
      const yieldsData = await getYieldsRecipes();
      const mappedYields: YieldItem[] = yieldsData.map((yieldItem) => ({
        _id: yieldItem._id,
        name: yieldItem.name,
        description: yieldItem.description,
      }));
      setYields(mappedYields);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar tipos de rendimento',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingYields(false);
    }
  }, [dispatch]);

  /**
   * Carregar unidades de medida
   */
  const loadUnitMeasures = useCallback(async () => {
    try {
      setLoadingUnitMeasures(true);
      const unitMeasuresData = await getUnitMeasures();
      setUnitMeasures(unitMeasuresData);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar unidades de medida',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingUnitMeasures(false);
    }
  }, [dispatch]);

  /**
   * Carregar unidades personalizadas do usuário
   */
  const loadUserUnitsAmountUse = useCallback(async () => {
    try {
      setLoadingUserUnits(true);
      const units = await getUserUnitsAmountUse();
      setUserUnitsAmountUse(units);
    } catch (error) {
      dispatch(
        addNotification({
          message: 'Erro ao carregar unidades personalizadas',
          type: 'error',
          duration: 4000,
        }),
      );
    } finally {
      setLoadingUserUnits(false);
    }
  }, [dispatch]);

  /**
   * Carregar todos os dados necessários
   */
  const loadAllData = useCallback(async () => {
    await Promise.all([
      loadUserCategories(),
      loadYields(),
      loadUnitMeasures(),
      loadUserUnitsAmountUse(),
    ]);
  }, [loadUserCategories, loadYields, loadUnitMeasures, loadUserUnitsAmountUse]);

  /**
   * Handler para quando uma categoria é adicionada
   */
  const handleCategoryAdded = useCallback(
    async (categoryId: string, categoryName: string) => {
      try {
        setUpdatingCategories(true);

        // Recarrega a lista completa de categorias da API
        await loadUserCategories();

        dispatch(
          addNotification({
            message: 'Lista de categorias atualizada!',
            type: 'success',
            duration: 2000,
          }),
        );

        return categoryName; // Retorna o NOME para seleção automática
      } catch (error) {
        // Fallback: adiciona apenas localmente se a recarga falhar
        const newCategory = { id: categoryId, name: categoryName };
        setUserCategories((prev) => [...prev, newCategory]);

        dispatch(
          addNotification({
            message: 'Categoria adicionada localmente',
            type: 'warning',
            duration: 3000,
          }),
        );

        return categoryName;
      } finally {
        setUpdatingCategories(false);
      }
    },
    [loadUserCategories, dispatch],
  );

  /**
   * Handler para quando uma unidade é adicionada
   */
  const handleUnitAdded = useCallback(
    async (unitId: string, unitName: string, quantity: string, unitMeasure: string) => {
      try {
        // Recarrega a lista completa de unidades da API
        await loadUserUnitsAmountUse();

        dispatch(
          addNotification({
            message: 'Unidade adicionada com sucesso!',
            type: 'success',
            duration: 2000,
          }),
        );
      } catch (error) {
        // Fallback: adiciona apenas localmente
        const newUnit: UnitAmountUse = {
          id: unitId,
          name: unitName,
          quantity: quantity,
          unitMeasure,
        };
        setUserUnitsAmountUse((prev) => [...prev, newUnit]);

        dispatch(
          addNotification({
            message: 'Unidade adicionada localmente',
            type: 'warning',
            duration: 3000,
          }),
        );
      }
    },
    [loadUserUnitsAmountUse, dispatch],
  );

  // Carregar dados iniciais
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    // Dados
    userCategories,
    yields,
    unitMeasures,
    userUnitsAmountUse,

    // Estados de loading
    loadingUserCategories,
    loadingYields,
    loadingUnitMeasures,
    loadingUserUnits,
    updatingCategories,

    // Loading geral
    isLoading: loadingUserCategories || loadingYields || loadingUnitMeasures || loadingUserUnits,
    isLoadingCategories: loadingUserCategories || updatingCategories,

    // Actions
    loadUserCategories,
    loadYields,
    loadUnitMeasures,
    loadUserUnitsAmountUse,
    loadAllData,
    handleCategoryAdded,
    handleUnitAdded,
  };
};
