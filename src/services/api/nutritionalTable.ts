import api from './index';
import {
  NutritionalTable,
  UserNutritionalTable,
  CreateUserNutritionalTableRequest,
} from '../../types/nutritionalTable';

export const getNutritionalTable = async (name: string): Promise<NutritionalTable[]> => {
  const response = await api.get(`/v1/nutritional-tables?name=${encodeURIComponent(name)}`);
  return response.data;
};

// Get nutritional tables including user tables by ingredient name
export const getNutritionalTablesWithUserTables = async (
  ingredientName: string,
): Promise<{
  systemTables: NutritionalTable[];
  userTables: UserNutritionalTable[];
}> => {
  const response = await api.get(
    `/v1/users/me/nutritional-tables?name=${encodeURIComponent(ingredientName)}`,
  );
  const data = response.data || [];

  const systemTables: NutritionalTable[] = [];
  const userTables: UserNutritionalTable[] = [];

  data.forEach((item: any) => {
    if (item.nutritionalTables) {
      // User created table - extract from wrapper
      const userTable = item.nutritionalTables;
      userTables.push({
        id: userTable.id,
        tableName: userTable.tableName,
        description: userTable.description,
        carbohydrateG: userTable.carbohydrateG,
        energyKcal: userTable.energyKcal,
        proteinG: userTable.proteinG,
        totalFatsG: userTable.totalFatsG,
        totalSugarG: userTable.totalSugarG,
        addSugarG: userTable.addSugarG,
        saturatedFatsG: userTable.saturatedFatsG,
        transFatsG: userTable.transFatsG,
        dietaryFiberG: userTable.dietaryFiberG,
        sodiumMG: userTable.sodiumMG,
        monounsaturatedG: userTable.monounsaturatedG,
        polyunsaturatedG: userTable.polyunsaturatedG,
        cholesterolMG: userTable.cholesterolMG,
        calciumMG: userTable.calciumMG,
        magnesiumMG: userTable.magnesiumMG,
        phosphorusMG: userTable.phosphorusMG,
        ironMG: userTable.ironMG,
        potassiumMG: userTable.potassiumMG,
        copperMG: userTable.copperMG,
        zincMG: userTable.zincMG,
        retinolMCG: userTable.retinolMCG,
        raeMCG: userTable.raeMCG,
        vitaminDMCG: userTable.vitaminDMCG,
        thiamineMG: userTable.thiamineMG,
        riboflavinMG: userTable.riboflavinMG,
        niacinMG: userTable.niacinMG,
        vitaminB6PiridoxinaMG: userTable.vitaminB6PiridoxinaMG,
        vitaminB12MG: userTable.vitaminB12MG,
        vitaminCMCG: userTable.vitaminCMCG,
        lipidsG: userTable.lipidsG,
        iodinG: userTable.iodinG,
        manganeseMG: userTable.manganeseMG,
        isUserCreated: true,
      });
    } else if (item._id && item.tableName && item.description) {
      // System table
      systemTables.push(item);
    }
  });

  return { systemTables, userTables };
};

// Get all user nutritional tables (for management)
export const getUserNutritionalTables = async (): Promise<UserNutritionalTable[]> => {
  try {
    // Since there's no dedicated endpoint, we'll need to get them by making a generic call
    // This is a workaround - ideally there should be GET /v1/users/me/nutritional-tables
    const response = await api.get('/v1/users/me/nutritional-tables?name=');
    const data = response.data || [];

    const userTables: UserNutritionalTable[] = [];
    data.forEach((item: any) => {
      if (item.nutritionalTables) {
        userTables.push({
          ...item.nutritionalTables,
          isUserCreated: true,
        });
      }
    });

    return userTables;
  } catch (error) {
    console.error('Error getting user tables:', error);
    return [];
  }
};

export const createUserNutritionalTable = async (
  data: CreateUserNutritionalTableRequest,
): Promise<UserNutritionalTable> => {
  const response = await api.post('/v1/users/me/nutritional-tables', data);
  return response.data;
};

export const updateUserNutritionalTable = async (
  id: string,
  data: Partial<CreateUserNutritionalTableRequest>,
): Promise<UserNutritionalTable> => {
  const response = await api.patch(`/v1/users/me/nutritional-tables/${id}`, data);
  return response.data;
};

export const deleteUserNutritionalTable = async (id: string): Promise<void> => {
  await api.delete(`/v1/users/me/nutritional-tables/${id}`);
};
