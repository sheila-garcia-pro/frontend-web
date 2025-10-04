import React from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Recipe } from '../../../types/recipes';
import { RecipeIngredient } from '../../../types/recipeIngredients';
import { useNutritionalInfo } from '../../../hooks/useNutritionalInfo';
import NutritionLabel from '../NutritionLabel';

interface NutritionalInfoSectionProps {
  recipe: Recipe;
  recipeIngredients: RecipeIngredient[];
}

const NutritionalInfoSection: React.FC<NutritionalInfoSectionProps> = ({
  recipe,
  recipeIngredients,
}) => {
  const { nutritionalData, loading, error, hasData } = useNutritionalInfo(
    recipe,
    recipeIngredients,
  );

  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          {error}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          💡 Para obter informações nutricionais completas, verifique se os ingredientes da receita
          possuem dados nutricionais cadastrados no sistema.
        </Typography>
      </Alert>
    );
  }

  if (!hasData && !loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          📊 Adicione ingredientes à receita para calcular as informações nutricionais
        </Typography>
        <Typography variant="caption" color="text.secondary">
          O rótulo nutricional será gerado automaticamente baseado nos ingredientes e suas
          quantidades
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {nutritionalData ? (
        <NutritionLabel
          data={nutritionalData}
          loading={loading}
          onDownload={() => {
            // Download concluído
          }}
        />
      ) : (
        <NutritionLabel
          data={{
            productName: '',
            portionSize: 0,
            servingsPerContainer: 0,
            nutrients: {
              calories: 0,
              totalFat: 0,
              saturatedFat: 0,
              transFat: 0,
              cholesterol: 0,
              sodium: 0,
              totalCarbohydrate: 0,
              dietaryFiber: 0,
              totalSugars: 0,
              addedSugars: 0,
              protein: 0,
              calcium: 0,
              iron: 0,
              potassium: 0,
              vitaminC: 0,
            },
            dailyValues: {
              totalFat: 0,
              saturatedFat: 0,
              cholesterol: 0,
              sodium: 0,
              totalCarbohydrate: 0,
              dietaryFiber: 0,
              calcium: 0,
              iron: 0,
              potassium: 0,
              vitaminC: 0,
            },
          }}
          loading={loading}
        />
      )}
    </Box>
  );
};

export default NutritionalInfoSection;
