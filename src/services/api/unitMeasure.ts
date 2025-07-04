import api, { cachedGet, clearCache } from './index';
import {
  UnitMeasuresResponse,
  CreateUnitMeasureParams,
  UnitMeasure,
  UnitMeasureSearchParams,
} from '../../types/unitMeasure';

// Obter lista de unidades de medida
export const getUnitMeasures = async (
  params?: UnitMeasureSearchParams,
): Promise<UnitMeasuresResponse> => {
  const response = await api.get<UnitMeasuresResponse>('/v1/unit-measure', {
    params,
  });
  return response.data;
};

// Obter lista de unidades de medida com cache
export const getCachedUnitMeasures = async (
  params?: UnitMeasureSearchParams,
): Promise<UnitMeasuresResponse> => {
  const cacheKey = JSON.stringify(params || {});
  const response = await cachedGet<UnitMeasuresResponse>(
    '/v1/unit-measure',
    params || {},
    cacheKey,
  );
  return response;
};

// Criar nova unidade de medida
export const createUnitMeasure = async (params: CreateUnitMeasureParams): Promise<UnitMeasure> => {
  const response = await api.post<UnitMeasure>('/v1/unit-measure', params);
  clearCache('/v1/unit-measure');
  return response.data;
};

// Atualizar unidade de medida
export const updateUnitMeasure = async (
  id: string,
  params: Partial<CreateUnitMeasureParams>,
): Promise<UnitMeasure> => {
  const response = await api.patch<UnitMeasure>(`/v1/unit-measure/${id}`, params);
  clearCache('/v1/unit-measure');
  return response.data;
};

// Excluir unidade de medida
export const deleteUnitMeasure = async (id: string): Promise<void> => {
  await api.delete(`/v1/unit-measure/${id}`);
  clearCache('/v1/unit-measure');
};
