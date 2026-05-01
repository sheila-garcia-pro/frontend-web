import api from '../index';
import { convertPriceDataToGrams, getConversionDescription } from '../../../utils/unitConversion';

interface UpdatePriceMeasureData {
  price: number;
  quantity: number;
  unitMeasure: string;
}

export const updateIngredientPriceMeasure = async (
  ingredientId: string,
  data: UpdatePriceMeasureData,
): Promise<void> => {
  // Converter dados para gramas antes de enviar para a API
  const convertedData = convertPriceDataToGrams(data.price, data.quantity, data.unitMeasure);

  // Log para debug da conversão
  console.log('Conversão de unidades:', {
    original: data,
    converted: convertedData,
    description: getConversionDescription(data.quantity, data.unitMeasure, convertedData.quantity),
  });

  await api.post(`/v1/users/me/ingredient/${ingredientId}/price-measure`, convertedData);
};
