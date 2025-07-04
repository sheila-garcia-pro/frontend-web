import api, { cachedGet, clearCache } from './index';
import {
  UnitsAmountUseResponse,
  CreateUnitAmountUseParams,
  UnitAmountUse,
  UnitAmountUseSearchParams,
} from '../../types/unitAmountUse';

// Obter lista de unidades de medida
export const getUnitsAmountUse = async (
  params?: UnitAmountUseSearchParams,
): Promise<UnitsAmountUseResponse> => {
  const response = await api.get<UnitsAmountUseResponse>('/v1/users/me/units-amount-use', {
    params,
  });
  return response.data;
};

// Obter lista de unidades de medida com cache
export const getCachedUnitsAmountUse = async (
  params?: UnitAmountUseSearchParams,
): Promise<UnitsAmountUseResponse> => {
  const cacheKey = JSON.stringify(params || {});
  const response = await cachedGet<UnitsAmountUseResponse>(
    '/v1/users/me/units-amount-use',
    params || {},
    cacheKey,
  );
  return response;
};

// Criar nova unidade de medida
export const createUnitAmountUse = async (
  params: CreateUnitAmountUseParams,
): Promise<UnitAmountUse> => {
  const response = await api.post<UnitAmountUse>('/v1/users/me/units-amount-use', params);
  clearCache('/v1/users/me/units-amount-use');
  return response.data;
};

// Atualizar unidade de medida
export const updateUnitAmountUse = async (
  id: string,
  params: Partial<CreateUnitAmountUseParams>,
): Promise<UnitAmountUse> => {
  const response = await api.patch<UnitAmountUse>(`/v1/users/me/units-amount-use/${id}`, params);
  clearCache('/v1/users/me/units-amount-use');
  return response.data;
};

// Excluir unidade de medida
export const deleteUnitAmountUse = async (id: string): Promise<void> => {
  await api.delete(`/v1/users/me/units-amount-use/${id}`);
  clearCache('/v1/users/me/units-amount-use');
};
