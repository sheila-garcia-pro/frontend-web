import api, { clearCache } from './index';
import {
  Coupon,
  CreateCouponParams,
  UpdateCouponParams,
  CouponSearchParams,
  CouponsResponse,
} from '../../types/coupons';

type QueryParams = {
  [key: string]: number | string | boolean | undefined;
};

/**
 * Obter lista de cupons com paginação e filtros
 * @param params Parâmetros de busca (page, itemPerPage, name, supplierId, active, sort)
 * @returns Promise com resposta paginada contendo lista de cupons
 */
export const getCoupons = async (params: CouponSearchParams): Promise<CouponsResponse> => {
  // Remove parâmetros vazios ou nulos
  const queryParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as QueryParams);

  const response = await api.get<CouponsResponse>('/v1/coupon', {
    params: queryParams,
  });
  return response.data;
};

/**
 * Obter cupom por ID
 * @param id ID do cupom
 * @returns Promise com dados do cupom
 */
export const getCouponById = async (id: string): Promise<Coupon> => {
  const response = await api.get<Coupon>(`/v1/coupon/${id}`);
  return response.data;
};

/**
 * Criar um novo cupom
 * @param params Dados para criação (name, description, supplierId opcional)
 * @returns Promise com cupom criado
 */
export const createCoupon = async (params: CreateCouponParams): Promise<Coupon> => {
  const response = await api.post<Coupon>('/v1/coupon', params);
  // Limpa o cache de cupons após criar um novo
  clearCache('/v1/coupon');
  return response.data;
};

/**
 * Atualizar um cupom existente
 * @param id ID do cupom
 * @param params Dados para atualização (campos opcionais)
 * @returns Promise com cupom atualizado
 */
export const updateCoupon = async (id: string, params: UpdateCouponParams): Promise<Coupon> => {
  const response = await api.patch<Coupon>(`/v1/coupon/${id}`, params);
  // Limpa o cache de cupons e do cupom específico
  clearCache('/v1/coupon');
  clearCache(`/v1/coupon/${id}`);
  return response.data;
};

/**
 * Excluir um cupom
 * @param id ID do cupom
 * @returns Promise void
 */
export const deleteCoupon = async (id: string): Promise<void> => {
  await api.delete(`/v1/coupon/${id}`);
  // Limpa o cache de cupons e do cupom específico
  clearCache('/v1/coupon');
  clearCache(`/v1/coupon/${id}`);
};

/**
 * Obter cupons de um fornecedor específico
 * @param supplierId ID do fornecedor
 * @returns Promise com lista de cupons do fornecedor
 */
export const getCouponsBySupplier = async (supplierId: string): Promise<Coupon[]> => {
  const response = await api.get<CouponsResponse>('/v1/coupon', {
    params: {
      supplierId,
      itemPerPage: 100, // Busca todos os cupons do fornecedor
    },
  });
  return response.data.data;
};
