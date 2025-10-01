import api from './index';
import {
  UnitAmountUse,
  CreateUnitAmountUseParams,
  UnitsAmountUseResponse,
} from '../../types/unitAmountUse';

// Obter unidades de medida do usuário
export const getUserUnitsAmountUse = async (): Promise<UnitAmountUse[]> => {
  try {
    const response = await api.get<UnitsAmountUseResponse[]>('/v1/users/me/units-amount-use');

    // A API retorna um array com um objeto que contém unitsAmountUse
    if (response.data && response.data.length > 0 && response.data[0].unitsAmountUse) {
      return response.data[0].unitsAmountUse;
    }

    return [];
  } catch (error) {
    console.error('Erro ao buscar unidades de medida:', error);
    throw error;
  }
};

// Criar nova unidade de medida
export const createUnitAmountUse = async (params: CreateUnitAmountUseParams): Promise<void> => {
  try {
    await api.post('/v1/users/me/units-amount-use', params);
  } catch (error) {
    console.error('Erro ao criar unidade de medida:', error);
    throw error;
  }
};

// Atualizar unidade de medida
export const updateUnitAmountUse = async (
  id: string,
  params: CreateUnitAmountUseParams,
): Promise<void> => {
  try {
    await api.patch(`/v1/users/me/units-amount-use/${id}`, params);
  } catch (error) {
    console.error('Erro ao atualizar unidade de medida:', error);
    throw error;
  }
};

// Excluir unidade de medida
export const deleteUnitAmountUse = async (id: string): Promise<void> => {
  try {
    await api.delete(`/v1/users/me/units-amount-use/${id}`);
  } catch (error) {
    console.error('Erro ao excluir unidade de medida:', error);
    throw error;
  }
};
