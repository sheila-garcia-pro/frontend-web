import { useState, useMemo, useCallback } from 'react';
import {
  Supplier,
  CreateSupplierParams,
  UpdateSupplierParams,
  SupplierGroup,
  SupplierSearchParams,
} from '@/types/suppliers';

// Dados mockados iniciais
const MOCK_SUPPLIERS: Supplier[] = [
  {
    _id: '1',
    name: 'Açougue Central',
    group: 'açougue',
    address: 'Rua das Flores, 123 - Centro',
    phone: '(11) 98765-4321',
    comments: 'Fornecedor principal de carnes bovinas e suínas. Entrega terça e sexta.',
    ingredients: [], // Será populado dinamicamente
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Hortifruti Verdão',
    group: 'hortifruti',
    address: 'Av. Paulista, 456 - Bela Vista',
    phone: '(11) 91234-5678',
    comments: 'Produtos sempre frescos. Entrega diária.',
    ingredients: [], // Será populado dinamicamente
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Mercado São José',
    group: 'mercado',
    address: 'Rua do Comércio, 789 - Jardins',
    phone: '(11) 99876-5432',
    comments: 'Bom para itens de mercearia em geral.',
    ingredients: [], // Será populado dinamicamente
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Adega Premium',
    group: 'adega',
    address: 'Rua dos Vinhos, 321 - Vila Mariana',
    phone: '(11) 97654-3210',
    comments: 'Vinhos importados e nacionais. Consultar catálogo.',
    ingredients: [], // Será populado dinamicamente
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Padaria Pão Quente',
    group: 'padaria',
    address: 'Rua da Padaria, 111 - Mooca',
    phone: '(11) 96543-2109',
    comments: 'Pães artesanais e francês. Entrega às 6h.',
    ingredients: [], // Será populado dinamicamente
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'Laticínios Vale Verde',
    group: 'laticínios',
    address: 'Estrada Rural, km 12 - Zona Rural',
    phone: '(11) 95432-1098',
    comments: 'Queijos artesanais, leite fresco. Entrega segunda e quinta.',
    ingredients: [], // Será populado dinamicamente
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '7',
    name: 'Pescados do Mar',
    group: 'pescado',
    address: 'Rua da Praia, 555 - Santos',
    phone: '(13) 99999-8888',
    comments: 'Peixes frescos e frutos do mar. Verificar disponibilidade.',
    ingredients: [], // Será populado dinamicamente
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [loading, setLoading] = useState(false);

  // Função para simular delay de API
  const simulateApiDelay = () => new Promise((resolve) => setTimeout(resolve, 500));

  // Criar fornecedor
  const createSupplier = useCallback(async (data: CreateSupplierParams): Promise<Supplier> => {
    setLoading(true);
    await simulateApiDelay();

    const newSupplier: Supplier = {
      _id: Date.now().toString(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSuppliers((prev) => [...prev, newSupplier]);
    setLoading(false);
    return newSupplier;
  }, []);

  // Atualizar fornecedor
  const updateSupplier = useCallback(async (data: UpdateSupplierParams): Promise<Supplier> => {
    setLoading(true);
    await simulateApiDelay();

    let updatedSupplier: Supplier | null = null;

    setSuppliers((prev) =>
      prev.map((supplier) => {
        if (supplier._id === data._id) {
          updatedSupplier = {
            ...supplier,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          return updatedSupplier;
        }
        return supplier;
      }),
    );

    setLoading(false);
    if (!updatedSupplier) {
      throw new Error('Fornecedor não encontrado');
    }
    return updatedSupplier;
  }, []);

  // Deletar fornecedor
  const deleteSupplier = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    await simulateApiDelay();

    setSuppliers((prev) => prev.filter((supplier) => supplier._id !== id));
    setLoading(false);
  }, []);

  // Buscar fornecedor por ID
  const getSupplierById = useCallback(
    (id: string): Supplier | undefined => {
      return suppliers.find((supplier) => supplier._id === id);
    },
    [suppliers],
  );

  // Buscar fornecedores com filtros e paginação
  const searchSuppliers = useCallback(
    (params: SupplierSearchParams) => {
      let filtered = [...suppliers];

      // Filtrar por grupo
      if (params.group && params.group !== 'all') {
        filtered = filtered.filter((supplier) => supplier.group === params.group);
      }

      // Filtrar por nome
      if (params.name && params.name.trim() !== '') {
        const searchTerm = params.name.toLowerCase();
        filtered = filtered.filter((supplier) => supplier.name.toLowerCase().includes(searchTerm));
      }

      // Ordenar
      if (params.sort) {
        filtered.sort((a, b) => {
          switch (params.sort) {
            case 'name-asc':
              return a.name.localeCompare(b.name);
            case 'name-desc':
              return b.name.localeCompare(a.name);
            case 'group-asc':
              return a.group.localeCompare(b.group);
            case 'group-desc':
              return b.group.localeCompare(a.group);
            default:
              return 0;
          }
        });
      }

      // Paginação
      const total = filtered.length;
      const startIndex = (params.page - 1) * params.itemPerPage;
      const endIndex = startIndex + params.itemPerPage;
      const paginatedData = filtered.slice(startIndex, endIndex);

      return {
        data: paginatedData,
        total,
        page: params.page,
        itemPerPage: params.itemPerPage,
      };
    },
    [suppliers],
  );

  // Obter lista de grupos únicos
  const availableGroups = useMemo(() => {
    const groups = new Set(suppliers.map((s) => s.group));
    return Array.from(groups).sort();
  }, [suppliers]);

  // Vincular ingrediente a fornecedor
  const linkIngredientToSupplier = useCallback(
    async (supplierId: string, ingredientId: string): Promise<void> => {
      setLoading(true);
      await simulateApiDelay();

      setSuppliers((prev) =>
        prev.map((supplier) => {
          if (supplier._id === supplierId) {
            const currentIngredients = supplier.ingredients || [];
            // Evitar duplicatas
            if (!currentIngredients.includes(ingredientId)) {
              return {
                ...supplier,
                ingredients: [...currentIngredients, ingredientId],
                updatedAt: new Date().toISOString(),
              };
            }
          }
          return supplier;
        }),
      );

      setLoading(false);
    },
    [],
  );

  // Desvincular ingrediente de fornecedor
  const unlinkIngredientFromSupplier = useCallback(
    async (supplierId: string, ingredientId: string): Promise<void> => {
      setLoading(true);
      await simulateApiDelay();

      setSuppliers((prev) =>
        prev.map((supplier) => {
          if (supplier._id === supplierId) {
            const currentIngredients = supplier.ingredients || [];
            return {
              ...supplier,
              ingredients: currentIngredients.filter((id) => id !== ingredientId),
              updatedAt: new Date().toISOString(),
            };
          }
          return supplier;
        }),
      );

      setLoading(false);
    },
    [],
  );

  // Obter fornecedores de um ingrediente específico
  const getSuppliersByIngredient = useCallback(
    (ingredientId: string): Supplier[] => {
      return suppliers.filter((supplier) => supplier.ingredients?.includes(ingredientId));
    },
    [suppliers],
  );

  return {
    suppliers,
    loading,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    searchSuppliers,
    availableGroups,
    linkIngredientToSupplier,
    unlinkIngredientFromSupplier,
    getSuppliersByIngredient,
  };
};
