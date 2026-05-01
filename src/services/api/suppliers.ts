import api, { cachedGet, clearCache } from './index';
import {
  Supplier,
  SupplierCategory,
  SuppliersResponse,
  CreateSupplierParams,
  UpdateSupplierParams,
  SupplierSearchParams,
  CreateSupplierCategoryParams,
  UpdateSupplierCategoryParams,
} from '@/types/suppliers';

// ============= FORNECEDORES =============

/**
 * Buscar fornecedores com paginação e filtros
 */
export const getSuppliers = async (params: SupplierSearchParams): Promise<SuppliersResponse> => {
  const queryParams: Record<string, any> = {
    page: params.page,
    itemPerPage: params.itemPerPage,
  };

  if (params.category) queryParams.category = params.category;
  if (params.name) queryParams.name = params.name;
  if (params.sort) queryParams.sort = params.sort;
  if (params.active !== undefined) queryParams.active = params.active;

  const response = await api.get<SuppliersResponse>('/v1/supplier', {
    params: queryParams,
  });

  return response.data;
};

/**
 * Buscar fornecedor específico por ID
 */
export const getSupplierById = async (id: string): Promise<Supplier> => {
  const response = await api.get<Supplier>(`/v1/supplier/${id}`);
  return response.data;
};

/**
 * Criar novo fornecedor
 */
export const createSupplier = async (data: CreateSupplierParams): Promise<Supplier> => {
  const response = await api.post<Supplier>('/v1/supplier', {
    ...data,
    active: data.active ?? true, // Padrão: ativo
  });

  // Limpar cache de fornecedores
  clearCache('/v1/supplier');

  return response.data;
};

/**
 * Atualizar fornecedor existente
 */
export const updateSupplier = async (
  id: string,
  data: Partial<CreateSupplierParams>,
): Promise<Supplier> => {
  const response = await api.patch<Supplier>(`/v1/supplier/${id}`, data);

  // Limpar cache
  clearCache('/v1/supplier');

  return response.data;
};

/**
 * Deletar fornecedor
 */
export const deleteSupplier = async (id: string): Promise<void> => {
  await api.delete(`/v1/supplier/${id}`);

  // Limpar cache
  clearCache('/v1/supplier');
};

// ============= CATEGORIAS =============

/**
 * Buscar todas as categorias de fornecedores (com cache)
 */
export const getSupplierCategories = async (): Promise<SupplierCategory[]> => {
  const response = await cachedGet<SupplierCategory[]>(
    '/v1/category-supplier',
    {},
    'supplier-categories',
  );
  return response;
};

/**
 * Buscar categoria específica por nome
 */
export const getSupplierCategoryByName = async (name: string): Promise<SupplierCategory> => {
  const response = await api.get<SupplierCategory>(`/v1/category-supplier/${name}`);
  return response.data;
};

/**
 * Criar nova categoria
 */
export const createSupplierCategory = async (
  data: CreateSupplierCategoryParams,
): Promise<SupplierCategory> => {
  const response = await api.post<SupplierCategory>('/v1/category-supplier', data);

  // Limpar cache de categorias
  clearCache('/v1/category-supplier');

  return response.data;
};

/**
 * Atualizar categoria
 */
export const updateSupplierCategory = async (
  id: string,
  data: UpdateSupplierCategoryParams,
): Promise<SupplierCategory> => {
  const response = await api.patch<SupplierCategory>(`/v1/category-supplier/${id}`, data);

  // Limpar cache de categorias
  clearCache('/v1/category-supplier');

  return response.data;
};

/**
 * Deletar categoria
 */
export const deleteSupplierCategory = async (id: string): Promise<void> => {
  await api.delete(`/v1/category-supplier/${id}`);

  // Limpar cache de categorias
  clearCache('/v1/category-supplier');
};
