import api from '../index';

interface UpdatePriceMeasureData {
  price: number;
  quantity: number;
  unitMeasure: string;
}

export const updateIngredientPriceMeasure = async (
  ingredientId: string,
  data: UpdatePriceMeasureData,
): Promise<void> => {
  await api.patch(`/v1/users/me/ingredient/${ingredientId}/price-measure`, data);
};
