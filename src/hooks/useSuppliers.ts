import { useState, useEffect, useCallback, useMemo } from 'react';
import * as supplierAPI from '@/services/api/suppliers';
import { useNotification } from '@/hooks/useNotification';
import {
  Supplier,
  SupplierCategory,
  CreateSupplierParams,
  UpdateSupplierParams,
  SupplierSearchParams,
  SuppliersResponse,
} from '@/types/suppliers';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [categories, setCategories] = useState<SupplierCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    currentPage: 1,
    totalPages: 1,
  });

  const { showSuccess, showError } = useNotification();

  // Carregar categorias da API
  const loadCategories = useCallback(async () => {
    try {
      const data = await supplierAPI.getSupplierCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Erro ao carregar categorias:', err);
      // Não mostrar notificação para não poluir a UI
      // Se o endpoint não existir, simplesmente não carrega categorias
    }
  }, []);

  // Carregar categorias ao montar o hook
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Criar fornecedor
  const createSupplier = useCallback(
    async (data: CreateSupplierParams): Promise<Supplier> => {
      setLoading(true);
      setError(null);
      try {
        const newSupplier = await supplierAPI.createSupplier(data);

        showSuccess('Fornecedor criado com sucesso!');
        return newSupplier;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erro ao criar fornecedor';
        setError(errorMsg);
        showError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  // Atualizar fornecedor
  const updateSupplier = useCallback(
    async (data: UpdateSupplierParams): Promise<Supplier> => {
      setLoading(true);
      setError(null);
      try {
        const updated = await supplierAPI.updateSupplier(data._id, data);

        showSuccess('Fornecedor atualizado com sucesso!');
        return updated;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erro ao atualizar fornecedor';
        setError(errorMsg);
        showError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  // Deletar fornecedor
  const deleteSupplier = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);
      try {
        await supplierAPI.deleteSupplier(id);

        showSuccess('Fornecedor deletado com sucesso!');
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erro ao deletar fornecedor';
        setError(errorMsg);
        showError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showSuccess, showError],
  );

  // Buscar fornecedor por ID
  const getSupplierById = useCallback(
    (id: string): Supplier | undefined => {
      return suppliers.find((supplier) => supplier._id === id);
    },
    [suppliers],
  );

  // Buscar fornecedores com filtros (chamada à API)
  const searchSuppliers = useCallback(
    async (params: SupplierSearchParams): Promise<SuppliersResponse> => {
      setLoading(true);
      setError(null);
      try {
        const response = await supplierAPI.getSuppliers(params);

        setSuppliers(response.data);
        setPaginationData({
          total: response.total,
          currentPage: response.currentPage,
          totalPages: response.totalPages,
        });

        return response;
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || 'Erro ao buscar fornecedores';
        setError(errorMsg);
        showError(errorMsg);

        // Retornar estrutura vazia em caso de erro para não quebrar a página
        const emptyResponse: SuppliersResponse = {
          data: [],
          total: 0,
          currentPage: 1,
          totalPages: 1,
        };

        setSuppliers([]);
        setPaginationData({
          total: 0,
          currentPage: 1,
          totalPages: 1,
        });

        return emptyResponse;
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  // Lista de categorias disponíveis (apenas nomes)
  const availableCategories = useMemo(() => {
    return categories.map((cat) => cat.name);
  }, [categories]);

  // ===== VINCULAÇÃO COM INGREDIENTES (LOCAL) =====
  // Mantém implementação local pois API não suporta ainda

  const linkIngredientToSupplier = useCallback(
    async (supplierId: string, ingredientId: string): Promise<void> => {
      setLoading(true);
      try {
        // TODO: Quando API suportar, fazer chamada real
        // await supplierAPI.linkIngredient(supplierId, ingredientId);

        // Por enquanto, atualiza apenas localmente
        setSuppliers((prev) =>
          prev.map((supplier) => {
            if (supplier._id === supplierId) {
              const currentIngredients = supplier.ingredients || [];
              if (!currentIngredients.includes(ingredientId)) {
                return {
                  ...supplier,
                  ingredients: [...currentIngredients, ingredientId],
                };
              }
            }
            return supplier;
          }),
        );

        await new Promise((resolve) => setTimeout(resolve, 300)); // Simula delay
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const unlinkIngredientFromSupplier = useCallback(
    async (supplierId: string, ingredientId: string): Promise<void> => {
      setLoading(true);
      try {
        // TODO: Quando API suportar, fazer chamada real

        setSuppliers((prev) =>
          prev.map((supplier) => {
            if (supplier._id === supplierId) {
              const currentIngredients = supplier.ingredients || [];
              return {
                ...supplier,
                ingredients: currentIngredients.filter((id) => id !== ingredientId),
              };
            }
            return supplier;
          }),
        );

        await new Promise((resolve) => setTimeout(resolve, 300)); // Simula delay
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getSuppliersByIngredient = useCallback(
    (ingredientId: string): Supplier[] => {
      return suppliers.filter((supplier) => supplier.ingredients?.includes(ingredientId));
    },
    [suppliers],
  );

  return {
    suppliers,
    categories,
    loading,
    error,
    paginationData,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    searchSuppliers,
    availableCategories,
    loadCategories,
    linkIngredientToSupplier,
    unlinkIngredientFromSupplier,
    getSuppliersByIngredient,
  };
};
