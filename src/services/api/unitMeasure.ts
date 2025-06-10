import api from './index';
import { UnitMeasure } from '../../types/unitMeasure';

export const getUnitMeasures = async (): Promise<UnitMeasure[]> => {
  const response = await api.get('/v1/unit-measure');
  return response.data;
};
