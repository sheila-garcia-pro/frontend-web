import api from './index';
import { NutritionalTable } from '../../types/nutritionalTable';

export const getNutritionalTable = async (name: string): Promise<NutritionalTable[]> => {
  const response = await api.get(`/v1/nutritional-tables?name=${encodeURIComponent(name)}`);
  return response.data;
};
